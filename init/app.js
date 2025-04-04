const mongoose=require("mongoose");
const Content=require("../models/contentSchema.js")
const initdata=require("./data.js");

main().then(()=>{
    console.log("connected");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ContentCradle');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
};

const initdb = async () => {
    try {
        await Content.deleteMany({});
        await Content.insertMany(initdata);
        console.log("insert successfully");
    } catch (err) {
        console.error(err);
    }
};


initdb();