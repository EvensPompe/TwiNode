import * as db from '../database/db';
import express from 'express';
import multer from 'multer';
var upload = multer({ dest: 'uploads/' });
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../middlewares/NodeUser';
import * as nodemailer from 'nodemailer';
import Mail from '../middlewares/Mail';
import Tweet from '../middlewares/Tweet';
import { TokenGenerator, TokenBase } from 'ts-token-generator';

process.env.SECRET_KEY = "secret";


const app = express();

app.get('/',function(req, res) {
  db.default.tweetNode.find({},(err,data)=>{
    if (req.session.token) {
      res.render('home',{
        isConnected:true,
        tweets: data
      });
    }else{
      res.render('home',{
        isConnected:false,
        tweets: data
      });
    }
  })
});

app.post("/newTwiNode",upload.fields([{name:'imgtweet'},{name:'videotweet'}]),(req,res)=>{
// console.log(req.files.imgtweet,req.files.videotweet);
let imgsPath:[string] = req.files.imgtweet.map((img:object) =>{
  return img.path;
});

let videosPath:[string] = req.files.videotweet.map((video:object) =>{
  return video.path;
});

let tweet = new Tweet(req.body.tweet,imgsPath,videosPath,req.session.iduser);
db.default.tweetNode.create(tweet,(err:any,data:any)=>{
  if (err) {
    console.log(err);
  }else{
    res.redirect("/");
  }
})
});

app.get('/notification', (req, res) => {
  if (req.session.token) {
    res.render('notification',{
      isConnected:true
    });
  }else{
    res.render('notification',{
      isConnected:false
    });
  }
})

app.get('/messages', (req, res) => {
  if (req.session.token) {
    res.render('messages',{
      isConnected:true
    });
  }else{
    res.render('messages',{
      isConnected:false
    });
  }
})

app.get('/profil', (req, res) => {
  if (req.session.token) {
    res.render('profil',{
      isConnected:true,
      pseudo:req.session.pseudo
    });
  }else{
    res.render('profil',{
      isConnected:false
    });
  }
})

app.get('/parametres', (req, res) => {
  if (req.session.token) {
    res.render('parametres',{
      isConnected:true
    });
  }else{
    res.render('parametres',{
      isConnected:false
    });
  }
})

app.get('/connection', (req, res) => {
  res.render('connection');
})

app.post('/connection', (req, res) => {
  db.default.user.findOne({email:req.body.email},(err:any, user:any)=>{
    if (bcrypt.compareSync(req.body.mdp,user.mdp)) {
      req.session.iduser = user._id
      req.session.pseudo = user.pseudo
      req.session.email = user.email
      req.session.token = user.token
      res.redirect("/profil")
    }else{
      console.log("Votre identifiant ou votre mot de passe ne sont pas valide !");
    }
  })
});

app.get('/inscription', (req, res) => {
  res.render('inscription');
})

app.post('/inscription', (req, res) => {
  db.default.user.findOne({ email: req.body.email }, (err: any, user: any) => {
    if (err) {
      console.log(err);
    } else {
     if (!user && user.estActif) {
       if (req.body.mdp === req.body.confirm) {
        let confToken = new TokenGenerator();
         confToken.generate();
         const newUser = new User(req.body.nom, req.body.prenom, req.body.pseudo, req.body.email, req.body.mdp,confToken.generate());
         db.default.user.create(newUser,(err:any,user:any)=>{
           if (err) {
            console.log(err);
           }
           let userJwt:object = {
             nom:newUser.Nom,
             prenom:newUser.Prenom,
             pseudo:newUser.Pseudo,
             email:newUser.Email,
             token:newUser.Token
           }

           var tokenjwt = jwt.sign(userJwt,"secret",{expiresIn : 600});
           let mail = new Mail();
           mail.sendMail(newUser.Email,"Demande d'inscription à TwiNode",`Hello ${newUser.Pseudo},
           votre nouveau compte a été créé avec succès !
           Pour confirmer l'inscription, cliquez sur le lien ci-dessous :
           http://localhost:3001/user/confirmation?&jwt=${tokenjwt}
           Attention: Vous avez dix minutes pour confirmer votre compte. Si vous n'êtes pas à l'origine, ignorer le message !
           À très bientôt !


           Evens POMPE de TwiNode.`);
         })
         res.redirect('/')
       }else{
        console.log("Votre identifiant ou votre mot de passe ne sont pas valide !");
       }
     }else{

       let userJwt:object = {
         _id:user._id,
         nom:user.nom,
         prenom:user.prenom,
         pseudo:user.pseudo,
         email:user.email,
         token:user.token
       }

       var tokenjwt = jwt.sign(userJwt,"secret",{expiresIn : 600});
       let mail = new Mail();
       mail.sendMail(user.email,"Redemande d'inscription à TwiNode",`Hello ${user.pseudo},
       votre compte est déjà créé, mais il n'est pas confirmé !
       Pour confirmer l'inscription, cliquez sur le lien ci-dessous :
       http://localhost:3001/user/confirmation?&jwt=${tokenjwt}
       Attention: Vous avez dix minutes pour confirmer votre compte. Si vous n'êtes pas à l'origine, ignorer le message !
       À très bientôt !


       Evens POMPE de TwiNode.`);
       res.redirect('/')
     }
    }
  })
})

app.get("/user/confirmation",(req,res)=>{
  jwt.verify(req.query.jwt,"secret",(err:any,jwtData:any)=>{
    if (err) {
      console.log(err);
      res.redirect('/inscription')
    }
    let conditionConf:object = { email: jwtData.email, token: jwtData.token };
    let update:object = {estActif: true};
    db.default.user.findOneAndUpdate(conditionConf,update,{new:true},(err,data)=>{
      req.session.pseudo = data.pseudo
      req.session.email = data.email
      req.session.token = data.token
      res.redirect('/')
    })
  });
})

app.get('/deconnection', (req, res) => {
    req.session = null
    res.redirect("/")
})

export default app;
