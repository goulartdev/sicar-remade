(
  set -euo pipefail

  datasets=(
    "APPS"
    "VEGETACAO_NATIVA"
    "AREA_CONSOLIDADA"
    "AREA_POUSIO"
    "HIDROGRAFIA"
    "USO_RESTRITO"
    "SERVIDAO_ADMINISTRATIVA"
    "RESERVA_LEGAL"
  )

  for ds in "${datasets[@]}"; do
    for file in ./data/raw/$ds/*.zip; do
      output="${file%.zip}.parquet"

      if [ ! -e "$output" ]; then
        echo "Converting $ds/$(basename "$file") to Parquet"

        duckdb -c "LOAD spatial; COPY(
          SELECT
            * EXCLUDE(geom, cod_imovel, ind_status, des_condic),
            ST_MakeValid(geom) AS geometry,
            substring(cod_imovel, 1, 2) AS UF
          FROM ST_Read('/vsizip/""$file""')
          WHERE ST_Intersects(geometry, ST_GeomFromText('POLYGON((-74.40 -34.79, -74.40 6.67, -33.43 6.67, -33.43 -34.79, -74.40 -34.79))'))
        ) TO '""$output""' (FORMAT PARQUET, COMPRESSION ZSTD)"

        rm "$file"
      fi
    done

    output=$(echo "./data/${ds}" | tr '[:upper:]' '[:lower:]')

    if [ ! -d "$output" ]; then
      echo "Partitioning"

      duckdb -c "LOAD spatial; COPY(
        SELECT *
        FROM './data/""$ds""/*.parquet'
        ORDER BY cod_imovel
      ) TO '""$output""' (
        FORMAT PARQUET,
        COMPRESSION ZSTD,
        PARTITION_BY UF,
        OVERWRITE_OR_IGNORE
      )"

      rm -rf "./data/$ds"
    fi
  done
)
