const MessageModel = require("../models/MessageModel");
const UserModel = require("../models/UserModel");

class chatController{

    static async getHistorial(req,res){

        const myUID = req.auth.uid;
        const friendUID = req.params.friendUID;
        const registers = parseInt(req.params.registers);

        try {

            const friend = await UserModel.findById(friendUID,{email:0,friendRequests:0});
            const last15 = await MessageModel.find({
                $or: [
                    { to: myUID , for: friendUID },
                    { to: friendUID, for: myUID }
                ]
            },{password:0,__v:0})
            .populate('to')
            .populate('for')
            .sort({
                createdAt: 'desc'
            })
            .limit(registers);

            const messages = last15.sort();

            return res.json({
                ok: true,
                friend,
                messages
            });

        } catch (error) {
            console.log(error);
            return res.json({
                ok: false,
                msg: error.message
            });
        }
    }

}

module.exports = chatController;