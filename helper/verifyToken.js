const {verify} = require('jsonwebtoken');

const verifyToken = async (token = '')=>{
    try {
        const {uid} = verify(token, process.env.JWT_KEY);
        return [true,uid]
        
    } catch (error) {
        console.log(error);
        return [false,null]
    }
}

module.exports = verifyToken;