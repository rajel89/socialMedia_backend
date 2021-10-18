const mongoose = require('mongoose');
const Joi = require('joi');
const { boolean } = require('joi');

const friendSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 1, maxlength: 255 },
    description: { type: String, minlength:1, maxlength: 500},
    locality: { type: String, required: true, minlength: 1, maxlength: 50 },
    status: {type: Boolean, required: true},
});

const friendInSchema = new mongoose.Schema({
    rID: { type: String, required: true, minlength: 1, maxlength: 255 },
    status: { type: Boolean, required: true},
    dateRec: {type: Date, default: Date.now}
});

const friendOutSchema = new mongoose.Schema({
    sID: { type: String, required: true, minlength: 1, maxlength: 255 },
    status: { type: Boolean, required: true},
    dateOut: {type: Date, default: Date.now}
});

const Friend = mongoose.model('Friend', friendSchema);
const FriendIn = mongoose.model('FriendIn', friendInSchema);
const FriendOut = mongoose.model('FriendOut', friendOutSchema);

// function validateFriend(friend) {
//     const schema = Joi.object({
//         name: Joi.string().min(2).max(50).required(),
//         description: Joi.string().min(2).max(50).required(),
//         locality: Joi.string().min(2).max(50).required(),
//         status: Joi.boolean

//     });
//     return schema.validate(friend);
// }

//comment

exports.Friend = Friend;
exports.FriendIn = FriendIn;
exports.FriendOut = FriendOut;
// exports.validateFriend = validateFriend;
exports.friendSchema = friendSchema;
exports.friendInSchema = friendInSchema;
exports.friendOutSchema = friendOutSchema;