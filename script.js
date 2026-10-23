'use strict';

// Supabase terméklista és biztonságos Edge Function foglalás.

const categories = [

  {id:'all',icon:'▦',label:'Összes'},

  {id:'stroller',icon:'♧',label:'Babakocsi és autósülés'},

  {id:'nursery',icon:'♙',label:'Babaszoba'},

  {id:'feeding',icon:'♧',label:'Etetés'},

  {id:'bath',icon:'♧',label:'Fürdetés és ápolás'},

  {id:'clothes',icon:'♧',label:'Ruhák és textíliák'},

  {id:'toys',icon:'♡',label:'Játékok'},

  {id:'other',icon:'•••',label:'Egyéb'}

];

const categoryArt = {

  'all': '<g transform="translate(1 2)"><rect x="12" y="42" width="29" height="24" rx="3" fill="#ead4b7" stroke="#a88d6f" stroke-width="1.8"/><path d="M15 44v20m7-20v20m7-20v20m7-20v20" stroke="#b99b78" stroke-width="1.7"/><path d="M13 66v7m27-7v7" stroke="#94785e" stroke-width="3"/><path d="M47 41q1-19 18-19 16 1 18 19z" fill="#b9cbb1" stroke="#7e9b83" stroke-width="1.7"/><path d="M47 42h36l-6 17H55z" fill="#ddc2a1" stroke="#ab8b6b" stroke-width="1.7"/><path d="M57 59l-5 9m22-9 5 9" stroke="#8e806c" stroke-width="2.5"/><circle cx="51" cy="69" r="4" fill="#869f8b"/><circle cx="80" cy="69" r="4" fill="#869f8b"/><circle cx="52" cy="15" r="7" fill="#d9b994"/><circle cx="68" cy="15" r="7" fill="#d9b994"/><circle cx="60" cy="23" r="12" fill="#e5c6a0"/><circle cx="56" cy="22" r="1.6" fill="#6e5a4b"/><circle cx="64" cy="22" r="1.6" fill="#6e5a4b"/><ellipse cx="60" cy="28" rx="4" ry="3" fill="#f5e8d3"/></g>',

  'stroller': '<path d="M23 37q2-22 23-23 19 1 21 23H23z" fill="#b7c6aa" stroke="#7b977b" stroke-width="2"/><path d="M23 38h46l-8 20H35z" fill="#e0c7a4" stroke="#a78e70" stroke-width="2"/><path d="M25 22l-9-7" stroke="#8a7966" stroke-width="3" stroke-linecap="round"/><path d="M36 59l-6 11m27-11 7 11" stroke="#8a7966" stroke-width="3"/><circle cx="28" cy="71" r="6" fill="#8c9e89"/><circle cx="66" cy="71" r="6" fill="#8c9e89"/><path d="M75 34v26m0-26 12-4" stroke="#b7a084" stroke-width="3"/><rect x="70" y="41" width="15" height="19" rx="5" fill="#d9bda3" stroke="#a58c77" stroke-width="2"/>',

  'nursery': '<rect x="17" y="30" width="65" height="39" rx="4" fill="#e5d0ae" stroke="#a78d70" stroke-width="2"/><rect x="23" y="35" width="53" height="21" rx="4" fill="#faf2e3"/><path d="M26 34v30m10-30v30m10-30v30m10-30v30m10-30v30m10-30v30" stroke="#ae987a" stroke-width="2"/><path d="M22 68v8m55-8v8" stroke="#94775b" stroke-width="4"/><path d="M20 27q27-20 58 0" fill="none" stroke="#b6c3a6" stroke-width="3"/><circle cx="51" cy="18" r="4" fill="#cfb98d"/>',

  'feeding': '<path d="M24 26h25v38q-12 13-25 0z" fill="#f5e3c8" stroke="#ad9476" stroke-width="2"/><path d="M29 20h15v6H29z" fill="#c5d0b4"/><path d="M35 11q8 4 3 9h-7q-4-6 4-9z" fill="#d3b9a2"/><path d="M55 34q19-4 25 11l-5 17H59z" fill="#b9c9b4" stroke="#829b84" stroke-width="2"/><path d="M55 35q13 9 25 10" fill="none" stroke="#f9f1e1" stroke-width="3"/><circle cx="66" cy="53" r="3" fill="#e7d1aa"/><path d="M20 70h64" stroke="#b9a68a" stroke-width="3" stroke-linecap="round"/>',

  'bath': '<path d="M16 43h72l-9 23H27z" fill="#c5d7cc" stroke="#8aa79b" stroke-width="2"/><path d="M20 42q3-8 10 0h50q7-8 9 0" fill="#f8f4e8" stroke="#8aa79b" stroke-width="2"/><path d="M33 66l-4 8m47-8 4 8" stroke="#a18c70" stroke-width="3"/><circle cx="42" cy="29" r="6" fill="#fff8e9" stroke="#d7cdb4"/><circle cx="57" cy="22" r="8" fill="#fff8e9" stroke="#d7cdb4"/><circle cx="69" cy="32" r="5" fill="#fff8e9" stroke="#d7cdb4"/><path d="M28 40V23q0-8 8-8" stroke="#a5b5a2" stroke-width="3" fill="none"/>',

  'clothes': '<path d="M29 24l12-7h16l12 7 14 17-13 10-8-8v30H36V43l-8 8-13-10z" fill="#e6c7b4" stroke="#ad8f7e" stroke-width="2"/><path d="M41 17q7 14 16 0" fill="none" stroke="#f7e8d6" stroke-width="4"/><path d="M36 56h26" stroke="#f5e6d9" stroke-width="2"/><path d="M75 61q8-7 13 1l-3 13H71z" fill="#c3cdb4" stroke="#899b81" stroke-width="2"/>',

  'toys': '<circle cx="38" cy="25" r="11" fill="#c9a77e"/><circle cx="62" cy="25" r="11" fill="#c9a77e"/><circle cx="50" cy="36" r="21" fill="#ddbb90" stroke="#a78968" stroke-width="2"/><ellipse cx="50" cy="64" rx="21" ry="17" fill="#ddbb90" stroke="#a78968" stroke-width="2"/><circle cx="42" cy="34" r="2.3" fill="#645646"/><circle cx="58" cy="34" r="2.3" fill="#645646"/><ellipse cx="50" cy="43" rx="7" ry="5" fill="#f8e7cd"/><circle cx="50" cy="41" r="2" fill="#7d6656"/><path d="M32 59l-10 7m46-7 10 7" stroke="#b99a77" stroke-width="7" stroke-linecap="round"/>',

  'other': '<g><rect x="15" y="29" width="44" height="34" rx="6" fill="#d9c9af" stroke="#a28b71" stroke-width="2"/><rect x="20" y="34" width="34" height="23" rx="3" fill="#f8f4e9"/><path d="M25 47q5-8 10 0t10 0" fill="none" stroke="#98ae9d" stroke-width="2.5" stroke-linecap="round"/><circle cx="37" cy="61" r="2" fill="#9b8b74"/><path d="M31 29v-6q0-5 6-5" fill="none" stroke="#b6a38b" stroke-width="3"/><g transform="translate(59 26)"><circle cx="14" cy="14" r="13" fill="#c3d0b8" stroke="#8fa38d" stroke-width="2"/><circle cx="14" cy="14" r="5" fill="#f9f2e6"/><path d="M14 1V-5m0 38v7m-13-26h-5m36 0h6" stroke="#b8a17f" stroke-width="4" stroke-linecap="round"/></g><path d="M58 68q10-9 21 0" fill="none" stroke="#bba181" stroke-width="4" stroke-linecap="round"/><circle cx="83" cy="69" r="5" fill="#e2c5a4"/></g>'

};

function categoryImage(id) {

  const drawing = categoryArt[id] || categoryArt.other;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 88" role="img"><ellipse cx="50" cy="47" rx="44" ry="38" fill="#f2eadb" opacity=".65"/><path d="M8 58q5-13 13-13M82 15q6 7 7 15" fill="none" stroke="#c1cdb6" stroke-width="3" stroke-linecap="round" opacity=".7"/>${drawing}</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

}

// Termékek kizárólag a Supabase adatbázisból érkeznek.

const SUPABASE_URL='https://aalzgkdnqurpoepueehc.supabase.co';

const SUPABASE_PUBLISHABLE_KEY='sb_publishable_1PZSSo5VB-ZD90s5OOU2QA_v_1bj_ZK';

let products=[];

const RESERVATION_ENDPOINT=`${SUPABASE_URL}/functions/v1/create-reservation`;

let reservationBusy=false;

const categoryAliases={

  'Játékok':'toys','Babakocsi és autósülés':'stroller','Babaszoba':'nursery',

  'Etetés':'feeding','Fürdetés és ápolás':'bath','Ruhák és textíliák':'clothes',

  'Egyéb':'other',toys:'toys',stroller:'stroller',nursery:'nursery',

  feeding:'feeding',bath:'bath',clothes:'clothes',other:'other'

};

function normalizeProduct(p){

  const category=categoryAliases[p.category]||'other';

  const emoji={toys:'🧸',stroller:'🛒',nursery:'🛏️',feeding:'🍼',bath:'🛁',clothes:'👶',other:'🎁'}[category];

  const url=typeof p.webshop_url==='string'&&/^https?:\/\//i.test(p.webshop_url)?p.webshop_url:'';

  const image=typeof p.image_url==='string'&&/^https?:\/\//i.test(p.image_url)?p.image_url:'';

  return {id:String(p.id),name:String(p.name||''),description:String(p.description||''),

    price:Number(p.price)||0,category,status:'available',emoji,image,url};

}

async function loadProducts(){

  const results=document.getElementById('results');

  results.textContent='Ajándékok betöltése…';

  try{

    const response=await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,description,price,category,image_url,webshop_url&is_active=eq.true&order=created_at.asc`,{

      headers:{apikey:SUPABASE_PUBLISHABLE_KEY}

    });

    if(!response.ok)throw new Error(`HTTP ${response.status}`);

    const rows=await response.json();

    if(!Array.isArray(rows))throw new Error('Érvénytelen válasz');

    products=rows.map(normalizeProduct);

    await loadReservedStatus();

    // A korábban kosárba tett, már nem létező termékeket eltávolítjuk.

    for(const id of cart)if(!products.some(p=>p.id===id&&p.status==='available'))cart.delete(id);

    saveCart();updateCartBadge();renderProducts();

    if(!cartModal.hidden)renderCart();

  }catch(error){

    console.error('Supabase termékbetöltési hiba:',error);

    results.textContent='Nem sikerült betölteni az ajándékokat. Frissítsd az oldalt, vagy próbáld újra később.';

    grid.innerHTML='';

    document.getElementById('empty-state').hidden=true;

  }

}

const state = {category:'all',query:'',sort:'default',favorites:new Set()};

// A kosár csak ebben a böngészőben tárolódik. Nem foglal le semmit.

const CART_KEY='nimrod-wishlist-supabase-cart-v43';

function readCart(){try{const stored=JSON.parse(localStorage.getItem(CART_KEY)||'[]');return new Set(Array.isArray(stored)?stored.filter(id=>typeof id==='string'):[]);}catch{return new Set();}}

const cart=readCart();

function saveCart(){try{localStorage.setItem(CART_KEY,JSON.stringify([...cart]));}catch{}}

function updateCartBadge(){const count=cart.size;document.getElementById('cart-count').textContent=String(count);document.getElementById('floating-cart').setAttribute('aria-label',`Kosár megnyitása, ${count} termék`);}

function toggleCartItem(id){const product=products.find(p=>p.id===id);if(!product||product.status!=='available')return;if(cart.has(id))cart.delete(id);else cart.add(id);saveCart();updateCartBadge();renderProducts();if(!detailModal.hidden&&detailContent.dataset.productId===String(id))openProductDetail(id,true);if(!cartModal.hidden)renderCart();}

const categoryContainer = document.getElementById('categories');

const grid = document.getElementById('product-grid');

const money = value => new Intl.NumberFormat('hu-HU').format(value)+' Ft';

const escapeHtml = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function renderCategories(){

  categoryContainer.innerHTML=categories.map(cat=>`<button type="button" class="category ${state.category===cat.id?'active':''}" data-category="${cat.id}" aria-pressed="${state.category===cat.id}"><img class="category-art" src="${categoryImage(cat.id)}" alt="" aria-hidden="true" decoding="async"><span class="category-label">${cat.label}</span></button>`).join('');

}

function renderProducts(){

  let filtered=products.filter(p=>(state.category==='all'||p.category===state.category)&&`${p.name} ${p.description}`.toLocaleLowerCase('hu-HU').includes(state.query));

  if(state.sort==='price-asc')filtered.sort((a,b)=>a.price-b.price);

  if(state.sort==='price-desc')filtered.sort((a,b)=>b.price-a.price);

  if(state.sort==='name')filtered.sort((a,b)=>a.name.localeCompare(b.name,'hu'));

  if(state.sort==='available')filtered.sort((a,b)=>(a.status==='available'?0:1)-(b.status==='available'?0:1));

  document.getElementById('results').textContent=`${filtered.length} ajándék megjelenítve · A foglalás 7 napig érvényes`;

  document.getElementById('empty-state').hidden=filtered.length>0;

  grid.innerHTML=filtered.map(p=>{

    const reserved=p.status==='reserved';const preordered=p.status==='preordered';

    const statusText=reserved?'Foglalt':preordered?'Félretéve':'Szabad';

    return `<article class="product-card" data-product="${p.id}" tabindex="0" role="button" aria-label="${escapeHtml(p.name)} részleteinek megtekintése"><div class="product-image"><span class="product-placeholder" aria-hidden="true">${p.emoji}</span>${p.image?`<img class="product-photo" src="${p.image}" alt="" loading="lazy" onerror="this.remove()">`:``}<button type="button" class="favorite" data-favorite="${p.id}" aria-pressed="${state.favorites.has(p.id)}" aria-label="${state.favorites.has(p.id)?'Eltávolítás a kedvencekből':'Kedvencekhez adás'}: ${escapeHtml(p.name)}">${state.favorites.has(p.id)?'♥':'♡'}</button></div><div class="product-body"><h3 class="product-name">${escapeHtml(p.name)}</h3><p class="product-description">${escapeHtml(p.description)}</p><p class="price">${money(p.price)}</p><button class="product-button product-cart-button" type="button" data-cart-add="${p.id}" ${p.status!=='available'?'disabled title="Ez az ajándék jelenleg nem elérhető"':''}>${p.status!=='available'?'Nem elérhető':cart.has(p.id)?'✓ Kosárban – eltávolítom':'🛒 Kosárba teszem'}</button><div class="status ${reserved?'reserved':preordered?'preordered':''}"><span aria-hidden="true">🎁</span>${statusText}</div></div></article>`;

  }).join('');

}

categoryContainer.addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;state.category=button.dataset.category;renderCategories();renderProducts();});

grid.addEventListener('click',event=>{

  const cartButton=event.target.closest('[data-cart-add]');if(cartButton){toggleCartItem(cartButton.dataset.cartAdd);return;}

  const favorite=event.target.closest('[data-favorite]');

  if(favorite){const id=favorite.dataset.favorite;if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);renderProducts();return;}

  const card=event.target.closest('[data-product]');if(card)openProductDetail(card.dataset.product);

});

grid.addEventListener('keydown',event=>{

  if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-product]')){

    event.preventDefault();openProductDetail(event.target.dataset.product);

  }

});

document.getElementById('search').addEventListener('input',event=>{state.query=event.target.value.trim().toLocaleLowerCase('hu-HU');renderProducts();});

document.getElementById('sort').addEventListener('change',event=>{state.sort=event.target.value;renderProducts();});

renderCategories();loadProducts();

// A lap tetejére gomb csak görgetés után látható.

const backToTop = document.getElementById('back-to-top');

function updateBackToTop(){if(!backToTop)return;const y=window.scrollY||document.documentElement.scrollTop||0;backToTop.classList.toggle('is-visible',y>=220);}

window.addEventListener('scroll',updateBackToTop,{passive:true});

if(backToTop)backToTop.addEventListener('click',()=>{window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});

updateBackToTop();

const detailModal=document.getElementById('detail-modal');

const detailDialog=detailModal.querySelector('.detail-dialog');

const detailContent=document.getElementById('detail-content');

let detailReturnFocus=null;

function openProductDetail(id,keepFocus=false){

  const p=products.find(item=>item.id===id);if(!p)return;

  if(!keepFocus)detailReturnFocus=document.activeElement;

  detailContent.dataset.productId=String(id);

  const cat=categories.find(item=>item.id===p.category);

  const statusText=p.status==='reserved'?'Foglalt':p.status==='preordered'?'Félretéve':'Szabad';

  const statusClass=p.status==='reserved'?'reserved':p.status==='preordered'?'preordered':'';

  const hasShopLink=typeof p.url==='string' && p.url.startsWith('https://') || typeof p.url==='string' && p.url.startsWith('http://');

  const shopAction=hasShopLink

    ? `<a class="detail-action detail-action--preview" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer">↗ Termék megtekintése a webshopban</a>`

    : `<button class="detail-action detail-action--preview" type="button" disabled>↗ Termék megtekintése a webshopban – hamarosan</button>`;

  detailContent.innerHTML=`<div class="detail-layout">

    <div class="detail-picture"><span class="detail-emoji" aria-hidden="true">${p.emoji}</span>${p.image?`<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.remove()">`:''}</div>

    <div><p class="detail-eyebrow">${escapeHtml(cat?cat.label:'Ajándék')}</p>

    <h2 class="detail-title" id="detail-title">${escapeHtml(p.name)}</h2>

    <p class="detail-description" id="detail-product-description">${escapeHtml(p.description)}</p>

    ${p.description.trim().length>180?`<button type="button" class="detail-description-toggle" id="detail-description-toggle" aria-expanded="false" aria-controls="detail-product-description">Teljes leírás megjelenítése ↓</button>`:''}

    <p class="detail-price">${money(p.price)}</p>

    <span class="detail-status ${statusClass}">♡ ${statusText}</span>

    <div class="detail-actions">${shopAction}

      ${p.status==='available'?`<button type="button" class="detail-action detail-cart-action" id="detail-cart-add">${cart.has(p.id)?'✓ Kosárban – eltávolítom':'🛒 Kosárba teszem'}</button>`:''}

      <p class="detail-footnote">A kosárba helyezés még nem jelent foglalást. A kiválasztott ajándékokat a kosárban tudod 7 napra lefoglalni. A webshop megtekintése sem változtatja meg az ajándék állapotát.</p>

    </div></div></div>

    ${p.status!=='available'?`<div class="reservation-unavailable">Ez az ajándék jelenleg ${statusText.toLowerCase()} az aktuális állapot szerint, ezért most nem foglalható. A webshop megtekintése ettől függetlenül lehetséges, ha van terméklink.</div>`:''}`;

  const detailCartButton=detailContent.querySelector('#detail-cart-add');

  if(detailCartButton)detailCartButton.addEventListener('click',()=>toggleCartItem(p.id));

  const descriptionToggle=detailContent.querySelector('#detail-description-toggle');

  if(descriptionToggle)descriptionToggle.addEventListener('click',()=>{

    const description=detailContent.querySelector('#detail-product-description');

    const expanded=description.classList.toggle('is-expanded');

    descriptionToggle.setAttribute('aria-expanded',String(expanded));

    descriptionToggle.textContent=expanded?'Leírás összecsukása ↑':'Teljes leírás megjelenítése ↓';

  });

  detailModal.hidden=false;detailModal.removeAttribute('hidden');document.body.classList.add('detail-open');detailDialog.focus();

}

function closeProductDetail(){

  if(detailModal.hidden)return;

  detailModal.hidden=true;document.body.classList.remove('detail-open');

  if(detailReturnFocus&&detailReturnFocus.isConnected)detailReturnFocus.focus();

}

detailModal.addEventListener('click',event=>{if(event.target.closest('[data-close-detail]'))closeProductDetail();});

document.addEventListener('keydown',event=>{

  if(detailModal.hidden)return;

  if(event.key==='Escape'){closeProductDetail();return;}

  if(event.key==='Tab'){

    const elements=[...detailModal.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled])')];

    if(!elements.length){event.preventDefault();detailDialog.focus();return;}

    const first=elements[0],last=elements[elements.length-1];

    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}

    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}

    else if(document.activeElement===detailDialog&&event.shiftKey){event.preventDefault();last.focus();}

  }

});

const cartModal=document.getElementById('cart-modal');

const cartPanel=cartModal.querySelector('.cart-panel');

const cartItems=document.getElementById('cart-items');

let cartReturnFocus=null;

function renderCart(){

  const selected=products.filter(p=>cart.has(p.id));

  cartItems.innerHTML=selected.length?selected.map(p=>`<article class="cart-item"><div class="cart-item-picture"><span aria-hidden="true">${p.emoji}</span>${p.image?`<img src="${escapeHtml(p.image)}" alt="" onerror="this.remove()">`:''}</div><div class="cart-item-info"><h3>${escapeHtml(p.name)}</h3><p>${money(p.price)}</p><button type="button" class="cart-remove" data-cart-remove="${p.id}">Eltávolítás</button></div><button type="button" class="cart-view" data-cart-view="${p.id}" aria-label="${escapeHtml(p.name)} részletei">Részletek ›</button></article>`).join(''):'<div class="cart-empty"><span aria-hidden="true">🧸</span><h3>A kosarad még üres</h3><p>Nézelődj a kívánságlistában, és tedd ide a neked tetsző ajándékokat!</p></div>';

  document.getElementById('cart-total').textContent=money(selected.reduce((sum,p)=>sum+p.price,0));

  document.getElementById('cart-clear').hidden=!selected.length;

  document.getElementById('cart-reserve-all').hidden=!selected.length;

  if(!selected.length)closeCartReservationPreview();

}

function closeCartReservationPreview(){document.getElementById('cart-reservation-preview').hidden=true;document.getElementById('cart-reserve-all').setAttribute('aria-expanded','false');}

function openCart(){if(!detailModal.hidden)closeProductDetail();cartReturnFocus=document.activeElement;renderCart();cartModal.hidden=false;cartModal.removeAttribute('hidden');document.body.classList.add('cart-open');cartPanel.focus();}

function closeCart(){if(cartModal.hidden)return;closeCartReservationPreview();cartModal.hidden=true;document.body.classList.remove('cart-open');if(cartReturnFocus?.isConnected)cartReturnFocus.focus();}

document.getElementById('floating-cart').addEventListener('click',event=>{event.preventDefault();event.stopPropagation();openCart();});

document.getElementById('cart-continue').addEventListener('click',closeCart);

document.getElementById('cart-reserve-all').addEventListener('click',()=>{const selected=products.filter(p=>cart.has(p.id)&&p.status==='available');if(!selected.length)return;document.getElementById('cart-reservation-summary').textContent=`${selected.length} ajándék, összesen ${money(selected.reduce((sum,p)=>sum+p.price,0))}. A megerősítés után mindegyik 7 napra foglalttá válik.`;document.getElementById('cart-reserve-confirm').disabled=false;document.getElementById('cart-reservation-preview').hidden=false;document.getElementById('cart-reserve-all').setAttribute('aria-expanded','true');document.getElementById('cart-reservation-preview').scrollIntoView({block:'nearest',behavior:'smooth'});});

// Szállítási választás: csak a címeket közöljük, személyes adatot nem kérünk.

// A Supabase-ben tárolt publikus átvételi helyeket olvassuk, nem adminjoggal.

const SHIPPING_TABLE='shipping_locations';

let shippingLocations=[];

let selectedShippingLocation=null;

let selectedDeliveryMode='personal';

const shippingStyle=document.createElement('style');

shippingStyle.textContent=`

#delivery-options{margin:17px 0;padding:16px;border:1px solid #dfcdb8;border-radius:14px;background:#fffaf4;color:#554536}

#delivery-options h4{margin:0 0 9px;font-size:1.05rem}

.delivery-choices{display:flex;flex-wrap:wrap;gap:10px;margin:9px 0 12px}

.delivery-choices label{display:flex;align-items:center;gap:7px;cursor:pointer;font-size:.92rem}

#shipping-addresses{display:grid;gap:9px;margin-top:9px}

.shipping-address{border:1px solid #e0d1bf;border-radius:10px;padding:11px;background:#fff}

.shipping-address strong{display:block;margin-bottom:4px}

.shipping-address p{margin:3px 0;line-height:1.5;overflow-wrap:anywhere}

.shipping-address button{margin-top:8px;background:#9d7555;color:#fff;border:0;border-radius:8px;padding:8px 12px;cursor:pointer}

#delivery-options .shipping-hint{font-size:.84rem;line-height:1.5;margin:7px 0}

`;

document.head.appendChild(shippingStyle);

const deliveryOptions=document.createElement('section');

deliveryOptions.id='delivery-options';

deliveryOptions.innerHTML=`<h4>Hogyan szeretnéd átadni az ajándékot?</h4>

<div class="delivery-choices"><label><input type="radio" name="delivery-mode" value="personal" checked> Személyesen adom át</label><label><input type="radio" name="delivery-mode" value="shipping"> Elküldöm a csomagot</label></div>

<div id="shipping-details" hidden><p class="shipping-hint">Válaszd ki a csomagautomatát, majd másold ki a címet a webshop rendelési felületére. A webshopban a saját adataidat te adod meg.</p><div id="shipping-addresses" aria-live="polite">Csomagautomaták betöltése…</div></div>

<p class="shipping-hint">A szállítási mód kiválasztása tájékoztató jellegű; a tényleges szállítást a webshopban kell intézni.</p>`;

const reservationWarning=document.querySelector('#cart-reservation-preview .cart-reservation-warning');

if(reservationWarning)reservationWarning.before(deliveryOptions);

else document.getElementById('cart-reservation-preview').appendChild(deliveryOptions);

const shippingDetails=document.getElementById('shipping-details');

const shippingAddresses=document.getElementById('shipping-addresses');

deliveryOptions.addEventListener('change',e=>{

 if(e.target.name!=='delivery-mode')return;

 selectedDeliveryMode=e.target.value;

 shippingDetails.hidden=selectedDeliveryMode!=='shipping';

 if(selectedDeliveryMode==='shipping')void loadShippingLocations();else selectedShippingLocation=null;

});

function cleanShippingRow(row){

 const provider=String(row.provider||row.carrier||row.service||row.code||'Csomagautomata');

 const name=String(row.location_name||row.name||row.pickup_name||row.automata_name||'Átvételi hely');

 const address=String(row.address||row.full_address||row.exact_address||'');

 const identifier=String(row.location_code||row.automata_id||row.machine_id||'');

 const extra=String(row.notes||row.extra_info||row.description||'');

 return {id:String(row.id||provider+name),provider,name,address,identifier,extra};

}

function renderShippingLocations(){

 shippingAddresses.replaceChildren();

 if(!shippingLocations.length){shippingAddresses.textContent='Jelenleg nincs megjeleníthető csomagautomata. A foglalás ettől még lehetséges.';return;}

 for(const place of shippingLocations){

  const card=document.createElement('div');card.className='shipping-address';

  const title=document.createElement('strong');title.textContent=place.provider+' – '+place.name;card.appendChild(title);

  const addr=document.createElement('p');addr.textContent=place.address;card.appendChild(addr);

  if(place.identifier){const code=document.createElement('p');code.textContent='Automata azonosítója: '+place.identifier;card.appendChild(code);}

  if(place.extra){const extra=document.createElement('p');extra.textContent=place.extra;card.appendChild(extra);}

  const select=document.createElement('label');select.style.display='block';select.style.marginTop='8px';

  const radio=document.createElement('input');radio.type='radio';radio.name='selected-shipping-provider';radio.value=place.provider;

  radio.checked=selectedShippingLocation?.provider===place.provider;

  radio.addEventListener('change',()=>{selectedShippingLocation=place;});

  select.append(radio,document.createTextNode(' Ezt az automatát választom'));card.appendChild(select);

  const button=document.createElement('button');button.type='button';button.textContent='Cím másolása';

  button.addEventListener('click',async()=>{

   const text=[place.provider+' – '+place.name,place.address,place.identifier?'Automata: '+place.identifier:'',place.extra].filter(Boolean).join('\n');

   try{await navigator.clipboard.writeText(text);selectedShippingLocation=place;button.textContent='✓ Cím kimásolva';}

   catch{const field=document.createElement('textarea');field.value=text;field.readOnly=true;card.appendChild(field);field.select();button.textContent='Jelöld ki és másold a címet';}

  });card.appendChild(button);shippingAddresses.appendChild(card);

 }

}

let shippingLoadPromise=null;

async function loadShippingLocations(){

 if(shippingLoadPromise)return shippingLoadPromise;

 shippingLoadPromise=(async()=>{

  try{

   const response=await fetch(`${SUPABASE_URL}/rest/v1/${SHIPPING_TABLE}?select=*`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}});

   if(!response.ok)throw new Error(`HTTP ${response.status}`);

   const rows=await response.json();

   shippingLocations=(Array.isArray(rows)?rows:[]).filter(r=>r.is_visible===true||r.is_public===true||r.is_active===true||r.visible===true).map(cleanShippingRow).filter(r=>r.address);

   renderShippingLocations();

  }catch(err){console.warn('Szállítási helyek lekérése:',err);shippingAddresses.textContent='A csomagautomaták most nem érhetők el. A foglalás ettől még működik.';}

 })();

 return shippingLoadPromise;

}

document.getElementById('cart-reserve-cancel').addEventListener('click',closeCartReservationPreview);

document.getElementById('cart-reserve-confirm').addEventListener('click',async()=>{

  const ids=products.filter(p=>cart.has(p.id)&&p.status==='available').map(p=>p.id);

  await submitReservation(ids,document.getElementById('cart-guest-name').value,document.getElementById('cart-reserve-confirm'),document.getElementById('cart-reservation-feedback'));

});

document.getElementById('cart-clear').addEventListener('click',()=>{cart.clear();saveCart();updateCartBadge();renderProducts();renderCart();});

cartModal.addEventListener('click',event=>{

  if(event.target.closest('[data-close-cart]')){closeCart();return;}

  const remove=event.target.closest('[data-cart-remove]');if(remove){toggleCartItem(remove.dataset.cartRemove);return;}

  const view=event.target.closest('[data-cart-view]');if(view){const id=view.dataset.cartView;closeCart();openProductDetail(id);}

});

document.addEventListener('keydown',event=>{

  if(cartModal.hidden)return;

  if(event.key==='Escape'){event.preventDefault();closeCart();return;}

  if(event.key==='Tab'){

    const focusable=[...cartModal.querySelectorAll('button:not([disabled]):not([hidden]),a[href]')].filter(el=>el.getClientRects().length);

    if(!focusable.length){event.preventDefault();cartPanel.focus();return;}

    const first=focusable[0],last=focusable[focusable.length-1];

    if(event.shiftKey&&(document.activeElement===first||document.activeElement===cartPanel)){event.preventDefault();last.focus();}

    else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===cartPanel)){event.preventDefault();first.focus();}

  }

});

updateCartBadge();

// Foglaltság lekérdezése: kizárólag nyilvános, név és token nélküli nézetből.

async function loadReservedStatus(){

  const response=await fetch(`${SUPABASE_URL}/rest/v1/public_reserved_products?select=product_id`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}});

  if(!response.ok)throw new Error(`Foglaltsági adatok nem elérhetők (${response.status})`);

  const rows=await response.json();

  if(!Array.isArray(rows))throw new Error('Érvénytelen foglaltsági válasz');

  const reserved=new Set(rows.map(row=>row.product_id));

  for(const p of products)p.status=reserved.has(p.id)?'reserved':'available';

}

// v74 – webshoponkénti áttekintés, kizárólag a meglévő terméklinkekből.

function giftShopInfo(url){

  if(typeof url!=='string'||!/^https?:\/\//i.test(url))return null;

  try{

    const parsed=new URL(url);

    if(!['http:','https:'].includes(parsed.protocol))return null;

    const host=parsed.hostname.toLowerCase().replace(/^www\./,'');

    return {key:host,label:host,url:parsed.href};

  }catch{return null;}

}

function giftShopGroups(items){

  const groups=new Map();

  for(const item of items){

    const shop=giftShopInfo(item.url);

    const key=shop?.key||'__no_shop__';

    if(!groups.has(key))groups.set(key,{label:shop?.label||'Webshoplink nélküli ajándékok',items:[]});

    groups.get(key).items.push({...item,shop});

  }

  return [...groups.values()];

}

function giftShopGroupedHtml(items,{showStatus=false,purchaseIndex=null}={}){

  if(!items.length)return '<p>Nincs megjeleníthető ajándék.</p>';

  return '<div class="gift-shop-groups">'+giftShopGroups(items).map(group=>

    `<section class="gift-shop-group"><h4>🛍️ ${escapeHtml(group.label)}</h4><ul>`+

    group.items.map(item=>`<li><span class="gift-shop-item-name">${escapeHtml(item.name||'Ajándék')}</span>`+

      (showStatus?`<span class="gift-shop-item-status">${item.status==='purchased'?'Megvásárolva':item.status==='reserved'?'Lefoglalva':escapeHtml(item.status||'—')}</span>`:'')+

      (item.shop?`<a class="gift-shop-link" href="${escapeHtml(item.shop.url)}" target="_blank" rel="noopener noreferrer">↗ Megnyitás a webshopban</a>`:'<span class="gift-shop-no-link">Nincs webshoplink</span>')+

      (purchaseIndex!==null&&item.status==='reserved'&&item.product_id?` <button type="button" class="gift-shop-purchased" data-own-purchase="${purchaseIndex}" data-product-id="${escapeHtml(item.product_id)}">Megvásároltam</button>`:'')+

      '</li>').join('')+'</ul></section>').join('')+'</div>';

}

function reservationGiftSnapshot(ids){

  return ids.map(id=>{const p=products.find(product=>product.id===id);return {product_id:id,name:p?.name||'Ajándék',url:p?.url||''};});

}

function reservationItemsForDisplay(record){

  const snapshots=Array.isArray(record.gift_snapshot)?record.gift_snapshot:[];

  const ids=Array.isArray(record.product_ids)?record.product_ids:[];

  const server=Array.isArray(record.server_items)?record.server_items:[];

  const entries=Array.isArray(record.server_items)?server:ids.map(id=>({product_id:id,status:'reserved'}));

  return entries.map(item=>{

    const id=String(item.product_id||item.id||'');

    const snap=snapshots.find(p=>String(p.product_id)===id);

    const product=products.find(p=>p.id===id);

    return {...item,product_id:id,name:item.name||snap?.name||product?.name||'Ajándék',url:snap?.url||product?.url||''};

  });

}

function showReservationShopConfirmation(record){

  const overlay=document.createElement('div');overlay.className='gift-shop-confirmation-overlay';

  overlay.innerHTML=`<section class="gift-shop-confirmation" role="dialog" aria-modal="true" aria-labelledby="gift-shop-confirm-title"><button class="gift-shop-confirm-close" type="button" aria-label="Bezárás">×</button><h2 id="gift-shop-confirm-title">♡ Sikeres foglalás!</h2><p>Az ajándékokat 7 napra lefoglaltad. <strong>A vásárlás nem történt meg:</strong> a termékeket a webshopokban külön kell megrendelned.</p><p class="gift-shop-confirm-id">Foglalási azonosító: <code>${escapeHtml(record.reservation_id)}</code></p><h3>Ajándékaid webshoponként</h3>${giftShopGroupedHtml(reservationItemsForDisplay(record))}<p>A vásárlás után a „Foglalásaim” menüpontban jelöld meg az ajándékokat a „Megvásároltam” gombbal.</p><button type="button" class="gift-shop-confirm-done">Rendben</button></section>`;

  document.body.appendChild(overlay);

  const close=()=>{overlay.remove();document.removeEventListener('keydown',onKey);};

  const onKey=e=>{if(e.key==='Escape')close();};

  overlay.querySelector('.gift-shop-confirm-close').addEventListener('click',close);

  overlay.querySelector('.gift-shop-confirm-done').addEventListener('click',close);

  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});

  document.addEventListener('keydown',onKey);

  overlay.querySelector('.gift-shop-confirm-close').focus();

}

async function submitReservation(ids,name,button,feedback){

  if(reservationBusy)return;

  if(!ids.length){feedback.textContent='Nincs foglalható ajándék kiválasztva.';return;}

  if(selectedDeliveryMode==='shipping'&&!selectedShippingLocation){feedback.textContent='Válaszd ki a csomagautomatát a foglalás előtt.';return;}

  reservationBusy=true;button.disabled=true;feedback.textContent='Foglalás feldolgozása…';

  try{

    const response=await fetch(RESERVATION_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify({product_ids:ids,guest_name:name.trim()||null,delivery_mode:selectedDeliveryMode,shipping_provider:selectedDeliveryMode==='shipping'?selectedShippingLocation?.provider:null})});

    const result=await response.json().catch(()=>({}));

    if(!response.ok)throw new Error(result.error||`Foglalási hiba (${response.status})`);

    if(!result.reservation_id||!result.management_token)throw new Error('Hiányos foglalási visszaigazolás.');

    // A kezelési token kizárólag a látogató saját böngészőjében marad.

    const record={reservation_id:result.reservation_id,management_token:result.management_token,expires_at:result.expires_at,product_ids:ids,gift_snapshot:reservationGiftSnapshot(ids),guest_name:name.trim()||null,delivery_mode:selectedDeliveryMode,shipping_location:selectedDeliveryMode==='shipping'&&selectedShippingLocation?{provider:selectedShippingLocation.provider,name:selectedShippingLocation.name,address:selectedShippingLocation.address}:null};

    try{const old=JSON.parse(localStorage.getItem('nimrod-own-reservations-v44')||'[]');localStorage.setItem('nimrod-own-reservations-v44',JSON.stringify([record,...(Array.isArray(old)?old:[])]));}catch{}

    for(const id of ids)cart.delete(id);saveCart();updateCartBadge();

    for(const p of products)if(ids.includes(p.id))p.status='reserved';

    renderProducts();

    feedback.textContent=`Sikeres foglalás! ${ids.length} ajándék 7 napra lefoglalva. Azonosító: ${result.reservation_id}. A visszaigazolást őrizd meg ebben a böngészőben.`;

    showReservationShopConfirmation(record);

    button.hidden=true;

    if(!cartModal.hidden)renderCart();

    await loadProducts().catch(()=>{});

  }catch(error){

    feedback.textContent=error instanceof Error?error.message:'Nem sikerült a foglalás.';

    // Bizonytalan hálózati válasz esetén frissítsük a foglaltságot.

    await loadProducts().catch(()=>{});

  }finally{reservationBusy=false;button.disabled=false;}

}

// Saját foglalások – nincs regisztráció, csak a böngészőben mentett kezelőtoken.

const OWN_RESERVATIONS_KEY='nimrod-own-reservations-v44';

const MANAGEMENT_ENDPOINT=`${SUPABASE_URL}/functions/v1/manage-reservation`;

function readOwnReservations(){

  try{

    const data=JSON.parse(localStorage.getItem(OWN_RESERVATIONS_KEY)||'[]');

    return Array.isArray(data)?data.filter(r=>r&&typeof r.reservation_id==='string'&&typeof r.management_token==='string'):[];

  }catch{return [];}

}

function writeOwnReservations(records){

  try{localStorage.setItem(OWN_RESERVATIONS_KEY,JSON.stringify(records));return true;}catch{return false;}

}

const manageStyles=document.createElement('style');

manageStyles.textContent=`

#own-reservations-trigger{position:fixed;bottom:18px;left:18px;z-index:900;background:#f6ecdd;color:#554537;border:1px solid #cbb89f;border-radius:999px;padding:12px 17px;box-shadow:0 5px 22px #0002;cursor:pointer;font:600 14px/1.3 inherit}

#own-reservations-overlay[hidden]{display:none!important}

#own-reservations-overlay{position:fixed;inset:0;z-index:3000;background:#18140fb8;display:flex;justify-content:center;align-items:center;padding:16px}

#own-reservations-dialog{background:#fffaf3;color:#51483d;border-radius:18px;width:min(560px,100%);max-height:90vh;overflow:auto;padding:24px;box-shadow:0 18px 70px #0004;font-family:inherit}

#own-reservations-dialog h2{margin:0 0 10px;font-size:1.5rem}

#own-reservations-dialog p{line-height:1.5}

.own-reservation-entry{border:1px solid #e2d4c2;border-radius:12px;padding:16px;margin:12px 0;background:#fff}

.own-reservation-entry h3{font-size:1rem;margin:0 0 8px}

.own-reservation-entry ul{padding-left:22px;margin:8px 0}

.own-reservation-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}

#own-reservations-dialog button[data-own-purchase]{

  display:inline-flex;align-items:center;justify-content:center;

  margin:5px 0 3px 6px;padding:10px 16px;

  border:1px solid #91663f;border-radius:11px;

  background:linear-gradient(120deg,#b78b5b,#947049);

  color:#fff;font:700 13px/1.3 inherit;cursor:pointer;

  box-shadow:0 4px 12px #8e694b35;

}

#own-reservations-dialog button[data-own-purchase]:hover{filter:brightness(.94)}

#own-reservations-dialog button[data-own-purchase]:focus-visible{outline:3px solid #c59b69;outline-offset:2px}

#own-reservations-dialog button[data-own-purchase]:disabled{opacity:.55;cursor:wait}

.own-reservation-actions button,#own-reservations-close{border:1px solid #c8b39a;border-radius:9px;padding:9px 13px;background:#f0e2ce;color:#4e3e30;cursor:pointer;font:inherit}

.own-reservation-actions button:disabled{opacity:.5;cursor:wait}

#own-reservations-close{float:right}

.own-reservation-feedback{margin:8px 0 0;font-size:.93rem}

.own-reservation-section>h3{font-size:1.12rem;margin:18px 0 10px;color:#6d4f37}
.own-reservation-section>h3 span{font-size:.82rem;background:#eee1d1;padding:3px 9px;border-radius:99px}
.own-reservation-history{border-top:1px solid #e5d8c8;margin-top:20px;padding-top:14px}
.own-reservation-history>summary{cursor:pointer;font-weight:700;color:#795a41;padding:10px 4px}
.own-reservation-history>summary:focus-visible{outline:2px solid #9d7653;outline-offset:3px}
.own-reservation-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.own-reservation-state{border-radius:99px;padding:5px 10px;font-size:.78rem;font-weight:700}
.own-reservation-state.is-active{background:#e4eee6;color:#42694f}
.own-reservation-state.is-closed{background:#eee8e1;color:#766655}
.own-reservation-summary{font-size:.9rem;color:#786653}
.own-reservation-empty{padding:13px;border:1px dashed #ddcdbb;border-radius:10px;background:#fffdf9}
.own-reservation-id code{overflow-wrap:anywhere}

/* v4 – csak mobil: kompakt termékadatlap és nem takaró foglaláskezelő */

@media (max-width:650px){

  #own-reservations-trigger{

    display:inline-flex;align-items:center;justify-content:center;

    width:max-content;max-width:calc(100vw - 36px);margin:0;padding:9px 13px;

    font-size:12px;line-height:1.3;box-shadow:0 3px 12px #00000016;

  }

  .detail-dialog{padding:15px;max-height:90svh}

  .detail-layout{gap:9px}

  .detail-picture{min-height:145px;max-height:175px}

  .detail-emoji{font-size:65px}

  .detail-eyebrow{margin:4px 0 6px}

  .detail-title{margin:0 0 7px;font-size:24px}

  .detail-description{margin:0 0 10px;line-height:1.5}

  .detail-price{margin:0 0 9px;font-size:23px}

  .detail-actions{margin-top:12px;gap:7px}

  .detail-action{min-height:42px;padding:9px 12px}

  .detail-footnote{font-size:12px;line-height:1.5;margin:2px 0 0}

}

`;

document.head.appendChild(manageStyles);

const manageTrigger=document.getElementById('own-reservations-trigger') || document.createElement('button');

manageTrigger.id='own-reservations-trigger';manageTrigger.type='button';manageTrigger.textContent='♡ Foglalásaim';

// A gomb minden nézetben lebegő elem, a mobilos méretet a CSS szabályozza.

if(!manageTrigger.isConnected)document.body.appendChild(manageTrigger);

const manageOverlay=document.createElement('div');

manageOverlay.id='own-reservations-overlay';manageOverlay.hidden=true;

manageOverlay.innerHTML=`<div id="own-reservations-dialog" role="dialog" aria-modal="true" aria-labelledby="own-reservations-title" tabindex="-1"><button id="own-reservations-close" type="button" aria-label="Bezárás">✕</button><h2 id="own-reservations-title">Foglalásaim ♡</h2><p>Az ezen a böngészőn létrehozott foglalásaidat találod itt. Másik eszközön nem jelennek meg automatikusan.</p><div id="own-reservations-list"></div></div>`;

document.body.appendChild(manageOverlay);

const manageDialog=document.getElementById('own-reservations-dialog');

const manageList=document.getElementById('own-reservations-list');

let manageReturnFocus=null;

function ownReservationProducts(record){

  const ids=Array.isArray(record.product_ids)?record.product_ids:[];

  return ids.map(id=>products.find(p=>p.id===id)?.name||'Ajándék').map(n=>`<li>${escapeHtml(n)}</li>`).join('');

}

function ownReservationTitle(record,i){

  const name=typeof record.guest_name==='string'?record.guest_name.trim():'';

  return name?escapeHtml(name):`Foglalás ${i+1}`;

}

function ownReservationStatusLabel(status){
  return {active:'Aktív',cancelled:'Lemondva',expired:'Lejárt',completed:'Lezárva',purchased:'Megvásárolva'}[status]||'Ismeretlen';
}
function ownReservationIsExpired(record){
  const date=Date.parse(record.expires_at);
  return Number.isFinite(date)&&date<=Date.now();
}
function ownReservationHasNoServerItems(record){
  return Array.isArray(record.server_items)&&record.server_items.length===0;
}
function ownReservationDisplayStatus(record){
  const status=String(record.local_status||record.server_status||'active').toLowerCase();
  if(['cancelled','expired','completed','purchased'].includes(status))return status;
  if(ownReservationHasNoServerItems(record))return 'completed';
  const items=Array.isArray(record.server_items)?record.server_items:[];
  if(items.length&&!items.some(item=>item.status==='reserved')){
    return items.some(item=>item.status==='purchased')?'purchased':'completed';
  }
  return ownReservationIsExpired(record)?'expired':'active';
}
function ownReservationCard(record,index,i,history=false){
  const status=ownReservationDisplayStatus(record);
  const items=reservationItemsForDisplay(record);
  const reserved=items.filter(item=>item.status==='reserved').length;
  const purchased=items.filter(item=>item.status==='purchased').length;
  const canManage=!history&&status==='active'&&reserved>0;
  const date=record.expires_at&&Number.isFinite(Date.parse(record.expires_at))?new Date(record.expires_at).toLocaleString('hu-HU'):'Nem ismert';
  return `<article class="own-reservation-entry" data-own-index="${index}">
    <div class="own-reservation-card-head"><h3>${ownReservationTitle(record,i)}</h3><span class="own-reservation-state ${status==='active'?'is-active':'is-closed'}">${ownReservationStatusLabel(status)}</span></div>
    <p class="own-reservation-id"><strong>Azonosító:</strong> <code>${escapeHtml(record.reservation_id)}</code></p>
    <p><strong>${status==='active'?'Lejárat':'Eredeti lejárat'}:</strong> ${escapeHtml(date)}</p>
    ${items.length?`<p class="own-reservation-summary">${reserved} lefoglalt · ${purchased} megvásárolt</p>${giftShopGroupedHtml(items,{showStatus:true,purchaseIndex:canManage?index:null})}`:'<p class="own-reservation-summary">Ehhez a lezárt foglaláshoz már nem tartozik nyilvántartott ajándék.</p>'}
    ${canManage?`<div class="own-reservation-actions"><button type="button" data-own-view="${index}">Állapot lekérdezése</button><button type="button" data-own-cancel="${index}">Foglalás lemondása</button></div>`:''}
    <p class="own-reservation-feedback" data-own-feedback="${index}" role="status" aria-live="polite"></p>
  </article>`;
}
function showOwnReservations(){
  const records=readOwnReservations();
  const active=[],history=[];
  records.forEach((record,index)=>{
    const entry={record,index};
    (ownReservationDisplayStatus(record)==='active'?active:history).push(entry);
  });
  manageList.innerHTML=`<div class="own-reservation-section"><h3>Aktív foglalások <span>${active.length}</span></h3>
    ${active.length?active.map(({record,index},i)=>ownReservationCard(record,index,i)).join(''):'<p class="own-reservation-empty">Jelenleg nincs aktív foglalásod.</p>'}</div>
    <details class="own-reservation-history"><summary>Korábbi és lezárt foglalások (${history.length})</summary>
    ${history.length?history.map(({record,index},i)=>ownReservationCard(record,index,i,true)).join(''):'<p class="own-reservation-empty">Még nincs lezárt foglalás.</p>'}</details>`;
}

let ownReservationsRefreshRunning=false;

// Megnyitáskor ellenőrizzük a mentett foglalások valódi szerveroldali állapotát.

// Hálózati hiba esetén a foglalást nem töröljük és nem minősítjük lezártnak.

async function refreshOwnReservationsOnOpen(){

  if(ownReservationsRefreshRunning)return;

  const pending=readOwnReservations().filter(r=>

    ownReservationDisplayStatus(r)==='active');

  if(!pending.length)return;

  ownReservationsRefreshRunning=true;

  const notice=document.createElement('p');

  notice.id='own-reservations-refresh-notice';

  notice.setAttribute('role','status');

  notice.textContent='Foglalások állapotának automatikus ellenőrzése…';

  manageList.prepend(notice);

  manageList.querySelectorAll('button').forEach(b=>b.disabled=true);

  let failures=0;

  try{

    const results=await Promise.allSettled(pending.map(r=>requestOwnReservation('get',r)));

    results.forEach((result,i)=>{

      if(result.status!=='fulfilled'){failures++;return;}

      const info=result.value.reservation||result.value;

      saveOwnReservationServerItems(pending[i].reservation_id,info);
        if(Array.isArray(info.items)&&info.items.length===0){
          markOwnReservationClosed(pending[i].reservation_id,'completed');
          return;
        }
const status=String(info.status||'').toLowerCase();

      if(['cancelled','expired','completed','purchased'].includes(status)){

        markOwnReservationClosed(pending[i].reservation_id,status);

      }

    });

  }finally{

    ownReservationsRefreshRunning=false;

    if(!manageOverlay.hidden){

      showOwnReservations();

      if(failures){

        const warning=document.createElement('p');

        warning.setAttribute('role','status');

        warning.textContent=`${failures} foglalás állapotát nem sikerült ellenőrizni. Próbáld meg később, vagy használd az „Állapot lekérdezése” gombot.`;

        manageList.prepend(warning);

      }

    }

  }

}

function openOwnReservations(){

  if(!detailModal.hidden)closeProductDetail();

  if(!cartModal.hidden)closeCart();

  manageReturnFocus=document.activeElement;

  showOwnReservations();manageOverlay.hidden=false;document.body.style.overflow='hidden';manageDialog.focus();

  void refreshOwnReservationsOnOpen();

}

function closeOwnReservations(){manageOverlay.hidden=true;document.body.style.overflow='';if(manageReturnFocus?.isConnected)manageReturnFocus.focus();}

manageTrigger.addEventListener('click',openOwnReservations);

document.getElementById('own-reservations-close').addEventListener('click',closeOwnReservations);

manageOverlay.addEventListener('click',e=>{if(e.target===manageOverlay)closeOwnReservations();});

document.addEventListener('keydown',e=>{

  if(manageOverlay.hidden)return;

  if(e.key==='Escape'){e.preventDefault();closeOwnReservations();}

  if(e.key==='Tab'){

    const items=[...manageDialog.querySelectorAll('button:not([disabled])')];

    if(!items.length)return;

    const first=items[0],last=items[items.length-1];

    if(e.shiftKey&&(document.activeElement===first||document.activeElement===manageDialog)){e.preventDefault();last.focus();}

    else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===manageDialog)){e.preventDefault();first.focus();}

  }

});

function saveOwnReservationServerItems(reservationId,info){

  if(!Array.isArray(info?.items))return;

  const records=readOwnReservations();

  const found=records.find(r=>r.reservation_id===reservationId);

  if(found){found.server_items=info.items;if(typeof info.status==='string')found.server_status=info.status;writeOwnReservations(records);}

}

async function requestOwnReservation(action,record,productId=null){

  const response=await fetch(MANAGEMENT_ENDPOINT,{

    method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY},

    body:JSON.stringify({action,reservation_id:record.reservation_id,management_token:record.management_token,...(productId?{product_id:productId}:{})})

  });

  const result=await response.json().catch(()=>({}));

  if(!response.ok)throw new Error(result.error||`A művelet sikertelen (HTTP ${response.status}).`);

  return result;

}

// A foglalást az azonosítója alapján keressük, nem a változó listasorszám alapján.

function markOwnReservationClosed(reservationId,status){

  const records=readOwnReservations();

  const index=records.findIndex(r=>r.reservation_id===reservationId);

  if(index<0)return;

  records[index].local_status=status;

  writeOwnReservations(records);

}

manageList.addEventListener('click',async e=>{

  const button=e.target.closest('[data-own-view],[data-own-cancel],[data-own-purchase]');

  if(!button)return;

  const cancelling=button.hasAttribute('data-own-cancel');

  const purchasing=button.hasAttribute('data-own-purchase');

  const index=Number(button.dataset.ownCancel??button.dataset.ownView??button.dataset.ownPurchase);

  const record=readOwnReservations()[index];

  if(!record)return;

  if(cancelling&&!window.confirm('Biztosan lemondod ezt a foglalást? A benne lévő ajándékok újra foglalhatóvá válnak.'))return;

  if(purchasing&&!window.confirm('Biztosan megvásároltad ezt az ajándékot? A jelölés végleges, és a termék nem lesz újra foglalható.'))return;

  const entry=button.closest('.own-reservation-entry');

  const feedback=entry.querySelector('.own-reservation-feedback');

  const buttons=entry.querySelectorAll('button');

  buttons.forEach(b=>b.disabled=true);

  feedback.textContent=purchasing?'Vásárlás visszaigazolása…':cancelling?'Lemondás folyamatban…':'Állapot lekérdezése…';

  try{

    let result;

    if(purchasing){

      const productId=button.dataset.productId;

      result=await requestOwnReservation('purchase',record,productId);

      const updated=await requestOwnReservation('get',record);

      saveOwnReservationServerItems(record.reservation_id,updated.reservation||updated);

      showOwnReservations();

      await loadProducts().catch(()=>{});

      return;

    }

    try{

      result=await requestOwnReservation(cancelling?'cancel':'get',record);

    }catch(error){

      // Ha a lemondás nem sikerül, előbb ellenőrizzük a szerver szerinti állapotot.

      // Hálózati vagy jogosultsági hiba esetén semmit nem jelölünk önkényesen lezártnak.

      if(!cancelling)throw error;

      const current=await requestOwnReservation('get',record);

      const currentStatus=String((current.reservation||current).status||'').toLowerCase();

      if(['cancelled','expired','completed'].includes(currentStatus)){

        markOwnReservationClosed(record.reservation_id,currentStatus);

        showOwnReservations();

        await loadProducts().catch(()=>{});

        return;

      }

      throw error;

    }

    if(cancelling){

      markOwnReservationClosed(record.reservation_id,'cancelled');

      showOwnReservations();

      await loadProducts().catch(()=>{});

    }else{

      const info=result.reservation||result;

      saveOwnReservationServerItems(record.reservation_id,info);
      if(Array.isArray(info.items)&&info.items.length===0){
        markOwnReservationClosed(record.reservation_id,'completed');
        showOwnReservations();
        return;
      }
const status=String(info.status||'ismeretlen').toLowerCase();

      if(['cancelled','expired','completed','purchased'].includes(status)){

        markOwnReservationClosed(record.reservation_id,status);

        showOwnReservations();

      }else{

        showOwnReservations();

        const current=manageList.querySelector(`[data-own-index="${index}"] .own-reservation-feedback`);

        if(current)current.textContent=`Aktuális állapot: ${ownReservationStatusLabel(status)}.`;

      }

    }

  }catch(error){

    feedback.textContent=error instanceof Error?error.message:'Nem sikerült a művelet.';

  }finally{

    buttons.forEach(b=>b.disabled=false);

  }

});

// v63: kategóriák Supabase-ből, a meglévő illusztrációk megtartásával.

async function loadWishlistCategories(){

 try{

  const response=await fetch(`${SUPABASE_URL}/rest/v1/wishlist_categories?select=slug,label&order=sort_order.asc`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}});

  if(!response.ok)throw new Error('Kategóriák lekérése: '+response.status);

  const rows=await response.json();if(!Array.isArray(rows)||!rows.length)return;

  const next=[{id:'all',icon:'▦',label:'Összes'}];

  for(const row of rows){if(typeof row.slug!=='string'||typeof row.label!=='string'||!row.slug||!row.label)continue;

   next.push({id:row.slug,icon:'♡',label:row.label});categoryAliases[row.slug]=row.slug;

  }

  categories.splice(0,categories.length,...next);

  if(!categories.some(c=>c.id===state.category))state.category='all';

  renderCategories();await loadProducts();

 }catch(error){console.warn('Kategóriák lekérése sikertelen; alapértelmezett lista marad.',error);}

}

void loadWishlistCategories();
