import { Component, OnInit, OnChanges, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { InfiniteCalendarOptions } from './infinite-calendar-options';
import { I18n } from './i18n';
import { ExtDate, ExtInterval } from 'extdate';
import { InfiniteCalendarEvent } from './infinite-calendar-event';
import { ExtDateWithEvent } from './infinite-calendar-date-with-event';

declare const Math;
const PANE_HEIGHT = 325;
const ROW_HEIGHT = 65.594;
const CALENDAR_KEY_FORMAT = "%Y-%m-%d"

const DEFAULT_OPTIONS: InfiniteCalendarOptions = {
  style: {
    height: PANE_HEIGHT,
  },
  navigator: {
    today: true,
    labelForToday: 'Today',
  },
  label: {
    lang: 'en',
    short: true,
  }
};

@Component({
  selector: 'infinite-calendar',
  template: `
  <div #awesomeCalendar class="awesome-calendar">
    <div class="container">
      <nav class="navigation">
        <span class="current-day-indicator">
          {{ midDayOnCurrentWindow.strftime("%Y/%m") }}
        </span>

        <div class="back-to-today" *ngIf="navForToday">
          <a class="nav-button" (click)="onClickBackToToday()">
            {{ labelForToday }}
          </a>
        </div>
      </nav>

      <aside class="week-labels">
        <span *ngFor="let label of weekLabels; let i = index" class="label" [ngClass]="{'holiday': i == 0}">
          {{ label }}
        </span>
      </aside>

      <div class="scroll-view-outer-container">
        <div #scrollView
            class="scroll-view-inner-container"
            (scroll)="onScroll($event)">
          <div class="scroll-view" (touchmove)="onScroll($event)">
            <div class="row" *ngFor="let week of pAddr">
              <span class="cell"
                    *ngFor="let date of week"
                    [ngClass]="{
                      'current': vAddr[date.x][date.y].current,
                      'holiday': vAddr[date.x][date.y].holiday,
                      'hovered': vAddr[date.x][date.y].hovered,
                      'selected': vAddr[date.x][date.y].selected
                    }"
                    (click)="onClickDate($event, date)"
                    (mouseover)="onMouseoverDate($event, date)">
                <span class="year" *ngIf="vAddr[date.x][date.y].firstDayOfYear">
                  {{vAddr[date.x][date.y].year}}
                </span>
                <span class="month" *ngIf="vAddr[date.x][date.y].firstDayOfMonth">
                  {{vAddr[date.x][date.y].month}}
                </span>
                {{vAddr[date.x][date.y].day}}

                <div class="event-container" *ngIf="calendar[vAddr[date.x][date.y].date.strftime('%Y-%m-%d')]">
                  <div class="event">
                    {{ calendar[vAddr[date.x][date.y].date.strftime('%Y-%m-%d')][0].title }}
                  </div>
                  <div class="event" *ngIf="calendar[vAddr[date.x][date.y].date.strftime('%Y-%m-%d')].length > 1">
                    +{{calendar[vAddr[date.x][date.y].date.strftime('%Y-%m-%d')].length - 1}}
                  </div>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  `,
  styleUrls: [
    './infinite-calendar.component.scss',
  ]
})
export class InfiniteCalendarComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChild('scrollView')
  scrollView: ElementRef;


  //
  // Inputs
  //

  @Input()
  height: number = DEFAULT_OPTIONS.style.height;

  @Input()
  navForToday: boolean = DEFAULT_OPTIONS.navigator.today;

  @Input()
  labelForToday: string = DEFAULT_OPTIONS.navigator.labelForToday;

  @Input()
  language: string = DEFAULT_OPTIONS.label.lang;

  @Input()
  shortLabel: boolean = DEFAULT_OPTIONS.label.short;

  @Input()
  events: InfiniteCalendarEvent[] = [];

  //
  // Outputs
  //

  @Output()
  selectDate: EventEmitter<ExtDateWithEvent> = new EventEmitter<ExtDateWithEvent>();

  //
  // Configuration
  //
  maxRowsInVirtualContainer: number = 15;
  maxRowsOnWindow: number = 5;
  scrollDuration: number = 400; // msec

  //
  // View Models
  //
  hovering: [number, number];
  selecting: [number, number];

  // week labels
  weekLabels: string[] = [];

  // event dictionary
  calendar: any = {};

  // virtual address
  vAddr: any = {};

  // physical address
  pAddr: any[][] = [];

  loadable: boolean = false;

  //
  // Models
  //

  // The origin point in virtual space
  origin: ExtDate = new ExtDate();

  // current date object
  currentDate: ExtDate = new ExtDate();
  beginningOnWindow: ExtDate;
  endOnWindow: ExtDate;
  midDayOnCurrentWindow: ExtDate;

  constructor() { }

  ngOnInit() {
    const halfWeeks = Math.floor(this.maxRowsInVirtualContainer / 2.0);
    this.beginningOnWindow = this.currentDate.beginningOfWeek().prevWeek(halfWeeks);
    this.endOnWindow = this.currentDate.endOfWeek().nextWeek(halfWeeks);

    // set origin of virtual address to the beginning of the week of current day
    this.origin = this.currentDate.beginningOfWeek();

    // set week labels
    this._setWeekLabels();

    // calculate the mid day of the current window
    this.midDayOnCurrentWindow = this._midDayFromScrollTop(this.scrollView.nativeElement.scrollTop, ROW_HEIGHT);

    for (let w = 0; w < this.maxRowsInVirtualContainer; w++) {
      this.pAddr.push([]);
      for (let d = 0; d < 7; d++) {
        let date = this.beginningOnWindow.nextDay(7 * w + d);
        let addr = this._calcVirtualAddress(date);
        this.pAddr[w].push(addr);
        this.vAddr[addr.x] = this.vAddr[addr.x] || {};
        this.vAddr[addr.x][addr.y] = {
          date: date,
          year: date.year(),
          month: date.month(),
          day: date.day(),
          dayOfWeekInShort: date.dayOfWeekInShort('en'),
          current: date.isSameDay(this.currentDate),
          hovered: false,
          selected: false,
          holiday: date.dayOfWeekInShort('en') === 'Sun',
          firstDayOfMonth: date.day() === 1,
          firstDayOfYear: date.month() === 1 && date.day() === 1
        }
      }
    }
  }

  ngOnChanges() {
    if (this.shortLabel) {
      this.weekLabels = I18n[this.language]['short'];
    } else {
      this.weekLabels = I18n[this.language]['default'];
    }

    if (this.events && this.events.length > 0) {
      this._initializeEvents();
    }
  }

  ngAfterViewInit() {
    let ele = this.scrollView.nativeElement;
    const initialScrollTop = this.height;
    this._scrollTo(ele, initialScrollTop, this.scrollDuration);
  }

  onClickBackToToday() {
    const y = (-this.pAddr[0][0].y * this.height / this.maxRowsOnWindow);
    this._scrollTo(this.scrollView.nativeElement, y, this.scrollDuration);
  }

  onClickDate(event, addr) {
    if (this.selecting) {
      this.vAddr[this.selecting['x']][this.selecting['y']].selected = false;
    }
    this.selecting = addr;
    this.vAddr[addr['x']][addr['y']].selected = true;

    let date = this.vAddr[addr['x']][addr['y']].date;
    let dateWithEvent: ExtDateWithEvent = {
      date: date,
      events: this.calendar[date.strftime(CALENDAR_KEY_FORMAT)]
    };
    this.selectDate.emit(dateWithEvent);
  }

  onMouseoverDate(event, addr) {
    if (this.hovering) {
      this.vAddr[this.hovering['x']][this.hovering['y']].hovered = false;
    }
    this.hovering = addr;
    this.vAddr[addr['x']][addr['y']].hovered = true;
  }

  onScroll(event) {
    if (!this.loadable) {
      return;
    }

    // load prev month
    if (this.scrollView.nativeElement.scrollTop <= this.height) {
      this._appendMonthToTop();
    }

    // load next month
    //
    // bottom of the current window = this.scrollView.nativeElement.scrollTop + this.height
    // bottom of the next window = this.scrollView.nativeElement.scrollTop + 2 * this.height
    //
    // amount of scrolling = this.scrollView.nativeElement.scrollHeight
    if (this.scrollView.nativeElement.scrollTop + 2 * this.height > this.scrollView.nativeElement.scrollHeight) {
      this._appendMonthToBottom();
    }

    // calculate the first day of the current window
    this.midDayOnCurrentWindow = this._midDayFromScrollTop(this.scrollView.nativeElement.scrollTop, ROW_HEIGHT);
  }

  private _initializeEvents() {
    for (let event of this.events) {
      let beginAt = event.beginAt;
      let endAt = event.endAt;
      let interval = new ExtInterval(beginAt, endAt);
      for (let i = 0; i < Math.floor(interval.asDay()); i++ ) {
        let date = beginAt.nextDay(i);
        const key = date.strftime(CALENDAR_KEY_FORMAT);
        this.calendar[key] = this.calendar[key] || [];

        // calculate order of the event
        if (!event.data.order) {
          let order = 0;
          let eventsOnDay = this.calendar[key];

          // sort events to find a wormhole order
          eventsOnDay = eventsOnDay.sort((a, b) => {
            return a.data.order - b.data.order;
          });

          // find a wormhole
          for (let e of eventsOnDay) {
            if (order != e.order) {
              break;
            }
            order++;
          }

          event.data.order = order;
        }

        this.calendar[key].push(event);
      }
    }
  }


  private _setWeekLabels() {
    if (this.shortLabel) {
      this.weekLabels = I18n[this.language].dayOfWeek['short'];
    } else {
      this.weekLabels = I18n[this.language].dayOfWeek['default'];
    }
  }

  private _appendMonthToTop() {
    this.beginningOnWindow = this.beginningOnWindow.prevDay(7 * this.maxRowsOnWindow);
    for (let w = this.maxRowsOnWindow - 1; w >= 0; w--) {
      let week = [];
      for (let d = 0; d < 7; d++) {
        let date = this.beginningOnWindow.nextDay(7 * w + d);
        let addr = this._calcVirtualAddress(date);
        week.push(addr);
        this.vAddr[addr.x] = this.vAddr[addr.x] || {};
        this.vAddr[addr.x][addr.y] = {
          date: date,
          year: date.year(),
          month: date.month(),
          day: date.day(),
          dayOfWeekInShort: date.dayOfWeekInShort('en'),
          current: date.isSameDay(this.currentDate),
          hovered: false,
          selected: false,
          holiday: date.dayOfWeekInShort('en') === 'Sun',
          firstDayOfMonth: date.day() === 1,
          firstDayOfYear: date.month() === 1 && date.day() === 1
        }
      }
      this.pAddr = [week].concat(this.pAddr);
    }
  }

  private _appendMonthToBottom() {
    let appendBeginning = this.endOnWindow.nextDay();
    this.endOnWindow = this.endOnWindow.nextDay(7 * this.maxRowsOnWindow);
    for (let w = 0; w < this.maxRowsOnWindow ; w++) {
      let week = [];
      for (let d = 0; d < 7; d++) {
        let date = appendBeginning.nextDay(7 * w + d);
        let addr = this._calcVirtualAddress(date);
        week.push(addr);
        this.vAddr[addr.x] = this.vAddr[addr.x] || {};
        this.vAddr[addr.x][addr.y] = {
          date: date,
          year: date.year(),
          month: date.month(),
          day: date.day(),
          dayOfWeekInShort: date.dayOfWeekInShort('en'),
          current: date.isSameDay(this.currentDate),
          hovered: false,
          selected: false,
          holiday: date.dayOfWeekInShort('en') === 'Sun',
          firstDayOfMonth: date.day() === 1,
          firstDayOfYear: date.month() === 1 && date.day() === 1
        }
      }
      this.pAddr = this.pAddr.concat([week]);
    }
  }

  private _midDayFromScrollTop(scrollTop: number, rowHeight: number): ExtDate {
    let weeks = Math.floor(scrollTop / rowHeight);
    let target = this.beginningOnWindow.nextWeek(weeks + 2).nextDay(3);
    return target;
  }

  private _calcVirtualAddress(date: ExtDate) {
    let interval = new ExtInterval(this.origin, date);
    const days = Math.floor(interval.asDay());
    if (days >= 0) {
      return {
        x: days % 7,
        y: Math.floor(days / 7.0)
      };
    } else {
      return {
        x: 6 - ((-days - 1) % 7),
        y: Math.floor((7 + days)/ 7.0) - 1,
      };
    }
  }

  private _scrollTo(element, offsetTop:number, duration:number) {
    const fps = 60.0; // frame per sec

    const initOffsetTop:number = element.scrollTop;

    let counter = 0;
    const interval = setInterval(() => {
      if (counter * 1000 >= duration * fps) {
        clearInterval(interval);
      }

      const easingFunction = this._easing("quodratic");
      const time = counter * 1000 / (fps * duration);

      const scrollTop = initOffsetTop + (offsetTop - initOffsetTop) * easingFunction(time);
      element.scrollTop = scrollTop;

      counter += 1;
    }, Math.round(1000.0 / fps));

    // setInterval will not be finished exact duration time
    const error = 400; // msec

    // disable to load dates while auto scrolling
    setTimeout(() => {
      this.loadable = true;
    }, duration + error);
  }

  private _easing(pattern:string) {
    switch (pattern) {
      case "quodratic":
        return function(time:number) {
          return time < .5 ? 2 * time * time : - 2 * (time - 1) * (time - 1) + 1;
        }
      default:
        return function(time:number) {
          return time < .5 ? 2 * time * time : - 2 * (time - 1) * (time - 1) + 1;
        }
    }
  }
}
