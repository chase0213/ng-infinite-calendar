import { Injectable } from '@angular/core';
import { ExtDate } from 'extdate';

@Injectable()
export class CalendarService {

  current: ExtDate = new ExtDate();

  constructor() {
  }
}
