import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MapService } from "@maplibre/ngx-maplibre-gl";
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  CdkDragPlaceholder,
  moveItemInArray,
} from "@angular/cdk/drag-drop";

import { LayerControlComponent } from "./layer-control/layer-control.component";

@Component({
  selector: "app-layers",
  imports: [CdkDropList, CdkDrag, CdkDragPlaceholder, LayerControlComponent],
  templateUrl: "./layers.component.html",
  styleUrl: "./layers.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayersComponent {
  private readonly mapService = inject(MapService);

  private get map() {
    return this.mapService.mapInstance;
  }

  protected get layers(): string[] {
    return this.map
      .getStyle()
      .layers.filter(
        (layer) => (layer.metadata as Record<string, any> | undefined)?.["legend"],
      )
      .map((layer) => layer.id)
      .reverse();
  }

  protected moveLayer(event: CdkDragDrop<string[], string>) {
    const layers = this.layers;
    moveItemInArray(layers, event.previousIndex, event.currentIndex);
    const movedLayer = event.item.data;
    const beforeLayer = layers[event.currentIndex - 1] ?? "selected_car";

    this.map.moveLayer(movedLayer, beforeLayer);
  }
}
