const UserModel = require("../models/UserModel");
const bcrypt = require('bcrypt');
const {storage} = require('../config/firebaseStorage');
const {ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');
const sharp = require('sharp');

class userController {

    static async searchUser(req, res) {
        const uid = req.auth.uid;
        const q = req.query.q || '';

        if (!q || q === '') {
            return res.json({
                ok: true,
                users: []
            })
        }

        const currentPage = parseInt(req.query.page) || 1;
        const perpage = 5;
        const start = (currentPage * perpage) - perpage;
        const limit = start + perpage;
        const _users = await UserModel.find({ $and:[
            { username: { $regex: q, $options: 'i' } },
            {_id: {$ne:uid}}
        ] })
            .sort({ username: 'asc' })
            .populate('friendRequests')
            .exec();
        const totalRegisters = _users.length;

        const numPages = Math.ceil(totalRegisters / perpage);
        const users = _users.slice(start, limit);
        const previous = currentPage > 1 ? currentPage - 1 : currentPage;
        const next = currentPage < numPages ? currentPage + 1 : currentPage;
        const actualRegister = limit > totalRegisters ? limit - (limit - totalRegisters) : limit;


        return res.status(200).json({
            ok: true,
            q,
            previous,
            next,
            actualRegister,
            totalRegisters,
            users
        })

    }

    static async saveProfile(req, res) {

        const { username, email, password } = req.body;
        const uid = req.auth.uid;

        try {

            const user = await UserModel.findById(uid);
            user.username = username;
            user.email = email;

            if (password.length > 0) {
                const hash = bcrypt.hashSync(password, 10);
                user.password = hash;
            }

            await user.save();

            return res.status(200).json({
                ok: true,
                msg: 'profile updated'
            });

        } catch (error) {
            console.log(error);
            return res.json({
                ok: false,
                msg: error.message
            });
        }
    }
    
    static async uploadProfileImage(req, res){
       
        const uid = req.auth.uid;
        const name = req.file.originalname;
        const current_extension = '.'+name.split('.')[1];
        const extensionsNotAllowed = ['.gif']; 

        //zip image
        const buffer = await sharp(req.file.buffer)
        .resize(200, 200)
        .png()
        .toBuffer();
        
        //check extension

        if(extensionsNotAllowed.includes(current_extension)){
            return res.json({
                ok: false,
                msg: 'extension not allowed, only png or jpg'
            })
        }

        //upload
        try {

            const user = await UserModel.findById(uid);

            if(!user.image.includes('https://placeimg.com')){
                //last image
                const lastImage = ref(storage,user.image);
                // Delete the file
                await deleteObject(lastImage);
            }
            
            //ref to the storage
            const imgRef = ref(storage, `profile-images/${name}`);
            // pload with buffer
            await uploadBytes(imgRef, buffer);

            //update url
            const url = await getDownloadURL(imgRef);
            user.image = url;
            await user.save();

            return res.status(200).json({
                ok: true,
                msg: 'image updated !!'
            });

        } catch (error) {
            console.log(error);
            return res.status(200).json({
                ok: false,
                msg: error.message
            });
        }
    }
}

module.exports = userController;