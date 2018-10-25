import { Component } from '@angular/core';
import { AlertController, NavController, ActionSheetController, Platform, Events } from 'ionic-angular';
import { UserData } from '../../providers/user-data';
import { LookupData } from '../../providers/lookup-data';
import { LookupInterface } from '../../interfaces/lookup';
import { UserProfile } from '../../interfaces/user-profile';
import { Camera } from '@ionic-native/camera';
import { FilePath } from '@ionic-native/file-path';
import { Base64 } from '@ionic-native/base64';
import { SystemEvents } from '../../providers/enums';

@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {
  private _profile: UserProfile = {
    id: 0,
    username: null,
    password: null,
    name: null,
    position: null,
    company: null,
    photo: null
  };

  _photo: string;

  _positionList: LookupInterface[] = [];
  _companyList: LookupInterface[] = [];

  /**
   * [usr, pwd, name, pos, org, photo]
   */
  _changeFlag: boolean[] = [false, false, false, false, false, false];

  constructor(
    private camera: Camera,
    private actionSheetCtrl: ActionSheetController,
    private platform: Platform, 
    private filePath: FilePath,
    private base64: Base64,
    private events: Events,
    private alertCtrl: AlertController, 
    private nav: NavController, 
    private userData: UserData,
    private lookup: LookupData
  ) { }

  ngAfterViewInit() {

  }

  ionViewDidLoad() {
    this.getProfile();
    this.getLookups();
  }

  // Present an alert with the current username populated
  // clicking OK will update the username and display it
  // clicking Cancel will close the alert and do nothing
  onChangeName(): void {
    let alert = this.alertCtrl.create({
      title: 'Change Name',
      buttons: [
        'Cancel'
      ]
    });

    alert.addInput({
      name: 'name',
      value: this._profile.name,
      placeholder: 'name'
    });

    alert.addButton({
      text: 'Save',
      handler: (data: any) => {
        this._profile.name = data.name;
        this._changeFlag[2] = true;
      }
    });

    alert.present();
  }

  onChangePosition(): void {
    let alert = this.alertCtrl.create();
    alert.setTitle('Change Position');

    for (let entry of this._positionList) {
      alert.addInput({
        type: 'radio',
        label: entry.value,
        value: entry.value,
        checked: entry.value === this._profile.position ? true : false
      });
    } 

    alert.addButton('Cancel');
    alert.addButton({
      text: 'Save',
      handler: (data: any) => {
        this._profile.position = data;
        this._changeFlag[3] = true;
      }      
    });

    alert.present();
  }

  onChangeCompany(): void {
    let alert = this.alertCtrl.create();
    alert.setTitle('Change Company');

    for (let entry of this._companyList) {
      alert.addInput({
        type: 'radio',
        label: entry.value,
        value: entry.value,
        checked: entry.value === this._profile.company ? true : false
      });
    } 
    
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Save',
      // handler: data => {
      //   this.testRadioOpen = false;
      //   this.testRadioResult = data;
      // }
      handler: (data: any) => {
        this._profile.company = data;
        this._changeFlag[4] = true;
      }      
    });

    alert.present();
  }

  getLookups(): void {
    this.lookup.getPositionList().then((poslist) => {
      this._positionList = poslist;
    });

    this.lookup.getCompanyList().then((orglist) => {
      this._companyList = orglist;
    });
  }
  
  getProfile(): void {
    this.userData.getProfile().then((profile) => {
      this._profile = profile;
      // this._userId = profile.id;
      // this._username = profile.username;
      // this._password = profile.password;
      // this._name = profile.name
      // this._company = profile.company;
      // this._position = profile.position;
      // // this._photo = this.sanitizer.bypassSecurityTrustResourceUrl(profile.photo !== null ? 'data:image/png;base64,' + profile.photo : 'assets/img/personplaceholder.png');
      this._photo = profile.photo != null ? 'data:image/jpg;base64,' + profile.photo : 'assets/img/personplaceholder.png';
    });
  }

  onChangePassword(): void {
    let alert = this.alertCtrl.create({
      title: 'Change Password',
      buttons: [
        'Cancel'
      ]
    });

    alert.addInput({
      name: 'password',
      // value: this._password,
      placeholder: 'new password'
    });

    alert.addButton({
      text: 'Save',
      handler: (data: any) => {
        this._profile.password = data.password;
        this._changeFlag[1] = true;
      }
    });

    alert.present();
  }

  onLogout(): void {
    this.userData.logout();
    this.nav.setRoot('Login');
  }

  onUpdateServer(): void {
    let alert = this.alertCtrl.create({
      title: 'Update Account',
      message: "Confirm that you want to update account profile?",
      // inputs: [
      //   {
      //     name: 'title',
      //     placeholder: 'Title'
      //   },
      // ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Confirm',
          handler: () => {
            // Update the profile object
            this.userData.update(this._profile);
          }
        }
      ]
    });

    alert.present();
  }

  onUpdatePicture(): void {
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

    this._changeFlag[5] = true;
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
           
            // let currentName = imageData.substring(imageData.lastIndexOf('/') + 1, imageData.lastIndexOf('?'));
            // this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
            this.base64.encodeFile(correctPath).then((base64File: string) => {
              this._profile.photo = base64File;
              this._photo = 'data:image/jpg;base64,' + base64File;
            }, (err) => {
              this.events.publish(SystemEvents.ERROR, 'Error while selecting photo. ' + err);
            });
          });
      } else {
        // let currentName = imageData.substr(imageData.lastIndexOf('/') + 1);
        let correctPath = imageData;

        // this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
        this.base64.encodeFile(correctPath).then((base64File: string) => {
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
}