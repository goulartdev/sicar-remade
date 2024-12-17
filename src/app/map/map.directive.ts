import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
} from "@angular/core";

import { MapService } from "./map.service";
import { toSignal } from "@angular/core/rxjs-interop";

@Directive({
  selector: "[appMap]",
})
export class MapDirective {
  private readonly mapService = inject(MapService);
  protected isReady = toSignal(this.mapService.mapReady$);

  readonly mapContainer = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      this.mapService.setup(this.mapContainer.nativeElement);
    });
  }
}
