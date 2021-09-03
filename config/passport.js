const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const user = require('../models/user');

module.exports = function(passport){
    passport.use(
        new localStrategy({
            usernameField: "username"
        }, (username, password, done) => {
            user.findOne({username: username})
            .then((user) => {
                if(!user){
                    return done(null, false, { message: "Can not find user"})
                }

                bcrypt.compare(password, user.password, (err, success) => {
                    if(err) throw err;

                    if(success){
                        return done(null, user);
                    }

                    return done(null, false, {message: "Password incorrect"})
                })
            })
            .catch(err => console.log(err))
        })
    )

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}

