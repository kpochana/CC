import { Component, OnInit } from '@angular/core';
import {RedditService} from '../../services/reddit.service';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
})
export class NewPostPage implements OnInit {

  postText:string="";
  postTitle:string="";
  constructor(private reddit:RedditService) { }

  ngOnInit() {
  }

  submitPost(){
    this.reddit.submitPost(this.postTitle, this.postText);
  }
}
