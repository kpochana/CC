import { Injectable } from '@angular/core';
import {BehaviorSubject, Subscription} from 'rxjs';
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
  permissions:string = "identity edit read submit flair history privatemessages";
  loginURLp1:string = "https://www.reddit.com/api/v1/authorize?"
                + "client_id=" + this.appID
                + "&response_type=" + "code"
                + "&state=";

  loginURLp2:string = "&redirect_uri=" + this.redirectURL
                + "&duration=" + "permanent"
                + "&scope=" + this.permissions;

  //stuff to store in cookies              
  private reddit/*:Snoowrap*/ = null;
  public savedPosts:string[] = [];

  //stream stuff
  private wrapUpdate:BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public pageStream:BehaviorSubject<string[][]> = new BehaviorSubject<string[][]>([]);
  public postStream:BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public profileStream:BehaviorSubject<any> = new BehaviorSubject<any>("");
  public messageStream:BehaviorSubject<any> = new BehaviorSubject<any>([]);

  //other vars
  private subredditName:string = "CoronaCondom";
  threads = {};

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

  getPosts(subreddit:string = this.subredditName){
    //making sure reddit snoowrap object exists
    let tempSub = this.wrapUpdate.subscribe((junk)=>{
      //only get posts once it has been created
      if(this.reddit != null){
        //get posts
        this.reddit.getSubreddit(subreddit).getNew().then((data)=>{
          console.log(data.length);
          let toPush:Array<Array<string>> = [];
          for(let post of data){
            toPush.push([post.title, post.selftext, post.id]);
            console.log(post);
            console.log(post.comments);
          }
          this.pageStream.next(toPush);
          tempSub.unsubscribe();
        });
      }
    
    });

    
  }

  getPost(postID:string){
    //making sure reddit snoowrap obj exists
    let postSub = this.wrapUpdate.subscribe((junk)=>{
      //only get posts once obj has been created
      if(this.reddit != null){
          let post = this.reddit.getSubmission(postID);
          let toPush = []
          post.title.then((mTitle)=>{
            toPush.push(mTitle);
            post.selftext.then((mText)=>{
              toPush.push(mText);
              post.comments.then((mComments)=>{
                let commentsArray = [];
                for(let comment of mComments){
                  commentsArray.push([comment.body, comment.author.name, comment.id]);
                }
                toPush.push(commentsArray);
                post.author.name.then((name)=>{
                  toPush.push(name);
                  post.id.then((mID)=>{
                    toPush.push(mID);
                    console.log(toPush);
                    this.postStream.next(toPush);
                    postSub.unsubscribe();
                  });
                });
              });
            });
          });
              
      }
    });
  }

  getComments(comments/*:Snoowrap.Listing<Snoowrap.Comment>*/){
    let toReturn = [];
    if(comments.length == 0){
      return toReturn;
    }
    for(let comment of comments){
      let toSend = [comment.body, comment.id];
      toReturn.push([toSend, this.getComments(comment.replies)]);
    }
    return toReturn;
  }

  submitComment(ID:string, text:string){
    this.reddit.getSubmission(ID).reply(text);
  }

  getProfile(accountID:string="me"){
    let tempSub = this.wrapUpdate.subscribe((junk)=>{
      if(this.reddit != null){
        if(accountID == "me"){
          this.reddit.getMe().name.then((name)=>{
            console.log("pushing updated name: " + name); 
            this.profileStream.next(name);
            tempSub.unsubscribe();
          });
        }
      }
    });
  }

  submitPost(title:string, body:string){
    this.reddit.submitSelfpost({
      subredditName: this.subredditName,
      title: title,
      text: body
    }).then(console.log);
  }

  getInbox(){
    let toPush:string[] = [];
    let tempSub = this.wrapUpdate.subscribe((junk)=>{
      if(this.reddit != null){
        this.reddit.getInbox({filter: "messages"}).then((messages)=>{
          toPush = toPush.concat(this.processMessages(messages));
          this.messageStream.next(toPush);
          console.log(toPush);
        });
        this.reddit.getSentMessages().then((messages)=>{
          toPush = toPush.concat(this.processMessages(messages, true));
          this.messageStream.next(toPush);
          console.log(toPush);
          tempSub.unsubscribe();
        });
        console.log(this.threads);
      }
    });
  }

  processMessages(messages, sending=false){
    let displayArray:string[] = [];
    console.log(messages);
    for(let message of messages){
      if(message.subject.search(this.subredditName) != -1){
        if(sending){var key = message.dest;}
        else{var key = message.author.name;}
        if(!(key in this.threads)){
          displayArray.push(key);
          this.threads[key] = new thread(key);
        }
        this.threads[key].addMessage(message);
        
      }
    }
    console.log(displayArray);
    return displayArray;
  }
   
}

class thread{
  author:string="";
  messages = [];
  constructor(author:string){
    this.author = author;
  }

  addMessage(toAdd){
    this.messages.push(toAdd);
  }

}