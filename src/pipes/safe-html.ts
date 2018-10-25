import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
})
@Injectable()
export class SafeHtmlPipe implements PipeTransform {
// export class SafeHtmlPipe {
  // /**
  //  * Takes a value and makes it lowercase.
  //  */
  // transform(value: string, ...args) {
  //   return value.toLowerCase();
  // }

  constructor(
    private sanitizer:DomSanitizer
  ){}

  public transform(html: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(html);
  }
}
