import { Component } from '@angular/core';
import {RedditService} from '../services/reddit.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(private reddit:RedditService) {}

  goToPost(post:string[]){
    console.log(post[2]);
  }

}
