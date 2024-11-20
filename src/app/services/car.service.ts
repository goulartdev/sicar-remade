import { inject, Injectable } from "@angular/core";
import { HttpStatusCode } from "@angular/common/http";
import { MapService } from "@maplibre/ngx-maplibre-gl";
import { BehaviorSubject, map, Observable } from "rxjs";
import { LngLat, LngLatLike } from "maplibre-gl";

import { CARCode, CAR } from "@core/models/car";

import sample from "./car_sample.json";

type GeoJSONCAR = Omit<CAR, "data_inscricao" | "data_retificacao"> & {
  properties: {
    data_inscricao: string;
    data_retificacao: string;
  };
};

@Injectable()
export class CARService {
  private readonly mapService = inject(MapService);
  private readonly CAR$$ = new BehaviorSubject<CAR | null>(null);

  public readonly selectedCAR$ = this.CAR$$.asObservable();

  public find(code: CARCode): Observable<CAR> {
    const car = (sample.features as GeoJSONCAR[]).find(
      (car) => car.properties.cod_imovel === code,
    );

    return new Observable<GeoJSONCAR>((subscriber) => {
      setTimeout(() => {
        if (!car) {
          subscriber.error({
            status: HttpStatusCode.NotFound,
          });
        } else {
          subscriber.next(car);
          subscriber.complete();
        }
      }, 2000);
    }).pipe(
      map((car) => ({
        ...car,
        properties: {
          ...car.properties,
          data_inscricao: new Date(car.properties.data_inscricao),
          data_retificacao: new Date(car.properties.data_retificacao),
        },
      })),
    );
  }

  public listAt(coords: LngLatLike): Observable<CAR[]> {
    const [lng, lat] = LngLat.convert(coords).toArray();

    const cars = (sample.features as GeoJSONCAR[]).filter(
      (car) =>
        car.bbox[0] <= lng &&
        car.bbox[2] >= lng &&
        car.bbox[1] <= lat &&
        car.bbox[3] >= lat,
    );

    return new Observable<GeoJSONCAR[]>((subscriber) => {
      setTimeout(() => {
        subscriber.next(cars);
        subscriber.complete();
      }, 2000);
    }).pipe(
      map((cars) =>
        cars.map((car) => ({
          ...car,
          properties: {
            ...car.properties,
            data_inscricao: new Date(car.properties.data_inscricao),
            data_retificacao: new Date(car.properties.data_retificacao),
          },
        })),
      ),
    );
  }

  public selectCAR(car: CAR | null, navigate: boolean = true) {
    this.CAR$$.next(car);

    if (car && navigate) {
      this.mapService.fitBounds(car.bbox, {
        padding: { top: 100, right: 100, bottom: 100, left: 510 },
      });
    }
  }

  public clearSelectedCAR() {
    this.CAR$$.next(null);
  }
}
