import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'chatTimeIndicator'
})
export class ChatTimeIndicatorPipe implements PipeTransform {

  constructor(@Inject(LOCALE_ID) private locale: string) { }

  transform(value: any, args?: any): any {

    var inputDate = new Date(value);
    var actualInputDate = new Date(value);

    // Get today's date
    var todaysDate = new Date();

    // call setHours to take the time out of the comparison
    if (inputDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {
      return formatDate(actualInputDate, 'hh:mm a', this.locale);
    } else {
      return formatDate(inputDate, 'dd/MM/yyyy', this.locale);
    }

    return value;
  }

}
