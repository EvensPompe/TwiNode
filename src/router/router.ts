import * as db from '../database/db';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../middlewares/NodeUser';
import MailSMTP from '../middlewares/MailSMTP';

process.env.SECRET_KEY = "secret";


const app = express();
app.get('/', function(req, res) {
  res.render('home', {
    isConnect: true,
  });
});

app.get('/notification', (req, res) => {
  res.render('notification');
})

app.get('/messages', (req, res) => {
  res.render('messages');
})

app.get('/profil', (req, res) => {
  res.render('profil');
})

app.get('/parametres', (req, res) => {
  res.render('parametres');
})

app.get('/connection', (req, res) => {
  res.render('connection');
})

app.post('/connection', (req, res) => {

});

app.get('/inscription', (req, res) => {
  res.render('inscription');
})

app.post('/inscription', (req, res) => {
  db.default.user.findOne({ email: req.body.email }, (err: any, user: any) => {
    if (err) {
      console.log(err);
    } else {
     if (!user) {
       if (req.body.mdp === req.body.confirm) {
         const newUser = new User(req.body.nom, req.body.prenom, req.body.pseudo, req.body.email, req.body.mdp);
         db.default.user.create(newUser,(err:any,user:any)=>{
           if (err) {
            console.log(err);
           }
           var token = jwt.sign(newUser,"secret", { algorithm: 'RS256'});
           console.log(token);
           let smtp = new MailSMTP();
         })
       }else{

       }
     }else{
       console.log();
     }
    }
  })
})

app.get('/deconnection', (req, res) => {
  res.redirect("/")
})

export default app;
