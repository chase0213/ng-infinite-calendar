import { ExtDate } from 'extdate';

export interface InfiniteCalendarEvent {
  // required attributes
  title: string;
  body: string;
  beginAt: ExtDate;
  endAt: ExtDate;

  // optional attributes
  data: any;
}
