import mongoose from 'mongoose';
import _user from '../schema/user';
import _tweetNode from '../schema/tweetNode';
import _conversation from '../schema/conversation';
import dotenv from "dotenv";

dotenv.config();

import InterUser from "../interfaces/InterUser";

let option:object = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
}

const twidb = mongoose.connect(process.env.DB,option);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("C'est connecté !");
});

const user = mongoose.model<InterUser>('user',_user);
const tweetNode = mongoose.model('tweetNode', _tweetNode);
const conversations = mongoose.model('conversation', _conversation);

export default { user,tweetNode,conversations };
