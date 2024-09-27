import {
  TUI_DARK_MODE,
  TUI_ICON_RESOLVER,
  TuiButton,
  TuiIcon,
  TuiRoot,
  tuiSlideInRight,
} from "@taiga-ui/core";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  Renderer2,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { ControlComponent, MapService } from "@maplibre/ngx-maplibre-gl";
import { LngLatBoundsLike, MapGeoJSONFeature } from "maplibre-gl";

import mapStyle from "./core/map-style";
import { LayersComponent } from "./components/layers/layers.component";
import { MapComponent } from "./components/map/map.component";

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
export class AppComponent implements OnInit {
  private mapService = inject(MapService);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);

  protected readonly darkMode = inject(TUI_DARK_MODE);
  protected readonly style = mapStyle;

  protected layersVisible = false;
  protected bounds: LngLatBoundsLike = [-33.437108, 6.672897, -74.404622, -34.796086];

  public ngOnInit() {
    this.setDarkMode(this.darkMode());

    this.mapService.mapLoaded$.subscribe({
      next: () => this.setupOnHoverEffects(),
    });
  }

  protected resetBounds() {
    this.bounds = [...(this.bounds as number[])] as LngLatBoundsLike;
  }

  protected setDarkMode(darkMode: boolean) {
    this.darkMode.set(darkMode);

    if (darkMode) {
      this.renderer.setAttribute(this.document.body, "tuiTheme", "dark");
    } else {
      this.renderer.removeAttribute(this.document.body, "tuiTheme");
    }
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
