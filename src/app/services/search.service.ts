import { DestroyRef, inject, Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  BehaviorSubject,
  catchError,
  filter,
  fromEvent,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from "rxjs";
import { MapService } from "@maplibre/ngx-maplibre-gl";
import { LngLatLike, MapMouseEvent } from "maplibre-gl";

import { CARCode, CAR } from "@core/models/car";
import { CARService } from "./car.service";
//import mockdata from "scripts/data/sample_cities.json";
//
//export interface City {
//  id: number;
//  name: string;
//  uf: string;
//  bbox: [number, number, number, number];
//}

export type SearchTerm = CARCode | LngLatLike;

interface SearchBaseState<S> {
  status: S;
}

interface SearchIdleState extends SearchBaseState<"IDLE"> {}

interface SearchInProgressState extends SearchBaseState<"SEARCHING"> {
  term: SearchTerm;
}

interface SearchSuccessState extends SearchBaseState<"SUCCESS"> {
  term: SearchTerm;
  results: CAR[] | CAR;
}

interface SearchErrorState extends SearchBaseState<"ERROR"> {
  term: SearchTerm;
  error: HttpErrorResponse;
}

type SearchState =
  | SearchIdleState
  | SearchInProgressState
  | SearchSuccessState
  | SearchErrorState;

@Injectable()
export class SearchService {
  private readonly CARService = inject(CARService);
  private readonly mapService = inject(MapService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchState$$ = new BehaviorSubject<SearchState>({
    status: "IDLE",
  });

  public readonly searchState$ = this.searchState$$.asObservable();

  constructor() {
    this.searchState$
      .pipe(
        filter((state) => state.status == "SEARCHING"),
        switchMap(({ term }) => {
          const request: Observable<CAR | CAR[]> =
            typeof term == "string"
              ? this.CARService.find(term)
              : this.CARService.listAt(term);

          return request.pipe(
            map((results) => ({ status: "SUCCESS" as const, term, results })),
            catchError((error) => of({ status: "ERROR" as const, term, error })),
          );
        }),
        tap((state) => this.searchState$$.next(state)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    fromEvent(this.mapService.mapInstance, "click")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e: MapMouseEvent) => this.search(e.lngLat));
  }

  search(term: CARCode | LngLatLike) {
    this.searchState$$.next({ status: "SEARCHING", term });
  }

  //searchCity(name: string, page: number = 1): Observable<Paginated<City>> {
  //  const filtered = (mockdata as City[]).filter((city: City) =>
  //    city.name.toLowerCase().startsWith(name.toLowerCase()),
  //  );
  //
  //  return of({
  //    count: filtered.length,
  //    results: filtered.slice((page - 1) * 20, page * 20),
  //  });
  //}
}
