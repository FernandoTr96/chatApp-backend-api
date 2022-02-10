const {Schema,model} = require('mongoose');

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'https://placeimg.com/100/100/any',
        required: true
    },
    online: {
        type: Boolean,
        default: false
    },
    lastConnection: {
        type: String,
        default: new Date().getTime()
    },
    friendRequests:[String]
});

UserSchema.method('toJSON',function(){
    const {__v,_id,password, ...object} = this.toObject();
    object.uid = _id;
    return object;
});

module.exports = model('user',UserSchema);