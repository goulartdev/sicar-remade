import { TuiButton, TuiIcon, TuiRoot } from "@taiga-ui/core";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ControlComponent, MapService } from "@maplibre/ngx-maplibre-gl";
import { LngLatBoundsLike, StyleSpecification } from "maplibre-gl";

import { MapComponent } from "./components/map/map.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, TuiRoot, TuiIcon, TuiButton, ControlComponent, MapComponent],
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

  protected resetBounds() {
    this.bounds = [...(this.bounds as number[])] as LngLatBoundsLike;
  }
}
