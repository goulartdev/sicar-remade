import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { concatMap, map, Observable, of } from "rxjs";
import { LngLat, LngLatLike } from "maplibre-gl";

import { CARCode, CAR, CARCollection, isCARNumber } from "@core/models/car";
export type SearchTerm = CARCode | LngLatLike;

@Injectable()
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly host = "http://127.0.0.1:8000";

  public search(term: CARCode | LngLatLike) {
    return isCARNumber(term)
      ? this.find(term)
      : this.listAt(term).pipe(
          concatMap(({ features }) =>
            features.length === 1
              ? this.find(features[0].properties.cod_imovel)
              : of(features),
          ),
        );
  }

  public find(code: CARCode): Observable<CAR> {
    return this.http.get<CAR>(`${this.host}/imoveis/${code}`);
  }

  public listAt(coords: LngLatLike): Observable<CARCollection> {
    const [lng, lat] = LngLat.convert(coords).toArray();

    return this.http.get<CARCollection>(`${this.host}/imoveis`, {
      params: { lng, lat },
    });
  }
}
