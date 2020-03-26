export default function (banniere:string,pseudo:string) {
  if (banniere && pseudo) {
    return { banniere: banniere, pseudo: pseudo };
  }else if(!banniere && pseudo){
    return { pseudo: pseudo };
  }else if(banniere && !pseudo){
    return { banniere: banniere };
  }
}
