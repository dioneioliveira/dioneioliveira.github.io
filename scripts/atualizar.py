"""Atualização automática semanal do site DYOLIVEIRAYT.

Busca no YouTube, sem chave de API:
  - os vídeos mais recentes do canal (feed RSS público), sem os Shorts;
  - o número de inscritos e o total de vídeos (página pública do canal).

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
from datetime import datetime, timedelta, timezone

CHANNEL_ID = "UCo5GGyce2Z4DC0usGcQ3qkA"
HANDLE = "dyoliveirayt"
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

    dados["atualizadoEm"] = agora.strftime("%Y-%m-%dT%H:%M:%S-03:00")

    conteudo = (
        "/* Gerado automaticamente por scripts/atualizar.py toda semana.\n"
        "   Não edite à mão: o conteúdo fixo do site fica em js/config.js. */\n"
        "window.AUTO = " + json.dumps(dados, ensure_ascii=False, indent=2) + ";\n"
    )
    with open(DESTINO, "w", encoding="utf-8") as f:
        f.write(conteudo)

    print("Inscritos:", dados.get("inscritos"), "| Vídeos publicados:", dados.get("videosPublicados"),
          "| Vídeos no feed (sem Shorts):", len(dados.get("videos", [])))
    for e in erros:
        print("AVISO:", e, file=sys.stderr)
    if erros and not antes and "videos" not in dados:
        sys.exit(1)


if __name__ == "__main__":
    main()
