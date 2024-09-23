import { TuiRoot } from "@taiga-ui/core";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LngLatBoundsLike, StyleSpecification } from "maplibre-gl";

import { MapComponent } from "./components/map/map.component";
import { MapService } from "@maplibre/ngx-maplibre-gl";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, TuiRoot, MapComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,

  providers: [MapService],
})
export class AppComponent {
  protected layersVisible = false;
  protected bounds: LngLatBoundsLike = [-33.437108, 6.672897, -74.404622, -34.796086];
  protected readonly style: StyleSpecification = {
    version: 8,
    sources: {
      satellite: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: "satellite",
        source: "satellite",
        type: "raster",
        layout: {
          visibility: "visible",
        },
      },
    ],
  };
}
