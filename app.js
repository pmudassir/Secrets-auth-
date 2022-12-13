//jshint esversion:6
require('dotenv').config()
const express = require("express");
const ejs = require ("ejs");
const bodyParser = require ("body-parser");
const mongoose = require("mongoose");
const session = require('express-session')
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

//passport and session configs

app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.authenticate('session'));
app.use(passport.initialize());
app.use(passport.session());
 
mongoose.set('strictQuery', true);
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String 
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res){
    if(req.isAuthenticated()){
        res.redirect("/secrets")
    } else{
        res.render("home");
    }
});

app.get("/login", function(req,res){
    if(req.isAuthenticated()){
        res.redirect("/secrets")
    } else{
        res.render("login");
    }
    
});

app.get("/register", function(req, res){
    if(req.isAuthenticated()){
        res.redirect("/secrets")
    } else{
        res.render("register");
    }
});

app.get("/secrets", function(req, res){
    //below code kills the session avoids the back button issue
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stal   e=0, post-check=0, pre-check=0');

    if (req.isAuthenticated()) {
        res.render("secrets")
    } else {
        res.redirect("/login")
    }
})

app.get("/logout", function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect("/");
    });
  });

app.post("/register", function(req, res){
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res ,function(){
                res.redirect("/secrets")
            })
        }
    })
})

app.post("/login", passport.authenticate("local"), function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.logIn(user, function(err){
        if(err){
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
    })
})

app.listen(3000, function(){
    console.log("Server started on Port 3000");
});