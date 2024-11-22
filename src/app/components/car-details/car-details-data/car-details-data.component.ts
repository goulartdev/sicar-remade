import { DatePipe, DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { TuiExpand, TuiIcon } from "@taiga-ui/core";
import { TuiAccordion, TuiChevron } from "@taiga-ui/kit";

import { CARData } from "@core/models/car";
import { FormatDegreesPipe } from "src/app/pipes/format-degrees.pipe";

@Component({
  selector: "app-car-details-data",
  imports: [
    DecimalPipe,
    DatePipe,
    TuiExpand,
    TuiChevron,
    TuiIcon,
    TuiAccordion,
    FormatDegreesPipe,
  ],
  templateUrl: "./car-details-data.component.html",
  styleUrl: "./car-details-data.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarDetailsDataComponent {
  public car = input.required<CARData>();

  protected expanded = {
    property: true,
    soil: true,
    legalReserve: true,
    app: true,
    restricted: true,
    regularity: true,
  };
}
