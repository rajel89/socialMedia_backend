const Joi = require('joi');
const bcrypt = require('bcrypt');
const express = require('express');
const {User} = require('../models/user');
const router = express.Router();
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    // return res.status(200).send(req.body)
    try{
        const {error} = validateLogin(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOneAndUpdate({ email: req.body.email}, {isLogin:true}).select('+password').exec();
        if (!user) return res.status(400).send('Invalid email or password.');
       /*  return res.status(200).send(user) */

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        

        if (!validPassword) return res.status(400).send('Invalid email or password.')

        const token = user.generateAuthToken();

        return res.send({success:true, _id:user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, token: token });
    }catch(ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

router.post('/logout', async(req, res) => {
    let user = jwt.decode(req.headers.token);
    // res.send(req.headers.token)
    User.findByIdAndUpdate(user._id, {isLogin:false}).then(() => {
        return res.status(200).send({success: true, msg: 'You have successfully logout.'});
    })
})

function validateLogin(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(1024).required(),
    });
    return schema.validate(req);
}
//comment

module.exports = router;