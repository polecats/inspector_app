import { Component, ViewChild } from '@angular/core';
import { Events, MenuController, Nav, Platform, ToastController, LoadingController, Loading } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { AboutPage } from '../pages/about/about';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';

import { InspTabsPage } from '../pages/insp-tabs-page/tabs-page';
import { DatasheetPage } from '../pages/datasheet/datasheet';
import { ObservationPage } from '../pages/observation/observation';
import { DiagramPage } from '../pages/diagram/diagram';
import { CriticalPage } from '../pages/critical/critical';
import { CapturePage } from '../pages/capture/capture';
import { InspectionsPage } from '../pages/inspections/inspections';

import { UserData } from '../providers/user-data';

import { PageInterface } from '../interfaces/page-interface';
import { UserProfile } from '../interfaces/user-profile';
import { Utils } from '../providers/utils';
import { SettingsPage } from '../pages/settings/settings';
import { SystemEvents } from '../providers/enums';
import { LookupData } from '../providers/lookup-data';

@Component({
  templateUrl: 'app.template.html'
})
export class PipeInspectionApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu (not true, there is some bug here!)
  // The name attribute is refering to the app.module links array
  appPages: PageInterface[] = [
    { title: 'Support', name: 'Support', component: SupportPage, icon: 'help' },
    { title: 'About', name: 'About', component: AboutPage, icon: 'information-circle' }
  ];

  loggedInPages: PageInterface[] = [
    { title: 'Account', name: 'Account', component: AccountPage, icon: 'person' },
    { title: 'Settings', name: 'Settings', component: SettingsPage, icon: 'settings' },
    { title: 'Logout', name: 'Login', component: LoginPage, icon: 'log-out', logsOut: true }
  ];

  loggedOutPages: PageInterface[] = [
    { title: 'Login', name: 'Login', component: LoginPage, icon: 'log-in' },
    { title: 'Signup', name: 'Signup', component: SignupPage, icon: 'person-add' },
    { title: 'Settings', name: 'Settings', component: SettingsPage, icon: 'settings' },
    { title: 'About', name: 'About', component: AboutPage, icon: 'information-circle' }
  ];

  inspectionPages: PageInterface[] = [
    { title: 'Datasheet', name: 'InspTabs', component: InspTabsPage, tabComponent: DatasheetPage, index: 0, icon: 'paper' },
    { title: 'Observation', name: 'InspTabs', component: InspTabsPage, tabComponent: ObservationPage, index: 1, icon: 'list-box' },
    { title: 'Diagram', name: 'InspTabs', component: InspTabsPage, tabComponent: DiagramPage, index: 2, icon: 'albums' },
    { title: 'Critical', name: 'InspTabs', component: InspTabsPage, tabComponent: CriticalPage, index: 3, icon: 'alert' }
  ];  

  testPages: PageInterface[] = [
    { title: 'Capture', name: 'Capture', component: CapturePage, icon: 'camera' }
  ];   

  rootPage: any; // We shall set our root page when we navigate
  _loading: Loading;
  _userProfile: UserProfile = {
    id: 0,
    username: null,
    password: null,
    name: null,
    position: null,
    company: null,
    photo: 'assets/img/personplaceholder.png'
  };

  constructor(
    public events: Events,
    public userData: UserData,
    public menu: MenuController,
    public platform: Platform,
    public storage: Storage,
    public splashScreen: SplashScreen,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public utils: Utils,
    public lookup: LookupData
  ) {
    // Check if the user has already seen the tutorial
    this.storage.get('hasSeenTutorial').then((hasSeenTutorial) => {
      if (hasSeenTutorial) {
        this.rootPage = LoginPage; // Set to the default login
      } 
      else {
        this.rootPage = TutorialPage;
      }

      this.platformReady()
    });

    // Init a blank loading (avoid null issue)
    this._loading = this.loadingCtrl.create({
      content: '',
      duration: 10000, // a default 10 seconds timeout incase of any issues
      dismissOnPageChange: true
    });

    // decide which menu items should be hidden by current login status stored in local storage
    this.userData.hasLoggedIn().then((hasLoggedIn) => {
      if (hasLoggedIn) {
        this.rootPage = InspectionsPage; // Set to our main tabview
      }

      this.enableMenu(hasLoggedIn === true);
    });

    this.listenToEvents();
  }

  /**
   * Open page on the Nav child.
   * 
   * @param page 
   */
  openPage(page: PageInterface) {
    let params = {};

    // the nav component was found using @ViewChild(Nav)
    // setRoot on the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      params = { tabIndex: page.index };
    }

    // If we are already on tabs just change the selected tab
    // don't setRoot again, this maintains the history stack of the
    // tabs even if changing them from the menu
    if (this.nav.getActiveChildNavs().length && page.index != undefined) {
      this.nav.getActiveChildNavs()[0].select(page.index);
    } else {
      // Set the root of the nav with params if it's a tab index
      this.nav.setRoot(page.name, params).catch((err: any) => {
        console.log(`Didn't set nav root: ${err}`);
      });
    }

    if (page.logsOut === true) {
      // Give the menu time to close before changing to logged out
      this.userData.logout();
    }
  }

  openTutorial() {
    this.nav.setRoot(TutorialPage);
  }

  listInspections() {
    this.nav.setRoot(InspectionsPage);
  }

  /**
   * Listener that hears the event triggered by other view.
   */
  listenToEvents() {
    this.events.subscribe(SystemEvents.LOGIN, () => {
      // set the user profile
      this.userData.getProfile().then(profile => {
        // Manually copy
        this._userProfile.name = profile.name;
        this._userProfile.position = profile.position;
        this._userProfile.company = profile.company;
        this._userProfile.photo = profile.photo != null ? 'data:image/jpg;base64,' + profile.photo : 'assets/img/personplaceholder.png';

        // this._loading.dismiss();
        this.enableMenu(true);
        this.nav.setRoot(InspectionsPage); // Set to our main tabview
      });
    });

    this.events.subscribe(SystemEvents.LOGOUT, () => {
      // this._loading.dismiss();
      this.enableMenu(false);
    });

    // Event handler for error messages
    this.events.subscribe(SystemEvents.ERROR, (msg) => {
      // Prompt the messagebox
      let toast = this.toastCtrl.create({
        message: msg,
        duration: 3000,
        cssClass: 'error'
      });

      // this._loading.dismiss();
      toast.present();
    });

    // Event handler for success messages
    this.events.subscribe(SystemEvents.SUCCESS, (msg) => {
      // Prompt the messagebox
      let toast = this.toastCtrl.create({
        message: msg,
        duration: 3000,
        cssClass: 'success'
      });

      // this._loading.dismiss();
      toast.present();
    });  
    
    // Event handler for showing loader
    this.events.subscribe(SystemEvents.LOADER_SHOW, (msg) => {
      if (!this.utils.isStringValid(msg)) {
        msg = 'Please wait...';
      }

      this._loading = this.loadingCtrl.create({
        content: msg,
        duration: 10000, // a default 10 seconds timeout incase of any issues
        dismissOnPageChange: true
      });

      this._loading.present();
    });   

    // Event handler for closing loader
    this.events.subscribe(SystemEvents.LOADER_CLOSE, () => {
      this._loading.dismiss();
    });  
  }

  enableMenu(loggedIn: boolean) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }

  enableInspectionMenu(isInspection: boolean) {
    this.menu.enable(!isInspection, 'loggedInMenu');
    this.menu.enable(!isInspection, 'loggedOutMenu');
    this.menu.enable(isInspection, 'inspectionMenu');
  }

  platformReady() {
    // Call any initial plugins when ready
    this.platform.ready().then(() => {
      this.splashScreen.hide();

      // Pulls the lookup tables
      this.lookup.loadFromServer();
    });
  }

  isActive(page: PageInterface) {
    let childNav = this.nav.getActiveChildNavs()[0];

    // Tabs are a special case because they have their own navigation
    if (childNav) {
      if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent) {
        return 'primary';
      }

      return;
    }

    if (this.nav.getActive() && this.nav.getActive().name === page.name) {
      return 'primary';
    }

    return;
  }
}