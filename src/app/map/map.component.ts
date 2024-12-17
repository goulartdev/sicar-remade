import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
} from "@angular/core";

import { MapService } from "./map.service";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-map",
  imports: [],
  templateUrl: "./map.component.html",
  styleUrl: "./map.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent {
  private readonly mapService = inject(MapService);
  protected isReady = toSignal(this.mapService.mapReady$);

  readonly mapContainer = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      this.mapService.setup(this.mapContainer.nativeElement);
    });
  }
}
