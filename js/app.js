(function () {
  "use strict";

  var S = window.SITE || {};
  var C = S.canal || {};
  var T = S.temporada || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Utilidades                                                           */
  /* ------------------------------------------------------------------ */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function fmtInt(n) { return Math.round(n).toLocaleString("pt-BR"); }
  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso.length <= 10 ? iso + "T12:00:00" : iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "");
  }
  function fmtViews(n) {
    if (n == null) return "";
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".", ",") + " mi views";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(".", ",").replace(",0", "") + " mil views";
    return n + " views";
  }
  // Imagens: o pacote de visualização pode trocar os endereços por cópias embutidas.
  function asset(path) { return (window.ASSETS && window.ASSETS[path]) || path; }
  function thumbUrl(id) { return (window.THUMBS && window.THUMBS[id]) || "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; }
  function frameUrl(id, n) { return (window.THUMBS && window.THUMBS[id + "_" + n]) || "https://i.ytimg.com/vi/" + id + "/hq" + n + ".jpg"; }
  function watchUrl(id) { return "https://www.youtube.com/watch?v=" + encodeURIComponent(id); }
  function playlistUrl(id) { return "https://www.youtube.com/playlist?list=" + encodeURIComponent(id); }

  var videos = (S.videos || []).slice();

  // Dados da atualização automática semanal (js/auto.js) por cima do config.js
  var AUTO = window.AUTO || {};
  if (AUTO.inscritos) { C.inscritos = AUTO.inscritos; C.inscritosData = AUTO.inscritosData || C.inscritosData; }
  if (AUTO.videosPublicados) C.videosPublicados = AUTO.videosPublicados;
  if (AUTO.videos && AUTO.videos.length) {
    var doConfig = {};
    videos.forEach(function (v) { doConfig[v.id] = v; });
    var recentes = AUTO.videos.map(function (a) {
      var base = doConfig[a.id];
      // Vídeo já cadastrado no config mantém título e categoria escolhidos; o resto vem do YouTube
      return base
        ? Object.assign({}, base, { data: a.data || base.data, views: a.views != null ? a.views : base.views })
        : { id: a.id, titulo: a.titulo, categoria: guessCategory(a.titulo), data: a.data, views: a.views };
    });
    var vistos = {};
    recentes.forEach(function (v) { vistos[v.id] = true; });
    videos = recentes.concat(videos.filter(function (v) { return !vistos[v.id]; }));
  }
  function findVideo(id) {
    for (var i = 0; i < videos.length; i++) if (videos[i].id === id) return videos[i];
    for (var j = 0; j < (S.videos || []).length; j++) if (S.videos[j].id === id) return S.videos[j];
    return { id: id, titulo: "Vídeo no YouTube", categoria: "" };
  }
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>';
  function thumbHTML(id, extra) {
    return '<div class="thumb">' + (extra || "") + '<img src="' + esc(thumbUrl(id)) + '" alt="" loading="lazy"></div>';
  }

  // No arquivo HTML único, as imagens da pasta assets vêm embutidas
  if (window.ASSETS) $all('img[src^="assets/"]').forEach(function (img) { img.src = asset(img.getAttribute("src")); });

  /* ------------------------------------------------------------------ */
  /* Textos do canal                                                       */
  /* ------------------------------------------------------------------ */
  var subUrl = (C.url || "https://www.youtube.com") + "?sub_confirmation=1";
  $("#subBtn").href = subUrl;
  $("#topSub").href = subUrl;
  $("#igBtn").href = C.instagram || "#";
  $("#igHandle").textContent = C.handle || "";
  $("#heroSub").textContent = C.descricao || "";
  $("#allVideos").href = (C.url || "") + "/videos";
  if (C.temas && C.temas.length) $("#heroKicker").innerHTML = C.temas.map(esc).join(" <i></i> ");
  $("#year").textContent = "© " + new Date().getFullYear() + " DYOLIVEIRAYT";

  /* ------------------------------------------------------------------ */
  /* Hero: paisagem em neon vermelho, brasas subindo e moto na serra       */
  /* ------------------------------------------------------------------ */
  var heroCanvas = $("#heroCanvas"), heroSection = $(".hero");
  var hero = (function () {
    var ctx = heroCanvas.getContext("2d");
    var W = 0, H = 0, running = false, visible = true, t0 = performance.now();
    function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
    var r = rng(20260706);
    function ridge(base, amp) {
      var w = [1, 2, 3, 5].map(function (k) { return { f: (0.8 + r()) * k * 6.283, p: r() * 6.283, a: amp / (k * 1.2) }; });
      return function (x) { var y = base; for (var i = 0; i < 4; i++) y += w[i].a * Math.sin(w[i].f * x + w[i].p); return y; };
    }
    var back = ridge(0.62, 0.08), mid = ridge(0.74, 0.05), front = ridge(0.9, 0.025);
    var pines = [];
    for (var i = 0; i < 22; i++) pines.push({ x: r(), s: 0.6 + r() * 0.7, layer: r() > 0.5 ? 1 : 0 });
    var embers = [];
    for (var e = 0; e < 70; e++) embers.push(newEmber(true));
    function newEmber(anywhere) {
      return { x: Math.random(), y: anywhere ? Math.random() : 1.02, v: 0.0006 + Math.random() * 0.0016, s: 0.6 + Math.random() * 2.2, w: Math.random() * 6.28, hot: Math.random() > 0.7 };
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = heroCanvas.clientWidth; H = heroCanvas.clientHeight;
      heroCanvas.width = Math.round(W * dpr); heroCanvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }
    function line(fn, fill, stroke, glow) {
      ctx.beginPath(); ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 5) ctx.lineTo(x, fn(x / W) * H);
      ctx.lineTo(W, H); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
      ctx.save(); ctx.shadowColor = "#FF1A1A"; ctx.shadowBlur = glow; ctx.strokeStyle = stroke; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var x2 = 0; x2 <= W; x2 += 5) { var y2 = fn(x2 / W) * H; if (x2 === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2); }
      ctx.stroke(); ctx.restore();
    }
    function pine(x, g, h, col) {
      ctx.save(); ctx.strokeStyle = col; ctx.shadowColor = "#FF1A1A"; ctx.shadowBlur = 8; ctx.lineWidth = 1.4; ctx.fillStyle = "#050505";
      ctx.beginPath();
      for (var k = 0; k < 3; k++) {
        var top = g - h + k * h * 0.25, wdt = h * (0.16 + k * 0.08);
        ctx.moveTo(x, top); ctx.lineTo(x + wdt, top + h * 0.38); ctx.lineTo(x - wdt, top + h * 0.38); ctx.closePath();
      }
      ctx.fill(); ctx.stroke(); ctx.restore();
    }
    function bike(x, y, s, ang) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.strokeStyle = "#FFFFFF"; ctx.shadowColor = "#FF1A1A"; ctx.shadowBlur = 14; ctx.lineWidth = Math.max(2, s * 0.09); ctx.lineCap = "round"; ctx.lineJoin = "round";
      var rr = s * 0.32;
      ctx.beginPath(); ctx.arc(-s * 0.62, -rr, rr, 0, 6.283); ctx.stroke();
      ctx.beginPath(); ctx.arc(s * 0.62, -rr, rr, 0, 6.283); ctx.stroke();
      ctx.strokeStyle = "#FF2A2A";
      ctx.beginPath();
      ctx.moveTo(-s * 0.62, -rr); ctx.lineTo(-s * 0.1, -s * 0.72); ctx.lineTo(s * 0.35, -s * 0.72); ctx.lineTo(s * 0.62, -rr);
      ctx.moveTo(-s * 0.1, -s * 0.72); ctx.lineTo(s * 0.08, -rr * 1.1); ctx.lineTo(s * 0.35, -s * 0.72);
      ctx.moveTo(s * 0.32, -s * 0.95); ctx.lineTo(s * 0.62, -rr);
      ctx.moveTo(-s * 0.05, -s * 0.78); ctx.lineTo(s * 0.05, -s * 1.22); ctx.lineTo(s * 0.32, -s * 0.98);
      ctx.stroke();
      ctx.fillStyle = "#FF2A2A"; ctx.beginPath(); ctx.arc(s * 0.1, -s * 1.38, s * 0.17, 0, 6.283); ctx.fill();
      ctx.restore();
    }

    function draw(t) {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      var bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#070707"); bg.addColorStop(0.55, "#120203"); bg.addColorStop(1, "#070707");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // sol vermelho, como no logo
      var sx = W * (W < 980 ? 0.5 : 0.74), sy = H * 0.6, sr = Math.min(W, H) * 0.22;
      var g = ctx.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 2.4);
      g.addColorStop(0, "rgba(225,6,19,.55)"); g.addColorStop(1, "rgba(225,6,19,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#8E020A"; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.283); ctx.fill();
      ctx.fillStyle = "rgba(7,7,7,.55)";
      for (var b = 0; b < 5; b++) ctx.fillRect(sx - sr, sy - sr * 0.1 + b * sr * 0.2, sr * 2, sr * 0.05 + b * 1.5);

      // cortes diagonais do banner
      ctx.save(); ctx.globalAlpha = 0.5;
      var sl = ctx.createLinearGradient(0, 0, W * 0.25, 0);
      sl.addColorStop(0, "rgba(225,6,19,.55)"); sl.addColorStop(1, "rgba(225,6,19,0)");
      ctx.fillStyle = sl;
      ctx.beginPath(); ctx.moveTo(0, H * 0.08); ctx.lineTo(W * 0.22, H * 0.02); ctx.lineTo(0, H * 0.3); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, H * 0.36); ctx.lineTo(W * 0.14, H * 0.3); ctx.lineTo(0, H * 0.46); ctx.closePath(); ctx.fill();
      ctx.restore();

      line(back, "#0A0A0A", "rgba(255,42,42,.55)", 8);
      pines.forEach(function (p) { if (p.layer === 0) pine(p.x * W, back(p.x) * H + 4, H * 0.1 * p.s, "rgba(255,42,42,.6)"); });
      line(mid, "#080808", "rgba(255,42,42,.8)", 12);
      pines.forEach(function (p) { if (p.layer === 1) pine(p.x * W, mid(p.x) * H + 4, H * 0.15 * p.s, "#FF2A2A"); });
      line(front, "#070707", "#FF2A2A", 16);

      // brasas subindo
      embers.forEach(function (em) {
        if (!reduceMotion) { em.y -= em.v; em.x += Math.sin(t * 0.001 + em.w) * 0.0004; }
        if (em.y < -0.02) Object.assign(em, newEmber(false));
        ctx.globalAlpha = Math.max(0, Math.min(1, em.y * 1.4));
        ctx.fillStyle = em.hot ? "#FFB347" : "#FF2A2A";
        ctx.shadowColor = "#FF2A2A"; ctx.shadowBlur = 6;
        ctx.fillRect(em.x * W, em.y * H, em.s, em.s);
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      // moto atravessando a serra com um salto
      var cycle = 9000, ride = 6000, bt = reduceMotion ? 2400 : (t - t0) % cycle;
      if (bt < ride) {
        var u = bt / ride, bx = -0.06 + u * 1.12;
        var fy = function (x) { return front(x) * H - 2; };
        var lift = 0, j0 = 0.32, j1 = 0.52;
        if (bx > j0 && bx < j1) lift = Math.sin((bx - j0) / (j1 - j0) * Math.PI) * H * 0.14;
        var slope = (fy(bx + 0.01) - fy(bx - 0.01)) / (0.02 * W);
        var ang = Math.atan(slope) + (lift ? -0.3 * Math.cos((bx - j0) / (j1 - j0) * Math.PI) : 0);
        var s = Math.min(46, Math.max(26, H * 0.06));
        if (!lift && !reduceMotion) {
          ctx.fillStyle = "rgba(255,90,60,.5)";
          for (var d = 0; d < 4; d++) { ctx.beginPath(); ctx.arc(bx * W - s * (0.9 + d * 0.3), fy(bx) - 3 - Math.random() * 8, 1.5 + Math.random() * 2, 0, 6.283); ctx.fill(); }
        }
        bike(bx * W, fy(bx) - lift, s, ang);
      }
    }
    function loop(t) { if (!running) return; draw(t); requestAnimationFrame(loop); }
    function start() { if (!running && visible && !reduceMotion) { running = true; requestAnimationFrame(loop); } }
    function stop() { running = false; }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); else stop(); }).observe(heroSection);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    return { resize: resize, start: start, jump: function () { t0 = performance.now(); } };
  })();
  var resizeT;
  window.addEventListener("resize", function () { clearTimeout(resizeT); resizeT = setTimeout(hero.resize, 150); });

  /* ------------------------------------------------------------------ */
  /* Contador de inscritos                                                 */
  /* ------------------------------------------------------------------ */
  var MILESTONES = [
    [1000, "1 mil"], [5000, "5 mil"], [10000, "10 mil"], [25000, "25 mil"], [50000, "50 mil"],
    [100000, "100 mil · Placa de Prata"], [250000, "250 mil"], [500000, "500 mil"], [1000000, "1 milhão · Placa de Ouro"]
  ];
  var odo = $("#odometer"), currentSubs = null;
  function renderOdometer(n) {
    var str = fmtInt(n), want = str.replace(/\d/g, "d");
    var shape = $all(".odo-digit, .odo-sep", odo).map(function (e) { return e.classList.contains("odo-sep") ? "." : "d"; }).join("");
    if (shape !== want) {
      odo.innerHTML = str.split("").map(function (ch) {
        if (!/\d/.test(ch)) return '<span class="odo-sep">' + ch + "</span>";
        var strip = ""; for (var d = 0; d <= 9; d++) strip += "<span>" + d + "</span>";
        return '<span class="odo-digit"><span class="odo-strip">' + strip + "</span></span>";
      }).join("");
      void odo.offsetHeight;
    }
    var digits = str.replace(/\D/g, "").split("");
    $all(".odo-strip", odo).forEach(function (s, i) { s.style.transform = "translateY(-" + (digits[i] * 1.05) + "em)"; });
    odo.setAttribute("aria-label", str + " inscritos");
  }
  function renderMilestone(n) {
    var from = 0, goal = MILESTONES[MILESTONES.length - 1];
    for (var i = 0; i < MILESTONES.length; i++) if (n < MILESTONES[i][0]) { goal = MILESTONES[i]; from = i ? MILESTONES[i - 1][0] : 0; break; }
    var pct = Math.max(0, Math.min(1, (n - from) / (goal[0] - from)));
    $("#msFrom").textContent = fmtInt(from);
    $("#msGoal").textContent = goal[1];
    $("#msFill").style.width = (pct * 100).toFixed(1) + "%";
    var left = goal[0] - n;
    $("#msNote").innerHTML = left > 0
      ? "Faltam <strong>" + fmtInt(left) + " inscritos</strong> para os " + esc(goal[1].split(" ·")[0]) + ". Bora acelerar essa meta!"
      : "Meta batida! Valeu, família.";
  }
  function setSubs(n, live) {
    var prev = currentSubs; currentSubs = n;
    renderOdometer(n); renderMilestone(n);
    var st = $("#counterStatus");
    st.textContent = live ? "ao vivo" : "registro de " + (C.inscritosData || "");
    st.classList.toggle("live", !!live);
    if (prev != null && live) MILESTONES.forEach(function (m) { if (prev < m[0] && n >= m[0]) confetti(); });
  }
  var hasApi = !!(C.apiKey && C.channelId);
  function fetchStats() {
    return fetch("https://www.googleapis.com/youtube/v3/channels?part=statistics&id=" + encodeURIComponent(C.channelId) + "&key=" + encodeURIComponent(C.apiKey))
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var it = j.items && j.items[0];
        if (!it || it.statistics.hiddenSubscriberCount) throw new Error("canal não encontrado ou contagem oculta");
        setSubs(Number(it.statistics.subscriberCount), true);
        var vc = $("#tileVideos"); if (vc) vc.textContent = fmtInt(Number(it.statistics.videoCount));
      });
  }
  renderOdometer(0);
  setTimeout(function () {
    if (hasApi) {
      fetchStats().catch(function (e) { console.warn("[contador] usando o último registro:", e.message); setSubs(C.inscritos || 0, false); });
      setInterval(function () { fetchStats().catch(function () {}); }, Math.max(30, C.atualizarACadaSegundos || 60) * 1000);
    } else setSubs(C.inscritos || 0, false);
  }, 300);
  $("#msFlag").addEventListener("click", function () { confetti(); });

  var pilots = (S.equipe || []).filter(function (m) { return m.numero; });
  $("#statTiles").innerHTML =
    '<div class="tile"><span class="label">Vídeos publicados</span><b id="tileVideos">' + fmtInt(C.videosPublicados || videos.length) + "</b></div>" +
    '<div class="tile"><span class="label">Playlists</span><b>' + (S.playlists || []).length + "</b></div>" +
    pilots.slice(0, 2).map(function (p) {
      return '<div class="tile tile-plate"><span class="label">Piloto</span><b>' + esc(p.numero) + '</b><span class="name">' + esc(p.nome) + "</span></div>";
    }).join("");

  /* ------------------------------------------------------------------ */
  /* Equipe                                                                */
  /* ------------------------------------------------------------------ */
  $("#crew").innerHTML = (S.equipe || []).map(function (m) {
    var initials = m.nome.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
    var avatar = m.foto
      ? '<span class="avatar"><img src="' + esc(asset(m.foto)) + '" alt="Foto de ' + esc(m.nome) + '" loading="lazy">' +
        (m.numero ? '<b class="avatar-num">' + esc(m.numero) + "</b>" : "") + "</span>"
      : m.numero ? '<span class="plate">' + esc(m.numero) + "</span>" : '<span class="plate initials">' + esc(initials) + "</span>";
    return '<article class="member">' + avatar + '<div class="member-txt"><h3>' + esc(m.nome) +
      (m.apelido ? ' <small>“' + esc(m.apelido) + "”</small>" : "") +
      "</h3><p>" + esc(m.papel) + "</p></div></article>";
  }).join("");

  /* ------------------------------------------------------------------ */
  /* Temporada: Rumo ao Pódio                                              */
  /* ------------------------------------------------------------------ */
  $("#seasonTitle").innerHTML = esc(T.titulo || "Rumo ao Pódio").replace(/(\S+)$/, "<em>$1</em>") +
    (T.subtitulo ? '<span style="display:block;font-size:.42em;color:var(--muted);margin-top:.4em">' + esc(T.subtitulo) + "</span>" : "");
  $("#seasonLead").textContent = T.descricao || "";
  if (T.destaque) {
    var dv = findVideo(T.destaque);
    $("#seasonFeature").outerHTML = '<button type="button" class="season-feature video" data-video="' + esc(dv.id) + '">' +
      thumbHTML(dv.id, '<span class="play" style="opacity:1;background:transparent"><span style="width:80px;height:56px;box-shadow:var(--glow)">' + PLAY + "</span></span>") +
      '<div class="meta"><span class="cat">Episódio em destaque</span><span>' + esc(fmtDate(dv.data)) + "</span></div><h3>" + esc(dv.titulo) + "</h3></button>";
  }
  var nx = T.proxima || {};
  var hasDate = nx.data && !isNaN(new Date(nx.data));
  $("#nextRace").innerHTML = '<span class="label" style="color:#FF8A8A">Próxima largada</span><h3>' + esc(nx.nome || "Próxima etapa") + "</h3>" +
    (hasDate
      ? "<p>" + esc(nx.local || "") + (nx.local ? " · " : "") + esc(new Date(nx.data).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })) + "</p>" +
        '<div class="countdown" id="countdown" role="timer">' + ["dias", "horas", "min", "seg"].map(function (u) { return '<div class="cd"><b data-u="' + u + '">00</b><span>' + u + "</span></div>"; }).join("") + "</div>"
      : "<p>Data a confirmar. Os avisos de corrida saem primeiro no Instagram " + esc(C.handle || "") + ".</p>") +
    (T.playlist ? '<a class="btn btn-ghost" style="justify-self:start" href="' + esc(playlistUrl(T.playlist)) + '" target="_blank" rel="noopener">Ver a playlist</a>' : "");
  if (hasDate) {
    var target = new Date(nx.data).getTime();
    var tick = function () {
      var diff = Math.max(0, target - Date.now());
      var parts = { dias: Math.floor(diff / 864e5), horas: Math.floor(diff / 36e5) % 24, min: Math.floor(diff / 6e4) % 60, seg: Math.floor(diff / 1e3) % 60 };
      $all("#countdown b").forEach(function (b) { var v = parts[b.dataset.u]; b.textContent = v < 10 ? "0" + v : v; });
    };
    tick(); setInterval(tick, 1000);
  }
  $("#partners").innerHTML = '<span class="label">Parceiros e pista</span><ul>' + (T.parceiros || []).map(function (p) {
    return "<li>" + (p.url ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.nome) + "</a>" : "<span>" + esc(p.nome) + "</span>") + "</li>";
  }).join("") + "</ul>";
  $("#timeline").innerHTML = (T.diario || []).map(function (id, i) {
    var v = findVideo(id);
    return '<li><button type="button" class="tl-btn" data-video="' + esc(id) + '"><span class="tl-n">#' + (i + 1 < 10 ? "0" : "") + (i + 1) +
      (v.data ? " · " + esc(fmtDate(v.data)) : "") + "</span>" + thumbHTML(id) + "<h4>" + esc(v.titulo) + "</h4></button></li>";
  }).join("");
  var tl = $("#timeline");
  requestAnimationFrame(function () { tl.scrollLeft = tl.scrollWidth; });

  /* ------------------------------------------------------------------ */
  /* Vídeos                                                                */
  /* ------------------------------------------------------------------ */
  var videoFilter = store("dy-vfilter") || "Todos";
  function videoCard(v, feat) {
    var info = '<div class="meta"><span class="cat">' + esc(v.categoria) + "</span>" + (v.data ? "<span>" + esc(fmtDate(v.data)) + "</span>" : "") +
      (v.views != null ? "<span>" + esc(fmtViews(v.views)) + "</span>" : "") + "</div>";
    var th = thumbHTML(v.id, '<span class="play"><span>' + PLAY + "</span></span>");
    if (feat) return '<button type="button" class="video video-feat" data-video="' + esc(v.id) + '">' + th +
      '<div class="feat-text"><span class="feat-tag">Mais recente</span><h3>' + esc(v.titulo) + "</h3>" + info + "</div></button>";
    return '<button type="button" class="video" data-video="' + esc(v.id) + '">' + th + "<h3>" + esc(v.titulo) + "</h3>" + info + "</button>";
  }
  function renderVideos() {
    var cats = ["Todos"];
    videos.forEach(function (v) { if (v.categoria && cats.indexOf(v.categoria) < 0) cats.push(v.categoria); });
    if (cats.indexOf(videoFilter) < 0) videoFilter = "Todos";
    $("#videoFilters").innerHTML = cats.map(function (c) {
      return '<button type="button" class="chip" aria-pressed="' + (c === videoFilter) + '" data-f="' + esc(c) + '">' + esc(c) + "</button>";
    }).join("");
    var list = videos.filter(function (v) { return videoFilter === "Todos" || v.categoria === videoFilter; });
    $("#videoFeature").innerHTML = list.length ? videoCard(list[0], true) : "";
    $("#videoGrid").innerHTML = list.slice(1, 13).map(function (v) { return videoCard(v); }).join("");
  }
  $("#videoFilters").addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    videoFilter = b.dataset.f; store("dy-vfilter", videoFilter); renderVideos();
  });
  renderVideos();

  // Qualquer elemento com data-video abre o player
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-video]"); if (!b) return;
    e.preventDefault();
    openVideo(findVideo(b.getAttribute("data-video")));
  });
  function openVideo(v) {
    var embed = window.location.protocol !== "file:" && !window.NO_EMBED;
    var media = embed
      ? '<div class="modal-media"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.id) + '?autoplay=1&rel=0" title="' + esc(v.titulo) +
        '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>'
      : '<div class="modal-media"><img src="' + esc(thumbUrl(v.id)) + '" alt=""></div>';
    openModal(media + '<div class="modal-text"><div class="meta"><span class="cat">' + esc(v.categoria || "") + "</span>" +
      (v.data ? "<span>" + esc(fmtDate(v.data)) + "</span>" : "") + '</div><h3 id="modalTitle">' + esc(v.titulo) + "</h3>" +
      '<p><a class="btn btn-red" href="' + esc(watchUrl(v.id)) + '" target="_blank" rel="noopener">Assistir no YouTube</a></p></div>');
  }

  function guessCategory(title) {
    var t = title.toLowerCase();
    if (/velocross|motocross|moto|corrida|pista|largada|gate|treino|minimoto/.test(t)) return "Velocross";
    if (/camping|acamp|barraca|colch/.test(t)) return "Camping";
    if (/trilha|tr4|off.?road|pesca/.test(t)) return "Trilha";
    if (/cachoeira|aventura|drift|sandboard|skim|kart|quadri/.test(t)) return "Aventura";
    return "Vlog";
  }
  function fetchVideos() {
    var base = "https://www.googleapis.com/youtube/v3/";
    fetch(base + "playlistItems?part=snippet&maxResults=25&playlistId=UU" + C.channelId.slice(2) + "&key=" + encodeURIComponent(C.apiKey))
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.items || !j.items.length) throw new Error("sem vídeos");
        var fresh = j.items.map(function (it) {
          var sn = it.snippet;
          return { id: sn.resourceId.videoId, titulo: sn.title, categoria: guessCategory(sn.title), data: sn.publishedAt.slice(0, 10) };
        });
        return fetch(base + "videos?part=statistics,contentDetails&id=" + fresh.map(function (v) { return v.id; }).join(",") + "&key=" + encodeURIComponent(C.apiKey))
          .then(function (r) { return r.json(); })
          .then(function (d) {
            var info = {};
            (d.items || []).forEach(function (it) { info[it.id] = it; });
            videos = fresh.filter(function (v) {
              var it = info[v.id]; if (!it) return true;
              v.views = Number(it.statistics.viewCount);
              var m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(it.contentDetails.duration || "");
              var secs = m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 999;
              return secs > 70; // deixa os Shorts de fora
            });
            renderVideos();
          });
      })
      .catch(function (e) { console.warn("[vídeos] usando a lista do config.js:", e.message); });
  }
  if (hasApi && C.buscarVideosRecentes) fetchVideos();

  /* ------------------------------------------------------------------ */
  /* Playlists                                                             */
  /* ------------------------------------------------------------------ */
  $("#playlists").innerHTML = (S.playlists || []).map(function (p) {
    return '<a class="pl" href="' + esc(playlistUrl(p.id)) + '" target="_blank" rel="noopener"><b>' + esc(p.nome) +
      '</b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a>';
  }).join("");

  /* ------------------------------------------------------------------ */
  /* Fotos                                                                 */
  /* ------------------------------------------------------------------ */
  var fotos = S.fotos || [];
  function fotoSrc(f) { return f.src ? asset(f.src) : frameUrl(f.video, f.quadro || 1); }
  $("#gallery").innerHTML = fotos.map(function (f, i) {
    return '<button type="button" class="photo" data-f="' + esc(f.formato || "quadrada") + '" data-i="' + i + '"><div class="ph"><img src="' + esc(fotoSrc(f)) +
      '" alt="' + esc(f.legenda) + '" loading="lazy"></div><span class="cap">' + esc(f.legenda) + "</span></button>";
  }).join("");
  $("#gallery").addEventListener("click", function (e) {
    var b = e.target.closest(".photo"); if (!b) return;
    var f = fotos[Number(b.dataset.i)];
    openModal('<div class="modal-media photo-view"><img src="' + esc(fotoSrc(f)) + '" alt="' + esc(f.legenda) + '"></div><div class="modal-text"><h3 id="modalTitle">' + esc(f.legenda) + "</h3>" +
      (f.video ? '<p><button type="button" class="btn btn-red" data-video="' + esc(f.video) + '">Ver o vídeo desse momento</button></p>' : "") + "</div>");
  });

  /* ------------------------------------------------------------------ */
  /* Campings                                                              */
  /* ------------------------------------------------------------------ */
  $("#campGrid").innerHTML = (S.campings || []).map(function (c) {
    var cover = (c.videos && c.videos[0]) ? c.videos[0].id : "";
    return '<article class="camp">' + (c.src ? '<div class="thumb"><img src="' + esc(asset(c.src)) + '" alt="" loading="lazy"></div>' : cover ? thumbHTML(cover) : "") +
      '<div class="camp-body"><div><h3>' + esc(c.nome) + '</h3><div class="camp-loc">' + esc(c.local) + "</div></div>" +
      '<div class="tags">' + (c.tags || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>" +
      "<p>" + esc(c.texto) + '</p><div class="camp-foot">' + (c.videos || []).map(function (v) {
        return '<button type="button" class="ep-btn" data-video="' + esc(v.id) + '">▶ ' + esc(v.rotulo) + "</button>";
      }).join("") +
      (c.mapa ? '<a class="map-link" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(c.mapa) + '" target="_blank" rel="noopener">Ver no mapa →</a>' : "") +
      "</div></div></article>";
  }).join("");

  /* ------------------------------------------------------------------ */
  /* Checklist                                                             */
  /* ------------------------------------------------------------------ */
  var checks = store("dy-checklist") || {}, groups = S.checklist || {}, total = 0, wasDone = false;
  $("#checkCols").innerHTML = Object.keys(groups).map(function (g, gi) {
    return "<div><h4>" + esc(g) + "</h4>" + groups[g].map(function (item, ii) {
      total++;
      var id = "chk-" + gi + "-" + ii, k = g + "|" + item;
      return '<label class="check" for="' + id + '"><input type="checkbox" id="' + id + '" data-k="' + esc(k) + '"' + (checks[k] ? " checked" : "") + "><span>" + esc(item) + "</span></label>";
    }).join("") + "</div>";
  }).join("");
  function updateChecks(celebrate) {
    var done = $all("#checkCols input:checked").length, full = total > 0 && done === total;
    $("#checkCount").textContent = full ? "Tudo pronto! Bora pra estrada." : done + "/" + total + " itens no carro";
    $("#checkFill").style.width = (total ? done / total * 100 : 0) + "%";
    $("#checklist").classList.toggle("done", full);
    if (full && !wasDone && celebrate) confetti();
    wasDone = full;
  }
  $("#checkCols").addEventListener("change", function (e) {
    var k = e.target.dataset.k; if (!k) return;
    if (e.target.checked) checks[k] = 1; else delete checks[k];
    store("dy-checklist", checks); updateChecks(true);
  });
  $("#checkReset").addEventListener("click", function () {
    checks = {}; store("dy-checklist", checks);
    $all("#checkCols input").forEach(function (i) { i.checked = false; });
    updateChecks(false);
  });
  updateChecks(false);

  /* ------------------------------------------------------------------ */
  /* Garagem                                                               */
  /* ------------------------------------------------------------------ */
  $("#prodGrid").innerHTML = (S.garagem || []).map(function (p) {
    return '<article class="prod">' + (p.src ? '<div class="thumb"><img src="' + esc(asset(p.src)) + '" alt="" loading="lazy"></div>' : thumbHTML(p.video)) +
      '<div class="prod-body"><span class="prod-cat">' + esc(p.categoria) + "</span><h3>" + esc(p.nome) + "</h3><p>" + esc(p.texto) + '</p><div class="prod-foot">' +
      (p.video ? '<button type="button" class="ep-btn" data-video="' + esc(p.video) + '">▶ Ver no vídeo</button>' : "") +
      (p.link ? '<a class="prod-buy" href="' + esc(p.link) + '" target="_blank" rel="noopener sponsored">Ver na loja</a>' : "") +
      "</div></div></article>";
  }).join("");

  /* ------------------------------------------------------------------ */
  /* Loja da família: links da Shopee e do Mercado Livre                   */
  /* ------------------------------------------------------------------ */
  var LOJAS = {
    shopee: { nome: "Shopee", classe: "buy-shopee", rotulo: "Comprar na Shopee" },
    mercadolivre: { nome: "Mercado Livre", classe: "buy-ml", rotulo: "Comprar no Mercado Livre" }
  };
  var loja = S.loja || {};
  function safeUrl(u) { return typeof u === "string" && /^https:\/\//i.test(u.trim()) ? u.trim() : ""; }
  function fmtPreco(n) { return n ? "R$ " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""; }
  function categoriaPeloNome(t) {
    t = (t || "").toLowerCase();
    if (/barraca|colch|camping|acamp|lampi|lanterna|mesa|cadeira|fogareiro|imperme|saco de dormir/.test(t)) return "Camping";
    if (/moto|velocross|trilha|enduro|guid|capacete|luva|bota|óculos|oculos/.test(t)) return "Moto";
    if (/camis|short|bermuda|cal[cç]a|jaqueta|bon[eé]/.test(t)) return "Roupas";
    return "Outros";
  }
  function nomeCurto(t) {
    t = (t || "").replace(/\s+/g, " ").trim();
    if (t.length <= 60) return t;
    return t.slice(0, 60).replace(/\s+\S*$/, "") + "…";
  }
  // Vitrine da Shopee (atualizada toda semana em js/auto.js) + ajustes do config
  var ajustes = loja.ajustes || {};
  var daVitrine = ((AUTO.shopee && AUTO.shopee.itens) || []).map(function (it) {
    var a = ajustes[it.id] || {};
    if (a.ocultar) return null;
    return {
      nome: a.nome || nomeCurto(it.nome), categoria: a.categoria || categoriaPeloNome(it.nome),
      porque: a.porque || "", imagem: a.imagem || it.imagem, video: a.video || "",
      preco: a.preco || fmtPreco(it.preco), shopee: it.link, mercadolivre: a.mercadolivre || ""
    };
  }).filter(Boolean);
  var shopItems = (loja.produtos || []).concat(daVitrine).filter(function (p) { return p.nome && (safeUrl(p.shopee) || safeUrl(p.mercadolivre)); });
  if (shopItems.length) {
    $("#loja").hidden = false;
    $("#navLoja").hidden = false;
    var shopCat = "Todos", shopStore = "todas";
    var cats = ["Todos"];
    shopItems.forEach(function (p) { if (p.categoria && cats.indexOf(p.categoria) < 0) cats.push(p.categoria); });
    var stores = Object.keys(LOJAS).filter(function (k) { return shopItems.some(function (p) { return safeUrl(p[k]); }); });

    var renderShop = function () {
      $("#shopCats").innerHTML = cats.length > 2 ? cats.map(function (c) {
        return '<button type="button" class="chip" aria-pressed="' + (c === shopCat) + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
      }).join("") : "";
      $("#shopStores").innerHTML = stores.length > 1 ? ["todas"].concat(stores).map(function (k) {
        return '<button type="button" class="chip chip-store' + (k !== "todas" ? " " + LOJAS[k].classe : "") + '" aria-pressed="' + (k === shopStore) + '" data-store="' + k + '">' +
          (k === "todas" ? "Todas as lojas" : LOJAS[k].nome) + "</button>";
      }).join("") : "";
      var list = shopItems.filter(function (p) {
        return (shopCat === "Todos" || p.categoria === shopCat) && (shopStore === "todas" || safeUrl(p[shopStore]));
      });
      $("#shopGrid").innerHTML = list.map(function (p) {
        var img = p.imagem ? '<div class="shop-img"><img src="' + esc(asset(p.imagem)) + '" alt="' + esc(p.nome) + '" loading="lazy"></div>'
          : p.video ? thumbHTML(p.video) : '<div class="shop-img shop-img-empty"><span>' + esc(p.nome) + "</span></div>";
        var botoes = Object.keys(LOJAS).filter(function (k) { return safeUrl(p[k]); }).map(function (k) {
          return '<a class="buy ' + LOJAS[k].classe + '" href="' + esc(safeUrl(p[k])) + '" target="_blank" rel="noopener sponsored">' + LOJAS[k].rotulo + "</a>";
        }).join("");
        return '<article class="shop-card">' + img + '<div class="shop-body">' +
          (p.categoria ? '<span class="prod-cat">' + esc(p.categoria) + "</span>" : "") +
          "<h3>" + esc(p.nome) + "</h3>" + (p.porque ? "<p>" + esc(p.porque) + "</p>" : "") +
          (p.preco ? '<span class="shop-price">' + esc(p.preco) + "</span>" : "") +
          '<div class="shop-buy">' + botoes + "</div>" +
          (p.video ? '<button type="button" class="link-btn" data-video="' + esc(p.video) + '">Ver no vídeo</button>' : "") +
          "</div></article>";
      }).join("") || '<p class="sec-lead">Nenhum produto nesse filtro.</p>';
    };
    $("#shopCats").addEventListener("click", function (e) { var b = e.target.closest("[data-cat]"); if (b) { shopCat = b.dataset.cat; renderShop(); } });
    $("#shopStores").addEventListener("click", function (e) { var b = e.target.closest("[data-store]"); if (b) { shopStore = b.dataset.store; renderShop(); } });
    renderShop();
    var precoData = AUTO.shopee && AUTO.shopee.atualizado ? "Preços conferidos em " + AUTO.shopee.atualizado + " e podem mudar na loja." : "Preços e estoque podem mudar na loja.";
    $("#shopNote").innerHTML = esc(loja.afiliado
      ? "Todos os links desta loja são de afiliado: você paga o mesmo preço e o canal ganha uma pequena comissão, que ajuda a manter os vídeos. " + precoData
      : precoData) +
      (safeUrl(loja.vitrineShopee) ? ' <a class="shop-all" href="' + esc(safeUrl(loja.vitrineShopee)) + '" target="_blank" rel="noopener sponsored">Ver a vitrine completa na Shopee →</a>' : "");
  }

  /* ------------------------------------------------------------------ */
  /* Blog                                                                  */
  /* ------------------------------------------------------------------ */
  var posts = S.blog || [];
  $("#blogGrid").innerHTML = posts.map(function (p, i) {
    return '<button type="button" class="post" data-i="' + i + '"><div class="meta"><span class="cat">' + esc(p.categoria) + "</span><span>" + esc(fmtDate(p.data)) +
      "</span></div><h3>" + esc(p.titulo) + "</h3><p>" + esc(p.resumo) + '</p><span class="post-more">Ler · ' + esc(p.leitura) + "</span></button>";
  }).join("");
  $("#blogGrid").addEventListener("click", function (e) {
    var b = e.target.closest(".post"); if (!b) return;
    var p = posts[Number(b.dataset.i)];
    openModal('<article class="article"><div class="meta"><span class="cat">' + esc(p.categoria) + "</span><span>" + esc(fmtDate(p.data)) + " · " + esc(p.autor) +
      '</span></div><h3 id="modalTitle">' + esc(p.titulo) + "</h3>" + (p.texto || []).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") + "</article>");
  });

  /* ------------------------------------------------------------------ */
  /* Contato                                                               */
  /* ------------------------------------------------------------------ */
  var contact = C.emailParcerias || C.handle || "";
  $("#contactText").textContent = contact;
  $("#socials").innerHTML = (S.redes || []).map(function (r) { return '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.nome) + "</a>"; }).join("");
  $("#copyContact").addEventListener("click", function () {
    var msg = $("#copyMsg");
    var fallback = function () {
      var range = document.createRange(); range.selectNodeContents($("#contactText"));
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      msg.textContent = "Selecionado. Use Ctrl+C para copiar.";
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(contact).then(function () { msg.textContent = "Copiado."; }, fallback);
    else fallback();
  });

  /* ------------------------------------------------------------------ */
  /* Modal                                                                 */
  /* ------------------------------------------------------------------ */
  var modal = $("#modal"), lastFocus = null;
  function openModal(html) {
    lastFocus = document.activeElement;
    $("#modalBody").innerHTML = html;
    modal.hidden = false; document.body.style.overflow = "hidden";
    $(".modal-close", modal).focus();
  }
  function closeModal() {
    modal.hidden = true; $("#modalBody").innerHTML = ""; document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  modal.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  /* ------------------------------------------------------------------ */
  /* Confete com bandeira quadriculada                                     */
  /* ------------------------------------------------------------------ */
  function confetti() {
    if (reduceMotion) return;
    var cv = document.createElement("canvas"); cv.className = "confetti"; document.body.appendChild(cv);
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    var ctx = cv.getContext("2d"); ctx.scale(dpr, dpr);
    var cols = ["#E10613", "#FF2A2A", "#FFFFFF", "#FFD21F", "#111111"], ps = [];
    for (var i = 0; i < 170; i++) ps.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 4, s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: cols[i % cols.length], chk: i % 8 === 0 });
    var start = performance.now();
    (function step(t) {
      ctx.clearRect(0, 0, W, H);
      ps.forEach(function (p) {
        p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        if (p.chk) { for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) { ctx.fillStyle = (a + b) % 2 ? "#111" : "#fff"; ctx.fillRect(-9 + a * 6, -9 + b * 6, 6, 6); } }
        else { ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
        ctx.restore();
      });
      if (t - start < 3500) requestAnimationFrame(step); else cv.remove();
    })(start);
  }

  /* ------------------------------------------------------------------ */
  /* Navegação: seção ativa e moto na barra de progresso                   */
  /* ------------------------------------------------------------------ */
  var navLinks = $all(".nav a");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $all("main section[id]").forEach(function (s) { io.observe(s); });
  }
  var trackBike = $("#trackBike"), lastY = window.scrollY, wheelieT;
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    trackBike.style.setProperty("--p", (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4));
    var dy = window.scrollY - lastY; lastY = window.scrollY;
    if (dy > 40) { trackBike.classList.add("wheelie"); clearTimeout(wheelieT); wheelieT = setTimeout(function () { trackBike.classList.remove("wheelie"); }, 250); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Segredo: digite "vrum" em qualquer lugar da página.
  var typed = "";
  document.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input, textarea")) return;
    typed = (typed + (e.key || "")).slice(-4).toLowerCase();
    if (typed === "vrum") { hero.jump(); window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); confetti(); }
  });

  hero.resize();
  hero.start();
})();
