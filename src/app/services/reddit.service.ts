import { Injectable } from '@angular/core';
import {BehaviorSubject, Subscription} from 'rxjs';
import { Device } from '@ionic-native/device/ngx';
//import {Snoowrap} from 'snoowrap';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';
import { Plugins } from '@capacitor/core';
import { NavController } from '@ionic/angular';

const { Storage } = Plugins;

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
  locationString:string = "All Cities";
  locationCode:string = "All Cities";

  //stream stuff
  private wrapUpdate:BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public pageStream:BehaviorSubject<string[][]> = new BehaviorSubject<string[][]>([]);
  public postStream:BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public profileStream:BehaviorSubject<any> = new BehaviorSubject<any>("");
  public messageStream:BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public threadStream:BehaviorSubject<string[][]> = new BehaviorSubject<string[][]>([]);
  public refreshStream:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public savedStream:BehaviorSubject<string[][]> = new BehaviorSubject<string[][]>([]);

  //other vars
  private subredditName:string = "CoronaCondom";
  public redditExists:boolean = false;
  public userName:string = "";

  //messaging vars
  threads = {};
  private currentThread:string;
  threadTitles:string[]=[];

  ///location & flair vars
  flairList:string[][] = [];

  constructor(private device: Device,
              private navCtrl: NavController) { 
    this.wrapUpdate.subscribe((swrap) =>{
      this.reddit = swrap;
      if(this.reddit != null){
        this.redditExists=true;
      }
    });
  }

  setLocation(lString:string, lCode:string){
    console.log(lString);
    console.log(lCode);
    this.locationString = lString;
    this.locationCode = lCode;
    if(lCode != "All Cities"){
      console.log("updating flair");
      this.reddit.getSubreddit(this.subredditName).selectMyFlair({flair_template_id: lCode});
    }
    this.getPosts();
    this.storeData("locationString", lString);
    this.storeData("locationCode", lCode);
  }

  loadData(){
    //getting location flair and zip codes
    Storage.get({key:"locationString"}).then((token)=>{
      if(token.value != null && token.value != ""){
        this.locationString = token.value;
      }
    });
    Storage.get({key:"locationCode"}).then((token)=>{
      if(token.value != null && token.value != ""){
        this.locationCode = token.value;
      }
    });
    //getting saved posts
    Storage.get({key:"savedPosts"}).then((token)=>{
      if(token.value != null && token.value != ""){
      let elems = token.value.split(',');
      this.savedPosts = this.savedPosts.concat(elems);
      console.log("Getting saved posts from storage: ");
      console.log(elems);
      }
    });
    //getting snoowrap object
    Storage.get({key:"refreshToken"}).then((token)=>{
      if(token.value != null && token.value != ""){
        let r = new snoowrap({
          userAgent: "corona condom",
          clientId: this.appID,
          clientSecret: "",
          refreshToken: token.value
        });
        this.wrapUpdate.next(r);
        //this.navCtrl.navigateForward('/main/tabs');
      }
    });
  }

  storeData(key:string, val:string){
    Storage.set({key:key, value:val});
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
      Storage.set({
        key:'refreshToken',
        value:r.refresh_token
      });
      console.log(r.refresh_token);
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
            console.log(post.author_flair_text + " " + this.locationString);
            if(post.author_flair_text == this.locationString || this.locationString == "All Cities"){
              toPush.push([post.title, post.selftext, post.author.name, post.created_utc, post.id]);
              console.log(post);
              console.log(post.comments);
            }
          }
          this.pageStream.next(toPush);
          this.refreshStream.next(false);
          tempSub.unsubscribe();
        });
      }
    
    });

    
  }

  /**returns [title, text, comments, author, postID] */
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
    return this.reddit.getSubmission(ID).reply(text);
  }

  loadProfile(accountID:string="me"){
    this.flairList = [["All Cities", "All Cities"]];
    //making sure snoowrap object exists
    let tempSub = this.wrapUpdate.subscribe((junk)=>{
      if(this.reddit != null){
        //getting user flair options
        this.reddit.getSubreddit(this.subredditName).getUserFlairTemplates().then((flairs)=>{
          for(let flair of flairs){
            this.flairList.push([flair.flair_text, flair.flair_template_id]);
          }
        });
        console.log("User Flair options: ");
        console.log(this.flairList);
        //loading profile information
        if(accountID == "me"){
          this.reddit.getMe().name.then((name)=>{
            console.log("pushing updated name: " + name);
            this.userName = name; 
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
    }).then((post)=>{ 
      this.getPosts();
      console.log(post);
    });
  }

  getInbox(){
    let tempSub = this.wrapUpdate.subscribe((junk)=>{
      if(this.reddit != null){
        this.reddit.getInbox().then((messages)=>{
          this.processMessages(messages);
        });
        this.reddit.getSentMessages().then((messages)=>{
          this.processMessages(messages, true);
          tempSub.unsubscribe();
        });
        console.log(this.threads);
      }
    });
  }

  processMessages(messages, sending=false){
    let counter = 0;
    let displayArray:string[] = [];
    console.log(messages);
    for(let message of messages){
      if(message.subject.search(this.subredditName) != -1){
        if(sending){
          var key = message.dest;
        }
        else{
          var key = message.author.name;
          message.markAsRead();
          counter += 1;
        }
        if(!(key in this.threads)){
          displayArray.push(key);

          this.threads[key] = new Thread(key);
        }
        this.threads[key].addMessage(message);
        if(!sending){
          this.threads[key].setLastMessage();
        }
      }
    }
    console.log(displayArray);
    this.threadTitles = this.threadTitles.concat(displayArray);
    this.messageStream.next(this.threadTitles);
    return this.threadTitles;
  }

  getThread(key:string){
    if(this.reddit != null){
      let mThread:string[][] = this.threads[key].getThread();
      this.threadStream.next(mThread);
      this.currentThread = key;
      console.log("current thread is: " + this.currentThread);
    }
  }

  savePost(postID:string){
    this.savedPosts.push(postID);
    //console.log(this.savedPosts);
    this.getSavedPosts();
    this.storeData('savedPosts', this.savedPosts.toString());
  }

  unsavePost(postID:string){
    let index = this.savedPosts.indexOf(postID);
    this.savedPosts.splice(index, 1);
    //console.log(this.savedPosts);
    this.getSavedPosts();
    this.storeData('savedPosts', this.savedPosts.toString());
  }

  submitMessage(dest:string, message:string){
    let tempSub = this.wrapUpdate.subscribe((junk)=>{
      if(this.reddit != null){
        if(this.threads[dest].lastMessage == null){
          this.reddit.composeMessage({to: dest,
                                      subject: this.subredditName,
                                      text: message}).then((message)=>{
                                        //this.processMessages([message], true);
                                        //this.getThread(this.currentThread);
                                        this.updateInbox(true);
                                        tempSub.unsubscribe();
                                      });
        }
        else{
        this.threads[dest].lastMessage.reply(message).then((message)=>{
          this.processMessages([message], true);
          this.getThread(this.currentThread);
          tempSub.unsubscribe();
        });
        }
      }
    });
  }

  updateInbox(original=false){
    if(this.reddit != null){
      if(original){
        this.reddit.getSentMessages().then((messages)=>{
          this.processMessages([messages[0]], original);
          //this.getThread(this.currentThread);
        });
      }
      else{
        this.reddit.getUnreadMessages().then((messages)=>{
          let toPush = this.processMessages(messages);
        });
      }
      if(this.currentThread != null){
        if(this.currentThread == ""){
          this.threadStream.next([]);
        }
        else{
        this.getThread(this.currentThread);
        }
      }
      console.log(this.threads);
    }
  }

  setCurrentThread(currThread:string){
    this.currentThread = currThread;
  }

  getSavedPosts(){
    let tempSub=this.wrapUpdate.subscribe(()=>{
      if(this.reddit != null){
        let displayList:string[][]=[];
        for(let id of this.savedPosts){
          let displayPost:string[]=[];
          let post = this.reddit.getSubmission(id);
          post.title.then((title)=>{
            displayPost.push(title);
            post.selftext.then((text)=>{
              displayPost.push(text);
              post.author.name.then((name)=>{
                displayPost.push(name);
                post.created_utc.then((time)=>{
                  displayPost.push(time);
                  post.id.then((id)=>{
                    displayPost.push(id);
                    displayList.push(displayPost);
                    tempSub.unsubscribe();
                  });
                });
              });
            });
          });
        }
        this.savedStream.next(displayList);
      }
    });
  }

  goToThread(key:string){
    console.log("going to thread");
    if(!(key in this.threads)){
      this.threads[key] = new Thread(key);
      //this.getThread(key);
    }
    this.navCtrl.navigateForward("/messages/" + key);
  }
}

class Thread{

  lastMessage = null;
  dest:string = "";
  messages = [];
  displayMessages:string[][] = [];

  constructor(dest:string){
    this.dest = dest;
  }

  addMessage(toAdd){
    this.messages.push(toAdd);
    let isUser = toAdd.dest == this.dest;
    let display = [toAdd.created, toAdd.body, toAdd.author.name, isUser]
    this.displayMessages.push(display);
  }


  getThread(){
    this.displayMessages = this.displayMessages.sort();
    return this.displayMessages;
  }

  setLastMessage(){
    this.lastMessage = this.messages[this.messages.length - 1];
  }


}