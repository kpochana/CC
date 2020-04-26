import { Component } from '@angular/core';
import {RedditService} from '../services/reddit.service';
import { NavController } from '@ionic/angular';
import { interval } from 'rxjs';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  mSub;
  polling;
  threads:string[]=[];
  constructor(private reddit:RedditService,
              private navCtrl:NavController) {}

  ngOnInit(){
    //this.reddit.getInbox();
    this.mSub = this.reddit.messageStream.subscribe((threads)=>{
      console.log(threads);
      this.threads = threads;
    });
  }

  ngOnDestroy(){
    this.mSub.unsubscribe();
  }

  goTo(name:string){
    this.navCtrl.navigateForward("/messages/" + name);
  }

  ionViewDidEnter(){
    this.polling = interval(5000).subscribe(()=>{
      console.log("I am running wee");
      this.reddit.getPosts();
      this.reddit.updateInbox();
    });

  }

  ionViewWillLeave(){
    this.polling.unsubscribe();
  }
}

