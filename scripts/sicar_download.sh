(
  set -euo pipefail

  UFs=(
    "AC"
    "AL"
    "AM"
    "AP"
    "BA"
    "CE"
    "DF"
    "ES"
    "GO"
    "MA"
    "MG"
    "MS"
    "MT"
    "PA"
    "PB"
    "PE"
    "PI"
    "PR"
    "RJ"
    "RN"
    "RO"
    "RR"
    "RS"
    "SC"
    "SE"
    "SP"
    "TO"
  )

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

  # obs: às vezes a conexão com o site é perdida e o download trava.
  # Isso parece acontecer mesmo baixando direto pelo sicar.
  # Se você perceber que o download travou, pare a execução do script e tente novamente

  cookies="./cookies"
  opts=(-L -c "$cookies" -b "$cookies" --fail-with-body)
  output_path='./data'

  curl $opts -s -o /dev/null -X GET 'https://consultapublica.car.gov.br/publico/imoveis/index'

  download_url='https://consultapublica.car.gov.br/publico/estados/downloadBase?idEstado=%s&tipoBase=%s&ReCaptcha=%s'

  for ds in "${datasets[@]}"; do
    mkdir -p "$output_path/${ds}"

    for uf in "${UFs[@]}"; do
      output="$output_path/$ds/$uf.zip"

      if [ ! -e "$output" ]; then
        ok=0

        printf "Baixando captcha para %s...\n" "$uf"
        curl $opts -s -o captcha.png -X GET 'https://consultapublica.car.gov.br/publico/municipios/ReCaptcha?id=1'

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
      fi
    done
  done

  rm captcha.png $cookies
)
