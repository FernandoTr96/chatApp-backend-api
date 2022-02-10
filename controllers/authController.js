const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');
const generateJwt = require('../helper/generateJwt');

class authController{

    static async loginWithEmailandPassword(req,res){

        const {email,password} = req.body;
        const user = await UserModel.findOne({email});

        if(!user){
            return res.json({
                ok: false,
                msg: 'bad credentials !!'
            })
        }

        const isRegistered = bcrypt.compareSync(password,user.password);

        if(!isRegistered){
            return res.json({
                ok: false,
                msg: 'bad credentials !!'
            })
        }

        const token = await generateJwt(user.id);

        res.status(200).json({
            ok: true,
            user,
            token
        })

    }

    static async registerAccount(req,res){

        const {username,email,password} = req.body;
        const isRegistered = await UserModel.findOne({email});

        if(isRegistered){ 
            return res.json({
                ok: false,
                msg: `the email ${email} was already registered !!` 
            })
        }

        const hash = bcrypt.hashSync(password, 10);

        const user = new UserModel({
            username,
            email,
            password: hash
        });

        try {

            await user.save();
            const token = await generateJwt(user.id);

            return res.status(201).json({
                ok: true,
                user,
                token
            })
            
        } catch (error) {

            console.log(error); 
            res.status(500).json({
                ok: false,
                err: `error [${error.code}]: call support to resolve this error `
            })

        }

    }

    static async refreshToken(req,res){
        
        const uid = req.auth.uid;
        const token = await generateJwt(uid);
        
        if(!token){
            return res.json({
                ok: false,
                msg: 'could not generate token'
            })
        }

        const user = await UserModel.findById(uid);

        res.status(200).json({
            ok: true,
            token,
            user
        })

    }

}

module.exports = authController;