var passport=require("passport"),
 GoogleStrategy = require('passport-google-oauth20').Strategy,
   User=require("../models/user"),
   connection=require("../data/data.js");

// Google sign to store user data in MySql Database.

passport.serializeUser((user, done) => {
    done(null, user.id);
});
 passport.deserializeUser((id, done) => {
connection.query("select * from user where id = '"+id+"'"+";",function(err,rows){  
    done(err, rows[0]);
    });

});



passport.use(
    new GoogleStrategy({
        // options for google strategy
       clientID:'' ,//put your ID here 
    clientSecret:'' ,// put your secret here
    callbackURL: "/auth/google/redirect"
    }, (accessToken, refreshToken, profile, done) => {
      connection.query("select * from user where username = '"+profile.displayName+"'",function(error,rows)
      {
           if(error)
            console.log(error);
            else
            {
                 console.log(rows);
                 if(rows.length!=0)
                 {
                      return done(null,rows)
                 }else
                 {
                    var newUser={
                         username:profile.displayName,
                         gid:profile.id
                    }
                    
                    connection.query('insert into user set ?',newUser,function(error,result)
                    {
                         if(error)
                         console.log(error);
                         else
                         {
                            return done(null,newUser); 
                         }
                    });
                 }
            }
           
      });
    })
);

// Google sign to store user data in MongoDB (NoSql) Database.
/*const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');
 passport.serializeUser((user, done) => {
    done(null, user.id);
});
 passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});
 passport.use(
    new GoogleStrategy({
        // options for google strategy
       clientID:'' ,
    clientSecret:'' ,
    callbackURL: "/auth/google/redirect"
    }, (accessToken, refreshToken, profile, done) => {
        // check if user already exists in our own db
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                // already have this user
                console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    thumbnail: profile._json.image.url
                }).save().then((newUser) => {
                    console.log('created new user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    })
);*/
