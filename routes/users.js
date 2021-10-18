const {User, validateUser} = require('../models/user');
const {Friends} = require('../models/friends');
const {Post, validatePost} = require('../models/post');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const express = require('express');
const admin = require('../middleware/admin');
const router = express.Router();
const jwt = require('jsonwebtoken');

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


//User create post
router.post('/posts/:userId/create', auth, async (req, res) => {
    
    try{
        const {error} = validatePost(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.params.userId);
        if(!user) return res.status(400).send(`The user with id "${req.params.userId}" does not exist.`);
    
        const post = new Post({
            userId: req.params.userId,
            content: req.body.content,
        });

        post.save();

        return res.send({success: true, msg:'Your post was published.', data:post});

    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

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

//This is to create new user account
router.post('/create-new-account', async (req, res) => {
    try{
        const {error} = validateUser(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email});
        if (user) return res.status(400).send(`User already registered.`);

        const salt = await bcrypt.genSalt(10);
        user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            dob: req.body.dob,
            password: await bcrypt.hash(req.body.password, salt)
        });
        await user.save();

        const token = user.generateAuthToken();
        return res.send({success:true, _id:user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, token: token });

    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

router.post('/search/friends', auth, async(req, res) => {
    try{
        User.find({ $text: { $search: req.body.keyword } } )
        .then(result => {
            if(!result)
            {
                res.status(404).send('No record found.');
            }
            
            let user = jwt.decode(req.headers.token);
            const searchedFriends = [];

            result.forEach(row => {
                if(row.id !== user._id)
                    Friends.findOne({"friendId":row._id, "userId":user._id})
                    .then(friend => {
                        if(friend)
                        {
                            searchedFriends.push({
                                _id: friend.details._id,
                                firstName: friend.details.firstName,
                                lastName: friend.details.lastName,
                                status: friend.status
                            })
                        }else{
                            searchedFriends.push({
                                _id: row._id,
                                firstName: row.firstName,
                                lastName: row.lastName,
                                status: null
                            })
                        }
                    });
            })
            setTimeout(() => {
                res.status(200).send({
                    success: true,
                    friends: searchedFriends,
                    msg: '' 
                 });
            }, 500)
            
        })
    }catch(e)
    {
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});

router.post('/friends/send/invite', auth, async(req, res) => {
    try{
        let user = jwt.decode(req.headers.token);

        /* Create friend invite record for active User */
        const activeUser = Friends.find({"userId": user._id, "friendId":req.body._id})
        .then(friend => {
            if(friend.length == 0)
            {
                let activeUserFriend = new Friends({
                    userId: user._id,
                    friendId: req.body._id,
                    details: req.body
                });

                activeUserFriend.save();

                /* Create record request record */
                let invitedFriend = new Friends({
                    userId: req.body._id,
                    friendId: user._id,
                    details: {_id: user._id, firstName: user.firstName, lastName: user.lastName, status: null},
                    status: 'request'
                });

                invitedFriend.save();

                return res.status(200).send({success: true, msg: 'Friend invite was sent to '+req.body.firstName, friend: activeUserFriend});
            }else{
                return res.status(400).send({success: true, msg: friend[0].status == 'pending' ? 'Friend invite was already sent' : '', friend: friend});
            }
        });

        
    }catch(e){
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});

router.get('/friend/requests', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);

    const activeUser = Friends.find({"userId":user._id, "status": "request"})
    .then(request => {
        if(request.length > 0)
        {
            return res.status(200).send(request);
        }else{
            return res.status(204).send({msg: "No friend request available."})
        }
    });
});

router.post('/friend/request/accept', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);
    // return res.status(200).send(req.body);
    
    /* Update user friend request */
    Friends.findOneAndUpdate({"userId": user._id, "friendId": req.body.friendId},{status: 'friends'})
    .then(result => {
        result.status = 'friends';

        /* Update friend's status to [friends] */
        Friends.findOneAndUpdate({"userId": req.body.friendId, "friendId": user._id},{status: 'friends'})
        .then(result2 => {
            return res.status(200).send({success: true, msg: 'You became now friends with '+ req.body.details.firstName+'.',  friend: result});
        })

    });
});

router.post('/friend/request/decline', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);
    // return res.status(200).send(req.body);
    
    /* Update user friend request */
    Friends.findOneAndUpdate({"userId": user._id, "friendId": req.body.friendId},{status: 'declined'})
    .then(result => {
        result.status = 'friends';

        /* Update friend's status to [friends] */
        Friends.findOneAndUpdate({"userId": req.body.friendId, "friendId": user._id},{status: 'declined'})
        .then(result2 => {
            return res.status(200).send({success: true, msg: 'Friend request of '+ req.body.details.firstName+' was declined.',  friend: result});
        })

    });
});

router.get('/friends/lists', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);
    try{
        let activeFriends = [];
        Friends.find({"userId" : user._id, "status": "friends"}).then(async(data) => {
            
            data.forEach(async(row) => {
                await User.findById(row.details._id).then(u => {
                    activeFriends.push({
                        _id: row._id,
                        friendId: row.friendId,
                        userId: row.userId,
                        details: row.details,
                        status: row.status,
                        isLogin: u.isLogin
                    });
                });
            });

            setTimeout(() => {
                return  res.status(200).send({success: true, friends: activeFriends})
            }, 300)
        });


    }catch(e)
    {
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});


router.get('/news/feed', auth, async(req,res) =>{
    let user = jwt.decode(req.headers.token);
    Post.find({"status": true}).sort({"createdAt": -1}).then(request => {
        return res.status(200).send(request);
    });
});


module.exports= router;