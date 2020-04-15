import { Component } from '@angular/core';
import {RedditService} from '../services/reddit.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private reddit: RedditService) {}
  
  test(){
    this.reddit.getPosts();
  }

}
