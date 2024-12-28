import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { TuiIcon } from "@taiga-ui/core";

import { MapService, SortableLayersComponent, LayerControlComponent } from "@map";

@Component({
  selector: "app-layers",
  imports: [TuiIcon, LayerControlComponent, SortableLayersComponent],
  templateUrl: "./layers.component.html",
  styleUrl: "./layers.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayersComponent {
  private readonly mapService = inject(MapService);
  protected readonly layers = this.mapService
    .getLayers()
    .filter((layer) => (layer.metadata as Record<string, any> | undefined)?.["legend"])
    .map((layer) => layer.id);
}
