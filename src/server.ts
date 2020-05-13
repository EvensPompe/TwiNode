import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import exphbs from 'express-handlebars';
import applications from './router/router';
import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import moment from './middlewares/moment';
import socketIO from 'socket.io';
import http from 'http';
import * as db from './database/db';

export default class Server {

  private port: number;

  constructor(port: number) {
    this.port = port;
  }

  public start() {
    const app = express();
    const server = http.createServer(app);
    const io = socketIO.listen(server);

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cookieParser())
    app.use(cors());
    app.set('trust proxy', 1) // trust first proxy
    app.use(cookieSession({
      secret: 'keyboard cat',
      name: 'session',
      keys: ['key1', 'key2']
    }));

    var hbs = exphbs.create({
      // Specify helpers which are only registered on this instance.
      helpers: {
        isEqual: function(value1: any, value2: any) {
          return value1 === value2;
        },
        fromNow: function(date: any) {
          let result = moment(date).format("DD/MM/YYYY HH:mm");
          return result;
        }
      }
    });

    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');
    app.use('/static', express.static('public'));
    app.use('/uploads', express.static('uploads'));
    app.use('/profil/uploads', express.static('uploads'));

    app.use('/', applications)

    io.on('connection', (socket: socketIO.socket) => {
      socket.on('message', (data) => {
        let newMessage = { message: data.message, user: data.user, date: new Date() };
        db.default.conversations.findByIdAndUpdate(data.convId, { $push: { messages: newMessage } },{new:true}).populate("dest", "-mdp -token -estActif -nom -prenom").populate("user", "-mdp -token -estActif -nom -prenom").exec((err: any, message: any) => {
          if (err) {
            console.log(err);
          } else {
            if (data.socketUser == message.user.socketUser) {
              if (data.socketDest == message.dest.socketUser) {
                io.to(data.socketDest).emit('allMessages', { conv: newMessage });
              }else{
                io.to(message.dest.socketUser).emit('allMessages', { conv: newMessage });
                io.to(data.socketUser).emit('allMessages', { conv: newMessage });
              }
            }else{
              if (data.socketUser == message.dest.socketUser) {
                io.to(message.user.socketUser).emit('allMessages', { conv: newMessage });
              }else{
                io.to(message.user.socketUser).emit('allMessages', { conv: newMessage });
                io.to(message.dest.socketUser).emit('allMessages', { conv: newMessage });
              }
            }
          }
        })
      });

      socket.on('socketUser',(data)=>{
        db.default.user.findByIdAndUpdate(data.user,{socketUser:data.socketUser},{new:true},(err,result)=>{
        //   db.default.conversations.findById(data.convId).populate("dest", "-mdp -token -estActif -nom -prenom").populate("user", "-mdp -token -estActif -nom -prenom").exec((err,conv)=>{
        //     if (conv.dest.socketUser == data.dest) {
        //       console.log(conv.dest.socketUser == data.destUser,conv.dest.socketUser,data.destUser,1);
        //     }else{
        //       console.log(conv.dest.socketUser == data.destUser,conv.dest.socketUser,data.dest,2);
        //     }
        //   })
        });
      })

      socket.on('searchUser', (data) => {
        db.default.user.find({}, (err, users) => {
          let allUsers = users.map(user => {
            return { pseudo: user.pseudo, id: user._id };
          })

          let result = allUsers.filter(user => {
            return user.pseudo.toLowerCase().includes(data.inputRech.toLowerCase().toString()) == true;
          });
          socket.emit('searchResult', {
            result: result
          })
        })
      });
      socket.on('disconnect', () => {

      });
    });

    server.listen(this.port, () => {
      console.log(`Le serveur tourne sur le port ${this.port}`);
    });
  }
}
