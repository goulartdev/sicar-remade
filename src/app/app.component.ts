import {
  TUI_DARK_MODE,
  TuiButton,
  TuiIcon,
  TuiRoot,
  TuiScrollbar,
  tuiSlideInRight,
  tuiSlideInLeft,
  tuiFadeIn,
  TUI_ALERT_POSITION,
} from "@taiga-ui/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Protocol } from "pmtiles";
import { addProtocol, MapMouseEvent } from "maplibre-gl";
import { fromEvent, switchMap } from "rxjs";

import mapStyle from "./core/map-style";
import { CARDetailsComponent } from "./CAR";
import { LayersComponent } from "./layers";
import { SearchService, SearchComponent } from "./search";
import { MapService, MAP_OPTIONS, MapDirective } from "./map";
import { AppService } from "./app.service";
import { CAR } from "@core/models/car";

let protocol = new Protocol();
addProtocol("pmtiles", protocol.tile);

@Component({
  selector: "app-root",
  imports: [
    TuiRoot,
    TuiIcon,
    TuiButton,
    TuiScrollbar,
    MapDirective,
    LayersComponent,
    SearchComponent,
    CARDetailsComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MAP_OPTIONS,
      useValue: {
        attributionControl: false,
        style: mapStyle,
        bounds: [-74.404622, -34.796086, -33.437108, 6.672897],
      },
    },
    { provide: TUI_ALERT_POSITION, useValue: "8px 60px 0 auto" },
    AppService,
    MapService,
    SearchService,
  ],
  animations: [tuiSlideInRight, tuiSlideInLeft, tuiFadeIn],
})
export class AppComponent implements OnInit {
  private readonly appService = inject(AppService);
  private readonly mapService = inject(MapService);
  private readonly searchService = inject(SearchService);

  protected readonly darkMode = inject(TUI_DARK_MODE);
  protected readonly mapReady = toSignal(this.mapService.mapReady$);

  protected readonly layersControlVisible = computed(() =>
    this.appService.widgets().includes("layers_control"),
  );
  protected readonly STACSearchVisible = computed(() =>
    this.appService.widgets().includes("stac_search"),
  );

  protected readonly CAR = this.appService.CAR;

  protected setCAR(car: CAR | null) {
    console.log(car);
    if (car) {
      this.appService.setCAR(car);
    } else {
      this.appService.clearCAR();
    }
  }

  public ngOnInit() {
    this.setDarkMode(this.darkMode());
  }

  protected toggleLayersControl() {
    if (this.layersControlVisible()) {
      this.appService.removeWidget("layers_control");
    } else {
      this.appService.addWidget("layers_control");
    }
  }

  protected resetBounds() {
    this.mapService.resetBounds();
  }

  protected setDarkMode(darkMode: boolean) {
    this.darkMode.set(darkMode);
  }
}
