import {Pipe, PipeTransform} from '@angular/core';

// Created own version because need to handle NULL cases
@Pipe({
    name: 'textUppercase'
})
export class TextUppercasePipe implements PipeTransform {
    public transform(input:string): string {
        if (!input) {
            return '';
        } else {
            return input.toUpperCase();
        }
    }
}