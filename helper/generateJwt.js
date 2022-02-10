const jwt = require('jsonwebtoken');

const generateJwt = (uid) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            { uid },
            process.env.JWT_KEY,
            { expiresIn: '5h' },
            (err,token)=>{
                if(token){
                    resolve(token);
                }
                reject(err);
            }
        );     
    })
};

module.exports = generateJwt;