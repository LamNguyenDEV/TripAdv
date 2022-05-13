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


// const popup = require("node-popup");
// var popup = require("popups");

var alert = require('alert');

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
// mongoose.connect ("mongodb://localhost:27017/userTrip", {useNewUrlParser: true});
//connect remote database
mongoose.connect("mongodb+srv://admin-lam:Test123@cluster0.velxy.mongodb.net/tripUser",{useNewUrlParser: true});
// mongoose.connect("mongodb+srv://caracciod1:<password>@cluster0.mz6vx.mongodb.net/test,{useNewUrlParser: true}); 
// Schema for user model.
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
                   
                alert("****Unsucessful Register.Please try again****");
                    res.redirect("/register");
            }else {
                passport.authenticate("local") (req,res, function(){

                    User.findById(req.user.id, function (err,foundUser) {
                        if(!err) {
                        foundUser.name=req.body.fullname ;
                        alert("****Sucessful Register.Welcome new member!!****");
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
                alert("Login is failed. Please try again");
                // console.log(err);
                console.log("this go here");
                res.redirect("/login");
                
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
});
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
//cairo
    .get("/cairo", function (req, res) {
        console.log(req.user.username); 
        if( req.isAuthenticated()) { 
            
            Place.find({ namePlace:"cairo"}, function (err,docs){
                if(err) {
                    console.log(err);
                    res.render("cairo",{cairoReview:res.locals.cairoReview});

                } else {
                    
                    res.render("cairo",{cairoReview:docs,user:req.user});
                    
                } // use res.locals for data in render template
             });
            
            
            
        }else {
            res.redirect("login");
        }
    
    })
    // paris
   .get("/paris", function (req, res) {
        console.log(req.user.username); 
        if( req.isAuthenticated()) { 
            
            Place.find({ namePlace:"paris"}, function (err,docs){
                if(err) {
                    console.log(err);
                    res.render("paris",{parisReview:res.locals.cairoReview});

                } else {
                    
                    res.render("paris",{parisReview:docs,user:req.user});
                    
                } // use res.locals for data in render template
             });
            
            
            
        }else {
            res.redirect("login");
        }
    
    })
    //rome
    .get("/rome", function (req, res) {
        console.log(req.user.username); 
        if( req.isAuthenticated()) { 
            
            Place.find({ namePlace:"rome"}, function (err,docs){
                if(err) {
                    console.log(err);
                    res.render("rome",{romeReview:res.locals.cairoReview});

                } else {
                    
                    res.render("rome",{romeReview:docs,user:req.user});
                    
                } // use res.locals for data in render template
             });
            
            
            
        }else {
            res.redirect("login");
        }
    
    })
    //sydney
    .get("/sydney", function (req, res) {
        console.log(req.user.username); 
        if( req.isAuthenticated()) { 
            
            Place.find({ namePlace:"sydney"}, function (err,docs){
                if(err) {
                    console.log(err);
                    res.render("sydney",{sydneyReview:res.locals.cairoReview});

                } else {
                    
                    res.render("sydney",{sydneyReview:docs,user:req.user});
                    
                } // use res.locals for data in render template
             });
            
            
            
        }else {
            res.redirect("login");
        }
    
    })
    //tokyo
    .get("/tokyo", function (req, res) {
        console.log(req.user.username); 
        if( req.isAuthenticated()) { 
            
            Place.find({ namePlace:"tokyo"}, function (err,docs){
                if(err) {
                    console.log(err);
                    res.render("tokyo",{tokyoReview:res.locals.cairoReview});

                } else {
                    
                    res.render("tokyo",{tokyoReview:docs,user:req.user});
                    
                } // use res.locals for data in render template
             });
            
            
            
        }else {
            res.redirect("login");
        }
    
    })
// ---------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>handle post each destination
//newyork
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
        alert("***Sucessful post your post***");
        res.redirect("newyork")}

});
});


////Paris
app.post("/paris", function(req,res){
    console.log("post /paris");
    const submittedSecret= req.body.secret;
    const nameReview = req.body.name;  
    
    Place.create({namePlace: "paris",
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
        alert("***Sucessful post your post***");
        small.save();
        res.redirect("paris")}

});
});

//rome
app.post("/cairo", function(req,res){
    console.log("post /rome");
    const submittedSecret= req.body.secret;
    const nameReview = req.body.name;  
    
    Place.create({namePlace: "cairo",
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
        alert("***Sucessful post your post***");
        res.redirect("cairo")}

});
});

//sydney
app.post("/sydney", function(req,res){
    console.log("post /sydney");
    const submittedSecret= req.body.secret;
    const nameReview = req.body.name;  
    
    Place.create({namePlace: "sydney",
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
        alert("***Sucessful post your post***");
        res.redirect("sydney")}

});
});
//Rome
app.post("/rome", function(req,res){
    console.log("post/rome");
    const submittedSecret= req.body.secret;
    const nameReview = req.body.name;  
    
    Place.create({namePlace: "rome",
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
        alert("***Sucessful post your post***");
        res.redirect("rome")}

});
});

//tokyo
app.post("/tokyo", function(req,res){
    console.log("post /tokyo");
    const submittedSecret= req.body.secret;
    const nameReview = req.body.name;  
    
    Place.create({namePlace: "tokyo",
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
        alert("***Sucessful post your post***");
        res.redirect("tokyo")}

});
});




 // handle delete function 
//  app.post("/delete", catchAsync (async (req, res)=>{
//     console.log("jajajaa");
//     res.send("hahahaha");
//  }));
// delete function NewYork
    app.post("/newyork/delete", function (req,res){
        console.log("post nevr go here")
        console.log(req.body.idReview);
        const checkReviewId = req.body.checkbox;
     Place.findByIdAndRemove(checkReviewId, (err)=>{
        if(!err) {
            alert("***Sucessful delete your post***"); 
            res.redirect("/newyork")
    } else {
        console.log("not found the ID review")
    }
     })  
       
        
    });

 //delete function cairo
 app.post("/cairo/delete", function (req,res){
    console.log("post nevr go here")
    console.log(req.body.idReview);
    const checkReviewId = req.body.checkbox;
 Place.findByIdAndRemove(checkReviewId, (err)=>{
    if(!err) { 
        alert("***Sucessful delete your post***");
        res.redirect("/cairo")
} else {
    console.log("not found the ID review")
}
 })  
   
    
});
 //delete function paris
 app.post("/paris/delete", function (req,res){
    console.log("post nevr go here")
    console.log(req.body.idReview);
    const checkReviewId = req.body.checkbox;
 Place.findByIdAndRemove(checkReviewId, (err)=>{
    if(!err) { 
        alert("***Sucessful delete your post***");
        res.redirect("/paris");
} else {
    console.log("not found the ID review")
}
 })  
   
    
});
 //delete function rome
 app.post("/rome/delete", function (req,res){
    console.log("post nevr go here")
    console.log(req.body.idReview);
    const checkReviewId = req.body.checkbox;
 Place.findByIdAndRemove(checkReviewId, (err)=>{
    if(!err) {
        alert("***Sucessful delete your post***");
        res.redirect("/rome");
} else {
    console.log("not found the ID review")
}
 })  
   
    
});
 //delete function sydney
 app.post("/sydney/delete", function (req,res){
    console.log("post nevr go here")
    console.log(req.body.idReview);
    const checkReviewId = req.body.checkbox;
 Place.findByIdAndRemove(checkReviewId, (err)=>{
    if(!err) { 
        alert("***Sucessful delete your post***");
        res.redirect("/sydney")
} else {
    console.log("not found the ID review")
}
 })  
   
    
});
 //delete function tokyo
 app.post("/tokyo/delete", function (req,res){
    console.log("post nevr go here")
    console.log(req.body.idReview);
    const checkReviewId = req.body.checkbox;
 Place.findByIdAndRemove(checkReviewId, (err)=>{
    if(!err) { 
        alert("***Sucessful delete your post***");
        res.redirect("/tokyo")
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





// process.env.Port for HeroKu
app.listen(process.env.PORT || 3000, function() {
    console.log("Server has started on port 3000");
  });