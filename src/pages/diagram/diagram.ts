import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, FabContainer, Platform, ModalController } from 'ionic-angular';
import { GraphData } from '../../providers/graph-data';
import { DomSanitizer } from '@angular/platform-browser'
import { ShapeModalPage } from '../shape-modal/shape-modal';
import { InspectionList } from '../../interfaces/inspection-list';
import { InspectionsData } from '../../providers/inspections-data';
import { InspectionDiagram } from '../../interfaces/inspection-drawing';

declare var editorHelper: any;

@IonicPage()
@Component({
  selector: 'page-diagram',
  templateUrl: 'diagram.html',
})
export class DiagramPage {
  private _editor: any;
  public _styleWidth: string;
  public _styleHeight: string;
  _inspection: InspectionList;
  _cmdTitle: string;
  _inspectionDiag: InspectionDiagram;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public graphData: GraphData,
    public sanitizer: DomSanitizer,
    public platform: Platform,
    public modalCtrl: ModalController,
    public inspectionsData: InspectionsData
  ) {
    this._styleWidth = platform.width() + 'px';
    this._styleHeight = platform.height()  + 'px';
    this._editor = new editorHelper();
    this._cmdTitle = 'Save';
  }

  ionViewDidLoad() {
    this._editor.load();

    this._inspection = this.navParams.data.inspection as InspectionList;
    
    if (this._inspection == null) {
      // This should not happen
      return;
    }
    
    this.fetchDiagram(this._inspection.id); 
  }

  /**
   * Retreive the observation list from storage and show.
   * 
   * @param id 
   */
  fetchDiagram(id: string): void {
    this.inspectionsData.getLocalDiagram(id).then((diag) => {
      if (diag == null) {
        return;
      }

      this._inspectionDiag = diag;

      if (diag.data != null) {
        this._cmdTitle = 'Update';
        this._editor.loadDiagram(diag.data);
      }
    });
  }

  dropModel(shapeName: string, fab: FabContainer) {
    fab.close();

    let profileModal = this.modalCtrl.create(
      ShapeModalPage, { 
        shapename: shapeName
      }, {
        enableBackdropDismiss: false,
        cssClass: 'page-shape-modal' 
      });

    profileModal.onDidDismiss((data) => {
      if (data != null) {
        this._editor.addStencil(data);
      }
    });

    profileModal.present();  
  }

  /**
   * Save the data sheet information and validates them.
   */  
  saveDiagram(): void {
    if (this._inspectionDiag == null) {
      let inspdiag: InspectionDiagram = {
        id: this._inspection.id,
        format: 0,
        data: null
      }

      this._inspectionDiag = inspdiag;
    }

    this._inspectionDiag.data = this._editor.getJsonModel();

    // We update back to our local storage
    this.inspectionsData.setLocalDiagram(this._inspection.id, this._inspectionDiag);
  }

  execute(command: string, fab: FabContainer): void {
    if (fab != null) {
      fab.close();
    }
    
    this._editor.execute(command);
  }
}