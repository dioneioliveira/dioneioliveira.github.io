"""Atualização automática semanal do site DYOLIVEIRAYT.

Busca no YouTube, sem chave de API:
  - os vídeos mais recentes do canal (feed RSS público), sem os Shorts;
  - o número de inscritos e o total de vídeos (página pública do canal);
  - os produtos da vitrine de afiliado da Shopee, com link, foto e preço.

Grava tudo em js/auto.js, que o site lê por cima do js/config.js.
Se alguma busca falhar, mantém o valor da semana anterior.

Uso: python3 scripts/atualizar.py
"""
import html
import json
import os
import re
import sys
import urllib.error
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


def videos_do_feed():
    _, xml = baixar("https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL_ID)
    lista = []
    for entrada in re.findall(r"<entry>(.*?)</entry>", xml, re.S):
        vid = re.search(r"<yt:videoId>(.*?)</yt:videoId>", entrada).group(1)
        titulo = html.unescape(re.search(r"<title>(.*?)</title>", entrada, re.S).group(1)).strip()
        data = re.search(r"<published>(.*?)</published>", entrada).group(1)[:10]
        views = re.search(r'views="(\d+)"', entrada)
        short = eh_short(vid)
        if short is None:  # sem resposta: usa as hashtags do título como pista
            short = titulo.count("#") >= 2
        if short:
            continue
        lista.append({"id": vid, "titulo": titulo, "data": data, "views": int(views.group(1)) if views else None})
    return lista


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
        lista = videos_do_feed()
        if lista:
            dados["videos"] = lista
    except Exception as e:  # noqa: BLE001
        erros.append("vídeos: %s" % e)

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
        "/* Gerado automaticamente por scripts/atualizar.py toda semana.\n"
        "   Não edite à mão: o conteúdo fixo do site fica em js/config.js. */\n"
        "window.AUTO = " + json.dumps(dados, ensure_ascii=False, indent=2) + ";\n"
    )
    with open(DESTINO, "w", encoding="utf-8") as f:
        f.write(conteudo)

    print("Inscritos:", dados.get("inscritos"), "| Vídeos publicados:", dados.get("videosPublicados"),
          "| Vídeos no feed (sem Shorts):", len(dados.get("videos", [])),
          "| Produtos na vitrine:", len((dados.get("shopee") or {}).get("itens", [])))
    for e in erros:
        print("AVISO:", e, file=sys.stderr)
    if erros and not antes and "videos" not in dados:
        sys.exit(1)


if __name__ == "__main__":
    main()
