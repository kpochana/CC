import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { Device } from '@ionic-native/device/ngx';
//import {Snoowrap} from 'snoowrap';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';

var snoowrap = require('snoowrap');

@Injectable({
  providedIn: 'root'
})
export class RedditService {

  //login stuff
  state:string = this.device.uuid + "CC";
  appID:string = "dACO3ajsot2Udg";
  redirectURL:string = "http://localhost:8100/redirect";
  permissions:string = "identity edit read";
  loginURLp1:string = "https://www.reddit.com/api/v1/authorize?"
                + "client_id=" + this.appID
                + "&response_type=" + "code"
                + "&state=";

  loginURLp2:string = "&redirect_uri=" + this.redirectURL
                + "&duration=" + "permanent"
                + "&scope=" + this.permissions;

  //stuff to store in cookies              
  private reddit = null;
  public savedPosts:string[] = [];

  //stream stuff
  private wrapUpdate:BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public pageStream:BehaviorSubject<string[][]> = new BehaviorSubject<string[][]>([]);
  public postStream:BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);


  constructor(private device: Device) { 
    this.wrapUpdate.subscribe((swrap) =>{
      this.reddit = swrap;
    })
  }

  login(state:string, code:string){
    if(state != this.state){
      //console.log("uh oh" + this.state + " but i got: " + state);
      return false;
    }
    snoowrap.fromAuthCode({
      code: code,
      userAgent: "corona condom",
      clientId: this.appID,
      redirectUri: this.redirectURL
    }).then(r=>{
      this.wrapUpdate.next(r);
      console.log(r);
    });
    return true;
  }

  generateURL(){
    return this.loginURLp1 + this.state + this.loginURLp2;
  }

  getPosts(subreddit:string = "CoronaCondom"){
    //making sure reddit snoowrap object exists
    this.wrapUpdate.subscribe((junk)=>{
      //only get posts once it has been created
      if(this.reddit != null){
        //get posts
        this.reddit.getSubreddit(subreddit).getNew().then((data)=>{
          console.log(data.length);
          let toPush:Array<Array<string>> = [];
          for(let post of data){
            toPush.push([post.title, post.selftext, post.id]);
          }
          this.pageStream.next(toPush);
          this.wrapUpdate.unsubscribe();
        });
      }
    
    });

    
  }

  getPost(postID:string){
    //making sure reddit snoowrap obj exists
    this.wrapUpdate.subscribe((junk)=>{
      //only get posts once obj has been created
      if(this.reddit != null){
          this.reddit.getSubmission(postID).then((post)=>{
            let comments = this.getComments(post.comments);
          });
        this.wrapUpdate.unsubscribe();
      }
    });
  }

  getComments(comments/*:Snoowrap.Listing<Snoowrap.Comment>*/){
    let toReturn = [];
    for(let comment of comments){
      
    }
  }
}
