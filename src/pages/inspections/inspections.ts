import { Component, ViewChild } from '@angular/core';
import { ItemSliding, AlertController, App, FabContainer, List, ModalController, NavController, LoadingController, Refresher, Events } from 'ionic-angular';
import { Utils } from "../../providers/utils";
import { InspTabsPage } from '../insp-tabs-page/tabs-page';
import { InspectionsData } from '../../providers/inspections-data';
import { InspectionList } from '../../interfaces/inspection-list';

// @IonicPage()
@Component({
  selector: 'inspections-record',
  templateUrl: 'inspections.html' 
})
export class InspectionsPage {
  // the list is a child of the Inspections page
  // @ViewChild('inspectionsList') gets a reference to the list
  // with the variable #onlineList, `read: List` tells it to return
  // the List and not a reference to the element
  @ViewChild('onlineList', { read: List }) onlineList: List;
  @ViewChild('localList', { read: List }) localList: List;

  // shownInspections: any = [];
  shownLocalInspections: InspectionList[] = [];
  shownOnlineInspections: InspectionList[] = [];
  queryText = '';
  segment = 'onlineInsp';

  constructor(
    public alertCtrl: AlertController,
    public app: App,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public inspectionsData: InspectionsData,
    public utils: Utils,
    public events: Events
  ) { }

  ionViewDidLoad() {
    this.app.setTitle('Visual Inspection'); 
    this.fetchLocalInspections(null);
    this.fetchOnlineInspection(); 
  }

  /**
   * Get the online inspection list count.
   */
  getOnlineInspectionCount(): number {
    if (this.shownOnlineInspections == null) {
      return 0;
    }

    return this.shownOnlineInspections.length;
  }

  /**
   * Get the local inspection list count
   */
  getLocalInspectionCount(): number {
    if (this.shownLocalInspections == null) {
      return 0;
    }
    
    return this.shownLocalInspections.length;
  }

  /**
   * Perform search filtering.
   */
  searchInspections(): void {
    if (this.segment === 'onlineInsp') {
      // this.updateOnlineInspections();
    }
    else if (this.segment === 'localInsp') {
      // this.updateLocalInspections();
    }
  }

  /**
   * This method will retrive list from the memory.
   */
  fetchOnlineInspection(): void {
    this.shownOnlineInspections = this.inspectionsData.getOnlineList();
  }

  /**
   * This method will retrive list from the memory.
   */
  fetchLocalInspections(refresher: Refresher): void {
    // Close any open sliding items when the schedule updates
    this.onlineList && this.onlineList.closeSlidingItems();
    this.localList && this.localList.closeSlidingItems();

    this.inspectionsData.getLocalList().then((inslist) => {
      this.shownLocalInspections = inslist;

      if (refresher != null) {
        refresher.complete();
      }
    });
  }

  /**
   * Called when we want to update the online list with the 
   * online data.
   * 
   * @param refresher 
   */
  updateOnlineInspections(refresher: Refresher): void {
    // Close any open sliding items when the schedule updates
    this.onlineList && this.onlineList.closeSlidingItems();
    this.localList && this.localList.closeSlidingItems(); 

    this.inspectionsData.listFromServer().then((data) => {
      this.shownOnlineInspections = data;
      refresher.complete();
    })
  }

  /**
   * Retrive the actual inspection record from the cloud.
   * 
   * @param slidingItem 
   * @param insp 
   */
  goDownloadOnline(slidingItem: ItemSliding, insp: InspectionList): void {
    slidingItem.close();

    // First check if record already in the local storage (downloaded before)
    // let record =  this.shownLocalInspections.filter(x => x.id === insp.id)[0];
    let record = null;
    
    if (this.shownLocalInspections != null) {
      record = this.shownLocalInspections.find(x => x.id === insp.id);
    }

    if (record != null) {
      let alert = this.alertCtrl.create({
        title: insp.name + ' inspection record found',
        message: 'Do you want to overwrite the local copy?',
        buttons: [
          {
            text: 'No',
            handler: () => {
              // they clicked the cancel button, do not remove the session
              // close the sliding item and hide the option buttons
              slidingItem.close();
            }
          },
          {
            text: 'Yes',
            handler: () => {
              // they want to overwrite this inspections local data
              // Download the inspection.
              this.goDownloadOnlineInspection(insp.id, insp.name);

              // close the sliding item and hide the option buttons
              slidingItem.close();
            }
          }
        ]
      });     
      
      // now present the alert on top of all other content
      alert.present();
    }
    else {
      // Download the inspection.
      this.goDownloadOnlineInspection(insp.id, insp.name);
    }
  }

  /**
   * Edit local inspection record.
   * 
   * @param slidingItem 
   * @param insp 
   */
  goEditLocal(slidingItem: ItemSliding, insp: InspectionList): void {
    slidingItem.close();

    this.openInspection(insp.id, insp.name, false);
  }

  /**
   * Upload the local inspection record to the cloud.
   * 
   * @param slidingItem 
   * @param insp 
   */
  goUploadLocal(slidingItem: ItemSliding, insp: InspectionList): void {
    // First, we need to check if this exist online to decide wether to post
    // or to put
    this.inspectionsData.checkOnlineRecord(insp.id).then((count) => {
      if (count < 0) {
        // Means error has occured and user is prompt.
        return;
      }

      if (count === 0) {
        let alert = this.alertCtrl.create({
          title: 'Upload ' + insp.name,
          message: 'Would you like to upload this inspections?',
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
              text: 'Upload',
              handler: () => {
                // No record exist online, so safe to post
                this.inspectionsData.uploadInspectionForm(insp.id).then((status) => {
                  if (status) {
                    // Upload is successfull. What else to do?
                    slidingItem.close();
                  }
                });
              }
            }
          ]
        });
    
        // now present the alert on top of all other content
        alert.present();
      }
      else {
        // Record exist online, prompt user for the next step
        let alert = this.alertCtrl.create({
          title: 'Upload ' + insp.name,
          message: 'Record already exist online, would you like to update?',
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
              text: 'Update',
              handler: () => {
                // they want to remove this inspections from the list
                this.inspectionsData.updateInspectionForm(insp.id).then((status) => {
                  if (status) {
                    // Upload is successfull. What else to do?
                    slidingItem.close();
                  }
                });
              }
            }
          ]
        });
    
        // now present the alert on top of all other content
        alert.present();        
      }
    });
  }

  /**
   * Remove the local inspection record for the list and storage.
   * 
   * @param slidingItem 
   * @param insp 
   */
  goDeleteLocal(slidingItem: ItemSliding, insp: InspectionList): void {
    let alert = this.alertCtrl.create({
      title: 'Delete ' + insp.name,
      message: 'Would you like to delete this inspections?',
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
            // they want to remove this inspections from the list
            this.inspectionsData.removeLocalListItem(insp).then((inslist) => {
              // Update back the list
              // this.fetchLocalInspections();
              this.shownLocalInspections = inslist;

              // close the sliding item and hide the option buttons
              slidingItem.close();
            });
          }
        }
      ]
    });

    // now present the alert on top of all other content
    alert.present();
  }

  /**
   * Performs the list update and refresh according to the current
   * view.
   * 
   * @param refresher 
   */
  goRefresh(refresher: Refresher) {
    if (this.segment === 'onlineInsp') {
      this.updateOnlineInspections(refresher);
    }
    else if (this.segment === 'localInsp') {
      this.fetchLocalInspections(refresher);
      // // simulate a network request that would take longer
      // // than just pulling from out local json file
      // setTimeout(() => {
      //   refresher.complete();
      //   this.events.publish('msg:success', 'Inspections list have been updated.');
      // }, 1000);
    }
  }

  goDownloadOnlineInspection(id: string, name: string): void {
    // Download the inspection report
    this.inspectionsData.downloadInspectionForm(id).then((success) => {
      if (!success) {
        return;
      }
      
      this.fetchLocalInspections(null);

      // If download is successfull, ask user if they want to open it
      let alert = this.alertCtrl.create({
        title: 'Download Successful',
        message: 'Would you like to open this record?',
        buttons: [
          {
            text: 'No',
            handler: () => { }
          },
          {
            text: 'Yes',
            handler: () => {
              this.openInspection(id, name, false);
            }
          }
        ]
      });
  
      // now present the alert on top of all other content
      alert.present();
    });
  }

  /**
   * Create a new local inspection record.
   * 
   * @param fab 
   */
  goCreateLocalInspection(fab: FabContainer): void {
    let guid = this.utils.newGuid(true);

    // Ask user to create a new inspections data
    // Go to the inspection view
    let alert = this.alertCtrl.create({
      title: 'New Inspection',
      subTitle: 'Please enter an inspections name',
      // message: 'Id: ' + guid,
      inputs: [
        {
          name: 'inspectionsname',
          placeholder: 'Inspections Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: _ => {
            console.log('Cancel create inspections');
          }
        },
        {
          text: 'Create',
          handler: data => {
            if (this.utils.isStringValid(data.inspectionsname)) {
              this.openInspection(guid, data.inspectionsname, true);
            } else {
              this.events.publish('msg:error', 'Invalid inspections name');
              return false;
            }
          }
        }
      ]
    });

    alert.present();
    fab.close();
  }

  /**
   * Open any local inspection records and proceed to the inspection mode
   * view.
   * 
   * @param guid 
   * @param inspName 
   */
  private openInspection(guid: string, inspName: string, isNew: boolean): void {
    let timestamp = this.utils.dateNowUnixTime();//Date.now() / 1000;

    if (isNew) {
      // We create a new entry to our local inspection list
      let newinsp: InspectionList = {
        id: guid,
        name: inspName.toUpperCase(),
        created: timestamp,
        modified: timestamp
      }

      this.inspectionsData.addLocalListItem(newinsp, false).then(() => {
        // Open the inspections view, but in edit mode
        this.navCtrl.setRoot(InspTabsPage, { inspection: newinsp, isNew: true });      
      });
    }
    else {
      // Get the inspection id and open it
      // We create a new entry to our local inspection list
      let editinsp: InspectionList = {
        id: guid,
        name: inspName,
        created: timestamp, // Provide dummy timestamp because this will be overriden in the actual
        modified: timestamp // inspection mode
      }

      this.navCtrl.setRoot(InspTabsPage, { inspection: editinsp, isNew: false });  
    }
  }
}