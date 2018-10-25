import { NgModule } from '@angular/core';
import { SafeHtmlPipe } from './safe-html';
import { StripHTMLPipe } from './strip-html';
import { TextAsteriskPipe } from './text-asterisk';
import { TitleCasePipe } from './title-case';
import { TextUppercasePipe } from './text-uppercase';
import { UnixTimeDatePipe } from './time-unixtime-date';

@NgModule({
	declarations: [SafeHtmlPipe, StripHTMLPipe, TextAsteriskPipe, TextUppercasePipe, TitleCasePipe, UnixTimeDatePipe],
	imports: [],
	exports: [SafeHtmlPipe, StripHTMLPipe, TextAsteriskPipe, TextUppercasePipe, TitleCasePipe, UnixTimeDatePipe]
})

export class PipesModule {}
