const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');

const friendsSchema = new mongoose.Schema({
    userId: {type: String, required: true, minlength: 1, maxlength: 50},
    friendId: {type: String, required: true, minlength: 1, maxlength: 50},
    details: {type: Object},
    status: {type: String, default: 'pending'}
});


const Friends = mongoose.model('Friends', friendsSchema);

exports.Friends = Friends;
exports.friendsSchema = friendsSchema;