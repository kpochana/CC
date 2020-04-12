import { Component } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http'
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';
import { browser } from 'protractor';
import { LoginService } from '../services/login.service';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  returnedState:string = "";
  returnedCode:string = "";

  state:string = "";
  code:string = "";


  userString:string = "";
  appID:string = "dACO3ajsot2Udg";
  redirectURL:string = "http://localhost:8100/tabs/tab1";
  permissions:string = "identity edit";
  loginURLp1:string = "https://www.reddit.com/api/v1/authorize?"
                + "client_id=" + this.appID
                + "&response_type=" + "code"
                + "&state=";

  loginURLp2:string = "&redirect_uri=" + this.redirectURL
                + "&duration=" + "permanent"
                + "&scope=" + this.permissions;
  
  constructor(private http: HttpClient, private iab:InAppBrowser, private loginService: LoginService) {
    var errorSearch = location.search.search("error");
    var querySearch = location.search.search("code");
    if(errorSearch == -1 && querySearch != -1){
      var params:string[] = location.search.split('?')[1].split('&');
      this.state = params[0].split('=')[1];
      this.code = params[1].split('=')[1];
      loginService.updateData([this.state, this.code]);
    }
  }

  getCode(){
    console.log("function running");
    var loginURL:string = this.loginURLp1 + this.userString + this.loginURLp2;
    let browser = this.iab.create(loginURL, '_blank');
    this.loginService.loginData.subscribe((data)=>{
      this.returnedState = data[0];
      this.returnedCode = data[1];
      console.log("returned login info: ");
      console.log(data);
      console.log(this.returnedState);
      console.log(this.returnedCode);
      if(this.returnedState == this.userString){
        browser.close();
        console.log(this.returnedState);
        console.log(this.returnedCode);
      }
    });
  }

  getToken(){
    var loginURL:string = "https://www.reddit.com/api/v1/access_token";
    var headers:HttpHeaders = new HttpHeaders({
      //'Content-Type' : 'application/x-www-form-urlencoded',
      'Authorization' : this.appID
    });
    this.http.post(loginURL, {
      grant_type: "authorization_code",
      code: this.code,
      redirect_uri: this.redirectURL
    },{headers}).subscribe((response) => {
      console.log(response);
    });
  }

}
