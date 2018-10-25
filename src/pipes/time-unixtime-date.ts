import {Pipe, PipeTransform} from '@angular/core';
// import { DatePipe } from '@angular/common'

@Pipe({
    name: 'unixTimeDate'
})
export class UnixTimeDatePipe implements PipeTransform {
    // constructor(private datepipe: DatePipe) { }

    public transform(input:number): string {
        // Convert the unix time we had to the compatible typescript elapse seconds
        const compatibleunixtime: number = input * 1000; 

        return new Date(compatibleunixtime).toLocaleString('en-GB');
        // return this.datepipe.transform(new Date(compatibleunixtime), format);//'dd-MM-yyyy');
    }
}