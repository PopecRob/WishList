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
const categoryContainer = document.getElementById('categories');
const grid = document.getElementById('product-grid');
const money = value => new Intl.NumberFormat('hu-HU').format(value)+' Ft';
const escapeHtml = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function renderCategories(){
  categoryContainer.innerHTML=categories.map(cat=>`<button type="button" class="category ${state.category===cat.id?'active':''}" data-category="${cat.id}" aria-pressed="${state.category===cat.id}"><span class="category-icon" aria-hidden="true">${cat.icon}</span><span class="category-label">${cat.label}</span></button>`).join('');
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
    return `<article class="product-card"><div class="product-image"><span class="product-placeholder" aria-hidden="true">${p.emoji}</span>${p.image?`<img class="product-photo" src="${p.image}" alt="" loading="lazy" onerror="this.remove()">`:``}<button type="button" class="favorite" data-favorite="${p.id}" aria-pressed="${state.favorites.has(p.id)}" aria-label="${state.favorites.has(p.id)?'Eltávolítás a kedvencekből':'Kedvencekhez adás'}: ${escapeHtml(p.name)}">${state.favorites.has(p.id)?'♥':'♡'}</button></div><div class="product-body"><h3 class="product-name">${escapeHtml(p.name)}</h3><p class="product-description">${escapeHtml(p.description)}</p><p class="price">${money(p.price)}</p><button class="product-button" type="button" disabled title="A vásárlási linkek később lesznek elérhetők">🛒 &nbsp; Megnézem – hamarosan</button><div class="status ${reserved?'reserved':preordered?'preordered':''}"><span aria-hidden="true">🎁</span>${statusText} <span class="sr-only">(bemutatóadat)</span></div></div></article>`;
  }).join('');
}
categoryContainer.addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;state.category=button.dataset.category;renderCategories();renderProducts();});
grid.addEventListener('click',event=>{const button=event.target.closest('[data-favorite]');if(!button)return;const id=Number(button.dataset.favorite);if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);renderProducts();});
document.getElementById('search').addEventListener('input',event=>{state.query=event.target.value.trim().toLocaleLowerCase('hu-HU');renderProducts();});
document.getElementById('sort').addEventListener('change',event=>{state.sort=event.target.value;renderProducts();});
const menuButton=document.querySelector('.mobile-menu-toggle');const menu=document.getElementById('mobile-menu');
menuButton.addEventListener('click',()=>{const expanded=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!expanded));menu.hidden=expanded;});
menu.addEventListener('click',event=>{if(event.target.closest('a')){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}});
renderCategories();renderProducts();

// A lap tetejére gomb csak görgetés után látható.
const backToTop = document.getElementById('back-to-top');
function updateBackToTop(){backToTop.classList.toggle('is-visible',window.scrollY>200);}
window.addEventListener('scroll',updateBackToTop,{passive:true});
backToTop.addEventListener('click',()=>{window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
updateBackToTop();
