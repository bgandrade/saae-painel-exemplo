#!/usr/bin/env python3
"""Baixa a malha municipal de Angra dos Reis (IBGE) e gera assets/data/angra-geo.js.

O painel não faz nenhuma requisição de rede em tempo de execução: o contorno do
município vai embutido no bundle. Este script só precisa ser rodado de novo se o
IBGE publicar uma malha nova.

    python3 tools/fetch_malha.py
"""

import gzip
import json
import sys
import urllib.request
from pathlib import Path

COD_ANGRA = "3300100"
URL = (
    "https://servicodados.ibge.gov.br/api/v3/malhas/municipios/"
    f"{COD_ANGRA}?formato=application/vnd.geo+json&qualidade=maxima"
)
# 4 casas decimais ≈ 11 m no equador. Muito além do necessário para um mapa
# que enquadra um município inteiro numa tela.
CASAS = 4

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "assets" / "data" / "angra-geo.js"


def baixar() -> dict:
    print(f"baixando malha do IBGE ({COD_ANGRA})...", file=sys.stderr)
    req = urllib.request.Request(URL, headers={"Accept-Encoding": "gzip"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        bruto = resp.read()
    # O serviço responde gzip mesmo sem negociação; urllib não descomprime sozinho.
    if bruto[:2] == b"\x1f\x8b":
        bruto = gzip.decompress(bruto)
    return json.loads(bruto.decode("utf-8"))


def anel_para_pares(anel: list) -> list:
    """Arredonda e remove pontos consecutivos que colapsaram no arredondamento."""
    saida = []
    for lon, lat in anel:
        par = [round(lon, CASAS), round(lat, CASAS)]
        if not saida or saida[-1] != par:
            saida.append(par)
    # o GeoJSON fecha o anel repetindo o primeiro ponto; o SVG fecha sozinho
    if len(saida) > 1 and saida[0] == saida[-1]:
        saida.pop()
    return saida


def main() -> int:
    dados = baixar()
    geom = dados["features"][0]["geometry"]
    if geom["type"] != "MultiPolygon":
        print(f"geometria inesperada: {geom['type']}", file=sys.stderr)
        return 1

    # Só o anel externo de cada polígono. Angra não tem buracos relevantes, e
    # ilha dentro de lagoa não muda nada numa maquete.
    poligonos = [anel_para_pares(poly[0]) for poly in geom["coordinates"]]
    poligonos = [p for p in poligonos if len(p) >= 3]
    # Maior primeiro: [0] é o continente, [1] é a Ilha Grande. O renderizador
    # conta com essa ordem para desenhar as ilhas pequenas por cima.
    poligonos.sort(key=len, reverse=True)

    lons = [lon for p in poligonos for lon, _ in p]
    lats = [lat for p in poligonos for _, lat in p]
    bbox = {
        "minLon": round(min(lons), CASAS),
        "minLat": round(min(lats), CASAS),
        "maxLon": round(max(lons), CASAS),
        "maxLat": round(max(lats), CASAS),
    }

    total = sum(len(p) for p in poligonos)
    linhas = [
        "// GERADO POR tools/fetch_malha.py — NÃO EDITAR À MÃO.",
        f"// Fonte: IBGE, malha municipal {COD_ANGRA} (Angra dos Reis/RJ), qualidade máxima.",
        f"// {len(poligonos)} polígonos, {total} pontos, coordenadas [lon, lat] em graus.",
        "",
        "export const MUNICIPIO = Object.freeze({",
        f"  codigo: '{COD_ANGRA}',",
        "  nome: 'Angra dos Reis',",
        "  uf: 'RJ',",
        "  fonte: 'IBGE — malha municipal digital',",
        "});",
        "",
        f"export const BBOX = Object.freeze({json.dumps(bbox)});",
        "",
        "// Ordenados do maior para o menor: [0] continente, [1] Ilha Grande.",
        "export const POLIGONOS = [",
    ]
    for p in poligonos:
        linhas.append("  " + json.dumps(p, separators=(",", "")) + ",")
    linhas.append("];")
    linhas.append("")

    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text("\n".join(linhas), encoding="utf-8")
    kb = SAIDA.stat().st_size / 1024
    print(
        f"{SAIDA.relative_to(RAIZ)}: {len(poligonos)} polígonos, {total} pontos, {kb:.1f} KB",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
