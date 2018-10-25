import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class SettingsData {
  // Key values identifier
  ID_API_GATEWAY = 'api-gateway';

  apiUrl = 'http://127.0.0.1/inspectorbackend/apiv2';

  constructor(
    private storage: Storage
  ) {
    this.storage.set(this.ID_API_GATEWAY, this.apiUrl);
  }

  public setApiGateway(urlPath: string): void {
    this.storage.set(this.ID_API_GATEWAY, urlPath);
  };

  public getApiGateway(): Promise<string> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_API_GATEWAY).then((value) => {
        return value;
      });
    });
  };
}
