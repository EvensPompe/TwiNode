import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const conversation = new mongoose.Schema({
  dest: String,
  messages:[{user:String,message:String,date:Date}],
  user:{type: Schema.Types.ObjectId,ref:'user'}
});

export default conversation;
