import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RedditService } from 'src/app/services/reddit.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {

  mSub;
  private messages:string[][]=[];
  id:string="";
  userText:string="";

  constructor(private route: ActivatedRoute,
              private reddit: RedditService) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.mSub = this.reddit.threadStream.subscribe((messages)=>{
      console.log("I'm being updated woo " + this.id);
      this.messages = messages;
    });
    console.log(this.id + " being initialized");
    this.reddit.getThread(this.id); 
  }

  ngOnDestroy(){
    this.mSub.unsubscribe();
  }

  ionViewDidLeave(){
    this.reddit.setCurrentThread("");
  }

  submit(){
    this.reddit.submitMessage(this.id, this.userText);
    this.userText="";
  }

}
