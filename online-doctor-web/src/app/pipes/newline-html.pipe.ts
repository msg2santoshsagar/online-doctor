import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newlineHtml'
})
export class NewlineHtmlPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    if (value.length > 0 && value.charAt(value.length - 1) == '\n') {
      value = value.substring(0, value.length - 1);
    }

    return value;
  }

}
