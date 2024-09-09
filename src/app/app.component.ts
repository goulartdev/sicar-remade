import { TuiRoot } from "@taiga-ui/core";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import {
  LayerComponent,
  MapComponent,
  RasterSourceComponent,
  VectorSourceComponent,
} from "@maplibre/ngx-maplibre-gl";
import { LngLatBoundsLike, StyleSpecification, addProtocol } from "maplibre-gl";
import { Protocol } from "pmtiles";

let protocol = new Protocol();
addProtocol("pmtiles", protocol.tile);

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    TuiRoot,
    MapComponent,
    VectorSourceComponent,
    RasterSourceComponent,
    LayerComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  public readonly attributionControl = false;
  public bounds: LngLatBoundsLike = [-33.437108, 6.672897, -74.404622, -34.796086];
  public readonly style: StyleSpecification = {
    version: 8,
    sources: {
      satellite: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
      area_imovel: {
        type: "vector",
        url: "pmtiles://http://localhost:9000/sicar/AREA_IMOVEL_2.pmtiles",
      },
      admin_boundaries: {
        type: "vector",
        url: "pmtiles://http://localhost:9000/sicar/admin_boundaries.pmtiles",
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
      {
        id: "area_imovel",
        source: "area_imovel",
        "source-layer": "AREA_IMOVEL",
        type: "fill",
        layout: {
          visibility: "visible",
        },
        paint: {
          "fill-color": [
            "match",
            ["get", "ind_status"],
            "AT",
            "#4567ff",
            "PE",
            "#ffc533",
            "SU",
            "#e0351b",
            "CA",
            "#7d7d7d",
            "#000000",
          ],
          "fill-outline-color": "#000000",
          "fill-opacity": 0.5,
        },
      },
      {
        id: "admin_boundaries",
        source: "admin_boundaries",
        "source-layer": "admin_boundaries",
        type: "line",
        layout: {
          visibility: "visible",
        },
        paint: {
          "line-color": "#d3650a",
          "line-width": 2,
        },
      },
    ],
  };
}
