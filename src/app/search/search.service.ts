import { Injectable } from "@angular/core";
import { HttpStatusCode } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { LngLat, LngLatLike } from "maplibre-gl";

import { CARCode, CAR } from "@core/models/car";
export type SearchTerm = CARCode | LngLatLike;

// TODO: delete this test data
import sample from "./car_sample.json";

type GeoJSONCAR = Omit<CAR, "data_inscricao" | "data_retificacao"> & {
  properties: {
    data_inscricao: string;
    data_retificacao: string;
  };
};

@Injectable()
export class SearchService {
  public search(term: CARCode | LngLatLike): Observable<CAR[]> {
    return typeof term == "string"
      ? this.find(term).pipe(map((CAR) => [CAR]))
      : this.listAt(term);
  }

  private find(code: CARCode): Observable<CAR> {
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

  private listAt(coords: LngLatLike): Observable<CAR[]> {
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
}
