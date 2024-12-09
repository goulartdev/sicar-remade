import {
  TUI_DARK_MODE,
  TuiButton,
  TuiIcon,
  TuiRoot,
  TuiScrollbar,
  tuiSlideInRight,
  tuiSlideInLeft,
  tuiFadeIn,
} from "@taiga-ui/core";
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { Protocol } from "pmtiles";
import { AsyncPipe } from "@angular/common";
import { ControlComponent, MapService } from "@maplibre/ngx-maplibre-gl";
import { LngLatBoundsLike, MapGeoJSONFeature, addProtocol } from "maplibre-gl";
import { map } from "rxjs";

import mapStyle from "./core/map-style";
import { CARService } from "./services";
import {
  MapComponent,
  LayersComponent,
  SearchInputComponent,
  CarDetailsComponent,
} from "./components";

let protocol = new Protocol();
addProtocol("pmtiles", protocol.tile);

@Component({
  selector: "app-root",
  imports: [
    AsyncPipe,
    TuiRoot,
    TuiIcon,
    TuiButton,
    TuiScrollbar,
    ControlComponent,
    MapComponent,
    LayersComponent,
    SearchInputComponent,
    CarDetailsComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MapService, CARService],
  animations: [tuiSlideInRight, tuiSlideInLeft, tuiFadeIn],
})
export class AppComponent implements OnInit {
  private readonly mapService = inject(MapService);
  protected readonly carService = inject(CARService);

  protected readonly darkMode = inject(TUI_DARK_MODE);
  protected readonly mapStyle = mapStyle;
  protected readonly mapLoaded$ = this.mapService.mapLoaded$.pipe(map(() => true));

  protected layersVisible = false;
  protected bounds: LngLatBoundsLike = [-33.437108, 6.672897, -74.404622, -34.796086];

  public ngOnInit() {
    this.setDarkMode(this.darkMode());

    this.mapLoaded$.subscribe({
      next: () => {
        this.mapService.mapInstance.resize();
        this.setupOnHoverEffects();
      },
    });
  }

  protected resetBounds() {
    this.bounds = [...(this.bounds as number[])] as LngLatBoundsLike;
  }

  protected setDarkMode(darkMode: boolean) {
    this.darkMode.set(darkMode);
  }

  /*
   * CAR
   */

  protected get selectedCAR$() {
    return this.carService.selectedCAR$;
  }

  /*
   * Hover style
   */

  private setupOnHoverEffects() {
    const map = this.mapService.mapInstance;
    map
      .getLayersOrder()
      .map((layerId) => map.getLayer(layerId)!)
      .filter(
        (layer) =>
          layer && ((layer.metadata ?? {}) as Record<string, any>)["enableHoverStyle"],
      )
      .forEach((layer) => {
        let hoveredFeature: MapGeoJSONFeature | null = null;

        map.on("mousemove", layer.id, (e) => {
          const feature = e.features?.[0] ?? null;

          if (feature == hoveredFeature) {
            return;
          }

          if (hoveredFeature) {
            map.setFeatureState(hoveredFeature, { hover: false });
          }

          if (feature) {
            map.setFeatureState(feature, { hover: true });
          }

          hoveredFeature = feature;
        });

        map.on("mouseleave", layer.id, () => {
          if (hoveredFeature) {
            map.setFeatureState(hoveredFeature, { hover: false });
          }

          hoveredFeature = null;
        });
      });
  }
}
