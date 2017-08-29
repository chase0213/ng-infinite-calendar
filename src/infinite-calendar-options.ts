export interface InfiniteCalendarOptions {
  style: InfiniteCalendarStyleOptions;
  navigator: InfiniteCalendarNavigatorOptions;
  label: InfiniteCalendarLabelOptions;
}

export interface InfiniteCalendarStyleOptions {
  height: number;
}

export interface InfiniteCalendarNavigatorOptions {
  // back to today button
  today: boolean;
  labelForToday: string;
}

export interface InfiniteCalendarLabelOptions {
  // language
  lang: string;
  short: boolean;
}
