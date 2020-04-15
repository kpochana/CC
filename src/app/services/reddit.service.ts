import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { Device } from '@ionic-native/device/ngx';
import {Snoowrap} from 'snoowrap';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';

var snoowrap = require('snoowrap');

@Injectable({
  providedIn: 'root'
})
export class RedditService {


  state:string = this.device.uuid + "CC";
  appID:string = "dACO3ajsot2Udg";
  redirectURL:string = "http://localhost:8100/redirect";
  permissions:string = "identity edit";
  loginURLp1:string = "https://www.reddit.com/api/v1/authorize?"
                + "client_id=" + this.appID
                + "&response_type=" + "code"
                + "&state=";

  loginURLp2:string = "&redirect_uri=" + this.redirectURL
                + "&duration=" + "permanent"
                + "&scope=" + this.permissions;

  //reddit:Snoowrap = new Snoowrap()
  //public login:BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  private sUpdate:BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private device: Device) { }

  login(state:string, code:string){
    if(state != this.state){
      //console.log("uh oh" + this.state + " but i got: " + state);
      return false;
    }
    snoowrap.fromAuthCode({
      code: code,
      userAgent: "corona condom",
      clientId: this.appID,
      redirectUri: this.redirectURL
    }).then(r=>{
      this.sUpdate.next(r);
      //console.log(r);
    });
    return true;
  }

  generateURL(){
    return this.loginURLp1 + this.state + this.loginURLp2;
  }
}
