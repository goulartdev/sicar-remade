import { inject, Injectable, InjectionToken } from "@angular/core";
import {
  MapGeoJSONFeature,
  Map,
  MapOptions as _MapOptions,
  PaddingOptions,
  LngLatBoundsLike,
  FitBoundsOptions,
} from "maplibre-gl";
import { FeatureCollection, Feature, BBox } from "geojson";
import { ReplaySubject } from "rxjs";

type MapOptions = Omit<_MapOptions, "container">;

export const MAP_OPTIONS = new InjectionToken<MapOptions>("MapOptions");

class MapNotReadyError extends Error {}

@Injectable()
export class MapService {
  private mapInstance: Map | null = null;
  private readonly mapReady = new ReplaySubject();
  private readonly options = inject(MAP_OPTIONS, { optional: true }) ?? {};
  private viewPadding: PaddingOptions = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  };

  public readonly mapReady$ = this.mapReady.asObservable();

  public get map(): Map {
    if (!this.mapInstance) {
      throw new MapNotReadyError();
    }

    return this.mapInstance;
  }

  public setup(container: HTMLElement | string) {
    this.mapInstance = new Map({ container, ...this.options });
    this.mapInstance.on("load", (_) => {
      this.mapReady.next(true);
      this.setupOnHoverEffects(this.map);
    });
  }

  public updateViewPadding(padding: Partial<PaddingOptions>) {
    this.viewPadding = { ...this.viewPadding, ...padding };
  }

  public fitBounds(bounds: LngLatBoundsLike, options?: FitBoundsOptions) {
    const padding: PaddingOptions = { ...this.viewPadding };
    const morePadding = options?.padding ?? 0;

    for (const key of ["top", "left", "bottom", "right"] as const) {
      const value = typeof morePadding === "number" ? morePadding : morePadding[key];
      padding[key] = padding[key] + (value ?? 0);
    }

    this.mapInstance?.fitBounds(bounds, { ...options, padding });
  }

  public resetBounds() {
    if (this.options.bounds) {
      this.fitBounds(this.options.bounds);
    } else {
      this.mapInstance?.setCenter(this.options.center ?? [0, 0]);
      this.mapInstance?.setZoom(this.options.zoom ?? 0);
    }
  }

  public fitFeatures(
    features: FeatureCollection | Feature[],
    options?: FitBoundsOptions,
  ) {
    if (!Array.isArray(features)) {
      features = features.features;
    }

    const extent = features
      .map(({ bbox }) => bbox)
      .filter((bbox): bbox is BBox => !!bbox)
      .reduce((ext, bbox) => {
        return [
          Math.min(ext[0] ?? bbox[0], bbox[0]),
          Math.min(ext[1] ?? bbox[1], bbox[1]),
          Math.max(ext[2] ?? bbox[2], bbox[2]),
          Math.max(ext[3] ?? bbox[3], bbox[3]),
        ];
      }, [] as number[]) as [number, number, number, number];

    if (extent.length > 0) {
      this.fitBounds(extent, options);
    }
  }

  private setupOnHoverEffects(map: Map) {
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
