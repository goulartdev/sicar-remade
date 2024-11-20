(
  set -euo pipefail

  opts=(-L --progress-bar --fail-with-body)
  output_path='./data'

  year='2022'
  ibge_url="https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_${year}/Brasil/BR/BR_%s_${year}.zip"

  uf_output="$output_path/uf"

  if [ ! -e "$uf_output.zip" ]; then
    echo "Baixando UF"
    curl $opts -o "$uf_output.zip" -X GET "$(printf $ibge_url 'UF')"
  fi

  echo "Processando UF"
  if [ ! -e "$uf_output.geojson" ]; then
    ogr2ogr -of GeoJSON -nlt MULTIPOLYGON -t_srs EPSG:4326 -progress "$uf_output.geojson" "/vsizip/$uf_output.zip"
  fi

  tippecanoe -z5 -o "$uf_output.pmtiles" --hilbert --include "NM_UF" -l "administrative" --force "$uf_output.geojson"

  rm "$uf_output.geojson"


  mun_output="$output_path/municipios"

  if [ ! -e "$mun_output.zip" ]; then
    echo "Baixando municípios"
    curl $opts -o "$mun_output.zip" -X GET "$(printf $ibge_url 'Municipios')"
  fi

  echo "Processando municípios"
  if [ ! -e "$mun_output.geojson" ]; then
    ogr2ogr -of GeoJSON -nlt MULTIPOLYGON -t_srs EPSG:4326 -progress "$mun_output.geojson" "/vsizip/$mun_output.zip"
  fi

  tippecanoe -zg -Z6 -o "$mun_output.pmtiles" --hilbert --include "NM_MUN" -l "administrative" --force "$mun_output.geojson"

  rm "$mun_output.geojson"

  tile-join -l "administrative" -o "$output_path/administrative.pmtiles" "$mun_output.pmtiles" --force "$uf_output.pmtiles"
)
