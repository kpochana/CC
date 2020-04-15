import { Component } from '@angular/core';
import {RedditService} from '../services/reddit.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  posts:string[][] = [];

  constructor(private reddit: RedditService) {}

  ngOnInit(){
    this.reddit.getPosts();
    this.reddit.postStream.subscribe((posts)=>{
      this.posts = posts;
      console.log(posts);
    });
  }

  goToPost(post:string[]){
    console.log(post[2]);
  }
  

}
