const {User, validateUser} = require('../models/user');
const {Friend, validateFriend} = require('../models/friend');
const {Post, validatePost} = require('../models/post');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const express = require('express');
const admin = require('../middleware/admin');
const router = express.Router();

//This is finding user

router.get('/', async (req, res) => {
    try{
        const users = await User.find();
        return res.send(users);
    }catch(ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});
//This is finding user by ID
router.get('/:id', async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user)
            return res.status(400).send(`The user with id "${req.params.id}" does not exist.`);
            return res.send(user);
    }catch(ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

//This is finding a user's POST
router.get('/:userId/post', async (req, res) => {
    try{
        const user = await User.findById();
        const { error } = validatePost(req.body);
        const post = await Post.findById(req.params.id);
        if(!post)
            return res.status(400).send(`The post with id "${req.params.id}" does not exist.`);
            return res.send(post);
    }catch(ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

//This is creating a user Post

// router.post('/:id/post', [auth, admin], async (req, res) => {
//     try{
//         const user = await User.findById(req.params.userId);
//         const{error} = validatePost(req.body);
//         if (error)
//             return res.status(400).send(error);

//         const post = new Post ({
//             name: req.body.name,
//             text: req.body.text,
//             datePosted: req.body.datePosted
           
//         });
//         await post.save();

//         return res.send(post);
//         //return res.send(user.postList);
        
//     }catch (ex){
//         return res.status(500).send(`Internal Server Error: ${ex}`);
//     }
// });

//This is to create a post
router.post('/:userId/posts', async (req, res) => {
    try{
        const user = await User.findById(req.params.userId);
        if(!user) return res.status(400).send(`The user with id "${req.params.userId}" does not exist.`);
    
        const post = new Post({
            name: user.name,
            text: req.body.text,
        });
    
        user.posts.push(post);
    
        await user.save();
        return res.send(user.posts);
    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});
// router.post('/:userId/post', async (req, res) => {
//     try {
//       const user = await User.findById();
//       const { error } = validatePost(req.body);
//       if (error) return res.status(400).send(error);
//       const post = new Post({
//             name: req.body.name,
//             text: req.body.text,
//             datePosted: req.body.datePosted
//       });
//       await post.save();
//       return res.send(post);
//     } catch (ex) {
//       return res.status(500).send(`Internal Server Error: ${ex}`);
//     }
//   });

//This is to delete a post
router.delete('/:userId/post/postId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.postId);
        if(!user) return res.status(400).send(`The user with id "${req.params.postId}" does not exist.`);

        // let friend = user.friendList.id(req.params.friendId);
        // if (!friend) return res.status(400).send(`The person with id "${req.params.friendId}" is not friends with the user.`);

        post = await post.remove();

        await user.save();
        return res.send(user.post);
    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

//This is to create a USER

router.post('/', auth, async (req, res) => {
    try{
        const {error} = validateUser(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email});
        if (user) return res.status(400).send(`User already registered.`);

        const salt = await bcrypt.genSalt(10);
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, salt),
            friends: [],
            friendsIn: [],
            friendsOut: [],
            posts: [],
        });
        await user.save();

        const token = user.generateAuthToken();

        return res
            .header('x-auth-token', token)
            .header('access-control-expose-headers', 'x-auth-token')
            .send({_id: user._id, name: user.name, email: user.email})
    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

//This is to find a friends by ID to be added to friendList
router.post('/:userId/friendList/:friendId', [auth, admin], async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if(!user) return res.status(400).send(`The user with id "${req.params.userId}" does not exist.`);

        let friend = await Friend.findById(req.params.friendId);
        if (!friend) return res.status(400).send(`The person with id "${req.params.friendId}" does not exist.`);

        user.friendList.push(friend);

        await user.save();
        return res.send(user.postList);
    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

//This is to update friend in the friendList

// router.put('/:userId/friendList/:friendId', auth, async (req, res) => {
//     try{
//         const {error} = validate(req.body);
//         if(error) return res.status(400).send(`The user with id`)

//         const user = await User.findById(req.params.userId);
//         if(!user) return res.status(400).send(`The user with id "${req.params.userId}" does not exist.`);

//         const friend = await Friend.findById(req.params.friendId);
//         if (!friend) return res.status(400).send(`The person with id "${req.params.friendId}" is not friends with the user.`);

//         friend.name = req.body.name;
//         friend.description = req.body.description;
//         friend.category = req.body.category;
//         friend.price = req.body.price;
//         friend.dateModified = Date.now();
        
//         await user.save();
//         return res.send(friend);
//     } catch (ex) {
//         return res.status(500).send(`Internal Server Error: ${ex}`);
//     }
// });

//This is the DELETE ACCOUNT button

// router.delete('/:userId', auth, async (req, res) => {
//     try {
//         let user = await User.findById(req.params.userId);
//         if(!user) return res.status(400).send(`The user with id "${req.params.userId}" does not exist.`);

//         user = await user.remove();

//         await user.save();
//         return res.send(user);
//     }catch (ex){
//         return res.status(500).send(`Internal Server Error: ${ex}`);
//     }
// });


//This is the UNFRIEND BUTTON

router.delete('/:userId/friendList/:friendId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if(!user) return res.status(400).send(`The user with id "${req.params.userId}" does not exist.`);

        let friend = user.friendList.id(req.params.friendId);
        if (!friend) return res.status(400).send(`The person with id "${req.params.friendId}" is not friends with the user.`);

        friend = await friend.remove();

        await user.save();
        return res.send(user.friendList);
    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});



//This is for the friend routes......
//find all friends

router.get('/', async (req, res) => {
    try{
        const friends = await Friend.find();
        return res.send(friends);
    }catch(ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

router.get('/:userId/friendList/:friendId', async (req, res) => {
    try{
        const friend = await Friend.findById(req.params.id);
        if(!friend)
            return res.status(400).send(`The friend with id "${req.params.id}" does not exist.`);
            return res.send(friend);
    }catch(ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});


router.post('/', [auth, admin], async (req, res) => {
    try{
        const{error} = validateFriend(req.body);
        if (error)
            return res.status(400).send(error);

        const friend = new Friend ({
            name: req.body.name,
            about: req.body.about,
            locality: req.body.locality,
            status: req.body.status,
        });
        await friend.save();

        return res.send(friend);
    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

//Update user information e-mail, name, password
router.put('/:id', async (req, res) => {
    try{
        const {error} = validateUser(req.body);
        if(error) return res.status(400).send(error);
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                email: req.body.email,
                name: req.body.name,
                password: req.body.password,
                //locality: req.body.locality,
            },
            {new: true}
        );
        if (!user)
            return res.status(400).send(`The person with id "${req.params.id}" does not exist.`);
            await user.save();
            return res.send(user);
    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});


router.delete('/:id', async (req, res) => {
    try{
        const friend = await Friend.findByIdAndRemove(req.params.id);
        if(!friend)
            return res.status(400).send(`The person with id "${req.params.id}" does not exist.`);
    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});



module.exports= router;