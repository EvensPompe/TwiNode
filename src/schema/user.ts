import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const user = new mongoose.Schema({
  nom: String,
  prenom: String,
  pseudo: String,
  email: String,
  mdp: String,
  token: String,
  estActif:Boolean,
  img: String,
  bannière:String,
  tweets:[{type: Schema.Types.ObjectId,ref:'tweeNode'}]
});

export default user;
