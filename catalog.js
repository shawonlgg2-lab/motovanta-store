/* MotoVanta catalog.js — loads active products from Supabase into every [data-catalog] grid.
   Grid attributes (all optional):
   data-vehicle="motorcycle|car"  -> shows that vehicle type + "universal" products
   data-category="slug1,slug2"    -> only these category slugs
   data-featured="1"              -> only featured products
   data-filters="1"               -> category filter buttons above the grid
   data-group="1"                 -> one section per category (instead of one flat grid)
   data-limit="12"                -> maximum number of products
   Search: any <input type="search"> inside the same <section>.
   Empty message: an element with [data-empty] next to the grid. */
(function(){
 var grids=[].slice.call(document.querySelectorAll("[data-catalog]"));
 if(!grids.length)return;
 var cfg=window.MOTOVANTA_CONFIG||{};
 var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};

 if(!document.getElementById("mv-catalog-css")){
  var st=document.createElement("style");st.id="mv-catalog-css";
  st.textContent=".cat-section{margin:0 0 56px;scroll-margin-top:90px}.cat-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin:0 0 20px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.14)}.cat-head h2{font-family:'Barlow Condensed',sans-serif;font-size:clamp(26px,4vw,38px);font-weight:800;letter-spacing:.02em;text-transform:uppercase;margin:0;padding-left:12px;border-left:4px solid #ff7a1a}.cat-head span{font-size:13px;opacity:.7;white-space:nowrap}.cat-filters{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 24px}";
  document.head.appendChild(st);
 }

 function setEmpty(grid,on,text){
  var box=grid.parentNode&&grid.parentNode.querySelector("[data-empty]");
  if(!box)return;if(text)box.textContent=text;box.style.display=on?"block":"none";
 }
 if(!cfg.SUPABASE_URL||String(cfg.SUPABASE_URL).indexOf("YOUR-PROJECT")>-1||!cfg.SUPABASE_ANON_KEY||String(cfg.SUPABASE_ANON_KEY).indexOf("YOUR_")>-1||!window.supabase){
  grids.forEach(function(g){setEmpty(g,true)});return;
 }
 var client=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 var BASE="id,name,description,image_url,affiliate_url,price_label,is_featured,sort_order,categories(name,slug)";
 var EXTRA=",vehicle_type,brand,price_amount,currency";
 var run=function(cols){return client.from("products").select(cols).eq("status","active").order("sort_order")};

 run(BASE+EXTRA).then(function(r){return r.error?run(BASE):r}).then(function(res){
  var all=(res&&res.data)||[];
  grids.forEach(function(g){build(g,all)});
 }).catch(function(){grids.forEach(function(g){setEmpty(g,true)})});

 function catOf(p){return {slug:(p.categories&&p.categories.slug)||"other-gear",name:(p.categories&&p.categories.name)||"Other Gear"}}

 function cardHTML(p){
  var c=catOf(p),amt=p.price_amount;
  var price=(amt!=null&&amt!=="")
   ?'<span class="mv-price" data-amount="'+esc(amt)+'" data-currency="'+esc(p.currency||"USD")+'">'+(window.MVCurrency?MVCurrency.format(amt,p.currency||"USD"):"$"+Number(amt).toFixed(2)+" USD")+'</span>'
   :'<span>'+esc(p.price_label||c.name)+'</span>';
  var link=p.affiliate_url
   ?'<a class="link-arrow mv-affiliate" data-product-id="'+esc(p.id)+'" data-product-name="'+esc(p.name)+'" href="'+esc(p.affiliate_url)+'" target="_blank" rel="sponsored noopener nofollow">View product ↗</a>'
   :'<span class="link-arrow">Link coming soon</span>';
  return '<article class="product-card" data-category="'+esc(c.slug)+'" data-search="'+esc((p.name+" "+(p.description||"")+" "+c.name+" "+(p.brand||"")).toLowerCase())+'"><div class="product-image">'+(p.image_url?'<img src="'+esc(p.image_url)+'" alt="'+esc(p.name)+'" loading="lazy">':'')+'<span class="product-type">'+esc(c.name)+'</span></div><div class="product-info"><span class="tag">'+(p.is_featured?"FEATURED GEAR":"MOTOVANTA PICK")+'</span><h3>'+esc(p.name)+'</h3><p>'+esc(p.description||"Explore this recommended product and check compatibility before ordering.")+'</p><div class="product-meta">'+price+link+'</div></div></article>';
 }

 function build(grid,all){
  var veh=grid.getAttribute("data-vehicle"),cats=(grid.getAttribute("data-category")||"").split(",").map(function(s){return s.trim()}).filter(Boolean);
  var feat=grid.getAttribute("data-featured")==="1",lim=parseInt(grid.getAttribute("data-limit"),10)||0;
  var items=all.filter(function(p){
   if(veh&&p.vehicle_type&&p.vehicle_type!==veh&&p.vehicle_type!=="universal")return false;
   if(cats.length&&cats.indexOf(catOf(p).slug)<0)return false;
   if(feat&&!p.is_featured)return false;
   return true;
  });
  if(lim)items=items.slice(0,lim);
  if(!items.length){grid.innerHTML="";setEmpty(grid,true);return}
  setEmpty(grid,false);

  var groups={},order=[];
  items.forEach(function(p){var c=catOf(p);if(!groups[c.slug]){groups[c.slug]={name:c.name,items:[]};order.push(c.slug)}groups[c.slug].items.push(p)});

  if(grid.hasAttribute("data-group")){
   grid.classList.remove("product-grid");
   grid.innerHTML=order.map(function(s){var g=groups[s];
    return '<section class="cat-section" id="'+esc(s)+'" data-cat="'+esc(s)+'"><div class="cat-head"><h2>'+esc(g.name)+'</h2><span>'+g.items.length+(g.items.length===1?" product":" products")+'</span></div><div class="product-grid">'+g.items.map(cardHTML).join("")+'</div></section>';
   }).join("");
  }else{
   grid.innerHTML=items.map(cardHTML).join("");
  }
  window.MVCurrency&&MVCurrency.apply&&MVCurrency.apply();

  [].forEach.call(grid.querySelectorAll(".mv-affiliate"),function(a){a.addEventListener("click",function(){
   try{client.from("affiliate_clicks").insert({product_id:a.dataset.productId,product_name:a.dataset.productName,destination:a.href,referrer:location.href}).then(function(){})}catch(e){}
  })});

  var state="all",wrap=grid.closest("section")||document;
  var search=wrap.querySelector('input[type="search"]');
  function apply(){
   var q=((search&&search.value)||"").trim().toLowerCase(),any=false;
   var secs=[].slice.call(grid.querySelectorAll(".cat-section"));
   var scopes=secs.length?secs:[grid];
   scopes.forEach(function(sc){
    var vis=0;
    [].forEach.call(sc.querySelectorAll(".product-card"),function(c){
     var ok=(state==="all"||c.dataset.category===state)&&(!q||c.dataset.search.indexOf(q)>-1);
     c.style.display=ok?"":"none";if(ok)vis++;
    });
    if(secs.length)sc.style.display=vis?"":"none";
    if(vis)any=true;
   });
   setEmpty(grid,!any,any?null:"No matching products found. Try another search or category.");
  }
  if(search)search.addEventListener("input",apply);

  if(grid.getAttribute("data-filters")==="1"&&order.length>1){
   var bar=document.createElement("div");bar.className="cat-filters filter-list";
   bar.innerHTML='<button class="filter-btn active" data-filter="all">All</button>'+order.map(function(s){return '<button class="filter-btn" data-filter="'+esc(s)+'">'+esc(groups[s].name)+'</button>'}).join("");
   grid.parentNode.insertBefore(bar,grid);
   [].forEach.call(bar.querySelectorAll(".filter-btn"),function(b){b.addEventListener("click",function(){
    state=b.dataset.filter;[].forEach.call(bar.querySelectorAll(".filter-btn"),function(x){x.classList.toggle("active",x===b)});apply();
   })});
  }
 }
})();
