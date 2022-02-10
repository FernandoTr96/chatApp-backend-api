const {isValid} = require('mongoose').Types.ObjectId;
const verifyToken = require('../helper/verifyToken');
const FriendsModel = require('../models/FriendsModel');
const UserModel = require('../models/UserModel');
const MessageModel = require('../models/MessageModel');

class socketController {

    constructor(io) {
        this.io = io;
        this.socketEvents();
    }

    async checkUserToken(socket) {
        const token = socket.handshake.query['x-token'];
        const [ok,uid] = await verifyToken(token);
        if(ok){
            return uid;
        }
        else{
            socket.disconnect();
        }
    }

    async connectUserInDB(uid) {
        const userConnected = await UserModel.findById(uid);
        userConnected.online = true;
        await userConnected.save();
    }

    async disconnectUserInDB(uid) {
        const userConnected = await UserModel.findById(uid);
        userConnected.online = false;
        userConnected.lastConnection = new Date().getTime();
        await userConnected.save();
    }

    async sendFriendRequest(toUID, forUID){

        if(!isValid(forUID)){
            return {
                ok: false,
                msg: 'the forUID not is an objectid valid'
            }
        }

        try {

            const user = await UserModel.findById(forUID);
            user.friendRequests.push(`${toUID}@pending`);
            await user.save();

            return{
                ok: true,
                msg: 'friend request send !!'
            }

        } catch (error) {
            console.log(error);
            return {
                ok: false,
                msg: error.message
            }
        }
    }

    async cancelFriendRequest(toUID, forUID){

        if(!isValid(forUID)){
            return {
                ok: false,
                msg: 'the forUID not is an objectid valid'
            }
        }

        try {

            let user = await UserModel.findById(forUID);
            user.friendRequests = user.friendRequests.filter(el => !el.includes(toUID));
            await user.save();

            return {
                ok: true,
                msg: 'friend request canceled !!'
            }

        } catch (error) {
            console.log(error);
            return {
                ok: false,
                msg: error.message
            }
        }
    }

    async getFriendRequest(uid){
        
        let array = [];

        const user = await UserModel.findById(uid)
        .sort({ timestamp: 'desc' })
        .populate('friendRequests')
        .exec();

        for (let id of user.friendRequests) {
            if(!id.includes('@accepted')){
                id = id.split('@')[0];
                const userReq = await UserModel.findById(id,{uid:1,username:1,image:1});
                array.unshift(userReq);
            }
        }

        return array
    }

    async acceptFriendRequest(toUID,forUID){
        
        const isFriend = await FriendsModel.find({ $or:[{to:toUID, for:forUID},{to:forUID, for:toUID}] });
        if(!isFriend.length){
            
            let user = await UserModel.findById(forUID);
            user.friendRequests = user.friendRequests.map(el => el.includes(`${toUID}@pending`) && `${toUID}@accepted` );
            user.save();

            const friend = new FriendsModel({
                to: toUID,
                for: forUID,
                dateOfLastMessage: new Date().getTime()
            });
            await friend.save();
        }
    }

    async getFriends(uid){
        const friends = await FriendsModel.find({$or:[{to:uid},{for:uid}]},{id:1,to:1,for:1})
        .populate('to',{password:0,email:0,friendRequests:0,__v:0})
        .populate('for',{password:0,email:0,friendRequests:0,__v:0})
        .sort({dateOfLastMessage: 'desc'});
        return friends;
    }

    async saveMessage(payload){       
        try {
            
            const msg = new MessageModel({
                to: payload.to,
                for: payload.for,
                message: payload.message
            });
            await msg.save();
    
            const friendship = await FriendsModel.findOne({ $or:[{to: payload.to, for: payload.for},{to: payload.for, for: payload.to}] });
            friendship.dateOfLastMessage = new Date().getTime();
            await friendship.save();

        } catch (error) {
           console.log(error);
        }  
    }

    socketEvents() {
        this.io.on('connection', async (socket) => {

            //validar token de usuario, si no es valido desconectar
            const uid = await this.checkUserToken(socket);

            //detectar conexion entrante
            // console.log(`[${socket.id}]: connected !!`);
            uid && await this.connectUserInDB(uid);

            //una vez autenticado crear room para cada usuario conectado
            socket.join(uid);

            //detectar si un socket se desconecta
            socket.on('disconnect', async () => {
                // console.log(`[${socket.id}]: disconnected !!`);
                await this.disconnectUserInDB(uid);
                socket.broadcast.emit('reloadFriendList',null);
                socket.broadcast.emit('reloadCurrentChat',null);
            })

            //emitir todos los usuarios conectados al  cargar o conectarse
            this.io.emit('reloadFriendList',null); 
            socket.broadcast.emit('reloadCurrentChat',null);              
            
            //emitir suarios conectados en todo momento desde el useEffect
            socket.on('loadFriends', async ()=>{
                socket.emit('getFriends', await this.getFriends(uid));
            })

            //enviar y cancelar solicitudes de amistad
            socket.on('sendFriendReq', async ({toUID,forUID})=>{
                await this.sendFriendRequest(toUID,forUID);
                // //obtener notificaciones de la otra persona
                this.io.to(forUID).emit('friendNotifications', await this.getFriendRequest(forUID));
                this.io.to(forUID).emit('notificationRingtone', null);
            })

            socket.on('cancelFriendReq', async ({toUID,forUID})=>{
                await this.cancelFriendRequest(toUID,forUID);
                // //obtener notificaciones de la otra persona
                this.io.to(forUID).emit('friendNotifications', await this.getFriendRequest(forUID));
            })

            socket.on('acceptFriendReq',async ({toUID,forUID})=>{
                await this.acceptFriendRequest(toUID,forUID);
                // //obtener notificaciones de la otra persona
                this.io.to(forUID).emit('friendNotifications', await this.getFriendRequest(forUID));
                //emitir todos los usuarios conectados al  cargar o conectarse
                this.io.to(forUID).emit('getFriends',await this.getFriends(forUID));
                this.io.to(toUID).emit('getFriends',await this.getFriends(toUID));
            })

            //escuchar mensajes
            socket.on('sendMessage', async (payload)=>{
                if(payload.message.length > 0){                  
                    await this.saveMessage(payload);
                    this.io.to(payload.to).emit('reloadCurrentChat',null);
                    this.io.to(payload.for).emit('reloadCurrentChat',null);
                    this.io.to(payload.for).emit('messageReceived',payload.to);
               }
            })

            //escuchar cando escriben
            socket.on('writting',(payload)=>{
                this.io.to(payload.for).emit('isWritting',payload.writting);
            })

        });
    }

}

module.exports = socketController;