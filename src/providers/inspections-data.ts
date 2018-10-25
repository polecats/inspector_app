import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { HttpClient } from '@angular/common/http';
import { SettingsData } from './settings-data';
import { Events } from 'ionic-angular';
import { InspectionList } from '../interfaces/inspection-list';
import { Storage } from '@ionic/storage';
import { InspectionDatasheet } from '../interfaces/inspection-datasheet';
import { InspectionForm } from '../interfaces/inspection-form';
import { InspectionObservation } from '../interfaces/inspection-observation';
import { InspectionDiagram } from '../interfaces/inspection-drawing';
import { SystemEvents } from './enums';

@Injectable()
export class InspectionsData {
  data: any;
  private _onlineDataList: InspectionList[];// = []; 

  // Key values identifier
  ID_INSPECTION_LOCAL_LIST = 'insp-local-list';

  constructor(
    private events: Events,
    private http: HttpClient,
    private settings: SettingsData,
    private storage: Storage
  ) { }

  public checkOnlineRecord(id: string): Promise<number> {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Checking online record entry...');
    return this.settings.getApiGateway().then(urldata => {
      return new Promise<number> ((resolve) => {
        this.http.get(
          urldata + '/inspection/check/' + id
        )
        .subscribe(
          (response) => {
            this.events.publish(SystemEvents.LOADER_CLOSE);
            if (response['code'] === 0) {
              resolve(1);
            }
            else {
              resolve(0);
            }
          }, 
          (error) => {
            console.error('checkOnlineRcord error: ' + JSON.stringify(error));
            this.events.publish(SystemEvents.ERROR, error.status + ':' + error.statusText);
            this.events.publish(SystemEvents.LOADER_CLOSE);
            resolve(-1);
          }
        );
      });
    });
  }

  /**
   * Upload the inspection record to the cloud.
   * 
   * @param id 
   */
  public uploadInspectionForm(id: string): Promise<boolean> {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Uploading inspection...');
    return this.storage.get(id).then((data) => { // Get the inspection record
      let insp = data as InspectionForm;

      if (insp == null) {
        this.events.publish(SystemEvents.SUCCESS, 'Could not retrieve record to upload.');
        this.events.publish(SystemEvents.LOADER_CLOSE);      

        return false;       
      }

      const options = {
        // headers: this.headers
      };

      return this.settings.getApiGateway().then(urldata => { // Get the URL
        return new Promise<boolean> ((resolve) => { // Perform the REST
          this.http.post(
            urldata + '/inspection/create',
            insp,
            options
          )
          .subscribe(
            (response) => {
              if (response['code'] === 0) {
                this.events.publish(SystemEvents.SUCCESS, 'Uploading inspection successful.');
                this.events.publish(SystemEvents.LOADER_CLOSE);
                resolve(true);
              }
              else {
                this.events.publish(SystemEvents.SUCCESS, 'Uploading inspection failed.');
                this.events.publish(SystemEvents.LOADER_CLOSE);              
                resolve(false);
              }            
            }, 
            (error) => {
              console.error('uploadInspectionForm error: ' + JSON.stringify(error));
              this.events.publish(SystemEvents.ERROR, error.status + ':' + error.statusText);
              this.events.publish(SystemEvents.LOADER_CLOSE);
              resolve(false);
            }
          );
        });
      });
    });
  }

  /**
   * Update the inspection record to the cloud.
   * 
   * @param id 
   */
  public updateInspectionForm(id: string): Promise<boolean> {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Updating online inspection...');
    return this.storage.get(id).then((data) => { // Get the inspection record
      let insp = data as InspectionForm;

      if (insp == null) {
        this.events.publish(SystemEvents.ERROR, 'Could not retrieve record to upload.');
        this.events.publish(SystemEvents.LOADER_CLOSE);      

        return false;       
      }

      const options = {
        // headers: this.headers
      };

      return this.settings.getApiGateway().then(urldata => {
        return new Promise<boolean> ((resolve) => {
          this.http.post(
            urldata + '/inspection/update',
            insp,
            options
          )
          .subscribe(
            (response) => {
              if (response['code'] === 0) {
                this.events.publish(SystemEvents.SUCCESS, 'Updating online inspection successful.');
                this.events.publish(SystemEvents.LOADER_CLOSE);
                resolve(true);
              }
              else {
                this.events.publish(SystemEvents.SUCCESS, 'Updating online inspection failed.');
                this.events.publish(SystemEvents.LOADER_CLOSE);              
                resolve(false);
              }            
            }, 
            (error) => {
              console.error('updateInspectionForm error: ' + JSON.stringify(error));
              this.events.publish(SystemEvents.ERROR, error.status + ':' + error.statusText);
              this.events.publish(SystemEvents.LOADER_CLOSE);
              resolve(false);
            }
          );
        });
      });
    });
  }

  /**
   * Retrieve the inspection record from the cloud
   * 
   * @param id 
   */
  public downloadInspectionForm(id: string): Promise<boolean> {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Downloading online inspection...');
    return this.settings.getApiGateway().then(urldata => {
      return new Promise<boolean> ((resolve) => {
        this.http.get(
          urldata + '/inspection/list/' + id
        )
        .subscribe(
          (response) => {
            this.events.publish(SystemEvents.SUCCESS, 'Downloading online inspection successful.');
            this.events.publish(SystemEvents.LOADER_CLOSE);
            resolve(this.processInspection(response));
          }, 
          (error) => {
            console.error('downloadInspectionForm error: ' + JSON.stringify(error));
            this.events.publish(SystemEvents.ERROR, error.status + ':' + error.statusText);
            this.events.publish(SystemEvents.LOADER_CLOSE);
            resolve(false);
          }
        );
      });
    });
  }

  /**
   * Process the inspection record response.
   * 
   * @param data JSON response of the http
   */
  private processInspection(data: any): Promise<boolean> {
    if (data['code'] === 0) {
      let inspection = data['data'];

      // Save the inspection record to local storage
      let insp: InspectionList = {
        id: inspection.id,
        name: inspection.name,
        created: inspection.created,
        modified: inspection.modified
      }

      return this.addLocalListItem(insp, true).then(() => {
        // Update the local storage inspection list
        let document = inspection.document;

        let inspectionform: InspectionForm = {
          id: inspection.id,
          name: inspection.name,
          datasheet: document.datasheet,
          observation: document.observation,
          drawings: document.drawings,
          timestamp: document.datasheet != null ? document.datasheet.inspection_timestamp : 0,      
        }

        this.storage.set(inspection.id, JSON.stringify(inspectionform));

        return true;
      });
    }
  }

  /**
   * Get the online list from the backend server and updates
   * the local storage
   */
  public listFromServer(): Promise<InspectionList[]> {
    // We don't show the normal progress because it is a list update
    // this.events.publish(this.systemEvents.LOADER_SHOW, 'Fetching online inspection list...');
    return this.settings.getApiGateway().then(urldata => {
      return new Promise<InspectionList[]> ((resolve) => {
        this.http.get(
          urldata + '/inspection/list'
        )
        .subscribe(
          (response) => {
            this.events.publish(SystemEvents.SUCCESS, 'Get online list successful.');
            resolve(this.processInspectionsList(response));
          }, 
          (error) => {
            console.error('loadFromServer error: ' + JSON.stringify(error));
            this.events.publish(SystemEvents.ERROR, error.status + ':' + error.statusText);
            resolve([]);
          }
        );
      });
    });
  }

  /**
   * Process the inspection list response.
   * 
   * @param data JSON response of the http
   */
  private processInspectionsList(data: any): InspectionList[] {
    this._onlineDataList = []; // Reset our list

    if (data['code'] === 0) {
      let inspections = data['data'];

      inspections['inspections'].forEach(element => {
        let insp: InspectionList = {
          id: element.id,
          name: element.name,
          created: element.created,
          modified: element.modified
        }

        this._onlineDataList.push(insp);
      });
    }

    return this._onlineDataList;
  }

  /**
   * Get the online list from the local storage
   */
  public getOnlineList(): InspectionList[] {
    if (this._onlineDataList) {
      return this._onlineDataList;
    } 
    else {
      return [];
    }    

    // return Observable.of(this._onlineDataList);
    // if (this._onlineDataList) {
    //   return Observable.of(this._onlineDataList);
    // } 
    // else {
    //   console.log('getOnlineList empty');
    //   return [];
    // }

    // return this.storage.ready().then(() => {
    //   return this.storage.get(this.ID_INSPECTION_ONLINE_LIST).then((value) => {
    //     return JSON.parse(value) as Inspections[];
    //   });
    // });
  }

  /**
   * Get the local list from the local storage
   */
  public getLocalList(): Promise<InspectionList[]> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_INSPECTION_LOCAL_LIST).then((value) => {
        return JSON.parse(value) as InspectionList[];
      });
    });
  }

  /**
   * Add a single new local inspection list to the local storage.
   * 
   * @param newList 
   * @param isUpdateListOnly TRUE refer to only update the list without creating a blank record
   */
  public addLocalListItem(newList: InspectionList, isUpdateListOnly: boolean): Promise<any> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_INSPECTION_LOCAL_LIST).then((value) => {
        let insplist = JSON.parse(value) as InspectionList[];

        if (insplist == null) {
          let insp: InspectionList[] = [];
          insplist = insp;
        }
        else {
          // If list exist, we check if a previous same record id exist
          // by using filter to remove the item from the array.
          insplist = insplist.filter(item => item.id !== newList.id);
        }
        
        insplist.push(newList); // We push in the new list

        if (isUpdateListOnly) { // We are just updating the list and not creating a new blank record
          // Save this list to the local storage
          return this.storage.set(this.ID_INSPECTION_LOCAL_LIST, JSON.stringify(insplist));         
        }

        // Save this list to the local storage
        this.storage.set(this.ID_INSPECTION_LOCAL_LIST, JSON.stringify(insplist));

        // // Create a new inspection
        // return new Promise<any> ((resolve) => {
        //   resolve(this.storage.set(newList.id, JSON.stringify(this.blankInspection(newList))));
        // });
        // Create a new inspection
        return this.storage.set(newList.id, JSON.stringify(this.blankInspection(newList)));
      });
    });
  }

  /**
   * Remove a single local inspection list from the local storage.
   * @param delList 
   */
  public removeLocalListItem(delList: InspectionList): Promise<InspectionList[]> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_INSPECTION_LOCAL_LIST).then((value) => {
        let insplist = JSON.parse(value) as InspectionList[];

        // Using filter to remove the item from the array.
        insplist = insplist.filter(item => item.id !== delList.id);

        // Save this list to the local storage
        this.storage.set(this.ID_INSPECTION_LOCAL_LIST, JSON.stringify(insplist));

        // Delete the old inspection
        return this.storage.remove(delList.id).then(() => {
          this.events.publish(SystemEvents.SUCCESS, 'Inspection ' + delList.name + ' removed from list');
          return insplist;
        });

        // // This index way might have a problem with array objects than values
        // const index: number = insplist.indexOf(delList);

        // if (index !== -1) {
        //   insplist.splice(index, 1);
                  
        //   // Save this list to the local storage
        //   this.storage.set(this.ID_INSPECTION_LOCAL_LIST, JSON.stringify(insplist));

        //   // Delete the old inspection
        //   return this.storage.remove(delList.id);
        // } 
        // else {
        //   this.events.publish(this.systemEvents.ERROR, 'Could not remove inspection from list');
        // }
      });
    });
  }

  /**
   * Returns a blank new inspection object.
   * 
   * @param data Inspection list data
   */
  private blankInspection(data: InspectionList): InspectionForm {
    let newdatasheet: InspectionDatasheet = {
      id: data.id,
      asset: null,
      field: null,
      inspection_timestamp: 0,
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
    }

    let newobservation: InspectionObservation = {
      id: data.id,
      data: null
    }

    let newdiagram: InspectionDiagram = {
      id: data.id,
      data: null,
      format: 0
    }

    let inspection: InspectionForm = {
      id: data.id,
      name: data.name,
      datasheet: newdatasheet,
      observation: newobservation,
      drawings: newdiagram,
      timestamp: data.created,
    }

    return inspection;
  }

  /**
   * Gets the datasheet from the inspection report
   * 
   * @param id The UUID of the inspection report
   */
  public getLocalDataSheet(id: string): Promise<InspectionDatasheet> {
    return this.storage.ready().then(() => {
      return this.storage.get(id).then((value) => {
        if (value == null) {
          return null;
        }

        // We have the record, we just need the Data Sheet
        let inspection = JSON.parse(value) as InspectionForm;

        return inspection.datasheet;
      });
    });
  }

  /**
   * Sets the datasheet for the inspection report
   * 
   * @param id The UUID of the inspection report
   * @param newData The new datasheet of the inspection report
   */
  public setLocalDataSheet(id: string, newData: InspectionDatasheet): void {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Saving data sheet...');
    this.storage.ready().then(() => {
      this.storage.get(id).then((value) => {
        if (value == null) {
          this.events.publish(SystemEvents.ERROR, 'Could not retrieve inspection data sheet');
          this.events.publish(SystemEvents.LOADER_CLOSE);
          
          return;
        }

        // We have the record
        let inspection = JSON.parse(value) as InspectionForm;

        // We update the data sheet
        inspection.datasheet = newData;

        // Save back to the storage
        this.storage.set(id, JSON.stringify(inspection));

        this.events.publish(SystemEvents.SUCCESS, 'Saving data sheet successful');
        this.events.publish(SystemEvents.LOADER_CLOSE);
      });
    });
  }

  /**
   * Gets the observation from the inspection report
   * 
   * @param id The UUID of the inspection report
   */
  public getLocalObservation(id: string): Promise<InspectionObservation> {
    return this.storage.ready().then(() => {
      return this.storage.get(id).then((value) => {
        if (value == null) {
          return null;
        }

        // We have the record, we just need the Observation Sheet
        let inspection = JSON.parse(value) as InspectionForm;

        return inspection.observation;
      });
    });
  }

  /**
   * Sets the observation for the inspection report
   * 
   * @param id The UUID of the inspection report
   * @param newData The new observation of the inspection report
   */
  public setLocalObservation(id: string, newData: InspectionObservation): void {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Updating observation data...');
    this.storage.ready().then(() => {
      this.storage.get(id).then((value) => {
        if (value == null) {
          this.events.publish(SystemEvents.ERROR, 'Could not retrieve observation data');
          this.events.publish(SystemEvents.LOADER_CLOSE);

          return;
        }

        // We have the record
        let inspection = JSON.parse(value) as InspectionForm;

        // We update the data sheet
        inspection.observation = newData;

        // Save back to the storage
        this.storage.set(id, JSON.stringify(inspection));

        this.events.publish(SystemEvents.SUCCESS, 'Updating observation data successful');
        this.events.publish(SystemEvents.LOADER_CLOSE);
      });
    });
  }

  /**
   * Gets the drawing from the inspection report
   * 
   * @param id The UUID of the inspection report
   */
  public getLocalDiagram(id: string): Promise<InspectionDiagram> {
    return this.storage.ready().then(() => {
      return this.storage.get(id).then((value) => {
        if (value == null) {
          return null;
        }

        // We have the record, we just need the diagram Sheet
        let inspection = JSON.parse(value) as InspectionForm;

        // Create a new inspection
        return new Promise<InspectionDiagram> ((resolve) => {
          resolve(inspection.drawings);
        });
        // return inspection.diagram;
      });
    });
  }

  /**
   * Sets the diagram for the inspection report
   * 
   * @param id The UUID of the inspection report
   * @param newData The new diagram of the inspection report
   */
  public setLocalDiagram(id: string, newData: InspectionDiagram): void {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Saving diagram data...');
    this.storage.ready().then(() => {
      this.storage.get(id).then((value) => {
        if (value == null) {
          this.events.publish(SystemEvents.ERROR, 'Could not retrieve diagram data');
          this.events.publish(SystemEvents.LOADER_CLOSE);

          return;
        }

        // We have the record
        let inspection = JSON.parse(value) as InspectionForm;

        // We update the data sheet
        inspection.drawings = newData;

        // Save back to the storage
        this.storage.set(id, JSON.stringify(inspection));

        this.events.publish(SystemEvents.SUCCESS, 'Saving diagram data successful');
        this.events.publish(SystemEvents.LOADER_CLOSE);
      });
    });
  }
}