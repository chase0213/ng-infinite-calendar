(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('extdate/index')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common', 'extdate/index'], factory) :
	(factory((global['ng-infinite-calendar'] = {}),global._angular_core,global._angular_common,global.extdate_index));
}(this, (function (exports,_angular_core,_angular_common,extdate_index) { 'use strict';

var PANE_HEIGHT = 325;
var DEFAULT_OPTIONS = {
    style: {
        height: PANE_HEIGHT,
    },
    navigator: {
        position: 'top',
        today: true,
        previousMonth: true,
        previousYear: false,
        nextMonth: true,
        nextYear: false,
        labelForToday: 'Today',
    }
};
var InfiniteCalendarComponent = (function () {
    function InfiniteCalendarComponent() {
        //
        // Inputs
        //
        this.height = DEFAULT_OPTIONS.style.height;
        this.position = DEFAULT_OPTIONS.navigator.position;
        this.navForToday = DEFAULT_OPTIONS.navigator.today;
        this.navForPrevMonth = DEFAULT_OPTIONS.navigator.previousMonth;
        this.navForPrevYear = DEFAULT_OPTIONS.navigator.previousMonth;
        this.navForNextMonth = DEFAULT_OPTIONS.navigator.nextMonth;
        this.navForNextYear = DEFAULT_OPTIONS.navigator.nextYear;
        this.labelForToday = DEFAULT_OPTIONS.navigator.labelForToday;
        //
        // Outputs
        //
        this.selectDate = new _angular_core.EventEmitter();
        this.selectInterval = new _angular_core.EventEmitter();
        //
        // Configuration
        //
        this.maxRowsInVirtualContainer = 15;
        this.maxRowsOnWindow = 5;
        this.scrollDuration = 400; // msec
        // virtual address
        this.vAddr = {};
        // physical address
        this.pAddr = [];
        this.loadable = false;
        //
        // Models
        //
        // The origin point in virtual space
        this.origin = new extdate_index.ExtDate();
        // current date object
        this.currentDate = new extdate_index.ExtDate();
    }
    /**
     * @return {?}
     */
    InfiniteCalendarComponent.prototype.ngOnInit = function () {
        var /** @type {?} */ halfWeeks = Math.floor(this.maxRowsInVirtualContainer / 2.0);
        this.beginningOnWindow = this.currentDate.beginningOfWeek().prevWeek(halfWeeks);
        this.endOnWindow = this.currentDate.endOfWeek().nextWeek(halfWeeks);
        // set origin of virtual address to the beginning of the week of current day
        this.origin = this.currentDate.beginningOfWeek();
        for (var /** @type {?} */ w = 0; w < this.maxRowsInVirtualContainer; w++) {
            this.pAddr.push([]);
            for (var /** @type {?} */ d = 0; d < 7; d++) {
                var /** @type {?} */ date = this.beginningOnWindow.nextDay(7 * w + d);
                var /** @type {?} */ addr = this._calcVirtualAddress(date);
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
                };
            }
        }
    };
    /**
     * @return {?}
     */
    InfiniteCalendarComponent.prototype.ngAfterViewInit = function () {
        var /** @type {?} */ ele = this.scrollView.nativeElement;
        var /** @type {?} */ initialScrollTop = this.height;
        this._scrollTo(ele, initialScrollTop, this.scrollDuration);
    };
    /**
     * @return {?}
     */
    InfiniteCalendarComponent.prototype.onClickBackToToday = function () {
        var /** @type {?} */ y = (-this.pAddr[0][0].y * this.height / this.maxRowsOnWindow);
        this._scrollTo(this.scrollView.nativeElement, y, this.scrollDuration);
    };
    /**
     * @param {?} event
     * @param {?} addr
     * @return {?}
     */
    InfiniteCalendarComponent.prototype.onClickDate = function (event, addr) {
        if (this.selecting) {
            this.vAddr[this.selecting['x']][this.selecting['y']].selected = false;
        }
        this.selecting = addr;
        this.vAddr[addr['x']][addr['y']].selected = true;
        this.selectDate.emit(this.vAddr[addr['x']][addr['y']].date);
    };
    /**
     * @param {?} event
     * @param {?} addr
     * @return {?}
     */
    InfiniteCalendarComponent.prototype.onMouseoverDate = function (event, addr) {
        if (this.hovering) {
            this.vAddr[this.hovering['x']][this.hovering['y']].hovered = false;
        }
        this.hovering = addr;
        this.vAddr[addr['x']][addr['y']].hovered = true;
    };
    /**
     * @param {?} event
     * @return {?}
     */
    InfiniteCalendarComponent.prototype.onScroll = function (event) {
        if (!this.loadable) {
            return;
        }
        // load prev month
        if (this.scrollView.nativeElement.scrollTop <= this.height) {
            this._appendMonthToTop();
        }
        // load next month
        if (this.scrollView.nativeElement.scrollTop + 2 * this.height > this.scrollView.nativeElement.scrollHeight) {
            this._appendMonthToBottom();
        }
    };
    /**
     * @return {?}
     */
    InfiniteCalendarComponent.prototype._appendMonthToTop = function () {
        this.beginningOnWindow = this.beginningOnWindow.prevDay(7 * this.maxRowsOnWindow);
        for (var /** @type {?} */ w = this.maxRowsOnWindow - 1; w >= 0; w--) {
            var /** @type {?} */ week = [];
            for (var /** @type {?} */ d = 0; d < 7; d++) {
                var /** @type {?} */ date = this.beginningOnWindow.nextDay(7 * w + d);
                var /** @type {?} */ addr = this._calcVirtualAddress(date);
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
                };
            }
            this.pAddr = [week].concat(this.pAddr);
        }
    };
    /**
     * @return {?}
     */
    InfiniteCalendarComponent.prototype._appendMonthToBottom = function () {
        var /** @type {?} */ appendBeginning = this.endOnWindow.nextDay();
        this.endOnWindow = this.endOnWindow.nextDay(7 * this.maxRowsOnWindow);
        for (var /** @type {?} */ w = 0; w < this.maxRowsOnWindow; w++) {
            var /** @type {?} */ week = [];
            for (var /** @type {?} */ d = 0; d < 7; d++) {
                var /** @type {?} */ date = appendBeginning.nextDay(7 * w + d);
                var /** @type {?} */ addr = this._calcVirtualAddress(date);
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
                };
            }
            this.pAddr = this.pAddr.concat([week]);
        }
    };
    /**
     * @param {?} date
     * @return {?}
     */
    InfiniteCalendarComponent.prototype._calcVirtualAddress = function (date) {
        var /** @type {?} */ interval = new extdate_index.ExtInterval(this.origin, date);
        var /** @type {?} */ days = Math.floor(interval.asDay());
        if (days >= 0) {
            return {
                x: days % 7,
                y: Math.floor(days / 7.0)
            };
        }
        else {
            return {
                x: 6 - ((-days - 1) % 7),
                y: Math.floor((7 + days) / 7.0) - 1,
            };
        }
    };
    /**
     * @param {?} element
     * @param {?} offsetTop
     * @param {?} duration
     * @return {?}
     */
    InfiniteCalendarComponent.prototype._scrollTo = function (element, offsetTop, duration) {
        var _this = this;
        var /** @type {?} */ fps = 60.0; // frame per sec
        var /** @type {?} */ initOffsetTop = element.scrollTop;
        var /** @type {?} */ counter = 0;
        var /** @type {?} */ interval = setInterval(function () {
            if (counter * 1000 >= duration * fps) {
                clearInterval(interval);
            }
            var /** @type {?} */ easingFunction = _this._easing("quodratic");
            var /** @type {?} */ time = counter * 1000 / (fps * duration);
            var /** @type {?} */ scrollTop = initOffsetTop + (offsetTop - initOffsetTop) * easingFunction(time);
            element.scrollTop = scrollTop;
            counter += 1;
        }, Math.round(1000.0 / fps));
        // setInterval will not be finished exact duration time
        var /** @type {?} */ error = 400; // msec
        // disable to load dates while auto scrolling
        setTimeout(function () {
            _this.loadable = true;
        }, duration + error);
    };
    /**
     * @param {?} pattern
     * @return {?}
     */
    InfiniteCalendarComponent.prototype._easing = function (pattern) {
        switch (pattern) {
            case "quodratic":
                return function (time) {
                    return time < .5 ? 2 * time * time : -2 * (time - 1) * (time - 1) + 1;
                };
            default:
                return function (time) {
                    return time < .5 ? 2 * time * time : -2 * (time - 1) * (time - 1) + 1;
                };
        }
    };
    return InfiniteCalendarComponent;
}());
InfiniteCalendarComponent.decorators = [
    { type: _angular_core.Component, args: [{
                selector: 'infinite-calendar',
                template: "\n  <div #awesomeCalendar class=\"awesome-calendar\">\n    <div class=\"container\">\n      <nav class=\"navigation\" *ngIf=\"navForToday\">\n        <div class=\"back-to-today\">\n          <a class=\"nav-button\" (click)=\"onClickBackToToday()\">\n            {{ labelForToday }}\n          </a>\n        </div>\n      </nav>\n\n      <div class=\"scroll-view-outer-container\">\n        <div #scrollView\n            class=\"scroll-view-inner-container\"\n            (scroll)=\"onScroll($event)\">\n          <div class=\"scroll-view\" (touchmove)=\"onScroll($event)\">\n            <div class=\"row\" *ngFor=\"let week of pAddr\">\n              <span class=\"cell\"\n                    *ngFor=\"let date of week\"\n                    [ngClass]=\"{\n                      'current': vAddr[date.x][date.y].current,\n                      'holiday': vAddr[date.x][date.y].holiday,\n                      'hovered': vAddr[date.x][date.y].hovered,\n                      'selected': vAddr[date.x][date.y].selected\n                    }\"\n                    (click)=\"onClickDate($event, date)\"\n                    (mouseover)=\"onMouseoverDate($event, date)\">\n                <span class=\"year\" *ngIf=\"vAddr[date.x][date.y].firstDayOfYear\">\n                  {{vAddr[date.x][date.y].year}}\n                </span>\n                <span class=\"month\" *ngIf=\"vAddr[date.x][date.y].firstDayOfMonth\">\n                  {{vAddr[date.x][date.y].month}}\n                </span>\n                {{vAddr[date.x][date.y].day}}\n              </span>\n            </div>\n          </div>\n        </div>\n      </div>\n\n    </div>\n  </div>\n  ",
                styles: [".awesome-calendar { align-items: center; display: flex; justify-content: center; } .awesome-calendar .container { width: 100%; } .awesome-calendar .scroll-view-outer-container, .awesome-calendar .scroll-view { height: 20.5rem; width: 100%; } .awesome-calendar .scroll-view-outer-container { border: 1px solid rgba(136, 136, 136, 0.4); border-radius: 4px; box-shadow: 1px 0px 3px -1px rgba(136, 136, 136, 0.8); position: relative; overflow: hidden; } .awesome-calendar .scroll-view-inner-container { position: absolute; left: 0; overflow-x: hidden; overflow-y: scroll; padding: 8px; width: 100%; -webkit-overflow-scrolling: touch; } .awesome-calendar .scroll-view-inner-container::-webkit-scrollbar { display: none; } .awesome-calendar .row { display: block; line-height: 1.7rem; } .awesome-calendar .cell { display: inline-block; height: 4.1rem; padding-bottom: 0; position: relative; text-align: center; width: 14%; } .awesome-calendar .cell.current { border: 2px #faa779 solid; border-radius: 4px; box-sizing: border-box; } .awesome-calendar .cell.hovered { background: rgba(255, 255, 159, 0.4); } .awesome-calendar .cell.selected { background: rgba(250, 167, 121, 0.6); } .awesome-calendar .cell.holiday { color: #ED2939; } .awesome-calendar .cell .month { color: #989898; font-size: .8em; } .awesome-calendar .cell .month::after { content: '/'; } .awesome-calendar .cell .year { color: #989898; font-size: .8em; margin-right: .2em; } .awesome-calendar .back-to-today { text-align: right; margin: 1em; } .awesome-calendar .nav-button { cursor: pointer; font-size: 1rem; padding: .2em 16px; } .awesome-calendar .nav-button:hover { color: #faa799; } "]
            },] },
];
/**
 * @nocollapse
 */
InfiniteCalendarComponent.ctorParameters = function () { return []; };
InfiniteCalendarComponent.propDecorators = {
    'scrollView': [{ type: _angular_core.ViewChild, args: ['scrollView',] },],
    'height': [{ type: _angular_core.Input },],
    'position': [{ type: _angular_core.Input },],
    'navForToday': [{ type: _angular_core.Input },],
    'navForPrevMonth': [{ type: _angular_core.Input },],
    'navForPrevYear': [{ type: _angular_core.Input },],
    'navForNextMonth': [{ type: _angular_core.Input },],
    'navForNextYear': [{ type: _angular_core.Input },],
    'labelForToday': [{ type: _angular_core.Input },],
    'selectDate': [{ type: _angular_core.Output },],
    'selectInterval': [{ type: _angular_core.Output },],
};

var CalendarService = (function () {
    function CalendarService() {
        this.current = new extdate_index.ExtDate();
    }
    return CalendarService;
}());
CalendarService.decorators = [
    { type: _angular_core.Injectable },
];
/**
 * @nocollapse
 */
CalendarService.ctorParameters = function () { return []; };

var InfiniteCalendarModule = (function () {
    function InfiniteCalendarModule() {
    }
    /**
     * @return {?}
     */
    InfiniteCalendarModule.forRoot = function () {
        return {
            ngModule: InfiniteCalendarModule,
            providers: [CalendarService]
        };
    };
    return InfiniteCalendarModule;
}());
InfiniteCalendarModule.decorators = [
    { type: _angular_core.NgModule, args: [{
                imports: [
                    _angular_common.CommonModule
                ],
                declarations: [
                    InfiniteCalendarComponent,
                ],
                exports: [
                    InfiniteCalendarComponent,
                ]
            },] },
];
/**
 * @nocollapse
 */
InfiniteCalendarModule.ctorParameters = function () { return []; };

exports.InfiniteCalendarModule = InfiniteCalendarModule;
exports.InfiniteCalendarComponent = InfiniteCalendarComponent;
exports.CalendarService = CalendarService;

Object.defineProperty(exports, '__esModule', { value: true });

})));
