import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'textAsterisk'
})
export class TextAsteriskPipe implements PipeTransform {
    public transform(input:string): string {
        if (!input) {
            return '';
        } else {
            return input.replace(/./g, "*");
        }
    }
}