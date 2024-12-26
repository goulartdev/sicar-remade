import { BBox, Feature, FeatureCollection, MultiPolygon } from "geojson";
import { LngLatBoundsLike } from "maplibre-gl";

export type CARCode = `${string & { __brand: "\\w{2}-\\d{7}-[\\w\\d]{32}" }}`;

export const isCARNumber = (value: any): value is CARCode => {
  const regex = new RegExp(/^\w{2}-\d{7}-[\w\d]{32}$/);
  return typeof value === "string" && regex.test(value);
};

export type CARStatus = "AT" | "PE" | "SU" | "CA";

export interface CARData {
  cod_imovel: CARCode;
  mod_fiscal: number;
  num_area: number;
  ind_status: CARStatus;
  ind_tipo: string;
  des_condic: string;
  municipio: string;
  cod_estado: string;
  //centroide: Point;
  //data_inscricao: Date;
  //data_retificacao: Date;
  //veg_nat_remanescente: number;
  //area_rural_consolidada: number;
  //area_servidao_admin: number;
  //rl_situacao: string;
  //rl_averbada: number;
  //rl_aprovada_nao_averbada: number;
  //rl_proposta: number;
  //rl_passivo_excedente: number;
  //rl_a_recompor: number;
  //app_total: number;
  //app_area_consolidada: number;
  //app_remanescente_veg_nat: number;
  //app_a_recompor: number;
  //area_uso_restrito: number;
  //uso_restrito_a_recompor: number;
}

export type CAR = Feature<MultiPolygon, CARData> & {
  bbox: BBox & LngLatBoundsLike;
};

export type CARCollection = FeatureCollection<
  MultiPolygon,
  Pick<CARData, "cod_imovel" | "ind_status">
>;
