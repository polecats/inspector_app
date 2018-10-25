import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DatasheetPage } from './datasheet';

@NgModule({
  declarations: [
    DatasheetPage,
  ],
  imports: [
    IonicPageModule.forChild(DatasheetPage),
  ],
})
export class DatasheetPageModule {}
