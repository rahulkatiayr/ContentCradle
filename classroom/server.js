const express=require("express");
const app=express();
const session=require("express-session")
const flash=require("connect-flash");

const sessionOption={
    secret :"mysuperstring",
    resave :false ,
    saveUninitialized : true


}
app.use(session(sessionOption));
app.use(flash());

app.listen(9000,()=>{
    console.log("active now !");
});

app.get("/test",(req,res)=>{
    res.send("hello");
});

app.get("/reqcount",(req,res)=>{
    if(req.session.count){
        req.session.count++;
    }else{
        req.session.count=1;
    }

    app.flash("success","count added succesfully ");
   
    
    res.send(`request count is ${req.session.count}`);
})

