import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'stripHTML'
})
@Injectable()
export class StripHTMLPipe implements PipeTransform {
  public transform(value, args) {
    let striped = value.replace(/(<([^>]+)>)/g, "");

    if (args != null) {
      if (args.split != null) {
        striped = striped.split(args.split);
        if (args.index != null) {
          striped = striped[args.index];
        }
      }
    }

    return striped;
  }
}