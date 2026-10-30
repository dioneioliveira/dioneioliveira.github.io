/* Ícones e cenas animadas da Roleta da aventura.
   Cada tema tem um ícone (desenho em linha, 24x24) e uma cena em SVG que
   aparece quando a roleta para. As animações ficam em css/style.css (sc-*). */
(function () {
  "use strict";

  // Ícones em linha (viewBox 24x24), usados na roda, na lista de chances e no resultado
  var ICONES = {
    barraca: "M3 20 L12 4 L21 20 Z M12 4 V20 M9 20 L12 14 L15 20 M1.5 20 H22.5",
    moto: "M2 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M16 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M5 17 L9 11 H14 L19 17 M9 11 L11 15 L14 11 M13 8 L16 9 L19 17",
    praia: "M12 2.5v2 M6 5l1.4 1.4 M18 5l-1.4 1.4 M7.5 12a4.5 4.5 0 0 1 9 0 M2 16c2-1.5 4-1.5 6 0s4 1.5 6 0s4-1.5 6 0 M2 20.5c2-1.5 4-1.5 6 0s4 1.5 6 0s4-1.5 6 0",
    cachoeira: "M3 3h18 M7 3v11 M12 3v13 M17 3v11 M2 19.5c2-1.3 4-1.3 6 0s4 1.3 6 0s4-1.3 6 0",
    corrida: "M14.5 4a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0 M7 21l3.5-6 3 2.5 1 3.5 M10.5 15l1.5-5.5 3.5 2.5 3-1 M12 9.5l-3.5 1-2 3",
    coroa: "M3 19h18 M4 19 L3 8 L8 12 L12 5 L16 12 L21 8 L20 19",
    sono: "M4 5h6l-6 7h6 M13 11h5l-5 6h5 M3 21h18"
  };
  var ICONE_PADRAO = { velocross: "moto", praia: "praia", camping: "barraca", "corrida de rua": "corrida", cachoeiras: "cachoeira", "a mãe decide": "coroa", "nada?": "sono" };

  function iconeDe(op) {
    var k = op.icone || ICONE_PADRAO[(op.nome || "").toLowerCase()] || "barraca";
    return ICONES[k] || ICONES.barraca;
  }
  function iconeSVG(op, cor) {
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="' + (cor || "currentColor") +
      '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + iconeDe(op) + '"/></svg>';
  }

  // Silhueta de uma pessoa em pé (x = centro, chao = altura do chão, s = escala)
  function pessoa(x, chao, s, atraso, cor, rabo) {
    var h = 58 * s;
    var corpo = "M" + (x - 10 * s) + " " + chao + " L" + (x - 8.5 * s) + " " + (chao - 44 * s) +
      " Q" + x + " " + (chao - 52 * s) + " " + (x + 8.5 * s) + " " + (chao - 44 * s) + " L" + (x + 10 * s) + " " + chao + " Z";
    var cabelo = rabo ? '<path d="M' + (x + 5 * s) + " " + (chao - h - 4 * s) + " q" + (9 * s) + " " + (4 * s) + " " + (6 * s) + " " + (16 * s) + '" stroke="' + cor + '" stroke-width="' + (3.5 * s) + '" fill="none" stroke-linecap="round"/>' : "";
    return '<g class="sc-in" style="--d:' + atraso + 's" fill="' + cor + '"><circle cx="' + x + '" cy="' + (chao - h) + '" r="' + (8.5 * s) + '"/>' + cabelo + '<path d="' + corpo + '"/></g>';
  }
  // A família: 2 adultos e 2 crianças
  function familia(xs, chao, cor, atraso) {
    atraso = atraso || 0.6;
    return pessoa(xs[0], chao, 1, atraso, cor) + pessoa(xs[1], chao, 0.68, atraso + 0.15, cor) +
      pessoa(xs[2], chao, 0.6, atraso + 0.3, cor) + pessoa(xs[3], chao, 0.95, atraso + 0.45, cor, true);
  }
  function estrelas(n, cor) {
    var s = "";
    for (var i = 0; i < n; i++) {
      var x = (i * 97) % 400, y = 12 + ((i * 53) % 110), r = 0.8 + (i % 3) * 0.5;
      s += '<circle class="sc-pisca" style="--d:' + ((i % 7) * 0.35).toFixed(2) + 's" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (cor || "#fff") + '"/>';
    }
    return s;
  }
  function moto(cor, placa) {
    return '<g stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="-22" cy="-12" r="11"/><circle cx="22" cy="-12" r="11"/>' +
      '<path d="M-22 -12 L-6 -30 H10 L22 -12 M-6 -30 L0 -16 L10 -30 M8 -38 L18 -36 L22 -12" stroke="' + cor + '"/>' +
      '<path d="M-3 -32 L1 -50 L12 -42"/></g>' +
      '<circle cx="2" cy="-56" r="7" fill="' + cor + '"/>' +
      (placa ? '<rect x="12" y="-44" width="14" height="11" rx="2" fill="#fff"/><text x="19" y="-35.5" text-anchor="middle" font-size="9" font-weight="900" font-style="italic" fill="#111" font-family="Kanit, sans-serif">' + placa + "</text>" : "");
  }
  function pinheiro(x, chao, h, cor) {
    return '<path d="M' + x + " " + (chao - h) + " L" + (x + h * 0.28) + " " + chao + " L" + (x - h * 0.28) + " " + chao + ' Z" fill="' + cor + '"/>';
  }

  var CENAS = {
    camping: function () {
      var faiscas = "";
      for (var i = 0; i < 9; i++) faiscas += '<rect class="sc-faisca" style="--d:' + (i * 0.27).toFixed(2) + 's;--x:' + ((i % 5) - 2) * 6 + 'px" x="283" y="200" width="2.5" height="2.5" fill="#FFC266"/>';
      return '<rect width="400" height="260" fill="#060A14"/>' + estrelas(26) +
        '<circle cx="330" cy="48" r="17" fill="#F4EFD8"/><circle cx="337" cy="43" r="16" fill="#060A14"/>' +
        '<path d="M0 185 L70 118 L130 168 L200 98 L270 160 L330 122 L400 175 V260 H0Z" fill="#0F1726"/>' +
        pinheiro(30, 205, 70, "#0B140F") + pinheiro(372, 205, 80, "#0B140F") + pinheiro(205, 205, 50, "#0B140F") +
        '<rect y="203" width="400" height="57" fill="#0A110C"/>' +
        '<circle class="sc-tremula" cx="283" cy="200" r="80" fill="url(#scFogo)"/>' +
        '<g class="sc-surge" style="transform-origin:110px 205px">' +
        '<path d="M50 205 L110 128 L170 205Z" fill="#E10613"/><path d="M110 128 L170 205 L188 205 L128 128Z" fill="#8E020A"/>' +
        '<path class="sc-luz" d="M98 205 L110 168 L122 205Z" fill="#FFD27A"/></g>' +
        '<path d="M266 206 L300 196 M300 206 L266 196" stroke="#4A2C18" stroke-width="5" stroke-linecap="round"/>' +
        '<path class="sc-chama" d="M271 200 Q268 180 283 160 Q298 180 295 200Z" fill="#FF6A1A"/>' +
        '<path class="sc-chama sc-chama2" d="M276 200 Q275 186 283 174 Q291 186 290 200Z" fill="#FFD27A"/>' + faiscas +
        familia([212, 236, 330, 354], 207, "#4A2E1C", 0.9);
    },
    velocross: function () {
      var poeira = "";
      for (var i = 0; i < 6; i++) poeira += '<circle class="sc-poeira" style="--d:' + (0.35 + i * 0.12).toFixed(2) + 's" cx="' + (60 + i * 26) + '" cy="200" r="' + (6 + i % 3 * 3) + '" fill="#A0704A"/>';
      return '<rect width="400" height="260" fill="url(#scPorDoSol)"/>' +
        '<circle cx="80" cy="70" r="30" fill="#FFB06A" opacity=".8"/>' +
        '<path d="M0 170 Q80 140 160 165 T320 150 T400 160 V260 H0Z" fill="#3B1D10"/>' +
        '<path d="M0 205 H170 Q200 205 215 168 L222 168 L222 205 H400 V260 H0Z" fill="#7A4524"/>' +
        '<path d="M0 222 H400" stroke="#fff" stroke-width="2" stroke-dasharray="10 14" opacity=".5"/>' + poeira +
        '<g class="sc-bandeira" style="transform-origin:352px 120px"><path d="M352 120 V200" stroke="#ddd" stroke-width="3"/>' +
        '<g transform="translate(354 120)"><rect width="34" height="22" fill="#fff"/><rect width="8.5" height="5.5" fill="#111"/><rect x="17" width="8.5" height="5.5" fill="#111"/><rect x="8.5" y="5.5" width="8.5" height="5.5" fill="#111"/><rect x="25.5" y="5.5" width="8.5" height="5.5" fill="#111"/><rect y="11" width="8.5" height="5.5" fill="#111"/><rect x="17" y="11" width="8.5" height="5.5" fill="#111"/><rect x="8.5" y="16.5" width="8.5" height="5.5" fill="#111"/><rect x="25.5" y="16.5" width="8.5" height="5.5" fill="#111"/></g></g>' +
        '<g class="sc-pilota"><g transform="translate(0 205)">' + moto("#E10613", "17") + "</g></g>";
    },
    praia: function () {
      var gaivotas = '<g class="sc-voa" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><path d="M60 60 q6 -6 12 0 q6 -6 12 0"/><path d="M95 45 q5 -5 10 0 q5 -5 10 0"/></g>';
      return '<rect width="400" height="260" fill="url(#scCeuDia)"/>' +
        '<g class="sc-sol"><circle cx="300" cy="70" r="32" fill="#FFD21F"/><circle cx="300" cy="70" r="46" fill="#FFD21F" opacity=".25"/></g>' + gaivotas +
        '<rect y="140" width="400" height="60" fill="#1E7FB8"/>' +
        '<g class="sc-ondas"><path d="M-80 150 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 V200 H-80Z" fill="#3FA4DB"/>' +
        '<path d="M-80 172 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#fff" stroke-width="2.5" fill="none" opacity=".7"/></g>' +
        '<path d="M0 195 Q200 180 400 195 V260 H0Z" fill="#F2D08B"/>' +
        '<g class="sc-balanca" style="transform-origin:60px 230px"><path d="M60 230 Q55 170 70 120" stroke="#6B4423" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<path d="M70 120 q-35 -5 -50 15 M70 120 q-30 -20 -55 -12 M70 120 q30 -20 55 -10 M70 120 q35 0 45 20 M70 120 q5 -25 -5 -38" stroke="#2E8B3A" stroke-width="7" fill="none" stroke-linecap="round"/></g>' +
        '<g class="sc-surge" style="transform-origin:200px 225px"><path d="M200 225 V160" stroke="#555" stroke-width="3"/><path d="M155 165 Q200 125 245 165Z" fill="#E10613"/><path d="M185 165 Q200 128 215 165Z" fill="#fff"/></g>' +
        familia([258, 282, 305, 330], 232, "#3A2A1C", 0.8);
    },
    cachoeiras: function () {
      var quedas = "";
      for (var i = 0; i < 7; i++) quedas += '<path class="sc-queda" style="--d:' + (i * 0.13).toFixed(2) + 's" d="M' + (172 + i * 9) + ' 40 V180" stroke="#DFF3FF" stroke-width="' + (3 + i % 2 * 2) + '" stroke-dasharray="14 10" fill="none" opacity=".85"/>';
      return '<rect width="400" height="260" fill="#9FD3E8"/>' +
        '<path d="M0 30 H175 V200 H0Z" fill="#4B6B3A"/><path d="M235 30 H400 V200 H235Z" fill="#4B6B3A"/>' +
        '<path d="M0 30 H175 V60 Q90 75 0 55Z M235 30 H400 V58 Q320 72 235 62Z" fill="#2E4A24"/>' +
        '<rect x="168" y="28" width="74" height="10" rx="4" fill="#5A4636"/>' +
        '<rect x="170" y="38" width="70" height="150" fill="#BDE6FA"/>' + quedas +
        '<ellipse cx="205" cy="200" rx="120" ry="22" fill="#2F86B3"/>' +
        '<ellipse class="sc-onda" cx="205" cy="198" rx="30" ry="6" fill="none" stroke="#fff" stroke-width="2"/>' +
        '<ellipse class="sc-onda" style="--d:.8s" cx="205" cy="198" rx="30" ry="6" fill="none" stroke="#fff" stroke-width="2"/>' +
        '<circle class="sc-nevoa" cx="190" cy="185" r="18" fill="#fff"/><circle class="sc-nevoa" style="--d:.6s" cx="222" cy="188" r="14" fill="#fff"/>' +
        '<path d="M0 215 Q100 205 150 222 Q250 240 400 215 V260 H0Z" fill="#3E3A33"/>' +
        '<path d="M290 228 Q320 205 380 214 L400 226 V240 H290Z" fill="#5A544A"/>' +
        familia([312, 334, 352, 372], 222, "#1A1F1A", 0.8);
    },
    corrida: function () {
      var predios = "";
      var xs = [0, 40, 70, 115, 150, 200, 235, 280, 320, 360];
      xs.forEach(function (x, i) { var h = 50 + (i * 37) % 70; predios += '<rect x="' + x + '" y="' + (160 - h) + '" width="' + (34 + i % 3 * 6) + '" height="' + h + '" fill="#1B2232"/>'; });
      return '<rect width="400" height="260" fill="url(#scCeuCidade)"/>' + predios +
        '<rect y="160" width="400" height="100" fill="#2B2B2E"/>' +
        '<path class="sc-faixa" d="M-40 215 H440" stroke="#FFD21F" stroke-width="5" stroke-dasharray="26 22"/>' +
        '<g class="sc-chegada"><path d="M40 60 V175 M360 60 V175" stroke="#ddd" stroke-width="5"/><rect x="40" y="60" width="320" height="30" fill="#E10613"/>' +
        '<text x="200" y="82" text-anchor="middle" font-family="Kanit, sans-serif" font-weight="900" font-style="italic" font-size="20" fill="#fff">CHEGADA</text></g>' +
        '<g class="sc-corredor" fill="#0F0F0F"><circle cx="200" cy="128" r="10"/>' +
        '<path d="M194 140 L206 140 L204 180 L196 180Z"/>' +
        '<g class="sc-perna1" style="transform-origin:200px 178px"><rect x="196" y="178" width="7" height="34" rx="3"/></g>' +
        '<g class="sc-perna2" style="transform-origin:200px 178px"><rect x="196" y="178" width="7" height="34" rx="3"/></g>' +
        '<g class="sc-perna2" style="transform-origin:200px 143px"><rect x="196" y="143" width="6" height="28" rx="3"/></g>' +
        '<g class="sc-perna1" style="transform-origin:200px 143px"><rect x="196" y="143" width="6" height="28" rx="3"/></g></g>';
    },
    mae: function () {
      var coracoes = "";
      for (var i = 0; i < 7; i++) coracoes += '<path class="sc-coracao" style="--d:' + (0.9 + i * 0.35).toFixed(2) + 's;--x:' + ((i % 4) - 1.5) * 18 + 'px" transform="translate(' + (120 + i * 26) + ' 210)" d="M0 4 C0 -2 8 -2 8 4 C8 -2 16 -2 16 4 C16 10 8 14 8 18 C8 14 0 10 0 4Z" fill="#FF2A6A"/>';
      return '<rect width="400" height="260" fill="#0B0708"/>' +
        '<path class="sc-holofote" d="M200 -10 L120 230 H280Z" fill="url(#scHolofote)"/>' +
        '<ellipse cx="200" cy="232" rx="85" ry="12" fill="#2A1A10"/>' +
        '<g fill="#1A1210">' + pessoa(200, 232, 1.9, 0.2, "#1A1210", true).replace('class="sc-in"', 'class="sc-in sc-in-fixo"') + "</g>" +
        '<g class="sc-coroa"><g transform="translate(0 14)"><path d="M176 92 L172 66 L186 78 L200 58 L214 78 L228 66 L224 92Z" fill="#FFD21F" stroke="#C99600" stroke-width="2"/>' +
        '<circle cx="200" cy="74" r="4" fill="#E10613"/></g></g>' + coracoes;
    },
    nada: function () {
      var zs = "";
      for (var i = 0; i < 3; i++) zs += '<text class="sc-z" style="--d:' + (i * 0.7) + 's" x="240" y="120" font-family="Kanit, sans-serif" font-weight="900" font-style="italic" font-size="' + (22 + i * 6) + '" fill="#BFC7D5">Z</text>';
      return '<rect width="400" height="260" fill="#14161C"/>' +
        '<rect x="300" y="40" width="70" height="55" fill="#1F2A44"/><circle cx="345" cy="58" r="10" fill="#F4EFD8" opacity=".8"/><path d="M335 40 V95 M300 67 H370" stroke="#14161C" stroke-width="4"/>' +
        '<rect y="215" width="400" height="45" fill="#221E1A"/>' +
        '<rect x="110" y="150" width="170" height="40" rx="10" fill="#8E1A1A"/><rect x="100" y="175" width="190" height="40" rx="12" fill="#B02222"/>' +
        '<rect x="96" y="160" width="22" height="55" rx="9" fill="#7A1414"/><rect x="272" y="160" width="22" height="55" rx="9" fill="#7A1414"/>' +
        '<g class="sc-respira" style="transform-origin:195px 172px"><circle cx="135" cy="164" r="10" fill="#E8C7A8"/><rect x="143" y="158" width="100" height="18" rx="9" fill="#2D4E8A"/></g>' +
        zs + '<text class="sc-pergunta" x="80" y="110" font-family="Kanit, sans-serif" font-weight="900" font-style="italic" font-size="64" fill="#FFD21F">?</text>';
    }
  };
  var CENA_PADRAO = { velocross: "velocross", praia: "praia", camping: "camping", "corrida de rua": "corrida", cachoeiras: "cachoeiras", "a mãe decide": "mae", "nada?": "nada" };

  var DEFS = '<defs>' +
    '<radialGradient id="scFogo"><stop offset="0" stop-color="#FFB347" stop-opacity=".75"/><stop offset="1" stop-color="#FF6A00" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="scPorDoSol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A0A10"/><stop offset=".6" stop-color="#C2410C"/><stop offset="1" stop-color="#F59E0B"/></linearGradient>' +
    '<linearGradient id="scCeuDia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5EB7E8"/><stop offset="1" stop-color="#FFE3B0"/></linearGradient>' +
    '<linearGradient id="scCeuCidade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2A4A"/><stop offset="1" stop-color="#E26A2C"/></linearGradient>' +
    '<linearGradient id="scHolofote" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6D0" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6D0" stop-opacity=".08"/></linearGradient>' +
    "</defs>";

  function cenaSVG(op) {
    var k = op.cena || CENA_PADRAO[(op.nome || "").toLowerCase()] || "camping";
    var f = CENAS[k] || CENAS.camping;
    return '<svg class="sc" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Cena animada: ' + (op.nome || "") + '">' + DEFS + f() + "</svg>";
  }

  window.ROLETA_ARTE = { iconeDe: iconeDe, iconeSVG: iconeSVG, cenaSVG: cenaSVG };
})();
