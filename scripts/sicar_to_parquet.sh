(
  set -euo pipefail
  datasets=(
    # "AREA_IMOVEL"
    "APPS"
    # "VEGETACAO_NATIVA"
    # "AREA_CONSOLIDADA"
    # "AREA_POUSIO"
    # "HIDROGRAFIA"
    # "USO_RESTRITO"
    # "SERVIDAO_ADMINISTRATIVA"
    # "RESERVA_LEGAL"
  )

  for ds in "${datasets[@]}"; do
    for file in ./data/$ds/*.zip; do
      output="${file%.zip}.gpkg"

      if [ ! -e "$output" ]; then
        echo "Convertendo $ds/$(basename "$file") para GPKG"
        # I get a decimal parse error when trying to convert directly to Parquet.
        # I'm pretty sure the problem is in the original data, but couldn't find
        # another way to solve than converting do gpkg first
        #
        # The -spat filters some wrong data outside Brazil's extent
        ogr2ogr -of GPKG \
          -nln "$ds" \
          -nlt MULTIPOLYGON \
          -t_srs EPSG:4326 \
          -spat -33.43 6.67 -74.40 -34.79 \
          "$output" "/vsizip/$file"
      fi
    done

    output="./data/${ds}.parquet"

    if [ ! -e "$output" ]; then
      echo "Convertendo de GPKG para Parquet"
      ogrmerge -f Parquet \
        -single \
        -nln "$ds" \
        -lco GEOMETRY_ENCODING=GEOARROW \
        -lco EDGES=SPHERICAL \
        -lco WRITE_COVERING_BBOX=NO \
        -lco SORT_BY_BBOX=NO \
        -lco COMPRESSION=GZIP \
        -lco FID=fid \
        -progress \
        -o "$output" "./data/$ds/*.gpkg"

      rm ./data/$ds/*.gpkg
    fi
  done
)
