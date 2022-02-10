const {validationResult} = require('express-validator');

const getErrors = (req,res,next)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.json({
            ...errors.mapped()
        })
    }

    next();

};


module.exports = getErrors;