import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { SystemEvents } from './enums';
import { Http } from '@angular/http';

@Injectable()
export class GraphData {
  constructor(
    public http: Http,
    private events: Events
  ) { }

  /**
   * Get the graph context html here. We are using the old HTTP Module to retrieve actual raw data
   * and not the  HTTP Client which tie the response to a JSON format only.
   */
  public getContext(): Promise<string> {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Loading diagram editor...');

    return this.http.get('assets/js/mxgraph/graph.htm').toPromise().then((response) => {
      this.events.publish(SystemEvents.LOADER_CLOSE);
      return response.text();
    }).catch(this.handleErrorPromise);

    // return new Promise<string> ((resolve) => {

    //   // .map((response) => {
    //   //   resolve(response.text());
    //   // })
    //   // .catch(this.handleErrorObservable);

    //   // this.http.get('assets/js/mxgraph/main-ui.html').subscribe((response) => {
    //   //   let graphstring = response as string;
    //   //   resolve(graphstring);
    //   // },
    //   // (error) => {
    //   //   console.error('getContext error: ' + JSON.stringify(error));
    //   //   this.events.publish(SystemEvents.ERROR, error.status + ':' + error.statusText);
    //   //   this.events.publish(SystemEvents.LOADER_CLOSE);
    //   //   resolve(null);
    //   // });
    // });
  }

  private handleErrorPromise (error: Response | any) {
    console.error(error.message || error);
    this.events.publish(SystemEvents.ERROR, error.status + ':' + error.statusText);
    this.events.publish(SystemEvents.LOADER_CLOSE);

    return Promise.reject(error.message || error);
  } 
}
