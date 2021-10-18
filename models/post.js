const mongoose = require('mongoose');
const Joi = require('joi');

const postSchema = new mongoose.Schema({
    userId: { type: String, required: true, minlength: 1, maxlength: 255 },
    content: { type: String, minlength:1},
    likes: { type: Number, required: true, default: 0 },
    status: {type: Boolean, required: true, default: true}
},{
    timestamps: true
});

const Post = mongoose.model('Post', postSchema);

function validatePost(post) {
    const schema = Joi.object({
        content: Joi.string().required().min(1)
    });
    return schema.validate(post);
}
exports.Post = Post;
exports.validatePost = validatePost;
exports.postSchema = postSchema;