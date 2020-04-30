import mongoose from 'mongoose';
import _user from '../schema/user';
import _tweetNode from '../schema/tweetNode';
import _conversation from '../schema/conversation';

let option:object = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
}

const twidb = mongoose.connect('mongodb://localhost:27017/twinode',option);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("C'est connecté !");
});

const user = mongoose.model('user',_user);
const tweetNode = mongoose.model('tweetNode', _tweetNode);
const conversations = mongoose.model('conversation', _conversation);

export default { user,tweetNode,conversations };
