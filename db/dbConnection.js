const mongoose = require('mongoose');

const dbConnection = async ()=>{

    try {

        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`[mongodb] is online`);
        
    } catch (error) {
        console.log(error);
    }

};

module.exports = dbConnection;