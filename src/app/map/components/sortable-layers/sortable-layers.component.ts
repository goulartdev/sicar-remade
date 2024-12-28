import {
  ChangeDetectionStrategy,
  Component,
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

  public layers = input.required<string[]>();

  protected moveLayer(event: CdkDragDrop<string[], string>) {
    const layers = this.layers();
    moveItemInArray(layers, event.previousIndex, event.currentIndex);
    const movedLayer = event.item.data;
    const beforeLayer = layers[event.currentIndex - 1] ?? "selected_car";

    this.mapService.map.moveLayer(movedLayer, beforeLayer);
  }
}
