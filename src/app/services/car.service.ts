import { inject, Injectable } from "@angular/core";
import { HttpStatusCode } from "@angular/common/http";
import { MapService } from "@maplibre/ngx-maplibre-gl";
import { BehaviorSubject, Observable, of } from "rxjs";

import { CARCode, CAR } from "@core/models/car";

import sample from "./car_sample.json";

@Injectable()
export class CARService {
  private readonly mapService = inject(MapService);
  private readonly CAR$$ = new BehaviorSubject<CAR | null>(null);

  public readonly selectedCAR$ = this.CAR$$.asObservable();

  public find(code: CARCode): Observable<CAR> {
    const car = (sample.features as CAR[]).find(
      (car) => car.properties.recibo === code,
    );

    return new Observable<CAR>((subscriber) => {
      setTimeout(() => {
        console.log(car);
        if (!car) {
          subscriber.error({
            status: HttpStatusCode.NotFound,
          });
        } else {
          subscriber.next(car);
          subscriber.complete();
        }
      }, 2000);
    });
  }

  public at(coords: [number, number]): Observable<CAR[]> {
    return of([]);
  }

  public selectCAR(car: CAR, navigate: boolean = true) {
    this.CAR$$.next(car);

    if (navigate) {
      console.log(car.bbox);
      this.mapService.fitBounds(car.bbox, { padding: 100 });
    }
  }

  public clearSelectedCAR() {
    this.CAR$$.next(null);
  }
}
