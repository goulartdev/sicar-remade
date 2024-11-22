import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { take, tap } from "rxjs";
import {
  TuiButton,
  TuiDataList,
  TuiDropdownOpen,
  TuiLoader,
  TuiTextfield,
  TuiTextfieldComponent,
} from "@taiga-ui/core";
import { GeoJSONSource, LngLat } from "maplibre-gl";
import { MapService } from "@maplibre/ngx-maplibre-gl";

import { CARService } from "@services/car.service";
import { isCARNumber, CAR } from "@core/models/car";
import { SearchService, SearchTerm } from "@services/search.service";
import { CARStatusPipe } from "src/app/pipes/car-status.pipe";

function CARValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const invalid = value && !isCARNumber(value);

    return invalid ? { invalidCARNumber: true } : null;
  };
}

export type LngLatString = `${string & { __brand: "\\d,\\d" }}`;

function isLatLngString(value: string): value is LngLatString {
  const regexp = new RegExp(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
  return regexp.test(value);
}

@Component({
  selector: "app-search-input",
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TuiTextfield,
    TuiLoader,
    TuiButton,
    TuiDataList,
    TuiDropdownOpen,
    CARStatusPipe,
  ],
  templateUrl: "./search-input.component.html",
  styleUrl: "./search-input.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchService],
})
export class SearchInputComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly CARService = inject(CARService);
  private readonly searchService = inject(SearchService);
  private readonly mapService = inject(MapService);

  protected input = viewChild<ElementRef>("searchInput");
  protected dropdown = viewChild(TuiTextfieldComponent, { read: TuiDropdownOpen });

  //protected input = new FormControl<CARCode | "">("", {
  protected inputCtrl = new FormControl<string>("", {
    nonNullable: true,
    //validators: [CARValidator()],
  });

  protected readonly isSearching = signal(false);
  protected readonly results = signal<CAR[]>([]);
  protected readonly hasResults = computed(() => this.results().length > 1);

  private readonly effectRef = afterRenderEffect(() =>
    this.dropdown()?.toggle(this.hasResults()),
  );

  ngOnInit() {
    this.route.queryParams.pipe(take(1)).subscribe(({ search }) => {
      this.inputCtrl.setValue(search);
      this.search();
    });

    this.searchService.searchState$
      .pipe(
        tap((state) => {
          this.isSearching.set(state.status === "SEARCHING");

          if (state.status === "SEARCHING") {
            this.updateSearchParam(state.term);
          }

          if (state.status === "SUCCESS") {
            if (Array.isArray(state.results)) {
              if (state.results.length > 1) {
                this.results.set(state.results);
                this.inputCtrl.patchValue("");
                const extent = state.results.reduce((ext, { bbox }) => {
                  return [
                    Math.min(ext[0] ?? bbox[0], bbox[0]),
                    Math.min(ext[1] ?? bbox[1], bbox[1]),
                    Math.max(ext[2] ?? bbox[2], bbox[2]),
                    Math.max(ext[3] ?? bbox[3], bbox[3]),
                  ];
                }, [] as number[]) as [number, number, number, number];

                this.mapService.fitBounds(extent, {
                  padding: { top: 100, right: 100, bottom: 100, left: 550 },
                });
                this.input()?.nativeElement.focus();
              } else if (state.results.length === 1) {
                this.updateSearchParam(state.results[0].properties.cod_imovel);
                this.CARService.selectCAR(state.results[0]);
              } else {
                // TODO: handle no results
              }
            } else {
              this.CARService.selectCAR(state.results);
            }
          } else {
            this.CARService.clearSelectedCAR();
            this.results.set([]);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  protected search() {
    const value = this.inputCtrl.value;

    if (isLatLngString(value)) {
      const [lon, lat] = value.split(",");
      this.searchService.search([parseFloat(lon), parseFloat(lat)]);
    }

    if (isCARNumber(value)) {
      this.searchService.search(value);
    }
  }

  protected select(car: CAR) {
    this.updateSearchParam(car.properties.cod_imovel);
    this.results.set([]);
    this.CARService.selectCAR(car);
  }

  protected clear() {
    this.CARService.clearSelectedCAR();
    this.results.set([]);
    this.inputCtrl.setValue("");
  }

  protected updateHighlight(data: GeoJSON.GeoJSON) {
    const source = this.mapService.mapInstance.getSource(
      "selected_car",
    ) as GeoJSONSource;

    source.setData(data);
  }

  private updateSearchParam(value: SearchTerm) {
    const term =
      typeof value === "string" ? value : LngLat.convert(value).toArray().join(",");

    this.inputCtrl.patchValue(term);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: term },
      onSameUrlNavigation: "ignore",
      replaceUrl: true,
    });
  }
}
