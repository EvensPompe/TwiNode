import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'

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

    app.get("/",(req,res)=>{
      res.send("hello world")
    })
    app.listen(this.port, () => {
      console.log(`Le serveur tourne sur le port ${this.port}`);
    })
  }
}
