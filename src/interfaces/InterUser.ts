import { Document } from 'mongoose';

export default interface InterfaceUser extends Document{
    nom: string,
    prenom: string,
    pseudo: string,
    email: string,
    mdp: string,
    token: string,
    estActif:boolean,
    img: string,
    banniere:string,
    tweets:string[],
    conversations:string[],
    socketUser:string
};