(
  set -euo pipefail

  ds="AREA_IMOVEL"
  output=$(echo "./data/${ds}" | tr '[:upper:]' '[:lower:]')

  if [ ! -d "$output" ]; then
    echo "Partitioning"

    duckdb -c "LOAD spatial; COPY(
      SELECT *,
        STRUCT_PACK(
            xmin := ST_XMin(ST_Envelope(geometry)),
            ymin := ST_YMin(ST_Envelope(geometry)),
            xmax := ST_XMax(ST_Envelope(geometry)),
            ymax := ST_YMax(ST_Envelope(geometry))
        ) AS geometry_bbox,
      FROM './data/""$ds""/*.parquet'
      ORDER BY geometry_bbox
    ) TO '""$output""' (
      FORMAT PARQUET,
      COMPRESSION ZSTD,
      PARTITION_BY UF,
      OVERWRITE_OR_IGNORE
    )"

    rm -rf "./data/$ds"
  fi

  if [ ! -e "$output.pmtiles" ]; then
    echo "Converting to FlatGeoBuf"

    if [ ! -e "$output.fgb" ]; then
      duckdb -c "LOAD spatial; COPY(
        SELECT geometry, ind_status, FROM '""$output""/**/*.parquet'
      ) TO '""$output"".fgb' WITH (FORMAT GDAL, DRIVER 'FlatGeoBuf')"
    fi

    echo "Generating PMTiles"

    tippecanoe -zg -o "${output}.pmtiles" \
      --no-feature-limit \
      --maximum-tile-bytes 1000000 \
      --drop-densest-as-needed \
      --hilbert \
      --order-largest-first \
      --include fid \
      --include ind_status \
      -l "$ds" "$output.fgb"

    rm "$output.fgb"
  fi
)
