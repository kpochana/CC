import { Component } from '@angular/core';
import {RedditService} from '../services/reddit.service';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  savedSub:Subscription;
  posts:string[][]=[];

  constructor(private reddit:RedditService,
              private navCtrl:NavController) {}


  ngOnInit(){
    this.savedSub=this.reddit.savedStream.subscribe((posts)=>{
      this.posts = posts;
    });
    this.reddit.getSavedPosts();
  }

  ionViewWillEnter(){

  }

  ngOnDestroy(){
    this.savedSub.unsubscribe();
  }


  goToPost(post:string[]){
    this.reddit.postStream.next([]);
    this.navCtrl.navigateForward("/post/"+post[4])
  }

}
