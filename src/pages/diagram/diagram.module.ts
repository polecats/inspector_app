import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DiagramPage } from './diagram';

@NgModule({
  declarations: [
    DiagramPage,
  ],
  imports: [
    IonicPageModule.forChild(DiagramPage),
  ],
})
export class DiagramPageModule {}
