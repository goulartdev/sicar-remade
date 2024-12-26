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
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Protocol } from "pmtiles";
import { addProtocol } from "maplibre-gl";

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
    { provide: TUI_ALERT_POSITION, useValue: "8px auto 0 8px" },
    AppService,
    MapService,
    SearchService,
  ],
  animations: [tuiSlideInRight, tuiSlideInLeft, tuiFadeIn],
})
export class AppComponent implements OnInit {
  private readonly appService = inject(AppService);
  private readonly mapService = inject(MapService);

  protected readonly darkMode = inject(TUI_DARK_MODE);
  protected readonly mapReady = toSignal(this.mapService.mapReady$);

  protected readonly layersControlVisible = computed(() =>
    this.appService.widgets().includes("layers_control"),
  );

  protected readonly CAR = this.appService.CAR;
  protected readonly adminUnit = signal<string | null>(null);

  protected setCAR(car: CAR | null) {
    if (car) {
      this.appService.setCAR(car);
    } else {
      this.appService.clearCAR();
    }
  }

  public ngOnInit() {
    this.setDarkMode(this.darkMode());

    this.mapService.mapReady$.subscribe(() => {
      this.mapService.map.on("mousemove", "administrative_fill", (e) => {
        const feature = e.features?.[0] ?? null;

        if (feature) {
          const props = feature.properties;
          this.adminUnit.set(
            props["NM_UF"] ?? `${props["NM_MUN"]} - ${props["SIGLA_UF"]}`,
          );
        } else {
          this.adminUnit.set(null);
        }
      });

      this.mapService.map.on("mouseleave", "administrative_fill", () => {
        this.adminUnit.set(null);
      });
    });
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
