import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InfiniteCalendarComponent } from './infinite-calendar.component';

@NgModule({
  declarations: [InfiniteCalendarComponent],
  imports: [
    CommonModule,
  ],
  exports: [InfiniteCalendarComponent]
})
export class InfiniteCalendarModule { }
