import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import exphbs from 'express-handlebars';
export default class Server {

  private port:number;

  constructor(port:number) {
    this.port = port;
  }

  public start(){
    const app = express();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cors());

    app.engine('handlebars', exphbs());
    app.set('view engine', 'handlebars');
    app.use('/static',express.static('public'));

    app.get('/', function (req, res) {
      
    res.render('home',{
      isConnect: false,
    });
    });
    app.listen(this.port, () => {
      console.log(`Le serveur tourne sur le port ${this.port}`);
    })
  }
}
