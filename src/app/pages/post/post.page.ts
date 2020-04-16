import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RedditService} from '../../services/reddit.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.page.html',
  styleUrls: ['./post.page.scss'],
})
export class PostPage implements OnInit {

  postID:string="";
  post:string[]=[];

  constructor(private route: ActivatedRoute,
              private reddit: RedditService) { }

  ngOnInit() {
    this.postID = this.route.snapshot.paramMap.get('id');
    console.log(this.postID);
    this.reddit.getPost(this.postID);
    this.reddit.postStream.subscribe((post)=>{
      this.post = post;
    });
  }

}
