import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { GeoJSONSource } from "maplibre-gl";
import { MapService } from "@maplibre/ngx-maplibre-gl";
import { TuiTitle } from "@taiga-ui/core";

import { CAR } from "@core/models/car";
import { CARStatusStyle } from "@core/map-style";
import { CarDetailsDataComponent } from "./car-details-data/car-details-data.component";

@Component({
    selector: "app-car-details",
    imports: [TuiTitle, CarDetailsDataComponent],
    templateUrl: "./car-details.component.html",
    styleUrl: "./car-details.component.css",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarDetailsComponent implements OnInit, OnDestroy {
  private map = inject(MapService).mapInstance;

  @Input({ required: true }) car!: CAR;

  ngOnInit() {
    const source: GeoJSONSource = this.getGeoJSONSource("selected_car")!;
    source.setData(this.car);
  }

  get status() {
    return CARStatusStyle[this.car.properties.status];
  }

  private getGeoJSONSource(name: string): GeoJSONSource | undefined {
    return this.map.getSource(name) as GeoJSONSource | undefined;
  }

  ngOnDestroy() {
    const source: GeoJSONSource = this.getGeoJSONSource("selected_car")!;
    source.setData({
      type: "FeatureCollection",
      features: [],
    });
  }
}
