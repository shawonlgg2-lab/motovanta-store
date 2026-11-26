const menuBtn=document.getElementById('menuBtn'),nav=document.getElementById('navlinks');

if(menuBtn && nav){
  menuBtn.addEventListener('click',()=>{
    const o=nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded',String(o));
    menuBtn.textContent=o?'✕':'☰';
  });
}

const year=document.getElementById('year');
if(year) year.textContent=new Date().getFullYear();

const search=document.getElementById('productSearch');

if(search){
  const btns=[...document.querySelectorAll('.filter-btn')];
  const cards=[...document.querySelectorAll('.product-card')];
  const nr=document.getElementById('noResults');

  let f=new URLSearchParams(location.search).get('cat');
  const allowed=['riding','creator','touring','safety','lifestyle','electronics'];
  if(!allowed.includes(f)) f='all';

  function upd(){
    const q=search.value.trim().toLowerCase();
    btns.forEach(b=>b.classList.toggle('active',b.dataset.filter===f));

    let n=0;
    cards.forEach(c=>{
      const v=(f==='all'||c.dataset.category===f)&&
      (c.dataset.search+' '+c.innerText).toLowerCase().includes(q);
      c.style.display=v?'':'none';
      if(v)n++;
    });

    if(nr)nr.style.display=n?'none':'block';
  }

  btns.forEach(b=>b.addEventListener('click',()=>{
    f=b.dataset.filter;
    upd();
  }));

  search.addEventListener('input',upd);
  upd();
}

if(typeof AFFILIATE_LINKS!=='undefined'){
  document.querySelectorAll('[data-link]').forEach(a=>{
    const u=(AFFILIATE_LINKS[a.dataset.link]||'').trim();
    if(u){
      a.href=u;
      a.target='_blank';
      a.rel='sponsored noopener';
      a.textContent=(typeof buttonText!=='undefined'?buttonText:'View on Amazon')+' ↗';
    }
  });
}
