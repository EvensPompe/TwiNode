import mongoose from 'mongoose';

const tweetNode = new mongoose.Schema({
   tweet:String,
   imgtweet:String,
   videotweet:String,
   date:Date
});

export default tweetNode;
