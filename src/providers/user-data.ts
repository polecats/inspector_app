import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SettingsData } from './settings-data';
import { UserProfile } from '../interfaces/user-profile';
import { SystemEvents } from './enums';

@Injectable()
export class UserData {
  _favorites: string[] = [];s

  // Key values identifier
  ID_HAS_LOGGED_IN = 'hasLoggedIn';
  ID_HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
  LOGGED_AS_OFFLINE = 'logAsOffline';
  ID_USERNAME = 'username';
  ID_PASSWORD = 'password';
  ID_USERPROFILE = 'userProfile';

  headers = new HttpHeaders({
    // 'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // 'Access-Control-Allow-Origin': '*',
    // 'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Authorization, X-Requested-With',
    // 'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS'
    // 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  });

  constructor(
    private events: Events,
    private storage: Storage,
    private http: HttpClient,
    private settings: SettingsData
  ) { }

  public login(usr: string, pwd: string): void {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Signing in...');

    // We shall try to login online first
    // When online login fail, try to login locally (needs to be login once)
    this.settings.getApiGateway().then((urldata) => {
      let params = new HttpParams();

      params = params.append('u', usr);
      params = params.append('p', pwd);

      const options = {
        // headers: this.headers,
        params: params
      };

      this.http.post(
        urldata + '/login', 
        null, 
        options
      ).subscribe((response) => {
        if (response['code'] == 0) {
          this.storage.set(this.ID_HAS_LOGGED_IN, true);
          this.storage.set(this.LOGGED_AS_OFFLINE, false);

          let profile = response['data'];

          // Set userprofile
          let userprofile: UserProfile = {
            id: profile['id'],
            username: usr,
            password: pwd,
            name: profile['name'],
            position: profile['position'],
            company: profile['company'],
            photo: profile['photo']
          };
  
          this.setProfile(userprofile);
          this.events.publish(SystemEvents.LOGIN);
        }
        else {
          this.events.publish(SystemEvents.ERROR, response['status']);
        }

        this.events.publish(SystemEvents.LOADER_CLOSE);
      }, err => {
        // This happens when fail to reach server
        console.log('Online login: ' + err.status + ':' + err.statusText);

        // We try login using existing data
        this.getProfile().then((profile) => {
          if (profile == null) {
            this.events.publish(SystemEvents.ERROR, "Offline login credential does not exist");  
            this.events.publish(SystemEvents.LOADER_CLOSE);

            return;
          }

          if (profile.password == pwd) {
            this.storage.set(this.ID_HAS_LOGGED_IN, true);
            this.storage.set(this.LOGGED_AS_OFFLINE, true);
            this.events.publish(SystemEvents.LOGIN);         
          }
          else {
            this.storage.set(this.ID_HAS_LOGGED_IN, false);
            this.storage.set(this.LOGGED_AS_OFFLINE, false);  
            this.events.publish(SystemEvents.ERROR, "Offline login credential not match");            
          }

          this.events.publish(SystemEvents.LOADER_CLOSE);
        }, err => {
          console.log('Offline login: ' + err.status);
          this.storage.set(this.ID_HAS_LOGGED_IN, false);
          this.events.publish(SystemEvents.ERROR, "Offline login failed");         
        })
      });
    })
  };

  public signup(userprofile: UserProfile): void {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Signing up new account...');
    this.settings.getApiGateway().then((urldata) => {
      const options = {
        // headers: this.headers
      };

      // Call the backend to signup
      this.http.post(
        // urldata + '/signup.php', 
        urldata + '/signup', 
        userprofile, 
        options
      ).subscribe((response) => {
        // Read the data
        if (response['code'] === 0) {
          this.events.publish(SystemEvents.SIGNUP);
        }
        else {
          this.events.publish(SystemEvents.ERROR, response['status']);
        }

        this.events.publish(SystemEvents.LOADER_CLOSE);
      }, err => {
        console.log(JSON.stringify(err));
        this.events.publish(SystemEvents.ERROR, err.status + ':' + err.statusText);
        this.events.publish(SystemEvents.LOADER_CLOSE);
      });
    });
  };

  public update(userprofile: UserProfile): void {
    this.events.publish(SystemEvents.LOADER_SHOW, 'Updating account profile...');
    this.settings.getApiGateway().then((urldata) => {
      const options = {
        // headers: this.headers
      };

      this.http.post(
        urldata + '/user/update', 
        userprofile,
        options
      ).subscribe((response) => {
        // Read the data
        if (response['code'] === 0) {
          // Update our storage profile.
          this.getProfile().then((profile) => {
            // We assign manually to ensure no null data is stored
            let up: UserProfile = {
              id: userprofile.id,
              username: userprofile.username == null ? profile.username : userprofile.username,
              password: userprofile.password == null ? profile.password : userprofile.password,
              name: userprofile.name == null ? profile.name : userprofile.name,
              position: userprofile.position == null ? profile.position : userprofile.position,
              company: userprofile.company == null ? profile.company : userprofile.company,
              photo: userprofile.photo == null ? profile.photo : userprofile.photo
            };

            this.setProfile(up);
            this.events.publish(SystemEvents.SUCCESS, 'Update successful');
            this.events.publish(SystemEvents.LOADER_CLOSE);
          });
        }
        else {
          this.events.publish(SystemEvents.ERROR, response['status']);
          this.events.publish(SystemEvents.LOADER_CLOSE);
        }
      }, err => {
        console.log(JSON.stringify(err));
        this.events.publish(SystemEvents.ERROR, err.status + ':' + err.statusText);
        this.events.publish(SystemEvents.LOADER_CLOSE);
      });
    });
  }

  public logout(): void {
    this.storage.set(this.ID_HAS_LOGGED_IN, false);
    this.events.publish(SystemEvents.LOGOUT);
  };

  public offlineLogin(): Promise<boolean> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.LOGGED_AS_OFFLINE).then((value) => {
        return value === true;
      });
    });
  };

  public hasLoggedIn(): Promise<boolean> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_HAS_LOGGED_IN).then((value) => {
        return value === true;
      });
    });
  };

  public checkHasSeenTutorial(): Promise<string> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_HAS_SEEN_TUTORIAL).then((value) => {
        return value;
      });
    });
  };

  public setProfile(userProfile: UserProfile): void {
    this.storage.set(this.ID_USERPROFILE, JSON.stringify(userProfile));
  }

  public getProfile(): Promise<UserProfile> {
    return this.storage.ready().then(() => {
      return this.storage.get(this.ID_USERPROFILE).then((value) => {
        return JSON.parse(value) as UserProfile;
      });
    });
  };
}