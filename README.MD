# ng-infinite-calendar

## Installation

To install this library, run:

```bash
$ npm install extdate ng-infinite-calendar --save
```

NOTE:
[extdate](https://github.com/chase0213/extdate) is a simple and lite extension of Date object in javascript, which ng-infinite-calendar uses internally.

## Consuming your library

You can import your library in any Angular application by running:

```bash
$ npm install extdate ng-infinite-calendar
```

and then from your Angular `AppModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Import the module
import { InfiniteCalendarModule } from 'ng-infinite-calendar';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    // Specify the module as an import
    InfiniteCalendarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Once the module is imported, you can use its components, directives and pipes in your Angular application:

```xml
<!-- You can now use the module component in app.component.html -->
<h1>
  {{title}}
</h1>
<infinite-calendar></infinite-calendar>
```

## Inputs and Outputs

Several inputs and outputs are provided.
See docs for details.

## Development

To generate all `*.js`, `*.d.ts` and `*.metadata.json` files:

```bash
$ npm run build
```

To lint all `*.ts` files:

```bash
$ npm run lint
```

## License

MIT © [Chisato Hasegawa](mailto:chase0213+dev@gmail.com)
