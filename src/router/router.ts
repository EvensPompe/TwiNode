import * as db from '../database/db';
import express from 'express';
import multer from 'multer';
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads')
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage })
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import User from '../middlewares/NodeUser';
import Mail from '../middlewares/Mail';
import Tweet from '../middlewares/Tweet';
import verif from '../middlewares/verif';

import { TokenGenerator, TokenBase } from 'ts-token-generator';

process.env.SECRET_KEY = "secret";

const app = express();

app.get('/', function(req, res) {
  db.default.tweetNode.find({}).populate("user", "-mdp -token -estActif -nom -prenom").exec((err, data) => {
    if (req.session ?.token) {
      res.render('home', {
        isConnected: true,
        tweets: data
      });
    } else {
      res.render('home', {
        isConnected: false,
        tweets: data
      });
    }
  })
});

app.post("/newTwiNode", upload.fields([{ name: 'imgtweet' }, { name: 'videotweet' }]), (req, res) => {
  let imgsPath: string[] = verif(req.files ?.imgtweet);
  let videosPath: string[] = verif(req.files ?.videotweet);

  if (imgsPath.length == 0 && videosPath == 0 && !req.body.tweet) {
    res.redirect("/");
  } else {
    let tweet = new Tweet(req.body.tweet, imgsPath, videosPath, req.session ?.iduser);

    db.default.tweetNode.create(tweet, (err: any, tweet: any) => {
      db.default.user.findByIdAndUpdate(tweet.user, { $push: { tweets: tweet._id } }, (error: any, data: any) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/");
        }
      })
    })
  }
});

app.get('/notification', (req, res) => {
  if (req.session ?.token) {
    res.render('notification', {
      isConnected: true
    });
  } else {
    res.redirect("/connection");
  }
})

app.get('/messages', (req, res) => {
  if (req.session ?.token) {
    res.render('messages', {
      isConnected: true
    });
  } else {
    res.redirect("/connection");
  }
})

app.get('/profil', (req, res) => {
  if (req.session ?.token) {
    res.render('profil', {
      isConnected: true,
      pseudo: req.session ?.pseudo
    });
  } else {
    res.redirect("/connection");
  }
})

app.get('/profil/mes_twinodes', (req, res) => {
  db.default.tweetNode.find({ user: req.session.iduser }).populate("user", "-mdp -token -estActif -nom -prenom").exec((err: any, tweets: any) => {
    if (req.session ?.token) {
      res.render('profil', {
        isConnected: true,
        pseudo: req.session ?.pseudo,
        tweets: tweets,
        mes_twinodes: true
      });
    } else {
      res.redirect("/connection");
    }
  })
})

app.get('/profil/mes_reponses', (req, res) => {
  if (req.session ?.token) {
    res.render('profil', {
      isConnected: true,
      pseudo: req.session ?.pseudo,
      mes_reponses: true
    });
  } else {
    res.redirect("/connection");
  }
})

app.get('/profil/aime', (req, res) => {
  if (req.session ?.token) {
    res.render('profil', {
      isConnected: true,
      pseudo: req.session ?.pseudo,
      aime: true
    });
  } else {
    res.redirect("/connection");
  }
})

app.get('/parametres', (req, res) => {
  if (req.session ?.token) {
    res.render('parametres', {
      isConnected: true
    });
  } else {
    res.redirect("/connection");
  }
})

app.get('/parametres/pseudo', (req, res) => {
  db.default.user.findById(req.session?.iduser,(err:any,user:any)=>{
    if (req.session ?.token) {
      res.render('parametres', {
        isConnected: true,
        pseudo: true,
        user:user
      });
    } else {
      res.redirect("/connection");
    }
  })
})

app.post('/parametres/pseudo', (req, res) => {
  if (req.session ?.pseudo == req.body?.newPseudo) {
    res.redirect("/parametres/pseudo");
  }
  db.default.user.findOneAndUpdate({ pseudo: req.session ?.pseudo }, { pseudo: req.body?.newPseudo }, { new: true }, (err:any, user:any) => {
    req.session ?.pseudo = req.body?.newPseudo
    res.redirect("/parametres/pseudo");
  })
})

app.get('/parametres/email', (req, res) => {
  if (req.session ?.token) {
    res.render('parametres', {
      isConnected: true,
      email: true
    });
  } else {
    res.redirect("/connection");
  }
})

app.get('/parametres/mdp', (req, res) => {
  if (req.session ?.token) {
    res.render('parametres', {
      isConnected: true,
      mdp: true
    });
  } else {
    res.redirect("/connection");
  }
})

app.get('/parametres/desactivation', (req, res) => {
  if (req.session ?.token) {
    res.render('parametres', {
      isConnected: true,
      desactivation: true
    });
  } else {
    res.redirect("/connection");
  }
})

app.get('/connection', (req, res) => {
  res.render('connection');
})

app.post('/connection', (req, res) => {
  db.default.user.findOne({ email: req.body.email }, (err: any, user: any) => {
    if (!user) {
      res.render("connection", {
        error: true,
        message: "Le compte n'existe pas !"
      })
    } else {
      if (bcrypt.compareSync(req.body.mdp, user.mdp)) {
        req.session.iduser = user._id
        req.session ?.pseudo = user.pseudo
       req.session ?.email = user.email
       req.session ?.token = user.token
       res.redirect("/profil")
      } else {
        res.render("connection", {
          error: true,
          message: "Votre identifiant ou votre mot de passe ne sont pas valide !"
        })
      }
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
      if (!user) {
        if (req.body.mdp === req.body.confirm) {
          let confToken = new TokenGenerator();
          confToken.generate();
          const newUser = new User(req.body.nom, req.body.prenom, req.body.pseudo, req.body.email, req.body.mdp, confToken.generate());
          db.default.user.create(newUser, (err: any, user: any) => {
            if (err) {
              console.log(err);
            }
            let userJwt: object = {
              nom: newUser.Nom,
              prenom: newUser.Prenom,
              pseudo: newUser.Pseudo,
              email: newUser.Email,
              token: newUser.Token
            }

            var tokenjwt = jwt.sign(userJwt, "secret", { expiresIn: 600 });
            let mail = new Mail();
            mail.sendMail(newUser.Email, "Demande d'inscription à TwiNode", `Hello ${newUser.Pseudo},
           votre nouveau compte a été créé avec succès !
           Pour confirmer l'inscription, cliquez sur le lien ci-dessous :
           http://localhost:3001/user/confirmation?&jwt=${tokenjwt}
           Attention: Vous avez dix minutes pour confirmer votre compte. Si vous n'êtes pas à l'origine, ignorer le message !
           À très bientôt !


           Evens POMPE de TwiNode.`);
          })
          res.redirect('/')
        } else {
          res.render("inscription", {
            error: true,
            message: "Les mots de passe ne correspondent pas !"
          })
        }
      } else {

        let userJwt: object = {
          _id: user._id,
          nom: user.nom,
          prenom: user.prenom,
          pseudo: user.pseudo,
          email: user.email,
          token: user.token
        }

        var tokenjwt = jwt.sign(userJwt, "secret", { expiresIn: 600 });
        let mail = new Mail();
        mail.sendMail(user.email, "Redemande d'inscription à TwiNode", `Hello ${user.pseudo},
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

app.get("/user/confirmation", (req, res) => {
  jwt.verify(req.query.jwt, "secret", (err: any, jwtData: any) => {
    if (err) {
      console.log(err);
      res.redirect('/inscription')
    }
    let conditionConf: object = { email: jwtData.email, token: jwtData.token };
    let update: object = { estActif: true };
    db.default.user.findOneAndUpdate(conditionConf, update, { new: true }, (err, data) => {
      req.session ?.pseudo = data ?.pseudo
      req.session ?.email = data ?.email
      req.session ?.token = data ?.token
      res.redirect('/')
    })
  });
})

app.get('/deconnection', (req, res) => {
  req.session = null
  res.redirect("/")
})

export default app;
