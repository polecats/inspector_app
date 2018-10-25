import { Component } from "@angular/core";
import { Platform, NavParams, ViewController, ActionSheetController } from "ionic-angular";
import { LookupData } from "../../providers/lookup-data";
import { LookupInterface } from "../../interfaces/lookup";

@Component({
    // selector: 'page-observation-modal',
    template: `
      <ion-header [hidden]="_isShowTemplate">
        <ion-toolbar>
          <ion-title>
            {{_viewTitle}} Text Editor
          </ion-title>
          <ion-buttons start>
            <button ion-button (click)="dismiss()">
              <span ion-text color="primary" showWhen="ios">Done</span>
              <ion-icon name="md-close" showWhen="android, windows"></ion-icon>
            </button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content [hidden]="_isShowTemplate">
        <ion-card>
            <ion-card-content>
              <ion-textarea rows="10" maxLength="1024" [(ngModel)]="_textData"></ion-textarea>
            </ion-card-content>         
        </ion-card>   
      </ion-content>
    `
  })
  export class TextEditModalPage {
    _textData: string;
    _viewTitle: string;
    _isShowTemplate: boolean = false;

    constructor(
      public platform: Platform,
      public params: NavParams,
      public viewCtrl: ViewController,
      public lookupData: LookupData,
      public actionSheetCtrl: ActionSheetController
    ) {
        if (this.params.data.text != null) {
            this._textData = this.params.data.text;
        }

        if (this.params.data.title != null) {
            this._viewTitle = this.params.data.title;
        }

        if (this.params.data.showTemplateFinding != null) {
          if (this.params.data.showTemplateFinding) {
            // Download lookups finding
            lookupData.getFindingsList().then((data) => {
              this.populateActionSheet(data);
              // this._isShowTemplate = true;
            });
          }
        }
        
        if (this.params.data.showTemplateRecommend != null) {
          if (this.params.data.showTemplateRecommend) {
            // Download lookups recommend
            lookupData.getRecommendationsList().then((data) => {
              this.populateActionSheet(data);
              // this._isShowTemplate = true;
            });
          }
        }
    }
  
    populateActionSheet(dataList: LookupInterface[]): void {
      let actionSheet = this.actionSheetCtrl.create({
        title: 'Select Text Template',
        enableBackdropDismiss: false
      });

      actionSheet.addButton({
        text: 'Skip',
        role: 'cancel',
        handler: () => {
          // We just skip this and show the raw text area
          this._isShowTemplate = false;
        }
      });

      for (let entry of dataList) {
        actionSheet.addButton({
          text: entry.name,
          handler: () => {
            this._textData = entry.value
            this._isShowTemplate = false;
          }
        });
      } 
  
      actionSheet.present();
    }

    dismiss() {
      this.viewCtrl.dismiss(this._textData);
    }
  }