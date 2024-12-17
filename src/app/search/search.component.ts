import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  linkedSignal,
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
import {
  outputFromObservable,
  rxResource,
  takeUntilDestroyed,
  toObservable,
} from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { fromEvent, of, switchMap } from "rxjs";
import {
  TuiButton,
  TuiDataList,
  TuiDropdownOpen,
  TuiLoader,
  TuiTextfield,
  TuiTextfieldComponent,
} from "@taiga-ui/core";
import { GeoJSONSource, LngLatLike, MapMouseEvent } from "maplibre-gl";

import { isCARNumber, CAR, CARCode } from "@core/models/car";
import { CARStatusPipe } from "@core/pipes/car-status.pipe";
import { MapService } from "src/app/map/map.service";
import { SearchService } from "./search.service";

function CARValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const invalid = value && !isCARNumber(value);

    return invalid ? { invalidCARNumber: true } : null;
  };
}

@Component({
  selector: "app-search",
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
  templateUrl: "./search.component.html",
  styleUrl: "./search.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly mapService = inject(MapService);
  private readonly searchService = inject(SearchService);

  protected input = viewChild<ElementRef>("searchInput");
  protected dropdown = viewChild(TuiTextfieldComponent, { read: TuiDropdownOpen });

  protected inputCtrl = new FormControl<CARCode | "">("", {
    nonNullable: true,
    validators: [CARValidator()],
  });

  private readonly searchValue = signal<CARCode | LngLatLike | null>(null);

  protected readonly resource = rxResource({
    request: this.searchValue,
    loader: ({ request }) => (request ? this.searchService.search(request) : of(null)),
  });

  protected readonly results = computed(() => {
    const results = this.resource.value() ?? [];
    return results.length > 1 ? results : null;
  });

  protected readonly selected = linkedSignal(() => {
    const results = this.resource.value() ?? [];
    return results.length === 1 ? results[0] : null;
  });

  private readonly effectRef = afterRenderEffect(() => {
    const results = this.results();

    if (results) {
      this.dropdown()?.toggle(true);
      this.input()?.nativeElement.focus();
      this.mapService.fitFeatures(results, { padding: 100 });
    }
  });

  public CAR = outputFromObservable<CAR | null>(toObservable(this.selected));

  ngOnInit() {
    const { search } = this.route.snapshot.queryParams;

    if (search) {
      this.inputCtrl.setValue(search);
      this.search();
    }

    this.mapService.mapReady$
      .pipe(
        switchMap(() => fromEvent(this.mapService.map, "click")),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e: MapMouseEvent) => {
        this.inputCtrl.reset();
        this.searchValue.set(e.lngLat);
      });
  }

  protected search() {
    const value = this.inputCtrl.value;

    if (isCARNumber(value)) {
      this.searchValue.set(value);
    }
  }

  protected select(car: CAR) {
    this.updateSearchParam(car.properties.cod_imovel);
    this.resource.set(null);
    this.selected.set(car);
  }

  protected clear() {
    this.inputCtrl.setValue("");
    this.searchValue.set(null);
  }

  protected updateHighlight(data: GeoJSON.GeoJSON) {
    const source = this.mapService.map.getSource("selected_car") as GeoJSONSource;
    source.setData(data);
  }

  private updateSearchParam(value: CARCode) {
    this.inputCtrl.patchValue(value);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: value },
      onSameUrlNavigation: "ignore",
      replaceUrl: true,
    });
  }
}
