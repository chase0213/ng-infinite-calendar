export interface InfiniteCalendarOptions {
    style: InfiniteCalendarStyleOptions;
    navigator: InfiniteCalendarNavigatorOptions;
}
export interface InfiniteCalendarStyleOptions {
    height: number;
}
export interface InfiniteCalendarNavigatorOptions {
    position: string;
    today: boolean;
    previousMonth: boolean;
    previousYear: boolean;
    nextMonth: boolean;
    nextYear: boolean;
    labelForToday: string;
}
