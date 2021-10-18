const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true, minlength: 1, maxlength: 50},
    lastName: {type: String, required: true, minlength: 1, maxlength: 50},
    email: {type: String, unique: true, required: true, minlength:1, maxlength: 255},
    dob: {type: String, required: true, minlength:1, maxlength: 255},
    password: {type: String, required: true, maxlength: 1024, minlength: 5, select: false},
    aboutMe: {type: String},
    isLogin: {type: Boolean, default: false},
});

userSchema.methods.generateAuthToken = function(){
    return jwt.sign({_id: this._id, firstName: this.firstName, lastName: this.lastName, isLogin: this.isLogin}, config.get('jwtSecret'));
};

userSchema.index({firstName: 'text', lastName: 'text'});

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        firstName: Joi.string().min(1).max(50).required(),
        lastName: Joi.string().min(1).max(50).required(),
        email: Joi.string().min(5).max(255).required(),
        dob: Joi.string().min(5).max(255).required(),
        password: Joi.string().min(1).max(1024).required()
    });
    return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;
exports.userSchema = userSchema;