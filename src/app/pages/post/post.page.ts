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
      this.reddit.submitComment(this.postID, this.userText).then((a)=>{
        console.log(a);
        setTimeout(()=>{
          console.log("resolving");
        this.reddit.getPost(this.postID);
        }, 2000);
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

  message(){
    console.log("button press");
    this.reddit.goToThread(this.post[3]);
  }
}
