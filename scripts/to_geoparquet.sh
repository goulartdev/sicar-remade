(
  set -euo pipefail

  GDAL_NUM_THREADS=ALL_CPUS

  for ds in ./sicar/by_dataset/AREA_IMOVEL; do

    for uf in $ds/*.zip; do
      gpkg_output=${uf%.zip}.gpkg
      parquet_output=${uf%.zip}.parquet

      echo "$uf to gpkg"
      ogr2ogr -progress -of GPKG -nlt MULTIPOLYGON $gpkg_output /vsizip/$uf

      # echo "$gpkg_output to parquet"
      # ogr2ogr -progress -of parquet -dsco GEOMETRY_ENCODING=GEOARROW $parquet_output $gpkg_output
      #
      # rm $gpkg_output
    done

    # echo "merging $(basename $ds)"
    # ogrmerge.py -progress -f parquet -single -nln $(basename $ds) \
    #   -dsco WRITE_COVERING_BBOX=YES \
    #   -dsco GEOMETRY_ENCODING=GEOARROW \
    #   -dsco SORT_BY_BBOX=YES \
    #   -dsco EDGES=SPHERICAL \
    #   -o ${ds}_preprocess.parquet $ds/*.parquet

    # rm $ds/*.parquet
  done
)
