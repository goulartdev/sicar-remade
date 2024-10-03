import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
import { NgIf } from "@angular/common";
import { TuiButton, TuiIcon, TuiLoader, TuiTextfield } from "@taiga-ui/core";
import { Subject, takeUntil } from "rxjs";

import { CARService } from "@services/car.service";
import { CARCode, isCARNumber } from "@core/models/car";
import { ActivatedRoute } from "@angular/router";

function CARValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const invalid = value && !isCARNumber(value);

    return invalid ? { invalidCARNumber: true } : null;
  };
}

@Component({
  selector: "app-search-input",
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TuiIcon,
    TuiTextfield,
    TuiLoader,
    TuiButton,
    NgIf,
  ],
  templateUrl: "./search-input.component.html",
  styleUrl: "./search-input.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly CARService = inject(CARService);
  private readonly cancelRequest$$ = new Subject();

  protected input = new FormControl<CARCode | "">("", {
    nonNullable: true,
    validators: [CARValidator()],
  });

  protected isSearching = signal(false);

  ngOnInit() {
    this.route.queryParams.subscribe(({ car }) => {
      this.input.setValue(car);
      this.search();
    });
  }

  protected search() {
    this.cancelRequest$$.next(null);
    const value = this.input.value;

    if (!isCARNumber(value)) {
      return;
    }

    this.isSearching.set(true);
    this.CARService.find(value)
      .pipe(takeUntil(this.cancelRequest$$))
      .subscribe({
        next: (car) => this.CARService.selectCAR(car),
        error: (err) => this.handleSearchError(err),
        complete: () => this.isSearching.set(false),
      });
  }

  private handleSearchError(err: unknown) {}

  public ngOnDestroy(): void {
    this.cancelRequest$$.next(null);
  }

  //protected results: Observable<SearchItemResult[]> = this.text.valueChanges.pipe(
  //  tap((value) => console.log(value)),
  //  debounceTime(500),
  //  map((value) => value.trim()),
  //  distinctUntilChanged(),
  //  filter((value) => value.length >= 3),
  //  switchMap((value) => this.search(value)),
  //  startWith([]),
  //);

  //private search(text: string): Observable<SearchItemResult[]> {
  //  return isCARNumber(text) ? this.handleCAR(text) : this.handleCity(text);
  //}
  //
  //private handleCAR(code: CARCode): Observable<SearchItemResult[]> {
  //  return of([]);
  //}
  //
  //private handleCity(name: string): Observable<SearchItemResult[]> {
  //  return this.searchService
  //    .searchCity(name)
  //    .pipe(map(({ results }) => results.map((city) => ({ label: city.name }))));
  //}
  //
  //public stringfy(item: SearchItemResult) {
  //  return item.label;
  //}
}
