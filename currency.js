/* MotoVanta currency switcher — USD default, plus CAD, AUD, BDT.
   Any element like <span class="mv-price" data-amount="24.99" data-currency="USD">
   is converted automatically. Rates come from config.js (CURRENCY_RATES). */
(function(){
  var cfg = window.MOTOVANTA_CONFIG || {};
  var rates = {USD:1, CAD:1.41, AUD:1.46, BDT:124};
  var custom = cfg.CURRENCY_RATES || {};
  Object.keys(custom).forEach(function(k){ var n = Number(custom[k]); if(n > 0) rates[k] = n; });

  var META = {
    USD:{flag:"🇺🇸", name:"United States", symbol:"$",  dec:2, locale:"en-US"},
    CAD:{flag:"🇨🇦", name:"Canada",        symbol:"C$", dec:2, locale:"en-CA"},
    AUD:{flag:"🇦🇺", name:"Australia",     symbol:"A$", dec:2, locale:"en-AU"},
    BDT:{flag:"🇧🇩", name:"Bangladesh",    symbol:"৳",  dec:0, locale:"en-US"}
  };
  var ORDER = ["USD","CAD","AUD","BDT"];
  var KEY = "mv_currency", cur = "USD";
  try { var saved = localStorage.getItem(KEY); if(META[saved]) cur = saved; } catch(e){}

  function format(amount, from){
    var n = Number(amount);
    if(!isFinite(n)) return "";
    var base = rates[(from || "USD").toUpperCase()] || 1;
    var value = (n / base) * rates[cur];
    var m = META[cur];
    var txt = value.toLocaleString(m.locale, {minimumFractionDigits:m.dec, maximumFractionDigits:m.dec});
    return m.symbol + txt + " " + cur;
  }

  function apply(){
    var list = document.querySelectorAll(".mv-price[data-amount]");
    for(var i = 0; i < list.length; i++){
      list[i].textContent = format(list[i].getAttribute("data-amount"), list[i].getAttribute("data-currency"));
    }
  }

  function set(code){
    if(!META[code]) return;
    cur = code;
    try { localStorage.setItem(KEY, code); } catch(e){}
    var sel = document.querySelector(".mv-currency");
    if(sel) sel.value = code;
    apply();
  }

  function injectStyle(){
    var s = document.createElement("style");
    s.textContent =
      ".mv-currency{background:#0b1a2e;color:#fff;border:1px solid rgba(255,255,255,.28);border-radius:8px;" +
      "padding:8px 8px;font:600 12px/1 Inter,system-ui,sans-serif;cursor:pointer;margin-right:8px;max-width:96px}" +
      ".mv-currency:focus{outline:2px solid #ff7a1a;outline-offset:1px}";
    document.head.appendChild(s);
  }

  function mount(){
    if(document.querySelector(".mv-currency")) return;
    var host = document.querySelector(".nav-actions") || document.querySelector("header .nav");
    if(!host) return;
    injectStyle();
    var sel = document.createElement("select");
    sel.className = "mv-currency";
    sel.setAttribute("aria-label", "Choose currency");
    sel.title = "Currency";
    ORDER.forEach(function(c){
      var o = document.createElement("option");
      o.value = c;
      o.textContent = META[c].flag + " " + c;
      o.title = META[c].name;
      sel.appendChild(o);
    });
    sel.value = cur;
    sel.addEventListener("change", function(){ set(sel.value); });
    host.insertBefore(sel, host.firstChild);
  }

  window.MVCurrency = {format:format, apply:apply, set:set, get:function(){return cur;}, rates:rates};

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ mount(); apply(); });
  else { mount(); apply(); }
})();
