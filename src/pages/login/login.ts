import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, MenuController, Events } from 'ionic-angular';
import { UserData } from '../../providers/user-data';
import { UserOption } from '../../interfaces/user-option';
import { SignupPage } from '../signup/signup';
import { SettingsPage } from '../settings/settings';
import { SystemEvents } from '../../providers/enums';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  private _login: UserOption = { username: '', password: '' };
  // menu:any;
  // private _loginsub: () => void;

  constructor(
    private navCtrl: NavController, 
    private userData: UserData, 
    private menu: MenuController, 
    private events: Events
  ) { 
    // menu.swipeEnable(false);
    // this.menu = menuCtrl;
  }

  ngOnInit() {
    // // Listen to the login event
    // this._loginsub = () => {
    //   this.navCtrl.setRoot(InspectionsPage); // Set to our main tabview
    // }

    // this.events.subscribe(this.systemEvents.LOGIN, this._loginsub);
  }

  ngOnDestroy() {
    // this.events.unsubscribe(this.systemEvents.LOGIN, this._loginsub);
    // this._loginsub = undefined;
  }

  onLogin(form: NgForm) {
    // this.submitted = true;
    
    if (form.valid) {
      this.userData.login(this._login.username, this._login.password);
    } else {
      this.events.publish(SystemEvents.ERROR, 'Please enter username and password', Date.now());
    }
  }

  onSignup() {
    this.navCtrl.push(SignupPage);
  }  

  onPageDidEnter() {
    // the left menu should be disabled on the login page
    this.menu.enable(false);

    // get rid of the swipe effect
    this.menu.swipeEnable(false);
  }

  onPageDidLeave() {
    // enable the left menu when leaving the login page
    this.menu.enable(true);

    // get back of the swipe effect
    this.menu.swipeEnable(true);
  }  

  doForgotPassword() {

  }

  doBack() {
    
  }

  openSettings() {
    this.navCtrl.push(SettingsPage);
  }
}