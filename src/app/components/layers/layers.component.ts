import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LayerControlComponent } from "./layer-control/layer-control.component";
import { MapService } from "@maplibre/ngx-maplibre-gl";
import { AsyncPipe, NgFor } from "@angular/common";
import { map } from "rxjs";

@Component({
  selector: "app-layers",
  standalone: true,
  imports: [LayerControlComponent, NgFor, AsyncPipe],
  templateUrl: "./layers.component.html",
  styleUrl: "./layers.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayersComponent {
  private readonly mapService = inject(MapService);
  public readonly layers = this.mapService.mapLoaded$.pipe(map(() => this.getLayers()));

  getLayers(): string[] {
    return this.mapService.mapInstance
      .getStyle()
      .layers.filter(
        (layer) => (layer.metadata as Record<string, any> | undefined)?.["legend"],
      )
      .map((layer) => layer.id);
  }
}
