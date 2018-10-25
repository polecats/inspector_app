import { Component } from '@angular/core';
import { Events, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-shape-modal',
  templateUrl: 'shape-modal.html'
})
export class ShapeModalPage {
    public _shapeName: string;

    constructor(
        public viewCtrl: ViewController,
        public events: Events,
        public params: NavParams
    ) {
        if (this.params.data.shapename != null) {
            this._shapeName = this.params.data.shapename;
        }
    }

    ionViewDidLoad() {

    }

    ngAfterViewInit() {

    }

    /**
     * This is called when the user closed without choosing.
     */
    dismiss(): void {
        this.viewCtrl.dismiss(null);
    }

    onSelection(name: string): void {
        this.viewCtrl.dismiss(name);
    }
}
