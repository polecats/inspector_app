import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { DatasheetPage } from '../datasheet/datasheet';
import { ObservationPage } from '../observation/observation';
import { DiagramPage } from '../diagram/diagram';
import { CriticalPage } from '../critical/critical';

@Component({
  templateUrl: 'tabs-page.html'
})
export class InspTabsPage {
  // set the root pages for each tab
  tab1Root: any = DatasheetPage;
  tab2Root: any = ObservationPage;
  tab3Root: any = DiagramPage;
  tab4Root: any = CriticalPage;
  mySelectedIndex: number;

  // tab1Params: any;
  // tab2Params: any;
  // tab3Params: any;
  // tab4Params: any;

  constructor(
    public navParams: NavParams
  ) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;

    // Set if readonly
    // navParams.data.readonly 
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad InspTabsPage ' + JSON.stringify(this.navParams.data));

    // // Set the param here
    // this.tab1Params = this.navParams.data;
    // this.tab2Params = this.navParams.data;
    // this.tab3Params = this.navParams.data;
    // this.tab4Params = this.navParams.data;
  }
}