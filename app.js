//jshint esversion:6
require('dotenv').config(); // dotenv
const express= require ("express");
const bodyParser = require ("body-parser");
const ejs = require("ejs");

const path= require('path');

const mongoose = require("mongoose");
const session = require("express-session");
const passport = require ("passport");
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const req = require('express/lib/request');

const app = express();

// app.use(express.static("./public"));
app.use(express.static("assets"));

app.set('view engine', 'ejs','html');

app.use(bodyParser.urlencoded({
    extended: true 
}));


app.use(session({
    secret: "Our little code",
    resave: false, 
    saveUninitialized: false,

}));

app.use(passport.initialize());
app.use(passport.session());
// connect local database
mongoose.connect ("mongodb://localhost:27017/userTrip", {useNewUrlParser: true});
//connect remote database
// mongoose.connect("mongodb+srv://caracciod1:<password>@cluster0.mz6vx.mongodb.net/test,{useNewUrlParser: true}); 
// Schema for user model
const userSchema =  new mongoose.Schema ({
    email: String ,
    password: String,
    name: String,
    // googleId: String,
    secret: String
}); 
// Schema for places
const placeSchema =  new mongoose.Schema ({
    namePlace: { type :String , unique: false},
    review: String,
    userid: { type :String , unique: false},
    time: { type :String , unique: false},
    rateHeart: { type :String , unique: false},
    productPackages:{ type :String , unique: false},
    cultural: { type :String , unique: false},
    gastronomy:{ type :String , unique: false},
    shopping: { type :String , unique: false},
    infrastructureTransport:{ type :String , unique: false},
    landscapeNaturalResource:{ type :String , unique: false},
    userGmail: { type :String , unique: false}, 
}); 
// connect passportLocal Mongoose plugin 
// placeSchema.plugin(passportLocalMongoose);
placeSchema.plugin(findOrCreate);
// connect passportLocal Mongoose plugin 
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// new User model
const User = new mongoose.model("User", userSchema); 
// new Place model
const Place = new mongoose.model("Place", placeSchema); 

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//------------------------------------------------>>> Server body function<<<--------------------------------------
app.get("/", function(req, res) {
    //demo
    // res.sendFile(path.join(__dirname+'/index.html'));
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
})
app.get("/register", function (req, res) {
    res.render("register");
})
//handle secret pages
app.get("/homepage", function (req, res) {


    if( req.isAuthenticated()) {
        res.render("homepage");
    }else {
        res.redirect("login");
    }
    // looking in our database for all secret property not equal to null
    //  User.find({"secret": {$ne: null}},function (err, foundUsers){
    //      if(err){
    //          console.log(err);
    
    //      }else { 
    //          if(foundUsers) {
    //              res.render("homepage", {usersWithSecrets: foundUsers});
    //          }
    //      }
    //  });
    });

//handle register pages
app.post ("/register", function (req, res) {
    // console.log(req.body.fullname);

   
        User.register({username: req.body.username}, req.body.password , function(err, user){
            if(err) {
                console.log(err);
                    res.redirect("/register");
    
            }else {
                passport.authenticate("local") (req,res, function(){

                    User.findById(req.user.id, function (err,foundUser) {
                        if(!err) {foundUser.name=req.body.fullname ;
                        foundUser.save();
                        }

                    });

                    res.redirect("/homepage");
                });
            }
        } );
     
    });

// after login --> authenticate--> move to /secrets page
app.post ("/login", function (req,res) {
    
        const user = new User( {
            username : req.body.username,
            password : req.body.password , 
    
        });
    // Log in method by passport plug in 
    // Read Document https://www.passportjs.org/concepts/authentication/login/
        req.login(user, function (err){
            if(err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, function () {
                    
                    res.redirect("/homepage");
                });
            }
        });
     
    }) ;

// handle logout 
app.get("/logout", (req,res)=>{
    req.logout();
    res.redirect("/");
})
// --->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>handle each section
// handle each destination
app.
    get("/newyork", function (req, res) {
        console.log(req.user.username); 
        if( req.isAuthenticated()) { 
            
            Place.find({ namePlace:"newyork"}, function (err,docs){
                if(err) {
                    console.log(err);
                    res.render("newyork",{newYorkReview:res.locals.newyorkReview});

                } else {
                    
                    res.render("newyork",{newYorkReview:docs,user:req.user});
                    
                } // use res.locals for data in render template
             });
            
            
            
        }else {
            res.redirect("login");
        }
    
    })

    .get("/tokyo", function (req, res) {

        

        if( req.isAuthenticated()) {
            
            res.render("tokyo");
        }else {
            res.redirect("login");
        }  
    })
    .get("/sydney", function (req, res) {

        if( req.isAuthenticated()) {
            res.render("sydney");
        }else {
            res.redirect("login");
        }  
    })
    .get("/cairo", function (req, res) {

        if( req.isAuthenticated()) {
            console.log("hello Cairo");
            res.render("cairo");
           
        }else {
            res.redirect("login");
        }  
    })
    .get("/rome", function (req, res) {

        if( req.isAuthenticated()) {
            res.render("rome");
        }else {
            res.redirect("login");
        }  
    })
    .get("/paris", function (req, res) {

        if( req.isAuthenticated()) {
            res.render("paris");
        }else {
            res.redirect("login");
        }  
    });
// handle post each destination
app.post("/newyork", function(req,res){
    console.log("post /newyork");
    const submittedSecret= req.body.secret;
    const nameReview = req.body.name;  
    
    Place.create({namePlace: "newyork",
                    review: submittedSecret,
                    userid: req.body.userfullName,
                    time: new Date(),
                    rateHeart:req.body.rateHeart, 
                    productPackages:req.body.productPackages,
                    cultural: req.body.cultural,
                    gastronomy:req.body.gastronomy,
                    shopping: req.body.shopping,
                    infrastructureTransport:req.body.Infras_transport,
                    landscapeNaturalResource:req.body.landscape,
                    userGmail: req.body.userEmail,                 

},function (err,small){
    if (err) {return console.log(err);
    } else { 
        small.save();
        res.redirect("newyork")}

});
})



 // handle delete function 
//  app.post("/delete", catchAsync (async (req, res)=>{
//     console.log("jajajaa");
//     res.send("hahahaha");
//  }));
    app.post("/newyork/delete", function (req,res){
        console.log("post nevr go here")
        console.log(req.body.idReview);
        const checkReviewId = req.body.checkbox;
     Place.findByIdAndRemove(checkReviewId, (err)=>{
        if(!err) { res.redirect("/newyork")
    } else {
        console.log("not found the ID review")
    }
     })  
       
        
    });
// create section for

  

    // User.findById(req.user.id, function (err,foundUser){
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         if(foundUser) {
    //             foundUser.secret = submittedSecret;
    //             foundUser.save(function(){
    //                 res.redirect("/");
    //             });
    //         }
    //     }
    // })






app.listen(3000, function () {
    console.log("Server started on port 3000.");
}) ;