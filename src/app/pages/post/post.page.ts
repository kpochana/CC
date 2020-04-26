import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RedditService} from '../../services/reddit.service';
import {PopoverController} from '@ionic/angular';
import {PopoverMenuComponent} from '../../components/popover-menu/popover-menu.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.page.html',
  styleUrls: ['./post.page.scss'],
})
export class PostPage implements OnInit {

  mSub;
  saved:boolean;
  userText:string="";
  postID:string="";
  post:string[]=[];
  comments:string[][]=[];

  constructor(private route: ActivatedRoute,
              private reddit: RedditService,
              private popoverController: PopoverController) { }

  ngOnInit() {
    this.postID = this.route.snapshot.paramMap.get('id');
    console.log(this.postID);
    this.reddit.getPost(this.postID);
    this.mSub = this.reddit.postStream.subscribe((post)=>{
      console.log("being updated");
      this.post = post;
      this.comments = post[2];
      this.saved = this.reddit.savedPosts.includes(this.postID);
    });
  }

  ngOnDestroy(){
    this.mSub.unsubscribe();
  }

  ionViewWillLeave(){ 
    
  }

  submitComment(){
    if(this.userText != ""){
      this.reddit.submitComment(this.postID, this.userText).then((newComment)=>{
        console.log(newComment);
        let toInsert:string[] = [newComment.body, newComment.author.name, newComment.id, newComment.created_utc, 0];
        this.comments.push(toInsert);
      });
      this.userText="";
    }
  }

  locateComment(comment){
    for(let index in this.comments){
      let iter = this.comments[index][2];
      if(iter == comment[2]){
        return parseInt(index);
      }
    }
  }

  replyComment(comment:string[]){
    if(this.userText != ""){
      this.reddit.replyComment(comment[2], this.userText).then((newComment)=>{
        console.log(newComment);
        let toInsert = [newComment.body, newComment.author.name, newComment.id, newComment.created_utc, comment[4]+1];
        let index = this.locateComment(comment) + 1;
        this.comments.splice(index,0,toInsert);
      });
      this.userText="";
    }
  }

  saveToggle(){
    if(!this.saved){
      this.reddit.savePost(this.postID);
      console.log("saving post");
      this.saved = true;
    }
    else if(this.saved){
      this.reddit.unsavePost(this.postID);
      console.log("unsaving post");
      this.saved = false;
    }
  }

  message(dest = this.post[3]){
    console.log("button press");
    this.reddit.goToThread(dest);
  }
}
