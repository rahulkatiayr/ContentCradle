const mongoose=require("mongoose");
const express=require("express");
const app=express();
const Content=require("./models/contentSchema.js");
const Review=require("./models/review.js");
const path = require("path");
const ExpressError=require("./ExpressError.js");
const {contentSchema}=require("./Schema.js");
const ejsMate= require("ejs-mate");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/userSchema.js");
const {url}=require("./middleware.js");

app.use(express.urlencoded({ extended: true }));
app.engine("ejs",ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname,"/public")));
const methodOverride = require("method-override");
const { error } = require("console");
app.use(methodOverride("_method"));
app.use(flash());
const {isloggedin}=require("./middleware.js");

const sessionOption={
    secret :"mysuperstring",
    resave :false ,
    saveUninitialized : true,
    cookie:{
        expires : Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        http:true,

    }
};

app.use(session(sessionOption));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(8080,()=>{
    console.log("active now ");
    
});


main().then(()=>{
    console.log("connected !")
}).
catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ContentCradle');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}




app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
});


app.get("/",(req,res)=>{
    res.send(" ready to act !");
});

// app.get("/demouser",async(req,res)=>{
//     let demoUser=new User({
//         email:"@kanpur",
//         username:"annu",
//     });

//   let demo= await User.register(demoUser,"helloworld");
//   console.log(demo);
//   res.send(demo);
// })



const validateContent = (req, res, next) => {
    console.log(req.body); // Check if req.body is correctly populated
    const result = contentSchema.validate(req.body); // Validate req.body against contentSchema
    console.log(result); // Log the validation result for debugging

    if (result.error) {
        // If there's an error in validation
        let errMsg = result.error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg); // Throw an error with status 400 and error message
    } else {
        next(); // Move to the next middleware if validation passes
    }
}

const validatereview = (req, res, next) => {
    console.log(req.body); // Check if req.body is correctly populated
    const result = reviewSchema.validate(req.body); // Validate req.body against contentSchema
    console.log(result); // Log the validation result for debugging

    if (result.error) {
        // If there's an error in validation
        let errMsg = result.error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg); // Throw an error with status 400 and error message
    } else {
        next(); // Move to the next middleware if validation passes
    }
}


app.get("/contents",asyncWrap(async(req,res)=>{
    let all_data= await Content.find({});
    // // console.log(all_data);
    res.render("index.ejs",{all_data});
}));


app.get("/contents/:id/show",asyncWrap(async(req,res,next)=>{
    let {id}=req.params;
    let result=await Content.findById(id);

    if(!result){

        req.flash("error","This content does not exist !");
        return res.redirect("/contents");

    }
    
    res.render("show.ejs",{result});

}))



app.get("/contents/newform",isloggedin,(req,res)=>{
    try{

    //    if(!req.isAuthenticated()){
    //     req.flash("error","you must be logged in first ");
    //     return res.redirect("/login");
    //    }

     res.render("new.ejs");     
 }
    catch(err){
        console.log(err);}

});


function asyncWrap(fn){
    return function(req,res,next){
        fn(req,res,next).catch((err)=>next(err));
    }
}
    
    

app.post("/contents/new/submit",validateContent,asyncWrap(async(req,res,next)=>{

    let new_content=req.body.Content; 

    if(!new_content){
        next(new ExpressError(400,"new_content is not found !"))
        
        return res.redirect("/content");
    }
    const save_content=await Content(new_content);
    save_content.save();
    req.flash("success","new content created successfully !");
    res.redirect("/contents");


}));

app.get("/contents/:id/edit",isloggedin,asyncWrap(async(req,res,next)=>{
    
    let {id}=req.params;
    console.log(id);
    let view_data=await Content.findById(id);

    if (!view_data) {
        // next(new ExpressError(402,"view data is  not found"));
        req.flash("error"," content of this id does not exist !");
        return res.redirect("/contents");
        
    }

    res.render("edit.ejs",{view_data});
    
})
);



app.put("/contents/:id/update",validateContent,asyncWrap(async(req,res)=>{
    let {id}=req.params;
    let update_one=await Content.findByIdAndUpdate(id,{...req.body.Content},{runValidators:true ,new : true});
    
    if(!update_one){
        next( new error(400,"update_content is not found !"));
    }
        
    req.flash("success","content updated successfully !")


    res.redirect("/contents");

}));

// adding a reviews 
app.post("/contents/:id/reviews",validatereview,asyncWrap(async(req,res)=>{
    let {id}=req.params;
    let find= await Content.findById(id);
    let newReview =new Review(req.body.Review);

    find.reviews.push(newReview);

    await newReview.save();
    await find.save();

    console.log("new review added ! ")
})
)
// delete route 
app.delete("/contents/:id/delete",isloggedin,asyncWrap(async(req,res)=>{
    let {id}=req.params;
    let delete_one=await Content.findByIdAndDelete(id);
    console.log(delete_one);
    req.flash("success","Deleted successfully !");
    res.redirect("/contents");
}));




app.get("/signup",(req,res)=>{
    res.render("./users/signup.ejs");
});

app.post("/signup/submit",asyncWrap(async(req,res)=>{

    try{
        let{username,email,password}= req.body;
        const  newuser=new User({username,email});
        const demo= await User.register(newuser,password);
        console.log(demo);

        req.login(demo,(err)=>{

            if(err){
                return next(err);
            }
            req.flash("success","welcome to content cradle !");
            res.redirect("/contents");
          
        });
        

    }catch(err){
      
        req.flash("error",err.message);
        res.redirect("/signup");
    }
      
}));

app.get("/login",(req,res)=>{
    res.render("./users/login.ejs");

});

app.post("/login/submit",url,passport.authenticate('local', { failureRedirect: '/login' ,failureFlash:true})
,async(req,res)=>{
    req.flash("success","succesfully logged in ");
    res.redirect(res.locals.redirectUrl);


});

app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }
        req.flash("success","logged out succeesfully !");
        res.redirect("/contents");
    });
});









// error handling

app.use((err,req,res,next)=>{
    let {status=500,message="some error "}=err;
    res.render("error.ejs",{status,message});

});

// for wrong route 

app.use("*",(req, res, next) => {
    let message="page not found ";
    let status=400;
    // res.status(400).send(" page not found  !");
    res.render("error.ejs",{message,status})
    // console.log(err.stack");
     
    
});
