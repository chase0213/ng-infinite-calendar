import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteCalendarComponent } from './infinite-calendar.component';
import { CalendarService } from './calendar.service';

export * from './infinite-calendar.component';
export * from './calendar.service';

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
      providers: [CalendarService]
    };
  }
}
