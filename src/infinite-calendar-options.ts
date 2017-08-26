export interface InfiniteCalendarOptions {
  style: InfiniteCalendarStyleOptions;
  navigator: InfiniteCalendarNavigatorOptions;
}

export interface InfiniteCalendarStyleOptions {
  height: number;
}

export interface InfiniteCalendarNavigatorOptions {
  // back to today button
  today: boolean;
  labelForToday: string;
}