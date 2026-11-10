"""Atualização automática do site DYOLIVEIRAYT (roda a cada 2 dias).

Busca no YouTube, sem chave de API:
  - os vídeos mais recentes do canal (feed RSS público), separando os Shorts;
  - o número de inscritos e o total de vídeos (página pública do canal);
  - os produtos da vitrine de afiliado da Shopee, com link, foto e preço;
  - onde cada vídeo novo foi gravado (📍 na descrição ou "em <Lugar>" no título), para o mapa.

Grava tudo em js/auto.js, que o site lê por cima do js/config.js.
Se alguma busca falhar, mantém o valor da atualização anterior.

Uso: python3 scripts/atualizar.py
"""
import html
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone

CHANNEL_ID = "UCo5GGyce2Z4DC0usGcQ3qkA"
HANDLE = "dyoliveirayt"
VITRINE_SHOPEE = "dyoliveirayt"  # collshp.com/dyoliveirayt
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, "js", "auto.js")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
BRT = timezone(timedelta(hours=-3))


class SemRedirecionar(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def baixar(url, seguir=True):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept-Language": "pt-BR,pt;q=0.9",
        "Cookie": "CONSENT=YES+1; SOCS=CAI",
    })
    abridor = urllib.request.build_opener() if seguir else urllib.request.build_opener(SemRedirecionar)
    with abridor.open(req, timeout=30) as r:
        return r.status, r.read().decode("utf-8", "replace")


def anterior():
    """Lê o js/auto.js atual para manter valores se uma busca falhar."""
    try:
        with open(DESTINO, encoding="utf-8") as f:
            texto = f.read()
        return json.loads(texto[texto.index("{"): texto.rindex("}") + 1])
    except (OSError, ValueError):
        return {}


def eh_short(video_id):
    """Shorts respondem 200 em /shorts/ID; vídeos normais redirecionam para /watch."""
    try:
        status, _ = baixar("https://www.youtube.com/shorts/" + video_id, seguir=False)
        return status == 200
    except urllib.error.HTTPError as e:
        return e.code == 200
    except Exception:
        return None


DESCRICOES = {}  # id -> descrição (usada só para descobrir onde o vídeo foi gravado)


def videos_do_feed():
    _, xml = baixar("https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL_ID)
    lista, shorts = [], []
    for entrada in re.findall(r"<entry>(.*?)</entry>", xml, re.S):
        vid = re.search(r"<yt:videoId>(.*?)</yt:videoId>", entrada).group(1)
        titulo = html.unescape(re.search(r"<title>(.*?)</title>", entrada, re.S).group(1)).strip()
        data = re.search(r"<published>(.*?)</published>", entrada).group(1)[:10]
        views = re.search(r'views="(\d+)"', entrada)
        desc = re.search(r"<media:description>(.*?)</media:description>", entrada, re.S)
        DESCRICOES[vid] = html.unescape(desc.group(1)) if desc else ""
        short = eh_short(vid)
        if short is None:  # sem resposta: usa as hashtags do título como pista
            short = titulo.count("#") >= 2
        item = {"id": vid, "titulo": titulo, "data": data, "views": int(views.group(1)) if views else None}
        (shorts if short else lista).append(item)
    return lista, shorts


def numero_br(texto):
    """'8,65 mil' -> 8650 · '1,2 mi' -> 1200000 · '832' -> 832."""
    m = re.search(r"([\d.,]+)\s*(mil|mi|milhão|milhões|K|M)?", texto, re.I)
    if not m:
        return None
    num, mult = m.group(1), (m.group(2) or "").lower()
    if mult:
        valor = float(num.replace(".", "").replace(",", "."))
        return round(valor * (1000 if mult in ("mil", "k") else 1_000_000))
    return int(num.replace(".", "").replace(",", ""))


def estatisticas():
    _, pagina = baixar("https://www.youtube.com/@%s/videos" % HANDLE)
    inscritos = re.search(r'"content":"([\d.,]+\s*(?:mil|mi|milhão|milhões)?)\s*inscritos?"', pagina)
    videos = re.search(r'"content":"([\d.,]+)\s*vídeos?"', pagina)
    return (numero_br(inscritos.group(1)) if inscritos else None,
            numero_br(videos.group(1)) if videos else None)


# ---------------------------------------------------------------------------
# MAPA AUTOMÁTICO: descobre onde cada vídeo novo foi gravado e marca no mapa.
#  1º) uma linha na descrição começando com 📍  (ex.: "📍 Parque Barigui, Curitiba - PR")
#  2º) se não tiver, procura "em/no/na <Lugar>" no título e na descrição (ex.: "... em Itapoá")
# O lugar é localizado no OpenStreetMap (Nominatim, gratuito, sem chave).
# ---------------------------------------------------------------------------
UA_MAPA = "DYOLIVEIRAYT-site/1.0 (+https://dioneioliveira.github.io)"
UF = {"Acre": "AC", "Alagoas": "AL", "Amapá": "AP", "Amazonas": "AM", "Bahia": "BA", "Ceará": "CE", "Distrito Federal": "DF",
      "Espírito Santo": "ES", "Goiás": "GO", "Maranhão": "MA", "Mato Grosso": "MT", "Mato Grosso do Sul": "MS", "Minas Gerais": "MG",
      "Pará": "PA", "Paraíba": "PB", "Paraná": "PR", "Pernambuco": "PE", "Piauí": "PI", "Rio de Janeiro": "RJ", "Rio Grande do Norte": "RN",
      "Rio Grande do Sul": "RS", "Rondônia": "RO", "Roraima": "RR", "Santa Catarina": "SC", "São Paulo": "SP", "Sergipe": "SE", "Tocantins": "TO"}
NAO_E_LUGAR = {"velocross", "motocross", "minha", "primeira", "meia", "maratona", "pódio", "podio", "rumo", "canal", "temporada", "família",
               "familia", "youtube", "shorts", "gate", "moto", "bike", "brasil", "casa", "pista", "trilha", "largada", "corrida", "desafio", "live", "vídeo", "video", "dyoliveirayt", "série", "serie"}
PALAVRA = r"[A-ZÀ-Ý][\wÀ-ÿ'’-]+"
RE_LUGAR = re.compile(r"\b(?:em|no|na)\s+((?:%s)(?:\s+(?:do|da|de|dos|das)\s+%s|\s+%s){0,3})(?:\s*(?:\(|/|,|-)\s*([A-Z]{2})\b)?" % (PALAVRA, PALAVRA, PALAVRA))


def tipo_do_video(titulo, descricao=""):
    """O título manda; a descrição só decide se o título não disser nada."""
    for texto in (titulo, descricao):
        t = _tipo(texto)
        if t:
            return t
    return "passeio"


def _tipo(texto):
    t = texto.lower() + " "
    for tipo, chaves in (("corrida", ("corrida de rua", "maratona", "running", "21km", "21 km", "10km", "5km", "pace")), ("velocross", ("velocross", "motocross", "moto ", "minimoto", "trilha de moto")), ("camping", ("camping", "acampa", "barraca")),
                         ("cachoeira", ("cachoeira",)), ("trilha", ("trilha",))):
        if any(c in t for c in chaves):
            return tipo
    return None


def candidatos_de_local(titulo, descricao):
    for linha in descricao.splitlines():
        if linha.strip().startswith("📍"):
            yield linha.strip().lstrip("📍").strip(" :-")
            return
    for texto in (titulo, descricao):
        for m in RE_LUGAR.finditer(texto):
            nome = m.group(1).strip()
            if nome.split()[0].lower() in NAO_E_LUGAR or nome.lower() in NAO_E_LUGAR or nome.isupper():
                continue
            yield nome + (", " + m.group(2) if m.group(2) else "")


def geocodificar(consulta, cache):
    if consulta in cache:
        return cache[consulta]
    import time
    time.sleep(1.1)  # regra de uso do Nominatim: no máximo 1 pedido por segundo
    url = ("https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=br&accept-language=pt-BR&q="
           + urllib.parse.quote(consulta))
    req = urllib.request.Request(url, headers={"User-Agent": UA_MAPA})
    with urllib.request.urlopen(req, timeout=30) as r:
        res = json.loads(r.read())
    achado = None
    if res:
        x = res[0]
        ok = x.get("category") in ("place", "leisure", "natural", "tourism", "waterway") or \
            (x.get("category") == "boundary" and x.get("addresstype") in ("city", "town", "village", "municipality"))
        if ok:
            a = x.get("address", {})
            cidade = a.get("city") or a.get("town") or a.get("village") or a.get("municipality") or ""
            uf = UF.get(a.get("state", ""), "")
            achado = {"nome": x.get("name") or consulta.split(",")[0], "lat": round(float(x["lat"]), 5), "lng": round(float(x["lon"]), 5),
                      "local": ", ".join(v for v in (cidade if cidade != x.get("name") else "", uf) if v) or uf}
    cache[consulta] = achado
    return achado


def distancia_km(a, b):
    import math
    dy = (a["lat"] - b["lat"]) * 111.0
    dx = (a["lng"] - b["lng"]) * 111.0 * math.cos(math.radians(a["lat"]))
    return (dx * dx + dy * dy) ** 0.5


def atualizar_mapa(dados, videos):
    mapa = list(dados.get("mapa") or [])
    vistos = set(dados.get("mapaVistos") or [])
    cache = dict(dados.get("mapaCache") or {})
    novos = []
    for v in videos:
        if v["id"] in vistos:
            continue
        vistos.add(v["id"])
        desc = DESCRICOES.get(v["id"], "")
        for consulta in candidatos_de_local(v["titulo"], desc):
            try:
                lugar = geocodificar(consulta, cache)
            except Exception as e:  # noqa: BLE001
                print("AVISO: não achei", consulta, "-", e, file=sys.stderr)
                vistos.discard(v["id"])  # tenta de novo na próxima atualização
                break
            if not lugar:
                continue
            perto = next((m for m in mapa if distancia_km(m, lugar) < 3), None)
            if perto:
                if v["id"] not in perto["videos"]:
                    perto["videos"].insert(0, v["id"])
            else:
                mapa.append({**lugar, "tipo": tipo_do_video(v["titulo"], desc),
                             "texto": "Gravado aqui: " + v["titulo"], "videos": [v["id"]], "auto": True})
            novos.append(lugar["nome"])
            break
    dados["mapa"] = mapa
    dados["mapaVistos"] = sorted(vistos)[-300:]
    dados["mapaCache"] = dict(list(cache.items())[-200:])
    return novos


QUERY_VITRINE = (
    "query StorefrontProductListQuery($urlSuffix: String, $page: LinktreelandingpagePaginationInput, "
    "$sortType: SortType, $cid: String, $language: String, $uuId: String, $deviceId: String) { "
    "storefrontProductList(urlSuffix: $urlSuffix, page: $page, sortType: $sortType, cid: $cid, "
    "language: $language, uuId: $uuId, deviceId: $deviceId) { "
    "itemList { linkId link linkName image linkType itemId itemCard } "
    "pagination { offset limit hasMore totalCount } } }"
)


def vitrine_shopee():
    """Produtos da vitrine de afiliado (sem repetidos e sem esgotados)."""
    itens, vistos, offset = [], set(), 0
    while True:
        corpo = json.dumps({
            "operationName": "StorefrontProductListQuery",
            "query": QUERY_VITRINE,
            "variables": {
                "urlSuffix": VITRINE_SHOPEE, "cid": "br", "language": "pt-BR",
                "page": {"offset": str(offset), "limit": "50"}, "sortType": "ITEM_CREATE_LATEST",
                "uuId": str(uuid.uuid4()), "deviceId": uuid.uuid4().hex.upper(),
            },
        }).encode()
        req = urllib.request.Request(
            "https://collshp.com/api/v3/gql/graphql?q=StorefrontProductListQuery", data=corpo,
            headers={"content-type": "application/json;charset=UTF-8", "accept": "application/json",
                     "referer": "https://collshp.com/%s?view=storefront" % VITRINE_SHOPEE, "user-agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            resposta = json.loads(r.read())
        if resposta.get("errors"):
            raise RuntimeError(resposta["errors"][0].get("message"))
        lista = resposta["data"]["storefrontProductList"]
        for it in lista.get("itemList") or []:
            card = it.get("itemCard") or {}
            dado = card.get("itemData") or {}
            chave = it.get("itemId") or it.get("link")
            if chave in vistos or dado.get("isSoldOut") or dado.get("itemStatus") not in (None, "normal"):
                continue
            if not str(it.get("link", "")).startswith("https://"):
                continue
            vistos.add(chave)
            preco = (dado.get("itemCardDisplayPrice") or {})
            imagem = re.sub(r"\.\w+$", "", (it.get("image") or "").rsplit("/", 1)[-1])
            itens.append({
                "id": str(it.get("itemId") or ""),
                "nome": (it.get("linkName") or "").strip(),
                "link": it["link"],
                "imagem": "https://down-br.img.susercontent.com/file/%s_tn" % imagem if imagem else "",
                "preco": round(int(preco.get("price") or 0) / 100000, 2) or None,
                "precoOriginal": round(int(preco.get("originalPrice") or 0) / 100000, 2) or None,
            })
        pag = lista.get("pagination") or {}
        if not pag.get("hasMore"):
            break
        offset += 50
    return itens


def main():
    antes = anterior()
    dados = dict(antes)
    agora = datetime.now(BRT)
    erros = []

    try:
        lista, shorts = videos_do_feed()
        if lista:
            dados["videos"] = lista
        if shorts:
            dados["shorts"] = shorts
    except Exception as e:  # noqa: BLE001
        erros.append("vídeos: %s" % e)
        lista, shorts = [], []

    try:
        novos = atualizar_mapa(dados, lista + shorts)
        if novos:
            print("Mapa: novos lugares/vídeos ->", ", ".join(novos))
    except Exception as e:  # noqa: BLE001
        erros.append("mapa: %s" % e)

    try:
        inscritos, total = estatisticas()
        if inscritos:
            dados["inscritos"] = inscritos
            dados["inscritosData"] = agora.strftime("%d/%m/%Y")
        if total:
            dados["videosPublicados"] = total
    except Exception as e:  # noqa: BLE001
        erros.append("estatísticas: %s" % e)

    try:
        produtos = vitrine_shopee()
        if produtos:
            dados["shopee"] = {"atualizado": agora.strftime("%d/%m/%Y"), "itens": produtos}
    except Exception as e:  # noqa: BLE001
        erros.append("vitrine Shopee: %s" % e)

    dados["atualizadoEm"] = agora.strftime("%Y-%m-%dT%H:%M:%S-03:00")

    conteudo = (
        "/* Gerado automaticamente por scripts/atualizar.py a cada 2 dias.\n"
        "   Não edite à mão: o conteúdo fixo do site fica em js/config.js. */\n"
        "window.AUTO = " + json.dumps(dados, ensure_ascii=False, indent=2) + ";\n"
    )
    with open(DESTINO, "w", encoding="utf-8") as f:
        f.write(conteudo)

    print("Inscritos:", dados.get("inscritos"), "| Vídeos publicados:", dados.get("videosPublicados"),
          "| Vídeos no feed (sem Shorts):", len(dados.get("videos", [])),
          "| Shorts:", len(dados.get("shorts", [])), "| Produtos na vitrine:", len((dados.get("shopee") or {}).get("itens", [])))
    for e in erros:
        print("AVISO:", e, file=sys.stderr)
    if erros and not antes and "videos" not in dados:
        sys.exit(1)


if __name__ == "__main__":
    main()
