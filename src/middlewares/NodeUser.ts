import bcrypt from 'bcrypt';
export default class NodeUser {

  private nom: string;
  private prenom: string;
  private pseudo: string;
  private email: string;
  private mdp: string;
  private saltRounds:number = 10;

  constructor(nom: string, prenom: string, pseudo: string, email: string, mdp:string) {
      this.nom = nom;
      this.prenom = prenom;
      this.pseudo = pseudo;
      this.email = email;
      this.mdp = bcrypt.hashSync(mdp, this.saltRounds);
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

  get Mdp() {
    return this.mdp;
  }
}
