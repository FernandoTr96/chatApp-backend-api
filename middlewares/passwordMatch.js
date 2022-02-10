const passwordMatch = (value,{req})=>{

    if(value !== req.body.password) {
        throw new Error('password confirmation does not match password');
    }

    return true;

};

module.exports = passwordMatch;