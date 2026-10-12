'use strict';
// Bemutató adatok. A foglalási rendszer még NINCS összekötve adatbázissal.
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

const products = [
  {id:1,name:'Maxi-Cosi Plaza+ babakocsi',description:'Kényelmes és praktikus mindennapi használatra.',price:299990,category:'stroller',status:'available',emoji:'🛒',image:'assets/images/product-stroller.jpg'},
  {id:2,name:'Bölcső kiságy',description:'Természetes fa, modern dizájn.',price:129990,category:'nursery',status:'reserved',emoji:'🛏️',image:'assets/images/product-crib.jpg'},
  {id:3,name:'Stokke Tripp Trapp etetőszék',description:'Együtt nő Nimróddal.',price:89990,category:'feeding',status:'available',emoji:'🪑',image:'assets/images/product-chair.jpg'},
  {id:4,name:'Maxi-Cosi Pearl 360 autósülés',description:'Biztonság és kényelem.',price:149990,category:'stroller',status:'available',emoji:'🚙',image:'assets/images/product-car-seat.jpg'},
  {id:5,name:'Baby Monitor 5”',description:'Videós légzésfigyelő.',price:79990,category:'other',status:'preordered',emoji:'📹',image:'assets/images/product-monitor.jpg'},
  {id:6,name:'Fürdető szett',description:'Minden, ami a fürdetéshez kell.',price:19990,category:'bath',status:'available',emoji:'🛁',image:'assets/images/product-bath.jpg'},
  {id:7,name:'Játszószőnyeg',description:'Puha és biztonságos.',price:34990,category:'toys',status:'available',emoji:'🧸',image:'assets/images/product-playmat.jpg'},
  {id:8,name:'Pelenkatároló',description:'Praktikus és stílusos.',price:24990,category:'nursery',status:'reserved',emoji:'🧺',image:'assets/images/product-storage.jpg'},
  {id:9,name:'Plüss zsiráf',description:'Nimród első barátja lehet. ♡',price:14990,category:'toys',status:'available',emoji:'🦒',image:'assets/images/product-giraffe.jpg'}
];
const state = {category:'all',query:'',sort:'default',favorites:new Set()};
// A kosár csak ebben a böngészőben tárolódik. Nem foglal le semmit.
const CART_KEY='nimrod-wishlist-demo-cart-v40';
function readCart(){try{const stored=JSON.parse(localStorage.getItem(CART_KEY)||'[]');return new Set(Array.isArray(stored)?stored.filter(id=>Number.isInteger(id)&&products.some(p=>p.id===id&&p.status==='available')):[]);}catch{return new Set();}}
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
  document.getElementById('results').textContent=`${filtered.length} ajándék megjelenítve · Bemutatóverzió`;
  document.getElementById('empty-state').hidden=filtered.length>0;
  grid.innerHTML=filtered.map(p=>{
    const reserved=p.status==='reserved';const preordered=p.status==='preordered';
    const statusText=reserved?'Foglalt':preordered?'Félretéve':'Szabad';
    return `<article class="product-card" data-product="${p.id}" tabindex="0" role="button" aria-label="${escapeHtml(p.name)} részleteinek megtekintése"><div class="product-image"><span class="product-placeholder" aria-hidden="true">${p.emoji}</span>${p.image?`<img class="product-photo" src="${p.image}" alt="" loading="lazy" onerror="this.remove()">`:``}<button type="button" class="favorite" data-favorite="${p.id}" aria-pressed="${state.favorites.has(p.id)}" aria-label="${state.favorites.has(p.id)?'Eltávolítás a kedvencekből':'Kedvencekhez adás'}: ${escapeHtml(p.name)}">${state.favorites.has(p.id)?'♥':'♡'}</button></div><div class="product-body"><h3 class="product-name">${escapeHtml(p.name)}</h3><p class="product-description">${escapeHtml(p.description)}</p><p class="price">${money(p.price)}</p><button class="product-button product-cart-button" type="button" data-cart-add="${p.id}" ${p.status!=='available'?'disabled title="Ez az ajándék jelenleg nem elérhető"':''}>${p.status!=='available'?'Nem elérhető':cart.has(p.id)?'✓ Kosárban – eltávolítom':'🛒 Kosárba teszem'}</button><div class="status ${reserved?'reserved':preordered?'preordered':''}"><span aria-hidden="true">🎁</span>${statusText} <span class="sr-only">(bemutatóadat)</span></div></div></article>`;
  }).join('');
}
categoryContainer.addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;state.category=button.dataset.category;renderCategories();renderProducts();});
grid.addEventListener('click',event=>{
  const cartButton=event.target.closest('[data-cart-add]');if(cartButton){toggleCartItem(Number(cartButton.dataset.cartAdd));return;}
  const favorite=event.target.closest('[data-favorite]');
  if(favorite){const id=Number(favorite.dataset.favorite);if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);renderProducts();return;}
  const card=event.target.closest('[data-product]');if(card)openProductDetail(Number(card.dataset.product));
});
grid.addEventListener('keydown',event=>{
  if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-product]')){
    event.preventDefault();openProductDetail(Number(event.target.dataset.product));
  }
});
document.getElementById('search').addEventListener('input',event=>{state.query=event.target.value.trim().toLocaleLowerCase('hu-HU');renderProducts();});
document.getElementById('sort').addEventListener('change',event=>{state.sort=event.target.value;renderProducts();});
const menuButton=document.querySelector('.mobile-menu-toggle');const menu=document.getElementById('mobile-menu');
menuButton.addEventListener('click',()=>{const expanded=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!expanded));menu.hidden=expanded;});
menu.addEventListener('click',event=>{if(event.target.closest('a')){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}});
renderCategories();renderProducts();

// A lap tetejére gomb csak görgetés után látható.
const backToTop = document.getElementById('back-to-top');
function updateBackToTop(){backToTop.classList.toggle('is-visible',window.scrollY>=200);}
window.addEventListener('scroll',updateBackToTop,{passive:true});
backToTop.addEventListener('click',()=>{window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
updateBackToTop();


// v36 – részletes terméknézet; a próbaadatokból épül, vásárlást még nem indít.
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
  const hasShopLink=typeof p.url==='string' && /^https?:\/\//i.test(p.url);
  const shopAction=hasShopLink
    ? `<a class="detail-action detail-action--preview" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer">↗ Termék megtekintése a webshopban</a>`
    : `<button class="detail-action detail-action--preview" type="button" disabled>↗ Termék megtekintése a webshopban – hamarosan</button>`;
  detailContent.innerHTML=`<div class="detail-layout">
    <div class="detail-picture"><span class="detail-emoji" aria-hidden="true">${p.emoji}</span>${p.image?`<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.remove()">`:''}</div>
    <div><p class="detail-eyebrow">${escapeHtml(cat?cat.label:'Ajándék')}</p>
    <h2 class="detail-title" id="detail-title">${escapeHtml(p.name)}</h2>
    <p class="detail-description">${escapeHtml(p.description)}</p>
    <p class="detail-price">${money(p.price)}</p>
    <span class="detail-status ${statusClass}">♡ ${statusText}</span>
    <div class="detail-actions">${shopAction}
      ${p.status==='available'?`<button type="button" class="detail-action detail-cart-action" id="detail-cart-add">${cart.has(p.id)?'✓ Kosárban – eltávolítom':'🛒 Kosárba teszem'}</button>`:''}
      <p class="detail-footnote">A webshop megtekintése <strong>nem jelent foglalást</strong>, és nem változtatja meg az ajándék állapotát.</p>
    </div></div></div>
    ${p.status==='available'?`<section class="gift-choice" aria-labelledby="gift-choice-title">
      <h3 class="gift-choice-title" id="gift-choice-title">Szeretnéd ezzel meglepni Nimródot? ♡</h3>
      <p class="gift-choice-description">Ha biztosan ezt az ajándékot választod, indítsd el a foglalást. Csak a következő lépésben, külön megerősítés után válna foglalttá.</p>
      <button class="gift-choice-button" type="button" id="start-gift-choice">♡ Ezt az ajándékot választom</button>
      <p class="gift-choice-note">Ha csak körülnéznél, nyugodtan megnyithatod fentebb a webshopot – attól még szabad marad az ajándék.</p>
      <div class="gift-confirmation" id="gift-confirmation" hidden>
        <h4>Biztosan szeretnéd lefoglalni?</h4>
        <p>A végleges rendszerben a megerősítés után az ajándék <strong>azonnal foglalttá válna</strong> mások számára. Vásárlás után kérnénk a visszajelzésedet. Ha nem érkezik visszajelzés, nem szabadítjuk fel automatikusan; előbb egyeztetünk.</p>
        <label class="guest-name-label" for="guest-name">Neved <span>(nem kötelező)</span></label>
        <input class="guest-name-input" id="guest-name" type="text" maxlength="80" placeholder="Pl. Nagyi">
        <button class="gift-choice-button" type="button" disabled>Foglalás véglegesítése – hamarosan</button>
        <button class="gift-choice-back" type="button" id="cancel-gift-choice">Mégsem, csak nézelődöm</button>
        <div class="gift-demo-banner">Bemutatóverzió: itt még nem történik valódi foglalás. Az adatbázist és a visszajelzést később kötjük be.</div>
      </div>
    </section>`:`<div class="reservation-unavailable">Ez az ajándék jelenleg ${statusText.toLowerCase()} a bemutatóadatok szerint, ezért most nem foglalható. A webshop megtekintése ettől függetlenül lehetséges, ha van terméklink.</div>`}`;
  const detailCartButton=detailContent.querySelector('#detail-cart-add');
  if(detailCartButton)detailCartButton.addEventListener('click',()=>toggleCartItem(p.id));
  const startChoice=detailContent.querySelector('#start-gift-choice');
  const confirmation=detailContent.querySelector('#gift-confirmation');
  const cancelChoice=detailContent.querySelector('#cancel-gift-choice');
  if(startChoice&&confirmation){
    startChoice.addEventListener('click',()=>{
      confirmation.hidden=false;
      startChoice.hidden=true;
      confirmation.scrollIntoView({block:'nearest',behavior:'smooth'});
      cancelChoice.focus();
    });
    cancelChoice.addEventListener('click',()=>{
      confirmation.hidden=true;
      startChoice.hidden=false;
      startChoice.focus();
    });
  }
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


// v40 – lebegő, helyben működő próbakosár
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
document.getElementById('cart-reserve-all').addEventListener('click',()=>{const selected=products.filter(p=>cart.has(p.id)&&p.status==='available');if(!selected.length)return;document.getElementById('cart-reservation-summary').textContent=`${selected.length} ajándék, összesen ${money(selected.reduce((sum,p)=>sum+p.price,0))}. A végleges rendszerben mindegyiket egyszerre foglalhatod le.`;document.getElementById('cart-reservation-preview').hidden=false;document.getElementById('cart-reserve-all').setAttribute('aria-expanded','true');document.getElementById('cart-reservation-preview').scrollIntoView({block:'nearest',behavior:'smooth'});});
document.getElementById('cart-reserve-cancel').addEventListener('click',closeCartReservationPreview);
document.getElementById('cart-clear').addEventListener('click',()=>{cart.clear();saveCart();updateCartBadge();renderProducts();renderCart();});
cartModal.addEventListener('click',event=>{
  if(event.target.closest('[data-close-cart]')){closeCart();return;}
  const remove=event.target.closest('[data-cart-remove]');if(remove){toggleCartItem(Number(remove.dataset.cartRemove));return;}
  const view=event.target.closest('[data-cart-view]');if(view){const id=Number(view.dataset.cartView);closeCart();openProductDetail(id);}
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

// v42 – a kosár a fejléc alatti magasságban lebeg, görgetéskor is ugyanott marad.
function positionFloatingCart(){const hero=document.querySelector('.hero');const button=document.getElementById('floating-cart');if(!hero||!button)return;const bottom=hero.getBoundingClientRect().bottom+window.scrollY;const target=Math.min(Math.max(bottom+12,76),Math.max(76,window.innerHeight-75));button.style.top=`${Math.round(target)}px`;}
positionFloatingCart();window.addEventListener('resize',positionFloatingCart);
