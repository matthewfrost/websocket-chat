const express = require('express');
const userRouter = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');

userRouter.post('/register', (req, res) => {
    const {username, password, password2} = req.body;

    let errors = [];

    if(!username || !password || !password2){
        errors.push({msg: "Please fill in all fields"});
    }

    if(password != password2){
        errors.push({msg: "Passwords do not match"});
    }

    if(errors.length > 0){
        return res.status(500);
    }

    User.findOne({username: username})
    .then(user => {
        if(user){
            return res.status(500);
        }

        const newUser = new User({
            username,
            password
        })

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err) throw err

                newUser.password = hash;
                newUser.save()
                .then(() => {
                    res.redirect('/');
                })
                .catch(err => {
                    console.log(err);
                })
            })
        })
    })
})

userRouter.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: '/chat.html',
        failureRedirect: '/'
    })(req, res, next)
})

userRouter.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/')
})

module.exports = userRouter;
