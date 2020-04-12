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

    io.on('connection', function(socket) {
      socket.emit('news', { hello: 'world' });
      socket.on('my other event', function(data) {
        console.log(data);
      });
    });

    io.on('connection',(socket : socketIO.socket)=>{
      console.log('hello');

    })

    server.listen(this.port, () => {
      console.log(`Le serveur tourne sur le port ${this.port}`);
    })
  }
}
