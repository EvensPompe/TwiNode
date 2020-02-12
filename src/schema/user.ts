import mongoose from 'mongoose';

const user = new mongoose.Schema({
  nom: String,
  prenom: String,
  pseudo: String,
  email: String,
  mdp: String,
  token: String,
  estActif:Boolean,
  img: String
});

export default user;
