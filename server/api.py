import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import duckdb

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/imoveis")
async def list_at(lng: float | None, lat: float | None):
    con = duckdb.connect()
    con.install_extension("spatial")
    con.load_extension("spatial")

    results = con.execute(
        """
        WITH imoveis AS (
            SELECT geometry, cod_imovel, ind_status, geometry_bbox
            FROM './data/area_imovel/**/*.parquet'
            WHERE geometry_bbox.xmin <= $1
              AND geometry_bbox.xmax >= $1
              AND geometry_bbox.ymin <= $2
              AND geometry_bbox.ymax >= $2
        )
        SELECT ST_AsGeoJSON(geometry), cod_imovel, ind_status, geometry_bbox
        FROM imoveis
        WHERE ST_Intersects(geometry, ST_Point($1, $2))
    """,
        [lng, lat],
    ).fetchall()

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": json.loads(row[0]),
                "bbox": [
                    row[3]["xmin"],
                    row[3]["ymin"],
                    row[3]["xmax"],
                    row[3]["ymax"],
                ],
                "properties": {
                    "cod_imovel": row[1],
                    "ind_status": row[2],
                },
            }
            for row in results
        ],
    }


@app.get("/imoveis/{cod_imovel}")
async def get_area_imovel_details(cod_imovel: str):
    con = duckdb.connect()
    con.install_extension("spatial")
    con.load_extension("spatial")

    uf = cod_imovel[0:2]

    results = con.execute(
        """
        SELECT
            ST_AsGeoJSON(geometry),
            geometry_bbox,
            num_area,
            mod_fiscal,
            ind_status,
            ind_tipo,
            des_condic,
            municipio,
            cod_estado
        FROM read_parquet($1, hive_partitioning=true)
        WHERE UF = $2 AND cod_imovel = $3
    """,
        ["./data/area_imovel/**/*.parquet", uf, cod_imovel],
    ).fetchall()

    row = results[0]

    return {
        "type": "Feature",
        "geometry": json.loads(row[0]),
        "bbox": [
            row[1]["xmin"],
            row[1]["ymin"],
            row[1]["xmax"],
            row[1]["ymax"],
        ],
        "properties": {
            "cod_imovel": cod_imovel,
            "num_area": row[2],
            "mod_fiscal": row[3],
            "ind_status": row[4],
            "ind_tipo": row[5],
            "des_condic": row[6],
            "municipio": row[7],
            "cod_estado": row[8],
        },
    }


@app.get("/imoveis/{cod_imovel}/{dataset}")
async def get_details(cod_imovel: str, dataset: str):
    con = duckdb.connect()
    con.install_extension("spatial")
    con.load_extension("spatial")

    uf = cod_imovel[0:2]

    results = con.execute(
        """
        SELECT ST_AsGeoJSON(geometry), num_area
        FROM read_parquet($1, hive_partitioning=true)
        WHERE UF = $2 AND cod_imovel = $3
    """,
        [f"./data/{dataset}/**/*.parquet", uf, cod_imovel],
    ).fetchall()

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": json.loads(row[0]),
                "properties": {"cod_imovel": cod_imovel, "num_area": row[1]},
            }
            for row in results
        ],
    }
