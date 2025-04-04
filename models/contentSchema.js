const mongoose=require("mongoose");
const Schema=mongoose.Schema;


let contentSchema=new Schema({
    title:{
        type:String,
        required:true
    },

    author:{
        type:String,
        required:true,
    },

    category:{
        type :String,
        required:true,
        

    },

    content :{
        type:String,
        required:true,
    },
    
    date:{
        type:Date,
        default:Date.now(),
    }
    ,

    reviews : [{
        type : Schema.Types.ObjectId,
        ref : "Review",
    }]
})

const Content=mongoose.model("Content",contentSchema);
module.exports=Content;