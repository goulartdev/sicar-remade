import {
  TUI_DARK_MODE,
  TUI_ICON_RESOLVER,
  TuiButton,
  TuiIcon,
  TuiRoot,
  tuiSlideInRight,
} from "@taiga-ui/core";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ControlComponent, MapService } from "@maplibre/ngx-maplibre-gl";
import { LngLatBoundsLike, StyleSpecification, addProtocol } from "maplibre-gl";
import { Protocol } from "pmtiles";

import { LayersComponent } from "./components/layers/layers.component";
import { MapComponent } from "./components/map/map.component";

let protocol = new Protocol();
addProtocol("pmtiles", protocol.tile);

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    TuiRoot,
    TuiIcon,
    TuiButton,
    ControlComponent,
    MapComponent,
    LayersComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    MapService,
  ],
  animations: [tuiSlideInRight],
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
      area_imovel: {
        type: "vector",
        url: "pmtiles://http://localhost:9000/sicar/AREA_IMOVEL_2.pmtiles",
      },
      administrative: {
        type: "vector",
        url: "pmtiles://http://localhost:9000/sicar/administrative.pmtiles",
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
        metadata: {
          legend: {
            label: "Imóveis",
            filterAttribute: "ind_status",
            expanded: true,
            categories: [
              { value: "AT", label: "Ativo", color: "#4567ff" },
              { value: "PE", label: "Pendente", color: "#ffc533" },
              { value: "SU", label: "Suspenso", color: "#e0351b" },
              { value: "CA", label: "Cancelado", color: "#7d7d7d" },
            ],
          },
        },
      },
      {
        id: "administrative",
        source: "administrative",
        "source-layer": "administrative",
        type: "line",
        layout: {
          visibility: "visible",
        },
        paint: {
          "line-color": "#d3650a",
          "line-width": ["step", ["zoom"], 1, 5, 2],
        },
        metadata: {
          legend: {
            label: "Limites Administrativos",
            color: "#d3650a",
          },
        },
      },
    ],
  };

  protected readonly darkMode = inject(TUI_DARK_MODE);

  protected resetBounds() {
    this.bounds = [...(this.bounds as number[])] as LngLatBoundsLike;
  }
}
