import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { InspectionList } from '../../interfaces/inspection-list';
import { InspectionsData } from '../../providers/inspections-data';
import { InspectionDatasheet } from '../../interfaces/inspection-datasheet';
import { Utils } from '../../providers/utils';
import { LookupData } from '../../providers/lookup-data';
import { LookupInterface } from '../../interfaces/lookup';

@IonicPage()
@Component({
  selector: 'page-datasheet',
  templateUrl: 'datasheet.html',
})
export class DatasheetPage {
  private _ds: InspectionDatasheet = {
    id: null,
    asset: null,
    field: null,
    inspection_timestamp: null,
    critical_rating: null,
    circuit_id: null,
    line_no: null,
    insulated: null,
    metal_temp: null,
    operating_pressure: null,
    operating_temperature: null,
    dead_legs: null,
    long_horizontal_runs: null,
    erosion_zones: null,
    elbows: null,
    tees: null,
    reducers: null,
    nominal_thickness: null,
    thickness_min: null,
    thickness_max: null,
    external_metal_loss_length: null,
    external_metal_loss_width: null,
    external_metal_loss_depth: null,
    dft: null
  };

  public _reportName: string;
  public _locationRef: string;
  public _dateTime: string;

  private _isAlreadyPopup: boolean = false;
  private _criticalList: LookupInterface[] = [];
  private _insulateList: LookupInterface[] = [];
  private _dftList: LookupInterface[] = [];

  constructor(
    public navCtrl: NavController, 
    private navParams: NavParams,
    public inspectionsData: InspectionsData,
    public utils: Utils,
    private alertCtrl: AlertController,
    private lookup: LookupData
  ) { }

  ngAfterViewInit() {
    this.getLookups();
  }

  /**
   * Retreive the lookup to populate the local lookup object.
   */
  getLookups(): void {
    this.lookup.getCriticalityRatingList().then((criticallist) => {
      if (criticallist == null) {
        return;
      }

      this._criticalList = criticallist;
    });

    this.lookup.getInsulatedList().then((insulatelist) => {
      if (insulatelist == null) {
        return;
      }

      this._insulateList = insulatelist;
    });

    this.lookup.getDftList().then((dftlist) => {
      if (dftlist == null) {
        return;
      }

      this._dftList = dftlist;
    });
  }

  ionViewDidLoad() {
    let inspection = this.navParams.data.inspection as InspectionList;
    this._reportName = inspection.name;
    this._dateTime = new Date().toISOString();

    // if (this.navParams.data.isNew === true) {
      // this._ds.inspection_timestamp = inspection.created;
      this._locationRef = 'REFER TO SKETCH';
    // }

    // Fetch from local storage
    this.inspectionsData.getLocalDataSheet(inspection.id).then((datasheet) => {
      if (datasheet == null) {
        return; // Fail safe when writing to storage returns null
      }

      this._ds = datasheet;

      if (datasheet.inspection_timestamp != null && datasheet.inspection_timestamp !== 0) {
        this._dateTime = this.utils.unixTimeToDateIso(datasheet.inspection_timestamp);
      }

      // This is here to fix a bug where the data has a different ID for each
      // inspection form elements. This is to standardise the ID with a single record ID
      this._ds.id = inspection.id;
    })
  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }

  /**
   * Save the data sheet information and validates them.
   */
  goSaveDataSheet(): void {
    // Convert the correct date from the form to the datasheet
    this._ds.inspection_timestamp = this.utils.dateStringUnixTime(this._dateTime);

    // Sanitize text
    this._ds.asset = this._ds.asset.toUpperCase();
    this._ds.field = this._ds.field.toUpperCase();
    this._ds.circuit_id = this._ds.circuit_id.toUpperCase();
    this._ds.line_no = this._ds.line_no.toUpperCase();

    // Save the data in the object
    this.inspectionsData.setLocalDataSheet(this._ds.id, this._ds);
  }

  /**
   * Selection event handler.
   * 
   * @param id 
   */
  goSelectDropdown(id: number): void {
    // Logic to prevent multi focus trigger
    if (this._isAlreadyPopup) {
      return;
    }

    switch (id)
    {
      case 0: // RBI Critically Rating
        this.handleSelection(
          id,
          'Select RBI Criticality Rating',
          this._ds.critical_rating,
          this._criticalList
        );
        break;

      case 1: // Insulated
        this.handleSelection(
          id,
          'Select Insulated',
          this._ds.insulated,
          this._insulateList
        );  

        break;
 
      case 2: // DFT
        this.handleSelection(
          id,
          'Select DFT',
          this._ds.dft,
          this._dftList
        );  

        break;
    }
  }

  /**
   * Handles the selection criteria.
   * 
   * @param id 
   * @param titleName 
   * @param formValue 
   * @param lookupList 
   */
  handleSelection(
    id: number,
    titleName: string, 
    formValue: any,
    lookupList: LookupInterface[]
  ): void {
    let posalert = this.alertCtrl.create({
      enableBackdropDismiss:false,
      title: titleName
    });
    
    for (let entry of lookupList) {
      posalert.addInput({
        type: 'radio',
        label: entry.value,
        value: entry.value,
        checked: entry.value === formValue ? true : false
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

        if (id === 0) { // Critical
          this._ds.critical_rating = data;
        }
        else if (id === 1) { // Insulated
          this._ds.insulated = data;
        }
        else if (id === 2) { // DFT
          this._ds.dft = data;
        }
      }      
    });

    this._isAlreadyPopup = true;
    posalert.present();    
  }

  /**
   * Get the lookup name for usage of lables.
   * 
   * @param id 
   * @param lookupList 
   */
  getLookUpLabel(id: any, lookupList: LookupInterface[]): string {
    for (let entry of lookupList) {
      if (entry.type === id) {
        return entry.name
      }
    }     
  }
}