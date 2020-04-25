import { Component, OnInit } from '@angular/core';
import {RedditService} from '../../services/reddit.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
})
export class NewPostPage implements OnInit {

  zipCode:string="";
  postText:string="";
  postTitle:string="";
  constructor(private reddit:RedditService,
              private navCtrl:NavController) { }

  ngOnInit() {
  }

  submitPost(){
    let postTitle:string = "";
    if(!(this.postText == "" || this.postTitle == "")){
      if(this.zipCode != ""){
        postTitle = "[" + this.zipCode + "] ";
      } 
      postTitle += this.postTitle;
      this.reddit.submitPost(postTitle, this.postText);
      this.navCtrl.navigateBack("/main/tabs/tab1");
    }
  }
}
