(
  set -euo pipefail

  basedir="sicar"

  datasets=(
    "APPS"
    "AREA_CONSOLIDADA"
    "AREA_IMOVEL"
    "AREA_POUSIO"
    "HIDROGRAFIA"
    "RESERVA_LEGAL"
    "SERVIDAO_ADMINISTRATIVA"
    "USO_RESTRITO"
    "VEGETACAO_NATIVA"
  )

  for ds in $datasets; do
    mkdir -p "./${basedir}/by_dataset/${ds}"
  done

  for uf in ./${basedir}/by_uf/*; do
    for ds in $datasets; do
      mv "${uf}/${ds}.zip" "./${basedir}/by_dataset/${ds}/$(basename $uf).zip"
    done
  done
)
