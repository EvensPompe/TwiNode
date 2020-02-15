export default class MailSMTP {
  private host:string;
  private port:number;
  private secure:boolean;
  private auth:object;
  private user:string;
  private pass:string;

  constructor(host:string,port:number,secure:boolean,auth:object,user:string,pass:string) {
     this.host = host;
     this.port = port;
     this.secure = secure;
     this.auth = {
       user : this.user = user,
       pass : this.pass = pass
     }
  }
}
