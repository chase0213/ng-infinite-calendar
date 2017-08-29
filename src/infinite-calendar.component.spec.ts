import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { DebugElement }    from '@angular/core';
import 'jasmine';

import { InfiniteCalendarComponent } from './infinite-calendar.component';

describe('SampleComponent', () => {

  let comp:    InfiniteCalendarComponent;
  let fixture: ComponentFixture<InfiniteCalendarComponent>;
  let de:      DebugElement;
  let el:      HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ InfiniteCalendarComponent ], // declare the test component
    });

    fixture = TestBed.createComponent(InfiniteCalendarComponent);

    comp = fixture.componentInstance; // BannerComponent test instance

    // query for the title <h1> by CSS element selector
    de = fixture.debugElement.query(By.css('h1'));
    el = de.nativeElement;
  });

  it('Should be false', () => {
    expect(false).toBe(true);
  });
});
