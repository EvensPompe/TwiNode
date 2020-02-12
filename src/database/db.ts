import mongoose from 'mongoose';
import _user from '../schema/user';
import _tweetNode from '../schema/tweetNode';

const twidb = mongoose.connect('mongodb://localhost:27017/twinode', {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("C'est connecté !");
});

const user = mongoose.model('user',_user);
const tweetNode = mongoose.model('tweetNode', _tweetNode);

export default { tweetNode,user,db,twidb };
