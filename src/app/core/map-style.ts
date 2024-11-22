import { StyleSpecification } from "maplibre-gl";

import { CARStatus } from "./models/car";

export interface StatusStyle {
  value: CARStatus;
  label: string;
  color: string;
}

const CARStatusStyle: Record<CARStatus, StatusStyle> = {
  AT: { value: "AT", label: "Ativo", color: "#4567ff" },
  PE: { value: "PE", label: "Pendente", color: "#ffc533" },
  SU: { value: "SU", label: "Suspenso", color: "#e0351b" },
  CA: { value: "CA", label: "Cancelado", color: "#7d7d7d" },
};

const style: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
    area_imovel: {
      type: "vector",
      url: "pmtiles://http://localhost:9000/sicar/AREA_IMOVEL_2.pmtiles",
    },
    administrative: {
      type: "vector",
      url: "pmtiles://http://localhost:9000/sicar/administrative.pmtiles",
    },
    selected_car: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    },
  },
  layers: [
    {
      id: "satellite",
      source: "satellite",
      type: "raster",
      layout: {
        visibility: "visible",
      },
    },
    {
      id: "area_imovel",
      source: "area_imovel",
      "source-layer": "AREA_IMOVEL",
      type: "fill",
      layout: {
        visibility: "visible",
      },
      paint: {
        "fill-color": [
          "match",
          ["get", "ind_status"],
          "AT",
          CARStatusStyle["AT"].color,
          "PE",
          CARStatusStyle["PE"].color,
          "SU",
          CARStatusStyle["SU"].color,
          "CA",
          CARStatusStyle["CA"].color,
          "#000000",
        ],
        "fill-outline-color": "#000000",
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.85,
          0.5,
        ],
      },
      filter: ["in", ["get", "ind_status"], ["literal", ["AT"]]],
      metadata: {
        legend: {
          label: "Imóveis",
          filterAttribute: "ind_status",
          expanded: true,
          categories: [
            { ...CARStatusStyle["AT"], visible: true },
            { ...CARStatusStyle["PE"], visible: false },
            { ...CARStatusStyle["SU"], visible: false },
            { ...CARStatusStyle["CA"], visible: false },
          ],
        },
        enableHoverStyle: true,
      },
    },
    {
      id: "administrative",
      source: "administrative",
      "source-layer": "administrative",
      type: "line",
      layout: {
        visibility: "visible",
      },
      paint: {
        "line-color": "#d3650a",
        "line-width": ["step", ["zoom"], 1, 5, 2],
      },
      metadata: {
        legend: {
          label: "Limites Administrativos",
          color: "#d3650a",
        },
      },
    },
    {
      id: "selected_car",
      source: "selected_car",
      type: "line",
      layout: {
        visibility: "visible",
      },
      paint: {
        "line-color": "#FF0000",
        "line-width": 2,
      },
    },
  ],
};

export { CARStatusStyle };
export default style;
