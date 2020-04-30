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
          let result = moment(date).fromNow();
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

    io.of('/messages').on('connection',(socket : socketIO.socket)=>{
      socket.on('message',(data)=>{
        let newMessage = {message:data.message,user:data.user,date:new Date()};
        db.default.conversations.findByIdAndUpdate(data.convId,{ $push:{messages:newMessage}},(err:any,message:any)=>{
          if (err) {

          }else{
            db.default.conversations.findById(data.convId,(err:any,conv:any)=>{
              socket.emit('allMessages',{conv:conv});
            })
          }
        })
      });
      socket.on('disconnect',()=>{
        
      });
    });

    server.listen(this.port, () => {
      console.log(`Le serveur tourne sur le port ${this.port}`);
    });
  }
}
