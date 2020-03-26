import bcrypt from 'bcrypt';
export default class NodeUser {

  private nom: string;
  private prenom: string;
  private pseudo: string;
  private email: string;
  private mdp: string;
  private token: string;
  private estActif:boolean;
  private saltRounds:number = 10;
  private banniere:string;

  constructor(nom: string, prenom: string, pseudo: string, email: string, mdp:string,token: string) {
      this.nom = nom;
      this.prenom = prenom;
      this.pseudo = pseudo;
      this.email = email;
      this.token = token;
      this.mdp = bcrypt.hashSync(mdp, this.saltRounds);
      this.estActif = false;
      this.banniere = "https://i.pinimg.com/originals/12/44/66/1244669904e7cb1be65ffdfb80475148.jpg";
  }

  get Nom() {
    return this.nom;
  }

  get Prenom() {
    return this.prenom;
  }

  get Pseudo() {
    return this.pseudo;
  }

  get Email() {
    return this.email;
  }

  get Token() {
    return this.token;
  }

  get Mdp() {
    return this.mdp;
  }

  get EstActif() {
    return this.estActif;
  }
}
