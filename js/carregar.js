/* Carrega as escolhas do painel de administração (admin.html) antes de montar o site.
   Busca no Supabase a configuração "site"; se demorar mais de 2,5 s ou falhar, usa a
   última cópia guardada no navegador. Depois carrega o js/app.js. */
(function () {
  var C = (window.SITE && window.SITE.canal) || {};
  var CHAVE = "dy-site-admin";
  function guardado() { try { return JSON.parse(localStorage.getItem(CHAVE) || "null"); } catch (e) { return null; } }
  var feito = false;
  function seguir(cfg) {
    if (feito) return; feito = true;
    window.SITE_ADMIN = cfg || guardado() || {};
    var s = document.createElement("script"); s.src = "js/app.js"; document.body.appendChild(s);
  }
  if (!C.supabaseUrl || !C.supabaseKey || !window.fetch) return seguir(null);
  setTimeout(function () { seguir(null); }, 2500);
  fetch(C.supabaseUrl.replace(/\/$/, "") + "/rest/v1/dy_site_config?chave=eq.site&select=valor", {
    headers: { apikey: C.supabaseKey, Authorization: "Bearer " + C.supabaseKey }, cache: "no-store"
  }).then(function (r) { return r.ok ? r.json() : null; }).then(function (l) {
    var cfg = l && l[0] ? l[0].valor || {} : null;
    if (cfg) { try { localStorage.setItem(CHAVE, JSON.stringify(cfg)); } catch (e) {} }
    seguir(cfg);
  }).catch(function () { seguir(null); });
})();
