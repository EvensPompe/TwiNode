import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const user = new mongoose.Schema({
  nom: String,
  prenom: String,
  pseudo: String,
  email: String,
  mdp: { type: String, required: true, index: { unique: true }},
  token: String,
  estActif:Boolean,
  img: String,
  banniere:{type: String,required: true},
  tweets:[{type: Schema.Types.ObjectId,ref:'tweeNode'}],
  conversations:[{type: Schema.Types.ObjectId,ref:'tweeNode'}],
  socketUser:String
});

export default user;
