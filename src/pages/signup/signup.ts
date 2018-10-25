import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, Platform, Events, AlertController, ActionSheetController } from 'ionic-angular';
import { UserData } from '../../providers/user-data';
import { LoginPage } from '../login/login';
import { UserProfile } from '../../interfaces/user-profile';
import { Camera } from '@ionic-native/camera';
import { FilePath } from '@ionic-native/file-path';
import { Base64 } from '@ionic-native/base64';
import { LookupData } from '../../providers/lookup-data';
import { LookupInterface } from '../../interfaces/lookup';
import { SystemEvents } from '../../providers/enums';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  private _profile: UserProfile = {
    id: 0,
    username: null,
    password: null,
    name: null,
    position: null,
    company: null,
    photo: null
  };

  public _submitted: boolean = false;
  private _positionList: LookupInterface[] = [];
  private _companyList: LookupInterface[] = [];
  public _photo: string = 'assets/img/personplaceholder.png';
  private _signupsub: () => void; // The event handler
  private _isAlreadyPopup: boolean = false;

  constructor(
    private userData: UserData,
    private lookup: LookupData,
    private navCtrl: NavController, 
    private camera: Camera,
    private platform: Platform, 
    private filePath: FilePath,
    private base64: Base64,
    private events: Events,
    private alertCtrl: AlertController, 
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {
    // Subscribe to event
    this._signupsub = () => {
      this.events.publish(SystemEvents.SUCCESS, 'Signup successful, please log in.');
      this.navCtrl.setRoot(LoginPage); // Return to the login screen
    }

    this.events.subscribe(SystemEvents.SIGNUP, this._signupsub);
  }

  ngOnDestroy() {
    this.events.unsubscribe(SystemEvents.SIGNUP, this._signupsub);
    this._signupsub = undefined;
  }

  ngAfterViewInit() {
    this.getLookups();
  }

  getLookups(): void {
    this.lookup.getPositionList().then((poslist) => {
      if (poslist == null) {
        return;
      }

      this._positionList = poslist;
    });

    this.lookup.getCompanyList().then((orglist) => {
      if (orglist == null) {
        return;
      }

      this._companyList = orglist;
    });
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
        this._profile.photo = imageData;

        if (options.encodingType === this.camera.EncodingType.JPEG) {
          this._photo = 'data:image/jpg;base64,' + imageData;
        }
        else {
          this._photo = 'data:image/png;base64,' + imageData;
        }

        return;
      }

      // Special handling for Android library when using file
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imageData)
          .then(filePath => {
            let correctPath = filePath;
            // // let correctPath = filePath.substr(filePath.lastIndexOf('/') + 1);
            // // let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            // alert('[0]' + filePath);
            // alert('[00]' + imageData);
            // alert('[1]' + filePath.substr(filePath.lastIndexOf('/') + 1));
            // alert('[2]' + filePath.substr(0, filePath.lastIndexOf('/') + 1));
            
            // let currentName = imageData.substring(imageData.lastIndexOf('/') + 1, imageData.lastIndexOf('?'));
            // this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
            this.base64.encodeFile(correctPath).then((base64File: string) => {
              // alert('[2]' + base64File);
              this._profile.photo = base64File;
              this._photo = 'data:image/jpg;base64,' + base64File;
            }, (err) => {
              this.events.publish(SystemEvents.ERROR, 'Error while selecting photo. ' + err);
            });
          });
      } else {
        // let currentName = imageData.substr(imageData.lastIndexOf('/') + 1);
        let correctPath = imageData;
        // // let correctPath = imageData.substr(imageData.substr(0, imageData.lastIndexOf('/') + 1));
        // // let correctPath = imageData.substr(0, imageData.lastIndexOf('/') + 1);
        // alert('[0]' + imageData);
        // alert('[1]' + imageData.substr(imageData.lastIndexOf('/') + 1));
        // alert('[2]' + imageData.substr(imageData.substr(0, imageData.lastIndexOf('/') + 1)));
        // this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
        this.base64.encodeFile(correctPath).then((base64File: string) => {
          // alert('[3]'  +base64File);
          this._profile.photo = base64File;

          if (options.encodingType === this.camera.EncodingType.JPEG) {
            this._photo = 'data:image/jpg;base64,' + base64File;
          }
          else {
            this._photo = 'data:image/png;base64,' + base64File;
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
   * Starts the photo capture
   */
  onAddPicture(): void {
    if(!this.platform.is('mobile')) {
      this.events.publish(SystemEvents.ERROR, 'This feature is for mobile app only');

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

  /**
   * Show the list of dropdown values.
   * 
   * @param id the dropdown id
   */
  onSelectDropdown(id: number): void {
    // Logic to prevent multi focus trigger
    if (this._isAlreadyPopup) {
      return;
    }

    switch (id)
    {
      case 0: // Position selection
        let posalert = this.alertCtrl.create({
          enableBackdropDismiss:false,
          title: 'Select Position'
        });
        
        for (let entry of this._positionList) {
          posalert.addInput({
            type: 'radio',
            label: entry.value,
            value: entry.value,
            checked: entry.value === this._profile.position ? true : false
          });
        } 
    
        posalert.addButton({
          text: 'Cancel',
          handler: () => {
            this._isAlreadyPopup = false;
          }
        });

        posalert.addButton({
          text: 'Ok',
          handler: (data: any) => {
            this._isAlreadyPopup = false;
            this._profile.position = data;
          }      
        });
    
        this._isAlreadyPopup = true;
        posalert.present();
        break;

      case 1: // Company selection
        let orgalert = this.alertCtrl.create({
          enableBackdropDismiss:false,
          title: 'Select Company'
        });
    
        for (let entry of this._companyList) {
          orgalert.addInput({
            type: 'radio',
            label: entry.value,
            value: entry.value,
            checked: entry.value === this._profile.company ? true : false
          });
        } 
        
        orgalert.addButton({
          text: 'Cancel',
          handler: () => {
            this._isAlreadyPopup = false;
          }
        });
        
        orgalert.addButton({
          text: 'Ok',
          // handler: data => {
          //   this.testRadioOpen = false;
          //   this.testRadioResult = data;
          // }
          handler: (data: any) => {
            this._isAlreadyPopup = false;
            this._profile.company = data;
          }      
        });
    
        this._isAlreadyPopup = true;
        orgalert.present();      
        break;
    }
  }

  /**
   * Register the new account profile.
   * 
   * @param form the form to submit
   */
  onSignup(form: NgForm): void {
    this._submitted = true;

    if (form.valid) {
      // There is no need to check for image
      this.userData.signup(this._profile);
      // this.userData.signup(this.signup.username);
      // this.navCtrl.push(TabsPage);
      // this.navCtrl.push(LoginPage); // Back to login
    }
    else {
      this.events.publish(SystemEvents.ERROR, 'Please fill all textual fields');
    }
  }

  onCompleted(): void {
    this.navCtrl.push(LoginPage); // Back to login
  }
}