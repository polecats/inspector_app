import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';
import { PipeInspectionApp } from './app.component';
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

import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';

import { Utils } from '../providers/utils';
import { SettingsData } from '../providers/settings-data';
import { InspectionsData } from '../providers/inspections-data';
import { SettingsPage } from '../pages/settings/settings';
import { LookupData } from '../providers/lookup-data';
import { SafeHtmlPipe } from '../pipes/safe-html';
import { StripHTMLPipe } from '../pipes/strip-html';
import { TextAsteriskPipe } from '../pipes/text-asterisk';
import { TitleCasePipe } from '../pipes/title-case';
import { Base64 } from '@ionic-native/base64';
import { ObservationModelPage } from '../pages/observation-modal/observation-modal';
import { TextUppercasePipe } from '../pipes/text-uppercase';
import { UnixTimeDatePipe } from '../pipes/time-unixtime-date';
import { ObservationIdentifierModelPage } from '../pages/observation-identifier-modal/observation-identifier-modal';
import { TextEditModalPage } from '../pages/observation-modal/text-edit-modal';
import { GraphData } from '../providers/graph-data';
import { HttpModule } from '@angular/http';
import { ShapeModalPage } from '../pages/shape-modal/shape-modal';
// import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    PipeInspectionApp, 
    AboutPage,
    AccountPage,
    LoginPage,
    SignupPage,
    TutorialPage,
    SupportPage,
    InspTabsPage,
    CapturePage,
    DatasheetPage,
    ObservationPage,
    ObservationModelPage,
    DiagramPage,
    CriticalPage,
    InspectionsPage,
    SettingsPage,
    ObservationIdentifierModelPage,
    TextEditModalPage,
    ShapeModalPage,
    
    // Pipes
    SafeHtmlPipe,
    StripHTMLPipe,
    TextAsteriskPipe,
    TitleCasePipe,
    TextUppercasePipe,
    UnixTimeDatePipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    IonicModule.forRoot(PipeInspectionApp, {}, {
      links: [
        { component: AboutPage, name: 'About', segment: 'about' },
        { component: TutorialPage, name: 'Tutorial', segment: 'tutorial' },
        { component: SupportPage, name: 'Support', segment: 'support' },
        { component: LoginPage, name: 'Login', segment: 'login' },
        { component: AccountPage, name: 'Account', segment: 'account' },
        { component: SignupPage, name: 'Signup', segment: 'signup' },

        { component: InspTabsPage, name: 'InspTabs', segment: 'insp-tabs-page' },
        { component: DatasheetPage, name: 'Datasheet', segment: 'datasheet' },
        { component: ObservationPage, name: 'Observation', segment: 'observation' },
        { component: ObservationModelPage, name: 'ObservationModel', segment: 'observation-model' },
        { component: DiagramPage, name: 'Diagram', segment: 'diagram' },
        { component: CriticalPage, name: 'Critical', segment: 'critical' },
        { component: CapturePage, name: 'Capture', segment: 'capture' },
        { component: InspectionsPage, name: 'Inspections', segment: 'inspections' },
        { component: SettingsPage, name: 'Settings', segment: 'settings' },

        { component: ObservationIdentifierModelPage, name: 'ObservationIdentifierModel', segment: 'observation-identifier-modal' },
        { component: TextEditModalPage, name: 'TextEditModal', segment: 'text-edit-modal' },
        { component: ShapeModalPage, name: 'ShapeModal', segment: 'shape-modal' }
      ]
    }),
    IonicStorageModule.forRoot({
      name: '__inspipeDb',
         driverOrder: ['sqlite', 'indexeddb', 'websql']
    })
    // DatePipe
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    PipeInspectionApp,
    AboutPage,
    AccountPage,
    LoginPage,
    SignupPage,
    TutorialPage,
    SupportPage,
    InspTabsPage,
    CapturePage,
    DatasheetPage,
    ObservationPage,
    ObservationModelPage,
    DiagramPage,
    CriticalPage,
    InspectionsPage,
    SettingsPage,
    ObservationIdentifierModelPage,
    TextEditModalPage,
    ShapeModalPage
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    UserData,
    InAppBrowser,
    SplashScreen,
    File,
    Transfer,
    Camera,
    FilePath,
    Utils,
    SettingsData,
    InspectionsData,
    LookupData,
    Base64,
    GraphData
  ]
})

export class AppModule { }
