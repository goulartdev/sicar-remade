import { inject, Injectable, signal, WritableSignal } from "@angular/core";

import { CAR } from "@core/models/car";
import { MapService } from "@map/map.service";

type Widget = "layers_control" | "stac_search";

interface AppState {
  CAR: WritableSignal<CAR | null>;
  widgets: WritableSignal<Widget[]>;
}

@Injectable()
export class AppService {
  private state: AppState = {
    CAR: signal<CAR | null>(null),
    widgets: signal<Widget[]>([]),
  };

  private mapService = inject(MapService);

  public readonly CAR = this.state.CAR.asReadonly();
  public readonly widgets = this.state.widgets.asReadonly();

  public setCAR(CAR: CAR) {
    this.state.CAR.set(CAR);
    this.mapService.updateViewPadding({
      left: 480,
    });
  }

  public clearCAR() {
    this.state.CAR.set(null);
    this.mapService.updateViewPadding({
      left: 0,
    });
  }

  public addWidget(widget: Widget) {
    const widgets = this.state.widgets();

    if (widgets.includes(widget)) {
      return;
    }

    this.state.widgets.set([...widgets, widget]);
  }

  public removeWidget(widget: Widget) {
    const widgets = this.state.widgets().filter((other) => other !== widget);
    this.state.widgets.set(widgets);
  }
}
