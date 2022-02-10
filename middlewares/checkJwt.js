const jwt = require('jsonwebtoken');

const checkJwt = (req,res,next)=>{

    const token = req.header('x-token');

    if(!token){
        return res.json({
            ok: false,
            msg: 'token not found !!'
        })
    }

    try {

        const {uid} = jwt.verify(token,process.env.JWT_KEY);
        req.auth = { uid };
        
    } catch (error) {

        return res.json({
            ok: false,
            msg: 'token not valid !!'
        })

    }

    next();

};

module.exports = checkJwt;