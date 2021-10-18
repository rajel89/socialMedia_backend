const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');

const friendRequestSchema = new mongoose.Schema({
    userId: {type: String, required: true, minlength: 1, maxlength: 50},
    userInviteId: {type: String, requried: true},
    inviteDetails: {type: Object, required: true},
    status: {type: String, default: 'pending'}
});

function validateFriendRequest(data)
{
    const schema = Joi.object({
        userId: Joi.string().min(1).max(50).required(),
        userInviteId: Joi.string().min(1).max(50).required(),
        inviteDetails: Joi.string().min(5).max(255).required(),
        status: Joi.object().required()
    });
    return schema.validate(data);
}


const FriendRequests = mongoose.model('FriendRequests', friendRequestSchema);

exports.FriendRequests = FriendRequests;
exports.validateFriendRequest = validateFriendRequest;
exports.friendRequestSchema = friendRequestSchema;