module.exports.isloggedin=(req,res,next)=>{
    // console.log(req);
    // console.log(req.path,req.originalUrl);
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in first ");
        return res.redirect("/login");
       }else{
        next ();
       }

}

module.exports.url=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl
    }else{
        res.locals.redirectUrl='/contents';

    }

    next();

}