export default function (values:object[]) {
  if (!values) {
    return values = [];
  }else{
    let arrayValue:string[] = values.map((value:object) =>{
      let result:string = value.path;
      return result;
    });
    let result:string[] = arrayValue;
    return result;
  }
}
