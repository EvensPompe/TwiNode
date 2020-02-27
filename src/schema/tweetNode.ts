import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const tweetNode = new mongoose.Schema({
   tweet:String,
   imgtweet:[String],
   videotweet:[String],
   date:Date,
   user:{type: Schema.Types.ObjectId,ref:'user'}
});

export default tweetNode;
