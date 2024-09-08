(
  set -euo pipefail

  datasets=(
    "AREA_IMOVEL"
    # "APPS"
    # "VEGETACAO_NATIVA"
    # "AREA_CONSOLIDADA"
    # "AREA_POUSIO"
    # "HIDROGRAFIA"
    # "USO_RESTRITO"
    # "SERVIDAO_ADMINISTRATIVA"
    # "RESERVA_LEGAL"
  )

  for ds in "${datasets[@]}"; do
    output="./data/$ds"

    if [ ! -e "$output.fgb" ]; then
      ogr2ogr -of FlatGeobuf -progress "$output.fgb" "$output.parquet"
    fi

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
  done
)
