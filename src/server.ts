import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import exphbs from 'express-handlebars';
import applications from './router/router';
import session from 'express-session';

export default class Server {

  private port: number;

  constructor(port: number) {
    this.port = port;
  }

  public start() {
    const app = express();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cors());
    app.set('trust proxy', 1) // trust first proxy
    app.use(session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true }
    }));

    app.engine('handlebars', exphbs());
    app.set('view engine', 'handlebars');
    app.use('/static', express.static('public'));

    app.use('/', applications)

    app.listen(this.port, () => {
      console.log(`Le serveur tourne sur le port ${this.port}`);
    })
  }
}
