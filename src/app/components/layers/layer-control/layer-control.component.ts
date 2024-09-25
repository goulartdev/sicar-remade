import { NgFor, NgIf } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MapService } from "@maplibre/ngx-maplibre-gl";
import { TuiExpand, TuiIcon, TuiLabel, TuiTitle } from "@taiga-ui/core";
import { TuiCheckbox, TuiChevron } from "@taiga-ui/kit";

type Category = {
  value: string | number;
  label: string;
  color: string;
  visible?: boolean;
};

type Legend = {
  label: string;
  color?: string;
  filterAttribute: string;
  expanded?: boolean;
  categories?: Category[];
};

@Component({
  selector: "app-layer-control",
  standalone: true,
  imports: [
    FormsModule,
    TuiCheckbox,
    TuiLabel,
    TuiTitle,
    TuiIcon,
    TuiExpand,
    TuiChevron,
    NgFor,
    NgIf,
  ],
  templateUrl: "./layer-control.component.html",
  styleUrl: "./layer-control.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayerControlComponent {
  private mapService = inject(MapService);

  @Input({ required: true }) layerId!: string;

  private get map() {
    return this.mapService.mapInstance;
  }

  private get layer() {
    return this.map.getLayer(this.layerId)!;
  }

  protected get legend(): Legend {
    return (this.layer.metadata as Record<string, any>)["legend"];
  }

  /*
   * Layer visibility
   */

  protected get visible(): boolean {
    return this.map.getLayoutProperty(this.layer.id, "visibility") === "visible";
  }

  protected set visible(visible: boolean) {
    const visibility = visible ? "visible" : "none";
    this.map.setLayoutProperty(this.layer.id, "visibility", visibility);
  }

  /*
   * Categories
   */

  protected get hasCategories(): boolean {
    const classes = this.legend.categories;
    return Array.isArray(classes) && classes.length > 0;
  }

  protected get categories(): Category[] {
    return this.hasCategories ? this.legend.categories! : [];
  }

  /*
   * Categories: expand
   */

  protected get expanded(): boolean {
    return this.legend.expanded ?? false;
  }

  protected set expanded(expanded: boolean) {
    this.legend.expanded = expanded;
  }

  protected toggleExpanded() {
    this.expanded = !this.expanded;
  }

  /*
   * Categories: filter
   */

  protected filterCategory(category: Category, visible: boolean) {
    category.visible = visible;

    const visibleCategories = this.categories
      .filter((category) => category.visible ?? true)
      .map((category) => category.value);

    this.map.setFilter(this.layer.id, [
      "in",
      ["get", this.legend.filterAttribute],
      ["literal", visibleCategories],
    ]);
  }
}
