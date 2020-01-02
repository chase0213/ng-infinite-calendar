import { ExtDate } from 'extdate';
import { InfiniteCalendarEvent } from './infinite-calendar-event';

export interface ExtDateWithEvent {
  date: ExtDate;
  events: InfiniteCalendarEvent[];
}