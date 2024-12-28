import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  TemplateRef,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  CdkDragPlaceholder,
  moveItemInArray,
} from "@angular/cdk/drag-drop";

import { MapService } from "@map/map.service";

@Component({
  selector: "app-sortable-layers",
  imports: [CdkDropList, CdkDrag, CdkDragPlaceholder, NgTemplateOutlet],
  templateUrl: "./sortable-layers.component.html",
  styleUrl: "./sortable-layers.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableLayersComponent {
  private readonly mapService = inject(MapService);
  protected readonly layersTemplate = contentChild<TemplateRef<any>>(TemplateRef);

  public layers = input.required<string[], string[]>({
    transform: (value: string[]) => value.reverse(),
  });

  private readonly topLayer = computed(() => {
    const mapLayers = this.mapService.getLayers().map((layer) => layer.id);
    const index = mapLayers.indexOf(this.layers()[0]);
    return mapLayers[index + 1];
  });

  protected moveLayer(event: CdkDragDrop<string[], string>) {
    const layers = this.layers();
    moveItemInArray(layers, event.previousIndex, event.currentIndex);
    const movedLayer = event.item.data;
    const beforeLayer = layers[event.currentIndex - 1] ?? this.topLayer();

    this.mapService.map.moveLayer(movedLayer, beforeLayer);
  }
}
