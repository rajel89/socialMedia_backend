const mongoose = require('mongoose');
const Joi = require('joi');

const postSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 1, maxlength: 255 },
    text: { type: String, minlength:1, maxlength: 1500},
    // likes: { type: Number, required: true, default: 0 },
    datePosted: {type: Date, default: Date.now}
});

const Post = mongoose.model('Post', postSchema);

function validatePost(post) {
    const schema = Joi.object({
        name: Joi.string().required().min(1).max(255),
        text: Joi.string().min(1).max(1500),
        // likes: Joi.number(),
        datePosted: Joi.date().options({ convert: false }),

    });
    return schema.validate(post);
}
exports.Post = Post;
exports.validatePost = validatePost;
exports.postSchema = postSchema;