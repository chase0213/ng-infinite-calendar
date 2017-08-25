import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CalendarService } from './calendar.service';
import { ExtDate, ExtInterval } from 'extdate';

declare const Math;
const PANE_HEIGHT = 325;

@Component({
  selector: 'infinite-calendar',
  templateUrl: `./infinite-calendar.component.html`,
  styleUrls: [
    './infinite-calendar.component.scss',
  ]
})
export class InfiniteCalendarComponent {

  @ViewChild('scrollView')
  scrollView: ElementRef;

  @Output()
  selectDate: EventEmitter<ExtDate> = new EventEmitter<ExtDate>();

  @Output()
  selectInterval: EventEmitter<ExtInterval> = new EventEmitter<ExtInterval>();


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

  constructor() { }

  ngOnInit() {
    const halfWeeks = Math.floor(this.maxRowsInVirtualContainer / 2.0);
    this.beginningOnWindow = this.currentDate.beginningOfWeek().prevWeek(halfWeeks);
    this.endOnWindow = this.currentDate.endOfWeek().nextWeek(halfWeeks);

    // set origin of virtual address to the beginning of the week of current day
    this.origin = this.currentDate.beginningOfWeek();

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

  ngAfterViewInit() {
    let ele = this.scrollView.nativeElement;
    const initialScrollTop = PANE_HEIGHT;
    this._scrollTo(ele, initialScrollTop, this.scrollDuration);
  }

  onClickBackToToday() {
    const y = (-this.pAddr[0][0].y * PANE_HEIGHT / this.maxRowsOnWindow);
    this._scrollTo(this.scrollView.nativeElement, y, this.scrollDuration);
  }

  onClickDate(event, addr) {
    if (this.selecting) {
      this.vAddr[this.selecting['x']][this.selecting['y']].selected = false;
    }
    this.selecting = addr;
    this.vAddr[addr['x']][addr['y']].selected = true;

    this.selectDate.emit(this.vAddr[addr['x']][addr['y']].date);
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
    if (this.scrollView.nativeElement.scrollTop <= PANE_HEIGHT) {
      this._appendMonthToTop();
    }

    // load next month
    if (this.scrollView.nativeElement.scrollTop + 2 * PANE_HEIGHT > this.scrollView.nativeElement.scrollHeight) {
      this._appendMonthToBottom();
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
