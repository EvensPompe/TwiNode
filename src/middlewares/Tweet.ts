export default class Tweet {
private tweet:string;
private imgtweet:[string];
private videotweet:[string];
private date:Date;
private user:string;

  constructor(tweet:string,imgtweet:[string],videotweet:[string],user:string) {
    this.tweet = tweet;
    this.imgtweet = imgtweet;
    this.videotweet = videotweet;
    this.date = new Date();
    this.user = user;
  }

  get Tweet(){
    return this.tweet;
  }

  get User(){
    return this.user;
  }

  get Imgtweet(){
    return this.imgtweet;
  }

  get Videotweet(){
    return this.videotweet;
  }

  get Date(){
    return this.date;
  }
}
