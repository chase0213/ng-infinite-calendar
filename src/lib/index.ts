import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteCalendarComponent } from './infinite-calendar.component';

export * from './infinite-calendar.component';
export * from './infinite-calendar-event';
export * from './infinite-calendar-options';
export * from './infinite-calendar-event';
export * from './infinite-calendar-date-with-event';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    InfiniteCalendarComponent,
  ],
  exports: [
    InfiniteCalendarComponent,
  ]
})
export class InfiniteCalendarModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: InfiniteCalendarModule,
      providers: []
    };
  }
}
