import { NavParams, ViewController, Platform, IonicPage, Events, ActionSheetController, AlertController, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { FilePath } from '@ionic-native/file-path';
import { Base64 } from '@ionic-native/base64';
import { InspectionObservationData } from '../../interfaces/inspection-observation-data';
import { ObservationIdentifierModelPage } from '../observation-identifier-modal/observation-identifier-modal';
import { SystemEvents } from '../../providers/enums';
import { Utils } from '../../providers/utils';
import { InspectionsData } from '../../providers/inspections-data';
import { TextEditModalPage } from './text-edit-modal';

@IonicPage()
@Component({
  selector: 'page-observation-modal',
  templateUrl: 'observation-modal.html',
})
export class ObservationModelPage {
  _isSaved: boolean;
  cmdTitle: string;
  viewTitle: string;
  iconName: string;
  segment: string = 'general';
  _photos: Array<{id: number, base64: string, encoding: string, isDeleted: boolean}> = [];
  _findings: Array<{id: number, value: string, isDeleted: boolean}> = [];
  _recommendations: Array<{id: number, value: string, isDeleted: boolean}> = [];

  _observation: InspectionObservationData = {
    id: null,
    location: null,
    findings: null,
    identifier: null,
    photos: null,
    recommendation: null
  };
  
  constructor(
    public platform: Platform,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private camera: Camera,
    private events: Events,
    private actionSheetCtrl: ActionSheetController,
    private filePath: FilePath,
    private base64: Base64,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public utils: Utils,
    public inspectionsData: InspectionsData
  ) { }
  
  // dismiss() {
  //   this.viewCtrl.dismiss();
  // }

  ionViewDidLoad() {
    this._isSaved = false;

    if (this.navParams.data.isNew) {
      this.cmdTitle = 'Add';
      this.viewTitle = 'New Observation';
      this.iconName = 'add';

      return;
    }

    this.cmdTitle = 'Update';
    this.viewTitle = 'Edit Observation';
    this.iconName = 'create';

    // We are loading from the previous screen
    if (this.navParams.data.observation != null) {
      this._observation = this.navParams.data.observation as InspectionObservationData;
      this.populatePhoto();
      this.populateFinding();
      this.populateRecommend();
    }
  }

  ionViewDidLeave(): void {
    // Call our callback to update the root page caller
    if (this.navParams.data.callback != null) {
      if (this._isSaved) {
        this.navParams.data.callback(this._observation).then(() => { 
          // this.navCtrl.pop();
        });
      }
      else {
        this.navParams.data.callback(null).then(() => { 
          // this.navCtrl.pop();
        });
      }
    }
  }

  ngAfterViewInit() {

  }

  /**
   * Selection event handler.
   * 
   * @param id 
   */
  goSelectIdentifiers(): void {
    let profileModal = this.modalCtrl.create(
      ObservationIdentifierModelPage, { 
        identifiers: this._observation.identifier 
      }, {
        enableBackdropDismiss: false,
        cssClass: 'select-modal' 
      });

    profileModal.onDidDismiss((data) => {
      this._observation.identifier = data;
    });

    profileModal.present();
  }

  /**
   * Populate the internal photo array.
   */
  populatePhoto(): void {
    if (this._observation.photos == null) {
      return;
    }

    let index = 0;

    this._observation.photos.forEach(photo => {
      this._photos.push({id:index, base64: photo, encoding: 'data:image/jpg;base64,', isDeleted: false});
      index++;
    });
  }

  /**
   * Populate the internal findings array.
   */
  populateFinding(): void {
    if (this._observation.findings == null) {
      return;
    }

    let index = 0;

    this._observation.findings.forEach(finding => {
      this._findings.push({id:index, value: finding, isDeleted: false});
      index++;
    });
  }

  /**
   * Populate the internal recommends array.
   */
  populateRecommend(): void {
    if (this._observation.recommendation == null) {
      return;
    }

    let index = 0;

    this._observation.recommendation.forEach(recommend => {
      this._recommendations.push({id:index, value: recommend, isDeleted: false});
      index++;
    });
  }

  /**
   * Mark the internal photo array item to isDelete.
   * @param id 
   */
  removePhoto(id: number): void {
    if (this._photos == null) {
      return;
    }

    // Prompt user first
    let alert = this.alertCtrl.create({
      title: 'Remove Photo',
      message: 'Would you like to remove this photo?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            // they clicked the cancel button, do not remove the session
            // close the sliding item and hide the option buttons
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this._photos[id].isDeleted = true;
          }
        }
      ]
    });

    // now present the alert on top of all other content
    alert.present();
  }

  /**
   * Mark the internal finding array item to isDelete.
   * @param id 
   */
  removeFinding(id: number): void {
    if (this._findings == null) {
      return;
    }

    // Prompt user first
    let alert = this.alertCtrl.create({
      title: 'Remove Finding',
      message: 'Would you like to remove this finding entry?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            // they clicked the cancel button, do not remove the session
            // close the sliding item and hide the option buttons
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this._findings[id].isDeleted = true;
          }
        }
      ]
    });

    // now present the alert on top of all other content
    alert.present();
  }

  /**
   * Mark the internal recommendation array item to isDelete.
   * @param id 
   */
  removeRecommendation(id: number): void {
    if (this._recommendations == null) {
      return;
    }

    // Prompt user first
    let alert = this.alertCtrl.create({
      title: 'Remove Recommendation',
      message: 'Would you like to remove this recommendation entry?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            // they clicked the cancel button, do not remove the session
            // close the sliding item and hide the option buttons
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this._recommendations[id].isDeleted = true;
          }
        }
      ]
    });

    // now present the alert on top of all other content
    alert.present();
  }

  /**
   * Get the observation photo count.
   */
  getPhotoCount(): number {
    if (this._photos == null) {
      return 0;
    }

    return this._photos.length;
  }

  /**
   * Get the observation finding count.
   */
  getFindingCount(): number {
    if (this._findings == null) {
      return 0;
    }

    return this._findings.length;
  }

  /**
   * Get the observation recommendation count.
   */
  getRecommendationCount(): number {
    if (this._recommendations == null) {
      return 0;
    }

    return this._recommendations.length;
  }

  /**
   * Edit the finding.
   * 
   * @param id 
   */
  editFinding(id: number): void {
    let modal = this.modalCtrl.create(
      TextEditModalPage, {
        text: this._findings[id].value,
        title: 'Edit Finding'
      }, {
        cssClass: 'select-modal',
        enableBackdropDismiss: false
      }
    );

    modal.onDidDismiss((data) => {
      if (this.utils.isStringValid(data)) {
        this._findings[id].value = data;
      }
    });

    modal.present();
  }

  /**
   * Edit the recommendation.
   * 
   * @param id 
   */
  editRecommendation(id: number): void {
    let modal = this.modalCtrl.create(
      TextEditModalPage, {
        text: this._recommendations[id].value,
        title: 'Edit Recommendation'
      }, {
        cssClass: 'select-modal',
        enableBackdropDismiss: false
      }
    );

    modal.onDidDismiss((data) => {
      if (this.utils.isStringValid(data)) {
        this._recommendations[id].value = data;
      }
    });

    modal.present();
  }

  /**
   * Add a new finding.
   */
  onFindings(): void {
    let modal = this.modalCtrl.create(
      TextEditModalPage, {
        title: 'New Finding',
        showTemplateFinding: true
      }, {
        cssClass: 'select-modal',
        enableBackdropDismiss: false
      }
    );

    modal.onDidDismiss((data) => {
      if (this.utils.isStringValid(data)) {
        if (this._findings == null) {
          this._findings = [];
        }
        
        this._findings.push({id: this._findings.length, value: data, isDeleted: false});
      }
    });

    modal.present();    
  }

  /**
   * Add a new recommendation.
   */
  onRecommendation(): void {
    let modal = this.modalCtrl.create(
      TextEditModalPage, {
        title: 'New Recommendation',
        showTemplateRecommend: true
      }, {
        cssClass: 'select-modal',
        enableBackdropDismiss: false
      }
    );

    modal.onDidDismiss((data) => {
      if (this.utils.isStringValid(data)) {
        if (this._recommendations == null) {
          this._recommendations = [];
        }

        this._recommendations.push({id: this._recommendations.length, value: data, isDeleted: false});
      }
    });

    modal.present();   
  }

  onPicture(): void {
    if(!this.platform.is('mobile')) {
      this.events.publish('msg:error', 'This feature is for mobile app only');

      return;
    }

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    actionSheet.present();
  }
    
  private takePicture(sourceType) {
    // Create options for the Camera Dialog
    const options = {
      quality: 50,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      allowEdit: true,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType: this.camera.DestinationType.DATA_URL
    };
     
    // Get the data of an image
    this.camera.getPicture(options).then((imageData) => {
      if (options.destinationType === this.camera.DestinationType.DATA_URL) {
        // this._profile.photo = imageData;

        if (options.encodingType === this.camera.EncodingType.JPEG) {
          this._photos.push({id: this.getPhotoCount(), base64: imageData, encoding: 'data:image/jpg;base64,', isDeleted: false});
        }
        else {
          this._photos.push({id: this.getPhotoCount(), base64: imageData, encoding: 'data:image/png;base64,', isDeleted: false});
        }

        return;
      }
  
      // Special handling for Android library when using file
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imageData)
          .then(filePath => {
            let correctPath = filePath;
            
            // let currentName = imageData.substring(imageData.lastIndexOf('/') + 1, imageData.lastIndexOf('?'));
            // this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
            this.base64.encodeFile(correctPath).then((base64File: string) => {
              this._photos.push({id: this.getPhotoCount(), base64: base64File, encoding: 'data:image/jpg;base64,', isDeleted: false});
            }, (err) => {
              this.events.publish(SystemEvents.ERROR, 'Error while selecting photo. ' + err);
            });
          });
      } else {
        // let currentName = imageData.substr(imageData.lastIndexOf('/') + 1);
        let correctPath = imageData;

        // this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
        this.base64.encodeFile(correctPath).then((base64File: string) => {
          // this._profile.photo = base64File;

          if (options.encodingType === this.camera.EncodingType.JPEG) {
            this._photos.push({id: this.getPhotoCount(), base64: base64File, encoding: 'data:image/jpg;base64,', isDeleted: false});
          }
          else {
            this._photos.push({id: this.getPhotoCount(), base64: base64File, encoding: 'data:image/png;base64,', isDeleted: false});
          }
        }, (err) => {
          this.events.publish(SystemEvents.ERROR, 'Error while capturing photo. ' + err);
        });
      }
    }, (err) => {
      this.events.publish(SystemEvents.ERROR, 'Error while updating photo. ' + err.message);
    });
  }  
  
  /**
   * Save this observation to the Inspection record
   */
  saveObservation(): void {
    // When saving, this will generate a new UUID
    if (this.navParams.data.isNew) {
      this._observation.id = this.utils.newGuid(true);
    }

    // Sanitize text
    this._observation.location = this._observation.location.toUpperCase();

    // Check parameters
    if (!this.utils.isStringValid(this._observation.identifier)) {
      this.events.publish(SystemEvents.ERROR, 'Please fill observation identifiers');

      return;
    }

    if (!this.utils.isStringValid(this._observation.location)) {
      this.events.publish(SystemEvents.ERROR, 'Please fill observation location');

      return;
    }

    // Loop the internal photo array and update the existing observation photos
    if (this._observation.photos != null) {
      this._observation.photos.length = 0; // Reset the array
    }
    else {
      this._observation.photos = [];
    }

    this._photos.forEach(photo => {
      if (!photo.isDeleted) {
        this._observation.photos.push(photo.base64);
      }
    });

    // Check photo parameters
    if (this._observation.photos.length < 1) {
      this.events.publish(SystemEvents.ERROR, 'Please add observation photo');

      return;
    }

    // Loop the internal findings array and update the existing observation findings
    if (this._observation.findings != null) {
      this._observation.findings.length = 0; // Reset the array
    }
    else {
      this._observation.findings = [];
    }

    this._findings.forEach(finding => {
      if (!finding.isDeleted) {
        this._observation.findings.push(finding.value);
      }
    });

    // Loop the internal recommends array and update the existing observation recommends
    if (this._observation.recommendation != null) {
      this._observation.recommendation.length = 0; // Reset the array
    }
    else {
      this._observation.recommendation = [];
    }

    this._recommendations.forEach(recommend => {
      if (!recommend.isDeleted) {
        this._observation.recommendation.push(recommend.value);
      }
    });

    // Check findings and recomendation parameters
    if (this._observation.findings.length < 1) {
      this.events.publish(SystemEvents.ERROR, 'Please add observation findings');

      return;
    }

    if (this._observation.recommendation.length < 1) {
      this.events.publish(SystemEvents.ERROR, 'Please add observation recommendation');

      return;
    }

    // Call our data manager
    this.inspectionsData.getLocalObservation(this.navParams.data.inspectionId).then((obs) => {
      if (obs.data == null) {
        // Meaning this might be a new observation, so create one array
        obs.data = [];
      }

      // Read existing inspection data
      if (this.navParams.data.isNew) {
        // Push to our array since its new
        obs.data.push(this._observation);
      }
      else {
        // We want to replace the old observation
        // by using filter to remove the item from the array.
        let editedobs = obs.data.filter(item => item.id !== this._observation.id);
        
        editedobs.push(this._observation); // Push the edited observation

        // Replace the entire observation
        obs.data.length = 0;  // Clear the old
        obs.data = editedobs; // In the new
      }

      // Store the changes
      this.inspectionsData.setLocalObservation(this.navParams.data.inspectionId, obs);
      this._isSaved = true;
    });
  }
}