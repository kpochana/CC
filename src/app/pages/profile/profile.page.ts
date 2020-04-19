import { Component, OnInit } from '@angular/core';
import { RedditService } from '../../services/reddit.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  name:string = "";
  constructor(private reddit: RedditService) { }

  ngOnInit() {
    console.log("initializing profile page");
    this.reddit.getProfile();
    this.reddit.profileStream.subscribe((name)=>{
      console.log(name);
      this.name=name;
    });
  }

}
