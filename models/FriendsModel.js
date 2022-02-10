const {Schema,model} = require('mongoose');

const FriendsModel = new Schema({
    to: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    for: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    dateOfLastMessage: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

FriendsModel.method('toJSON',function(){
    const {__v,_id,...object} = this.toObject();
    object.id = _id;
    return object;
})

module.exports = model('friend',FriendsModel);