(
  set -euo pipefail

  car_number="$0"
  cookies="./cookies"
  opts=(-L -c "$cookies" -b "$cookies" --fail-with-body)
  output_path='./data/car_sample'

  curl $opts -s -o /dev/null -X GET 'https://consultapublica.car.gov.br/publico/imoveis/index'

  search_url='https://consultapublica.car.gov.br/publico/imoveis/search?text=%s'
  export_url='https://consultapublica.car.gov.br/publico/imoveis/exportShapeFile?idImovel=%s&captcha=%s'

  printf "Baixando captcha para %s...\n" "$uf"
  curl $opts -s -o captcha.png -X GET 'https://consultapublica.car.gov.br/publico/municipios/captcha?id=1'

  ok=0

  while [ $ok -eq 0 ]; do
    printf "Abra o arquivo captcha.png e informe o captcha: "
    read -r captcha

    printf "Baixando área do imóvel...\n"

    curl $opts --progress-bar -o "$output" -X GET "$(printf $download_url $uf $ds $captcha)"

    output_size=$(wc -c < "$output")

    if [ "$output_size" -lt 1000 ]; then
      printf "Captcha incorreto\n"
      rm "$output"
    else
      ok=1
    fi
  done

  printf "Arquivo salvo em %s\n\n" "$output"

  rm captcha.png $cookies
)
