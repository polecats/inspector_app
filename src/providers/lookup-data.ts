import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { LookupInterface } from '../interfaces/lookup';
import { SettingsData } from './settings-data';
import { LookupTypes, SystemEvents } from './enums';

@Injectable()
export class LookupData {
  // Key values identifier
  ID_OBSERVATION_LIST = 'observation';
  ID_CRITICALITY_LIST = 'criticality';
  ID_INSULATED_LIST = 'insulated';
  ID_DFT_LIST = 'dft';
  ID_FINDINGS_LIST = 'findings';
  ID_RECOMMENDATIONS_LIST = 'recommendation';
  ID_POSITION_LIST = 'position';
  ID_COMPANY_LIST = 'company';
  ID_STATUS_LIST = 'status';

  constructor(
    private events: Events,
    private storage: Storage,
    private http: HttpClient,
    private settings: SettingsData
  ) { }

  public loadFromServer(): void {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Sync lookup data...');
    this.settings.getApiGateway().then(urldata => {
      this.http.get(
        urldata + '/lookup/list'
      )
      .subscribe(
        (response) => this.processLookups(response), 
        (error) => {
          console.error('loadFromServer error: ' + JSON.stringify(error));
          this.events.publish(SystemEvents.ERROR, error.status + ':' + error.statusText);
          this.events.publish(SystemEvents.LOADER_CLOSE);
        }
      );
    });
  }

  private processLookups(data: any): void {
    if (data['code'] === 0) {
      // This will retrieve all lookup.
      // We now process it
      let lookup = data['data'];

      // Prepare the array lists
      let observation: LookupInterface[] = []; 
      let criticality: LookupInterface[] = []; 
      let insulated: LookupInterface[] = []; 
      let dft: LookupInterface[] = []; 
      let findings: LookupInterface[] = []; 
      let recommendation: LookupInterface[] = []; 
      let position: LookupInterface[] = []; 
      let company: LookupInterface[] = []; 
      let status: LookupInterface[] = []; 

      lookup['lookup'].forEach(element => {
        let li: LookupInterface = {
          id: element.id,
          name: element.name,
          type: element.type,
          value: element.value
        }

        switch(element.type) {
          case LookupTypes.Observation_Connections:
          case LookupTypes.Observation_General:
          case LookupTypes.Observation_Insulation:
          case LookupTypes.Observation_Support:
            observation.push(li);

            break;

          case LookupTypes.Criticality:
            criticality.push(li);    
            
            break;
            
          case LookupTypes.DFT:
            dft.push(li);    
            
            break;      
            
          case LookupTypes.Findings:
            findings.push(li);    
            
            break;        
            
          case LookupTypes.Insulated:
            insulated.push(li);    
            
            break;  

          case LookupTypes.Recommendation:
            recommendation.push(li);    
            
            break;  

          case LookupTypes.Position:
            position.push(li);    
            
            break;  

          case LookupTypes.Company:
            company.push(li);    
            
            break;  

          case LookupTypes.Status:
            status.push(li);    
            
            break;  
        }
      }); 

      // Save to storage
      this.setObservationList(observation);
      this.setCriticalityRatingList(criticality);
      this.setInsulatedList(insulated);
      this.setDftList(dft);
      this.setFindingsList(findings);
      this.setRecommendationsList(recommendation);
      this.setPositionList(position);
      this.setCompanyList(company);
      this.setStatusList(status);

      this.events.publish(SystemEvents.SUCCESS, 'Sync data completed.');
      this.events.publish(SystemEvents.LOADER_CLOSE);
    }
    else {
      this.events.publish(SystemEvents.ERROR, data['status']);
      this.events.publish(SystemEvents.LOADER_CLOSE);
    }
  }

  public setObservationList(dataList: LookupInterface[]): void {
    this.storage.set(this.ID_OBSERVATION_LIST, JSON.stringify(dataList));
  };

  public getObservationList(): Promise<LookupInterface[]> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_OBSERVATION_LIST).then((value) => {
        return JSON.parse(value) as LookupInterface[];
      });
    });
  };

  public setCriticalityRatingList(dataList: LookupInterface[]): void {
    this.storage.set(this.ID_CRITICALITY_LIST, JSON.stringify(dataList));
  };

  public getCriticalityRatingList(): Promise<LookupInterface[]> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_CRITICALITY_LIST).then((value) => {
        return JSON.parse(value) as LookupInterface[];
      });
    });
  };  

  public setInsulatedList(dataList: LookupInterface[]): void {
    this.storage.set(this.ID_INSULATED_LIST, JSON.stringify(dataList));
  };

  public getInsulatedList(): Promise<LookupInterface[]> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_INSULATED_LIST).then((value) => {
        return JSON.parse(value) as LookupInterface[];
      });
    });
  }; 

  public setDftList(dataList: LookupInterface[]): void {
    this.storage.set(this.ID_DFT_LIST, JSON.stringify(dataList));
  };

  public getDftList(): Promise<LookupInterface[]> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_DFT_LIST).then((value) => {
        return JSON.parse(value) as LookupInterface[];
      });
    });
  };

  public setFindingsList(dataList: LookupInterface[]): void {
    this.storage.set(this.ID_FINDINGS_LIST, JSON.stringify(dataList));
  };

  public getFindingsList(): Promise<LookupInterface[]> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_FINDINGS_LIST).then((value) => {
        return JSON.parse(value) as LookupInterface[];
      });
    });
  }; 

  public setRecommendationsList(dataList: LookupInterface[]): void {
    this.storage.set(this.ID_RECOMMENDATIONS_LIST, JSON.stringify(dataList));
  };

  public getRecommendationsList(): Promise<LookupInterface[]> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_RECOMMENDATIONS_LIST).then((value) => {
        return JSON.parse(value) as LookupInterface[];
      });
    });
  }; 

  public setPositionList(dataList: LookupInterface[]): void {
    this.storage.set(this.ID_POSITION_LIST, JSON.stringify(dataList));
  };

  public getPositionList(): Promise<LookupInterface[]> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_POSITION_LIST).then((value) => {
        return JSON.parse(value) as LookupInterface[];
      });
    });
  }; 

  public setCompanyList(dataList: LookupInterface[]): void {
    this.storage.set(this.ID_COMPANY_LIST, JSON.stringify(dataList));
  };

  public getCompanyList(): Promise<LookupInterface[]> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_COMPANY_LIST).then((value) => {
        return JSON.parse(value) as LookupInterface[];
      });
    });
  }; 

  public setStatusList(dataList: LookupInterface[]): void {
    this.storage.set(this.ID_STATUS_LIST, JSON.stringify(dataList));
  };

  public getStatusList(): Promise<LookupInterface[]> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_STATUS_LIST).then((value) => {
        return JSON.parse(value) as LookupInterface[];
      });
    });
  }; 
}
