import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MapComponent as MglMapComponent } from "@maplibre/ngx-maplibre-gl";

/*
  I'm extending ngx-maplibre-gl MapComponent just to be able to provide a
  MapService somewhere else. I need this for injecting the service on my
  LayersComponent without having to wrap it in a CustomControl, which will
  break my layout.
*/

@Component({
  selector: "app-map",
  standalone: true,
  imports: [],
  template: "<div #container></div>",
  styles: [
    `
      :host {
        display: block;
      }
      div {
        height: 100%;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent extends MglMapComponent {}
