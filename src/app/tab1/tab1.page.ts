import { Component } from '@angular/core';
import {RedditService} from '../services/reddit.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  mSub;
  mSub2;
  posts:string[][] = [];

  constructor(private reddit: RedditService,
              private navCtrl: NavController) {}

  ngOnInit(){
    this.reddit.getPosts();
    this.mSub = this.reddit.pageStream.subscribe((posts)=>{
      this.posts = posts;
      console.log(posts);
    });
  }

  ngOnDestroy(){
    console.log("I am running");
    this.mSub.unsubscribe();
    this.mSub2.unsubscribe();
  }

  goToPost(post:string[]){
    //console.log(post[2]);
    this.reddit.postStream.next([]);
    this.navCtrl.navigateForward('/post/'+post[4]);
  }
 
  refresh(event:any){
    this.reddit.getPosts();
    this.reddit.updateInbox();
    this.mSub2 = this.reddit.refreshStream.subscribe((refreshing)=>{
      if(!refreshing){
        event.target.complete();
        this.reddit.refreshStream.next(true);
      }
    });
  }

}
