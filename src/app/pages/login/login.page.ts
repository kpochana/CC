import { Component, OnInit } from '@angular/core';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';
import { AlertController } from '@ionic/angular';
import { browser } from 'protractor';
import { RedditService } from '../../services/reddit.service';
import { Device } from '@ionic-native/device/ngx';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  tempSub;
  state:string = "";
  code:string = "";

  constructor(private iab: InAppBrowser, 
              private alertController: AlertController, 
              private reddit: RedditService,
              private device: Device,
              private navCtrl: NavController) { }

  ngOnInit() {
    if(this.reddit.redditExists){
      this.navCtrl.navigateForward('/main/tabs');
    }
  }

  ngOnDestroy(){
    this.tempSub.unsubscribe();
  }

  login(){
    //submitting request in new inappbrowser
    let browser = this.iab.create(this.reddit.generateURL(), '_blank');
    //handling reddit auth
    this.tempSub = browser.on("loadstart").subscribe(event => {
      //grabbing loaded URL
      var mUrl = event.url;
      //checking if the URL is the redirect URL
      if(mUrl.search("reddit") == -1 && mUrl.search("redirect?") != -1 ){
        //if bad login request, notify user
        if(mUrl.search("error") != -1){
          browser.close()
          this.alertUser("Something went wrong :( Please try again");
        }
        //if good request, extract state and code and update
        else{
          var params:string[] = mUrl.split('?')[1].split('&');
          var state:string = params[0].split('=')[1];
          var code:string = params[1].split('=')[1];
          var success:boolean = this.reddit.login(state, code);
          if (!success){
            this.alertUser("Something went wrong :( Please try again");
          }
          else{
            this.navCtrl.navigateForward('/main/tabs');
          }
          browser.close();
        }
      }
    });
  }

  async alertUser(message:string){
    const alert = await this.alertController.create({
      header: "Alert",
      subHeader: "Subtitle",
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  pushUpdate(){
    //console.log("state: " + this.state + " code: " + this.code);
    var success:boolean = this.reddit.login(this.state, this.code);
    if (!success){
      this.alertUser("Something went wrong :( Please try again");
    }
    else{
      this.navCtrl.navigateForward('/main/tabs');
    }
  }

}
