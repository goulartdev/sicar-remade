import { Pipe, PipeTransform } from "@angular/core";

import { CARStatusStyle, StatusStyle } from "@core/map-style";
import { CARStatus } from "@core/models/car";

@Pipe({
  name: "CARStatus",
  pure: true,
})
export class CARStatusPipe implements PipeTransform {
  transform(status: CARStatus): StatusStyle {
    return CARStatusStyle[status];
  }
}
