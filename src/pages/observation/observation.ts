import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ItemSliding, AlertController } from 'ionic-angular';
import { ObservationModelPage } from '../observation-modal/observation-modal';
import { InspectionObservationData } from '../../interfaces/inspection-observation-data';
import { InspectionsData } from '../../providers/inspections-data';
import { InspectionList } from '../../interfaces/inspection-list';
import { InspectionObservation } from '../../interfaces/inspection-observation';

@IonicPage()
@Component({
  selector: 'page-observation',
  templateUrl: 'observation.html',
})
export class ObservationPage {
  _observationList: InspectionObservationData[] = [];
  _inspection: InspectionList;

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public inspectionsData: InspectionsData
  ) { }

  ionViewDidLoad() {
    this._inspection = this.navParams.data.inspection as InspectionList;
    
    if (this._inspection == null) {
      // This should not happen
      return;
    }

    this.fetchObservations(this._inspection.id); 
  }

  /**
   * Retreive the observation list from storage and show.
   * 
   * @param id 
   */
  fetchObservations(id: string): void {
    this.inspectionsData.getLocalObservation(id).then((obslist) => {
      if (obslist == null) {
        return;
      }

      if (obslist.data != null) {
        this._observationList = obslist.data;
      }
    });
  }

  /**
   * Get the count number of the observation list.
   */
  getObservationCount(): number {
    if (this._observationList == null) {
      return 0;
    }

    return this._observationList.length;
  }

  /**
   * Add observation list.
   */
  addObservation(): void {
    this.navCtrl.push(
      ObservationModelPage, { 
        inspectionId: this._inspection.id, 
        observation: null, 
        isNew: true,
        callback: this.updateObservationCallback
      }
    );
  }

  /**
   * Callback function for updating the parent page when the children page
   * from the nav controller pops.
   */
  updateObservationCallback = (data) => {
    return new Promise((resolve) => {
      if (data != null) {
        let obsdata = data as InspectionObservationData;

        this._observationList.push(obsdata);
      }

      resolve();
    });
  }

  /**
   * Edit the observation.
   * 
   * @param slidingItem 
   * @param obs 
   */
  goEditObservation(slidingItem: ItemSliding, obs: InspectionObservationData): void {
    slidingItem.close();
    this.navCtrl.push(
      ObservationModelPage, { 
        inspectionId: this._inspection.id, 
        observation: obs, 
        isNew: false ,
        callback: this.updateObservationCallback
      }
    );
  }

  /**
   * Deletes the observation list.
   * 
   * @param slidingItem 
   * @param obs 
   */
  goDeleteObservation(slidingItem: ItemSliding, obs: InspectionObservationData): void {
    let alert = this.alertCtrl.create({
      title: 'Observation LOC: ' + obs.location,
      message: 'Would you like to delete this observation?',
      subTitle: 'Note: This process is irreversible',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            // they clicked the cancel button, do not remove the session
            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        },
        {
          text: 'Delete',
          handler: () => {
            if (this._inspection == null) {
              // This should suppose to happen
              return;
            }

            // they want to remove this observation from the list
            // by using filter to remove the item from the array.
            this._observationList = this._observationList.filter(item => item.id !== obs.id);

            let observation: InspectionObservation = {
              id: this._inspection.id,
              data: this._observationList
            }
            
            // We update back to our local storage
            this.inspectionsData.setLocalObservation(this._inspection.id, observation);

            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        }
      ]
    });

    // now present the alert on top of all other content
    alert.present();
  }
}