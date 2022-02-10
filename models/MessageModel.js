const {Schema,model} = require('mongoose');

const MessageSchema = new Schema({
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
    message: {
        type: String,
        required: true
    }
    
},{
    timestamps: true
});

MessageSchema.method('toJSON',function(){
    const {__v,_id,...object} = this.toObject();
    object.id = _id;
    return object;
})

module.exports = model('message',MessageSchema);