import { Component, ViewChild } from '@angular/core';
import { MenuController, NavController, Slides, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SettingsData } from '../../providers/settings-data';
import { LookupData } from '../../providers/lookup-data';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {
  // showSkip = true;

  apiLink: string;

	@ViewChild('slides') slides: Slides;

  constructor(
    public events: Events,
    public navCtrl: NavController,
    public menu: MenuController,
    public storage: Storage,
    public settings: SettingsData,
    public lookup: LookupData
  ) { 
    this.settings.getApiGateway().then(urlpath =>
    {
      this.apiLink = urlpath;
    })
  }

  onSlideChangeStart(slider: Slides) {
    slider.isEnd();
    // this.showSkip = !slider.isEnd();
  }

  ionViewWillEnter() {
    // this.slides.update();
  }

  ionViewDidEnter() {
    // // the root left menu should be disabled on the tutorial page
    // this.menu.enable(false);
  }

  ionViewWillLeave() {
    // // Save whatever changes to the settings
    // this.settings.setApiGateway(this.apiLink);
  }

  ionViewDidLeave() {
    // // enable the root left menu when leaving the tutorial page
    // this.menu.enable(true);
  }

  onSave(): void {
    // Save whatever changes to the settings
    this.settings.setApiGateway(this.apiLink);
    this.events.publish('msg:success', 'Settings saved');
  }

  /**
   * Perform data sync with the backend
   */
  onSync(): void {
    // Pulls the lookup tables
    this.lookup.loadFromServer();
  }

  /**
   * Handles the focus if the input
   */
  apiLinkFocus(): void {
    // // Save whatever changes to the settings
    // this.settings.setApiGateway(this.apiLink);
    console.log('apiLinkFocus');
  }
}