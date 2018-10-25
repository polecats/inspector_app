import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, NavController, ToastController, Events } from 'ionic-angular';
import { SystemEvents } from '../../providers/enums';

@Component({
  selector: 'page-user',
  templateUrl: 'support.html'
})
export class SupportPage {
  submitted: boolean = false;
  supportMessage: string;

  constructor(
    public events: Events,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController
  ) { }

  ionViewDidEnter() {
    // let toast = this.toastCtrl.create({
    //   message: 'This does not actually send a support request.',
    //   duration: 3000
    // });

    // toast.present();
  }

  submit(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.supportMessage = '';
      this.submitted = false;

      let toast = this.toastCtrl.create({
        message: 'Your support request has been sent.',
        duration: 3000
      });
      toast.present();
    }
  }

  // If the user enters text in the support question and then navigates
  // without submitting first, ask if they meant to leave the page
  ionViewCanLeave(): boolean | Promise<boolean> {
    // If the support message is empty we should just navigate
    if (!this.supportMessage || this.supportMessage.trim().length === 0) {
      return true;
    }

    return new Promise((resolve: any, reject: any) => {
      let alert = this.alertCtrl.create({
        title: 'Leave this page?',
        message: 'Are you sure you want to leave this page? Your support message will not be submitted.'
      });

      alert.addButton({ text: 'Stay', handler: reject });
      alert.addButton({ text: 'Leave', role: 'cancel', handler: resolve });
      alert.present();
    });
  }

  onUploadLog(): void {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Uploading log records...', Date.now());
    // simulate a network request that would take longer
    // than just pulling from out local json file
    setTimeout(() => {
      // refresher.complete();

      // const toast = this.toastCtrl.create({
      //   message: 'Sessions have been updated.',
      //   duration: 3000
      // });
      // toast.present();
      this.events.publish(SystemEvents.LOADER_CLOSE);
      this.events.publish(SystemEvents.SUCCESS, 'Upload log records successful');
    }, 2500);
  }
}