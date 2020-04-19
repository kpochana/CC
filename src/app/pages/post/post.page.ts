import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RedditService} from '../../services/reddit.service';
import {PopoverController} from '@ionic/angular';
import {PopoverMenuComponent} from '../../components/popover-menu/popover-menu.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.page.html',
  styleUrls: ['./post.page.scss'],
})
export class PostPage implements OnInit {

  userText:string="";
  postID:string="";
  post:string[]=[];

  constructor(private route: ActivatedRoute,
              private reddit: RedditService,
              public popoverController: PopoverController) { }

  ngOnInit() {
    this.postID = this.route.snapshot.paramMap.get('id');
    console.log(this.postID);
    this.reddit.getPost(this.postID);
    this.reddit.postStream.subscribe((post)=>{
      this.post = post;
    });
    var popButton = document.querySelector("#popButton");
    popButton.addEventListener('click', this.showMenu);
  }

  ionViewWillLeave(){
    this.reddit.postStream.next([]);
  }

  submitComment(){
    if(this.userText != ""){
      this.reddit.submitComment(this.postID, this.userText);
      this.userText="";
    }
  }

  async showMenu(event: any){
    console.log(this.popoverController);
    const popover = await this.popoverController.create({
      component: PopoverMenuComponent,
      event: event,
      translucent: true,
      backdropDismiss: true
    });
    return await popover.present();
  }

  rf(){
    console.log("i work");
  }
}
