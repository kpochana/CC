import { Component, OnInit } from '@angular/core';
import { RedditService } from '../../services/reddit.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  name:string = "";
  constructor(private reddit: RedditService,
              private navCtrl: NavController) { }

  ngOnInit() {
    console.log("initializing profile page");
    this.reddit.loadProfile();
  }

  updateCity($event:any){
    let val = $event.target.value;
    if(typeof(val) == "object"){
      this.reddit.setLocation(val[0], val[1]);
      console.log(val);
    }
  }

  logout(){
    this.reddit.storeData("refreshToken", "");
    this.reddit.redditExists = false;
    this.navCtrl.navigateForward("/login");
  }
}
