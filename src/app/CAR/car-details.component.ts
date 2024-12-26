import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from "@angular/core";
import { TuiAlertService, TuiButton, TuiIcon } from "@taiga-ui/core";
import { GeoJSONSource } from "maplibre-gl";

import { CAR } from "@core/models/car";
import { CARStatusPipe } from "@core/pipes/car-status.pipe";
import { MapService } from "@map/map.service";

import { CARDetailsDataComponent } from "./car-details-data/car-details-data.component";

@Component({
  selector: "app-car-details",
  imports: [TuiButton, TuiIcon, CARDetailsDataComponent, CARStatusPipe],
  templateUrl: "./car-details.component.html",
  styleUrl: "./car-details.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CARDetailsComponent implements OnInit, OnDestroy {
  private readonly alerts = inject(TuiAlertService);
  private readonly mapService = inject(MapService);

  protected section: WritableSignal<"data" | "layers" | "satellite"> = signal("data");

  public car = input.required<CAR>();

  ngOnInit() {
    const source: GeoJSONSource = this.getGeoJSONSource("selected_car")!;
    source.setData(this.car());
    this.focus();
  }

  private getGeoJSONSource(name: string): GeoJSONSource | undefined {
    return this.mapService.map.getSource(name) as GeoJSONSource | undefined;
  }

  protected async copyUrl() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/?search=${this.car().properties.cod_imovel}`,
    );
    this.alerts.open("Link copiado para a área de transferência").subscribe();
  }

  protected focus() {
    this.mapService.fitBounds(this.car().bbox, {
      padding: { top: 100, right: 100, bottom: 100, left: 100 },
    });
  }

  ngOnDestroy() {
    const source: GeoJSONSource = this.getGeoJSONSource("selected_car")!;
    source.setData({
      type: "FeatureCollection",
      features: [],
    });
  }
}
