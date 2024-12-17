import { formatNumber } from "@angular/common";
import { inject, LOCALE_ID, Pipe, PipeTransform } from "@angular/core";

type LngLat = "lng" | "lat";

@Pipe({
  name: "formatDegrees",
  standalone: true,
  pure: true,
})
export class FormatDegreesPipe implements PipeTransform {
  private locale = inject(LOCALE_ID);

  private directions: Record<LngLat, [string, string]> = {
    lng: ["L", "O"],
    lat: ["N", "S"],
  };

  transform(degrees: number, lngLat: LngLat, digitsInfo?: string): string {
    const intDegrees = Math.floor(Math.abs(degrees));
    const minutes = (Math.abs(degrees) - intDegrees) * 60;
    const intMinutes = Math.floor(minutes);
    const seconds = (minutes - intMinutes) * 60;
    const strSeconds = formatNumber(seconds, this.locale, digitsInfo);

    const d = this.getDirections(lngLat)[+(degrees < 0)];

    return `${intDegrees}°${intMinutes}'${strSeconds}" ${d}`;
  }

  private getDirections(lngLat: LngLat): [string, string] {
    return this.directions[lngLat];
  }
}
