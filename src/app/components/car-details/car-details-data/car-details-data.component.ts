import { DatePipe, DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { TuiExpand, TuiIcon } from "@taiga-ui/core";
import { TuiAccordion, TuiChevron } from "@taiga-ui/kit";

import { CARData } from "@core/models/car";
import { FormatDegreesPipe } from "src/app/pipes/format-degrees.pipe";

@Component({
  selector: "app-car-details-data",
  standalone: true,
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
  @Input({ required: true }) car!: CARData;

  protected expanded = {
    property: true,
    soil: true,
    legalReserve: true,
    app: true,
    restricted: true,
    regularity: true,
  };
}
