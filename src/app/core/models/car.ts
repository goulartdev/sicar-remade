import { LngLatBoundsLike } from "maplibre-gl";

export type CARCode = `${string & { __brand: "\\w{2}-\\d{7}-[\\w\\d]{32}" }}`;

export const isCARNumber = (text: string): text is CARCode => {
  const regex = new RegExp(/^\w{2}-\d{7}-[\w\d]{32}$/);
  return regex.test(text);
};

export interface CAR {
  type: "Feature";
  properties: {
    recibo: CARCode;
    modfiscais: number;
    tema: string;
    area: number;
    municipio: string;
    estado: string;
  };
  bbox: LngLatBoundsLike;
  geometry: GeoJSON.MultiPolygon;
}
