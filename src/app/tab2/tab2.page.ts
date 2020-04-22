import { Component } from '@angular/core';
import {RedditService} from '../services/reddit.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  threads:string[]=[];
  constructor(private reddit:RedditService) {}

  ngOnInit(){
    this.reddit.messageStream.subscribe((threads)=>{
      console.log(threads);
      this.threads = threads;
    })
    this.reddit.getInbox();
  }
}

