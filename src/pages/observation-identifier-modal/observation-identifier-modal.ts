import { ViewController, IonicPage, NavParams, Events,  } from 'ionic-angular';
import { Component } from '@angular/core';
import { LookupInterface } from '../../interfaces/lookup';
import { LookupData } from '../../providers/lookup-data';
import { SystemEvents, LookupTypes } from '../../providers/enums';

@IonicPage()
@Component({
  selector: 'page-observation-identifier-moda',
  templateUrl: 'observation-identifier-modal.html',
})
export class ObservationIdentifierModelPage {
  _generalIds: Array<{id: number, lookup: LookupInterface, isChecked: boolean}> = [];
  _connectionIds: Array<{id: number, lookup: LookupInterface, isChecked: boolean}> = [];
  _insulationIds: Array<{id: number, lookup: LookupInterface, isChecked: boolean}> = [];
  _supportIds: Array<{id: number, lookup: LookupInterface, isChecked: boolean}> = [];

  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public lookupData: LookupData,
    private events: Events
  ) { }
  
  ionViewDidLoad() {
    this.lookupData.getObservationList().then((list) => {
      if (list == null) {
        this.events.publish(SystemEvents.ERROR, 'Please sync online data. Load identifier failed');
        return;
      }

      this.sortObservationLookups(list);

      if (this.navParams.data.identifiers == null) {
          return;
      }
  
      this.markObservationLookups(this.navParams.data.identifiers);
    });
  }

  ngAfterViewInit() {

  }

  dismiss() {
    // Get the list of checked data
    let returndata = this.getCheckedIdentifierString();

    this.viewCtrl.dismiss(returndata);
  }

  /**
   * Sorts the observation identifier to their respective groups.
   * 
   * @param lookups 
   */
  sortObservationLookups(lookups: LookupInterface[]): void {
    let genindex = 0;
    let supindex = 0;
    let conindex = 0;
    let insindex = 0;

    lookups.forEach(entry => {
      switch(entry.type) {
        case LookupTypes.Observation_General:
          this._generalIds.push({id: genindex, lookup: entry, isChecked: false});
          genindex++;
          break;

        case LookupTypes.Observation_Support:
          this._supportIds.push({id: supindex, lookup: entry, isChecked: false});
          supindex++;
          break;

        case LookupTypes.Observation_Connections:
          this._connectionIds.push({id: conindex, lookup: entry, isChecked: false});
          conindex++;
          break;

        case LookupTypes.Observation_Insulation:
          this._insulationIds.push({id: insindex, lookup: entry, isChecked: false});
          insindex++;
          break;
      }
    });
  }

  /**
   * Mark the observation identifier arrays according to the given text input.
   * 
   * @param checkList 
   */
  markObservationLookups(checkList: string): void {
    let chkarr = checkList.split(',');

    // We make use of the loop shortcircuit feature to reduce the amount of looping
    // work needed to be done here.
    for (let i=0; i<chkarr.length; i++) {
      let index = 0;
      let isbreak = false;
      let targetname = chkarr[i].trim();

      // We loop for every observataion id list
      for (index=0; index<this._generalIds.length; index++) {
        if (this._generalIds[index].lookup.name === targetname) {
          this._generalIds[index].isChecked = true;

          // We break this loop here
          isbreak = true;
          break; 
        }
      }

      if (isbreak) {
        continue; // Skip this section
      }

      for (index=0; index<this._supportIds.length; index++) {
        if (this._supportIds[index].lookup.name === targetname) {
          this._supportIds[index].isChecked = true;

          // We break this loop here
          isbreak = true;
          break; 
        }
      }

      if (isbreak) {
        continue; // Skip this section
      }

      for (index=0; index<this._connectionIds.length; index++) {
        if (this._connectionIds[index].lookup.name === targetname) {
          this._connectionIds[index].isChecked = true;

          // We break this loop here
          isbreak = true;
          break; 
        }
      }

      if (isbreak) {
        continue; // Skip this section
      }

      for (index=0; index<this._insulationIds.length; index++) {
        if (this._insulationIds[index].lookup.name === targetname) {
          this._insulationIds[index].isChecked = true;

          // We break this loop here
          isbreak = true;
          break; 
        }
      }
    }

    // // Nice method, but unnecessary looping might involved.
    // chkarr.forEach(name => {
    //   this._generalIds.forEach(function(part, index, theArray) {
    //     if (part.lookup.name === name) {
    //       theArray[index].isChecked = true;
    //     }
    //   });

    //   this._generalIds.forEach(function(part, index, theArray) {
    //     if (part.lookup.name === name) {
    //       theArray[index].isChecked = true;
    //     }
    //   });

    //   this._generalIds.forEach(function(part, index, theArray) {
    //     if (part.lookup.name === name) {
    //       theArray[index].isChecked = true;
    //     }
    //   });

    //   this._generalIds.forEach(function(part, index, theArray) {
    //     if (part.lookup.name === name) {
    //       theArray[index].isChecked = true;
    //     }
    //   });
    // });
  }

  /**
   * Get the checked identifier in delimeted string format
   */
  getCheckedIdentifierString(): string {
    let returnstring = '';

    this._generalIds.forEach(function(part) {
      if (part.isChecked) {
        returnstring = returnstring.concat(part.lookup.name + ',');
      }
    });

    this._supportIds.forEach(function(part) {
      if (part.isChecked) {
        returnstring = returnstring.concat(part.lookup.name + ',');
      }
    });

    this._connectionIds.forEach(function(part) {
      if (part.isChecked) {
        returnstring = returnstring.concat(part.lookup.name + ',');
      }
    });

    this._insulationIds.forEach(function(part) {
      if (part.isChecked) {
        returnstring = returnstring.concat(part.lookup.name + ',');
      }
    });

    return returnstring;
  }

  /**
   * Update the identifier list.
   * 
   * @param index 
   */
  updateGeneral(index: number): void {
    this._generalIds[index].isChecked = !this._generalIds[index].isChecked;
  }
  
  /**
   * Update the identifier list.
   * 
   * @param index 
   */
  updateSupport(index: number): void {
    this._supportIds[index].isChecked = !this._supportIds[index].isChecked;
  }

  /**
   * Update the identifier list.
   * 
   * @param index 
   */
  updateConnection(index: number): void {
    this._connectionIds[index].isChecked = !this._connectionIds[index].isChecked;
  }
  
  /**
   * Update the identifier list.
   * 
   * @param index 
   */
  updateInsulation(index: number): void {
    this._insulationIds[index].isChecked = !this._insulationIds[index].isChecked;
  }
}