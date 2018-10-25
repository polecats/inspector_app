import { Component, ViewChild } from '@angular/core';
import { MenuController, NavController, Slides } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { UserData } from '../../providers/user-data';
import { LoginPage } from '../../pages/login/login';
import { InspectionsPage } from '../../pages/inspections/inspections';

@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})

export class TutorialPage {
  showSkip = true;

	@ViewChild('slides') slides: Slides;

  constructor(
    public navCtrl: NavController,
    public menu: MenuController,
    public storage: Storage,
    public userData: UserData
  ) { }

  startApp() {
    this.userData.hasLoggedIn().then((hasLoggedIn) => {
      if (hasLoggedIn) { // Set to our main tabview
        this.navCtrl.setRoot(InspectionsPage).then(() => {
          this.storage.set('hasSeenTutorial', 'true'); // Set as seens tutorial
        })
      }
      else {
        this.navCtrl.setRoot(LoginPage).then(() => {
          this.storage.set('hasSeenTutorial', 'true'); // Set as seens tutorial 
        })       
      }
    });
    
    // // this.navCtrl.push(TabsPage).then(() => {
    // this.navCtrl.setRoot(LoginPage).then(() => {
    //   this.storage.set('hasSeenTutorial', 'true');
    // })
  }

  onSlideChangeStart(slider: Slides) {
    this.showSkip = !slider.isEnd();
  }

  ionViewWillEnter() {
    this.slides.update();
  }

  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false);
  }

  ionViewDidLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menu.enable(true);
  }
}