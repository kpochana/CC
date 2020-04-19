import { Component } from '@angular/core';
import {RedditService} from '../services/reddit.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  posts:string[][] = [];

  constructor(private reddit: RedditService,
              private navCtrl: NavController) {}

  ngOnInit(){
    this.reddit.getPosts();
    this.reddit.pageStream.subscribe((posts)=>{
      this.posts = posts;
      console.log(posts);
    });
  }

  ngOnDestroy(){
    console.log("I am running");
    this.reddit.pageStream.unsubscribe();
  }

  goToPost(post:string[]){
    //console.log(post[2]);
    this.navCtrl.navigateForward('/post/'+post[2]);
  }
  

}
