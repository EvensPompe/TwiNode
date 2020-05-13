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
import modif from '../middlewares/modif';

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

  if (imgsPath.length == 0 && videosPath.length == 0 && (!req.body ?.tweet || req.body ?.tweet.trim() === "")) {
    res.redirect("/");
  } else {
    let tweet = new Tweet(req.body ?.tweet, imgsPath, videosPath, req.session ?.iduser);

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
  db.default.user.findById(req.session ?.iduser, (err: any, user: any) => {
    db.default.conversations.find({$or:[{ user: req.session ?.iduser},{dest:req.session ?.iduser}]}).populate("dest","-mdp -token -estActif -nom -prenom").exec((err: any, convs: any) => {
      if (req.session ?.token) {
        res.render('messages', {
          isConnected: true,
          user: user.pseudo,
          userId: req.session ?.iduser,
          convs: convs
        });
      } else {
        res.redirect("/connection");
      }
    })
  })
})

app.get('/message', (req, res) => {
  db.default.user.findById(req.session ?.iduser, (err: any, user: any) => {
    function verifConv(id: string) {
      if (!id) {
        return false;
      } else {
        return id;
      }
    }
    let newConv = verifConv(req.session ?.actConv);
    let oldConv = verifConv(req.query ?.convId);
    req.session.actConv = oldConv || newConv;
    db.default.conversations.findById(req.session ?.actConv).populate("dest", "-mdp -token -estActif -nom -prenom").populate("user", "-mdp -token -estActif -nom -prenom").exec((err: any, conv: any) => {
      function Verifsocket(socketid:string) {
        if (socketid == conv.dest.socketUser) {
          return conv.user.socketUser;
        }else{
          return socketid;
        }
      }
      let socketUser = Verifsocket(user.socketUser);
      //console.log(socketUser,conv.dest.socketUser,conv.dest.socketUser == user.socketUser);

      if (req.session ?.token) {
        res.render('message', {
          isConnected: true,
          user: user.pseudo,
          userId: req.session ?.iduser,
          convId: conv._id,
          dest: conv.dest.pseudo,
          messages: conv.messages,
          socketUser: socketUser,
          socketDest: conv.dest.socketUser
        });
      } else {
        res.redirect("/connection");
      }
    })
  })
})

app.post('/newConv', (req, res) => {
  db.default.conversations.create({ dest: req.query.id, messages: [], user: req.session ?.iduser}, (err: any, conv: any) => {
    req.session.actConv = conv._id;
    res.redirect('/message')
  })
})

app.get('/profil', (req, res) => {
  db.default.user.findById(req.session ?.iduser, (err: any, user: any) => {
    if (req.session ?.token) {
      res.render('profil', {
        isConnected: true,
        pseudo: user.pseudo,
        banniere: user.banniere,
      })
    } else {
      res.redirect("/connection");
    }
  })
})

app.get('/profil/mes_twinodes', (req, res) => {
  db.default.tweetNode.find({ user: req.session ?.iduser }).populate("user", "-mdp -token -estActif -nom -prenom").exec((err: any, tweets: any) => {
    db.default.user.findById(req.session ?.iduser, (err: any, user: any) => {
      if (req.session ?.token) {
        res.render('profil', {
          isConnected: true,
          pseudo: user.pseudo,
          tweets: tweets,
          banniere: user.banniere,
          mes_twinodes: true
        });
      } else {
        res.redirect("/connection");
      }
    })
  })
})

app.get('/profil/mes_reponses', (req, res) => {
  db.default.user.findById(req.session ?.iduser, (err: any, user: any) => {
    if (req.session ?.token) {
      res.render('profil', {
        isConnected: true,
        pseudo: user.pseudo,
        banniere: user.banniere,
        mes_reponses: true
      });
    } else {
      res.redirect("/connection");
    }
  })
})

app.get('/profil/aime', (req, res) => {
  db.default.user.findById(req.session ?.iduser, (err: any, user: any) => {
    if (req.session ?.token) {
      res.render('profil', {
        isConnected: true,
        pseudo: user.pseudo,
        banniere: user.banniere,
        aime: true
      });
    } else {
      res.redirect("/connection");
    }
  })
})

app.get('/profil/modification', (req, res) => {
  db.default.user.findById(req.session ?.iduser, (err: any, user: any) => {
    if (req.session ?.token) {
      res.render('profil', {
        isConnected: true,
        banniere: user.banniere,
        pseudo: user.pseudo,
        modif: true
      });
    } else {
      res.redirect("/connection");
    }
  })
})

app.post('/profil/modification', upload.single('newBanniere'), (req, res) => {
  let modifResult = modif(req.file ?.path, req.body ?.newPseudo);
  db.default.user.findByIdAndUpdate(req.session ?.iduser, modifResult, { new: true }, (err: any, user: any) => {
    if (err) {
      res.redirect("/profil")
    } else {
      res.redirect("/profil")
    }
  })
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
  db.default.user.findById(req.session ?.iduser, (err: any, user: any) => {
    if (req.session ?.token) {
      res.render('parametres', {
        isConnected: true,
        pseudo: true,
        user: user
      });
    } else {
      res.redirect("/connection");
    }
  })
})

app.post('/parametres/pseudo', (req, res) => {
  if (req.session ?.pseudo == req.body ?.newPseudo) {
    res.redirect("/parametres/pseudo");
  }
  db.default.user.findOneAndUpdate({ pseudo: req.session ?.pseudo }, { pseudo: req.body ?.newPseudo }, { new: true }, (err: any, user: any) => {
    req.session ?.pseudo = req.body ?.newPseudo
    res.redirect("/parametres/pseudo");
  })
})

app.get('/parametres/email', (req, res) => {
  db.default.user.findById(req.session ?.iduser, (err: any, user: any) => {
    if (req.session ?.token) {
      res.render('parametres', {
        isConnected: true,
        email: true,
        user: user
      });
    } else {
      res.redirect("/connection");
    }
  })
})

app.post('/parametres/email', (req, res) => {
  if (req.session ?.email == req.body ?.newEmail) {
    res.redirect("/parametres/email");
  }
  db.default.user.findOneAndUpdate({ email: req.session ?.email }, { email: req.body ?.newEmail }, { new: true }, (err: any, user: any) => {
    req.session ?.email = req.body ?.newEmail
    res.redirect("/parametres/email");
  })
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

app.post('/parametres/mdp', (req, res) => {
  db.default.user.findById(req.session ?.iduser, (err: any, user: any) => {
    if (bcrypt.compareSync(req.body ?.oldMdp, user.mdp)) {
      if (req.body ?.newMdp == req.body ?.reNewMdp) {
        let hash = bcrypt.hashSync(req.body ?.reNewMdp, 10)
        db.default.user.findByIdAndUpdate(req.session ?.iduser, { mdp: hash }, { new: true }, (err: any, user: any) => {
          let mail = new Mail();
          mail.sendMail(user.email, `Modification du mot de passe`, `Hello ${user.pseudo},
       Le mot de passe de votre compte a été modifié avec succès !

       À très bientôt !


       Evens POMPE de TwiNode.`)
          res.redirect("/parametres/mdp");
        })

      } else {
        res.redirect("/parametres/mdp");
      }
    } else {
      res.redirect("/parametres/mdp");
    }
  })
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

app.post('/parametres/desactivation', (req, res) => {
  if (req.body ?.checkDesact) {
    db.default.user.findById(req.session ?.iduser, (err: any, user: any) => {
      if (err) {
        res.redirect("/parametres/desactivation");
      } else {
        if (bcrypt.compareSync(req.body ?.confirmMdp, user.mdp)) {
          db.default.user.findByIdAndUpdate(req.session ?.iduser, { estActif: false }, { new: true }, (err: any, data: any) => {
            if (err) {
              res.redirect("/parametres/desactivation");
            } else {
              let userJwt: object = {
                nom: user.nom,
                prenom: user.prenom,
                pseudo: user.pseudo,
                email: user.email,
                token: user.token
              }

              var tokenjwt = jwt.sign(userJwt, "annule le secret", { expiresIn: "30d" });
              let mail = new Mail();
              mail.sendMail(user.email, `Désactivation de votre compte`, `Hello ${user.pseudo},
          Votre compte a été désactivé avec succès !
          Si toutefois vous n'êtes pas à l'origine de cette désactivation.
          Vous pouvez annuler le processus en vous connectant via le lien ci-dessus :
          http://localhost:3000/user/annulation?&jwt=${tokenjwt}
          Vous avez jusqu'à 30 jours pour annuler.
           À très bientôt !


           Evens POMPE de TwiNode.`)
              res.redirect("/deconnection");
            }
          })
        } else {
          res.redirect("/parametres/desactivation");
        }
      }
    })
  }
})

app.get("/user/annulation", (req, res) => {
  jwt.verify(req.query.jwt, "annule le secret", (err: any, data: any) => {
    if (err) {
      res.redirect("/connection")
    } else {
      db.default.user.findOne({ email: data.email }, (err: any, user: any) => {
        if (err) {
          res.redirect("/connection")
        } else {
          if (user.estActif == false) {
            db.default.user.findOneAndUpdate({ email: data.email }, { estActif: true }, { new: true }, (err: any, result: any) => {
              if (err) {
                res.redirect("/connection")
              } else {
                req.session.iduser = user._id
                req.session ?.pseudo = user.pseudo
                req.session ?.email = user.email
                req.session ?.token = user.token
                res.redirect("/profil")
              }
            })
          }
        }
      })
    }
  })
})

app.get('/connection', (req, res) => {
  if (req.session ?.token) {
    res.redirect('/')
  } else {
    res.render('connection');
  }
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
  if (req.session ?.token) {
    res.redirect('/')
  } else {
    res.render('inscription');
  }
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
           http://localhost:3000/user/confirmation?&jwt=${tokenjwt}
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
       http://localhost:3000/user/confirmation?&jwt=${tokenjwt}
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
      req.session ?.iduser = data ?._id
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
