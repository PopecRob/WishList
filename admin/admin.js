'use strict';
// Admin belépés és termékkezelés Supabase Auth-tal.
const titles={overview:['Áttekintés','Minden apró kívánság egy helyen, szeretettel rendezve.'],products:['Termékek','Az ajándékok áttekintése és kezelése.'],categories:['Kategóriák','Ajándékkategóriák hozzáadása és módosítása.'],new:['Új ajándék','Készítsük elő Nimród következő kívánságát!'],reservations:['Foglalások','Lefoglalt és megvásárolt ajándékok.'],shipping:['Szállítási adatok','Kedvenc átvételi helyeink és csomagautomatáink.']};
const sidebar=document.querySelector('.sidebar');const overlay=document.getElementById('mobile-overlay');const toggle=document.getElementById('menu-toggle');
function closeMenu(){sidebar.classList.remove('open');overlay.classList.remove('open');overlay.hidden=true;toggle.setAttribute('aria-expanded','false');}
function showView(view){if(!titles[view])return;document.querySelectorAll('[data-panel]').forEach(el=>el.classList.toggle('active',el.dataset.panel===view));document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));document.getElementById('page-title').innerHTML=titles[view][0]+' <span>♡</span>';document.getElementById('page-subtitle').textContent=titles[view][1];closeMenu();if(view==='reservations')void loadReservations();if(view==='products')void loadProducts();if(view==='categories')void loadAdminCategories();if(view==='shipping')void loadShipping();window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('[data-view],[data-go]').forEach(el=>el.addEventListener('click',()=>showView(el.dataset.view||el.dataset.go)));
toggle.addEventListener('click',()=>{const open=!sidebar.classList.contains('open');sidebar.classList.toggle('open',open);overlay.classList.toggle('open',open);overlay.hidden=!open;toggle.setAttribute('aria-expanded',String(open));});overlay.addEventListener('click',closeMenu);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});


// A nyilvános publishable key nem titok. Service role kulcsot SOHA ne tegyünk frontendbe.
const SUPABASE_URL='https://aalzgkdnqurpoepueehc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_1PZSSo5VB-ZD90s5OOU2QA_v_1bj_ZK';
const loginScreen=document.getElementById('login-screen');
const adminApp=document.getElementById('admin-app');
const loginForm=document.getElementById('login-form');
const loginMessage=document.getElementById('login-message');
const loginSubmit=document.getElementById('login-submit');
const logoutButton=document.getElementById('logout-button');
let authClient=null;
let authVersion=0;
// 15 perc tényleges inaktivitás után automatikus kijelentkezés.
const IDLE_LIMIT_MS=15*60*1000;
const LAST_ACTIVITY_KEY='nimrod_admin_last_activity_v1';
let lastActivity=0;
let idleLogoutInProgress=false;
let lastStoredActivity=0;
function storedActivity(){
  try { const value=Number(localStorage.getItem(LAST_ACTIVITY_KEY));return Number.isFinite(value)&&value>0?value:0; }
  catch {return 0;}
}
function rememberActivity(time=Date.now()){
  lastActivity=time;
  if(time-lastStoredActivity>5000){
    try{localStorage.setItem(LAST_ACTIVITY_KEY,String(time));lastStoredActivity=time;}catch{}
  }
}
function clearActivity(){lastActivity=0;lastStoredActivity=0;try{localStorage.removeItem(LAST_ACTIVITY_KEY);}catch{}}
async function logoutForInactivity(){
  if(idleLogoutInProgress||!authClient)return;
  idleLogoutInProgress=true;
  authVersion++;
  showLogin('15 perc inaktivitás miatt automatikusan kijelentkeztettünk. Jelentkezz be újra.');
  try{
    const {error}=await authClient.auth.signOut();
    if(error)throw error;
    clearActivity();
  }catch{
    // Hálózati hiba esetén sem engedjük vissza a felületre.
    showLogin('A munkamenet lejárt, de a kijelentkezést nem sikerült befejezni. Internetkapcsolat után frissítsd az oldalt.');
  }finally{idleLogoutInProgress=false;}
}
function verifyIdle(){
  if(adminApp.hidden||!authClient||idleLogoutInProgress)return false;
  const latest=lastActivity||storedActivity();
  if(!latest||Date.now()-latest>=IDLE_LIMIT_MS){void logoutForInactivity();return false;}
  return true;
}
function recordUserActivity(){
  if(!verifyIdle())return;
  if(Date.now()-lastActivity>=1000)rememberActivity();
}
['pointerdown','keydown','touchstart','scroll'].forEach(type=>
  document.addEventListener(type,recordUserActivity,{passive:true,capture:true})
);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)verifyIdle();});
window.addEventListener('focus',verifyIdle);
setInterval(verifyIdle,5000);

function showLogin(message=''){adminApp.hidden=true;loginScreen.hidden=false;loginMessage.textContent=message;closeMenu();}
function showAdmin(){if(idleLogoutInProgress)return;loginScreen.hidden=true;adminApp.hidden=false;loginMessage.textContent='';}
async function checkAdmin(session){
  if(!session?.user?.id){showLogin();return;}
  const version=++authVersion;
  // Az admin_users RLS policy kizárólag a saját sor lekérdezését engedi.
  const {data,error}=await authClient.from('admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(version!==authVersion)return;
  if(error||!data){showLogin('Ehhez a fiókhoz nincs adminjogosultság, vagy az ellenőrzés sikertelen.');return;}
  if(lastActivity && Date.now()-lastActivity>=IDLE_LIMIT_MS){await logoutForInactivity();return;}
  showAdmin();void loadAdminCategories();
}

async function initAuth(){
  showLogin('Bejelentkezés ellenőrzése…');
  if(!window.supabase?.createClient){showLogin('A bejelentkezési szolgáltatás nem töltődött be. Ellenőrizd az internetkapcsolatot.');return;}
  authClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}});
  const {data,error}=await authClient.auth.getSession();
  if(error){showLogin('Nem sikerült ellenőrizni a munkamenetet.');return;}
  if(data.session){
    lastActivity=storedActivity();
    if(!lastActivity||Date.now()-lastActivity>=IDLE_LIMIT_MS){
      await authClient.auth.signOut();
      clearActivity();
      showLogin('A korábbi munkamenet lejárt. Jelentkezz be újra.');
    }else await checkAdmin(data.session);
  }else{clearActivity();showLogin();}
  authClient.auth.onAuthStateChange((event,session)=>{
    if(event==='SIGNED_OUT'){authVersion++;clearActivity();if(!idleLogoutInProgress)showLogin();}
    // A tokenfrissítést is ellenőrizzük, de ne blokkoljuk a Supabase auth callbacket.
    else if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED')setTimeout(()=>{if(!idleLogoutInProgress&&session){if(!lastActivity)lastActivity=storedActivity();if(!lastActivity||Date.now()-lastActivity>=IDLE_LIMIT_MS){void logoutForInactivity();}else void checkAdmin(session);}},0);
  });
}
loginForm.addEventListener('submit',async event=>{
  event.preventDefault();if(!authClient)return;
  loginSubmit.disabled=true;loginSubmit.textContent='Ellenőrzés…';loginMessage.textContent='';
  try{
    const {data,error}=await authClient.auth.signInWithPassword({email:document.getElementById('login-email').value.trim(),password:document.getElementById('login-password').value});
    if(error){showLogin('Hibás e-mail-cím vagy jelszó, vagy a bejelentkezés nem sikerült.');return;}
    rememberActivity();
    await checkAdmin(data.session);
    document.getElementById('login-password').value='';
  }catch{showLogin('Hálózati hiba történt. Próbáld újra.');}
  finally{loginSubmit.disabled=false;loginSubmit.textContent='Bejelentkezés →';}
});
logoutButton.addEventListener('click',async()=>{
  authVersion++;clearActivity();showLogin('Kijelentkezés…');
  try{const {error}=await authClient.auth.signOut();if(error)throw error;showLogin('Sikeresen kijelentkeztél.');}
  catch{showLogin('A kijelentkezés nem sikerült. Frissítsd az oldalt, majd próbáld újra.');}
});
initAuth();

// Termékfeltöltés: az adatbázis RLS szabályai ellenőrzik az admin jogosultságot.
const productForm=document.getElementById('new-product-form');
const productSave=document.getElementById('product-save');
const productMessage=document.getElementById('product-form-message');
function productFeedback(message,type=''){
  productMessage.textContent=message;
  productMessage.className='product-form-message'+(type?' '+type:'');
}
document.getElementById('product-reset').addEventListener('click',()=>{
  productForm.reset();productFeedback('');
});
productForm.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!authClient||adminApp.hidden||!verifyIdle()){
    productFeedback('A munkamenet lejárt. Jelentkezz be újra.','error');return;
  }
  const name=document.getElementById('product-name').value.trim();
  const category=document.getElementById('product-category').value;
  const priceText=document.getElementById('product-price').value;
  const price=Number(priceText);
  const description=document.getElementById('product-description').value.trim();
  const image=document.getElementById('product-image').value.trim();
  const webshop=document.getElementById('product-webshop').value.trim();
  const active=document.getElementById('product-active').checked;
  if(!name||!category||priceText===''||!Number.isSafeInteger(price)||price<0||price>999999999){
    productFeedback('Ellenőrizd a nevet, a kategóriát és az árat.','error');return;
  }
  for(const link of [image,webshop]){
    if(link){try{const parsed=new URL(link);if(!['http:','https:'].includes(parsed.protocol))throw Error();}
      catch{productFeedback('Csak http:// vagy https:// kezdetű linket adj meg.','error');return;}}
  }
  productSave.disabled=true;productSave.textContent='Mentés…';productFeedback('Ajándék mentése folyamatban…');
  try{
    const {data:sessionData,error:sessionError}=await authClient.auth.getSession();
    if(sessionError||!sessionData.session||!verifyIdle())throw new Error('A munkamenet lejárt. Jelentkezz be újra.');
    const payload={name,category,price,description:description||null,image_url:image||null,webshop_url:webshop||null,is_active:active};
    // Nem kérünk vissza sort: az inaktív ajándék SELECT joga később kerül beállításra.
    const {error}=await authClient.from('products').insert(payload);
    if(error)throw error;
    productForm.reset();
    productsCache=[];
    productFeedback(active?'Sikeres mentés! Az ajándék megjelenhet a nyilvános kívánságlistán.':'Sikeres mentés! Az ajándék inaktívként került az adatbázisba.','success');
  }catch(error){
    console.error('Termékmentési hiba:',error);
    const message=String(error?.message||'');
    if(/row-level security|permission denied|42501/i.test(message))productFeedback('A Supabase elutasította a mentést. Ellenőrizni kell az adminjogosultságot és az RLS-szabályokat.','error');
    else if(/munkamenet lejárt/i.test(message))productFeedback(message,'error');
    else productFeedback('Nem sikerült menteni az ajándékot. Ellenőrizd az internetkapcsolatot és a Supabase beállításait.','error');
  }finally{productSave.disabled=false;productSave.textContent='Ajándék mentése →';}
});


// Automatikus termékadat-kitöltés a már telepített fetch-product Edge Functionből.
const importUrl=document.getElementById('product-import-url');
const importButton=document.getElementById('product-import-button');
const importMessage=document.getElementById('product-import-message');
const importPreview=document.getElementById('product-import-preview');
const importImage=document.getElementById('product-import-image');
let importRequestId=0;
function importFeedback(message,type=''){importMessage.textContent=message;importMessage.className='product-form-message'+(type?' '+type:'');}
function clearImportPreview(){importPreview.hidden=true;importImage.hidden=true;importImage.removeAttribute('src');document.getElementById('product-import-name').textContent='';document.getElementById('product-import-price').textContent='';}
function parseImportedPrice(value,currency){
  if(value===null||value===undefined||value==='')return null;
  const amount=Number(value);
  if(!Number.isFinite(amount)||amount<0)return null;
  if(currency&&currency.toUpperCase()!=='HUF')return null;
  return Number.isSafeInteger(amount)&&amount<=999999999?amount:null;
}
importButton.addEventListener('click',async()=>{
  if(!authClient||adminApp.hidden||!verifyIdle()){importFeedback('Jelentkezz be újra a lekéréshez.','error');return;}
  const raw=importUrl.value.trim();
  let url;
  try{url=new URL(raw);if(!['https:','http:'].includes(url.protocol))throw Error();}
  catch{importFeedback('Adj meg egy érvényes http:// vagy https:// webshoplinket.','error');return;}
  const requestId=++importRequestId;
  importButton.disabled=true;importButton.textContent='Lekérés folyamatban…';clearImportPreview();importFeedback('Termékadatok lekérése…');
  try{
    const {data:sessionData,error:sessionError}=await authClient.auth.getSession();
    if(sessionError||!sessionData.session||!verifyIdle())throw new Error('A munkamenet lejárt. Jelentkezz be újra.');
    const {data,error}=await authClient.functions.invoke('fetch-product',{body:{url:url.href}});
    if(requestId!==importRequestId||adminApp.hidden||!verifyIdle())return;
    if(error){
      let message=error.message||'Nem sikerült lekérni az adatokat.';
      try{const details=await error.context?.json();if(details?.error)message=details.error;}catch{}
      throw new Error(message);
    }
    if(!data||typeof data!=='object'||data.error)throw new Error(data?.error||'A webshop nem adott feldolgozható adatokat.');
    const name=typeof data.name==='string'?data.name.trim():'';
    const description=typeof data.description==='string'?data.description.trim():'';
    const price=parseImportedPrice(data.price,data.currency);
    const image=typeof data.image_url==='string'&&/^https?:\/\//i.test(data.image_url)?data.image_url:'';
    if(name)document.getElementById('product-name').value=name.slice(0,180);
    if(description)document.getElementById('product-description').value=description.slice(0,2000);
    if(price!==null)document.getElementById('product-price').value=String(price);
    document.getElementById('product-webshop').value=url.href;
    if(image)document.getElementById('product-image').value=image.slice(0,2000);
    document.getElementById('product-import-name').textContent=name||'A termék neve nem érhető el';
    document.getElementById('product-import-price').textContent=price!==null?price.toLocaleString('hu-HU')+' Ft':(data.currency&&data.currency!=='HUF'?'Nem forintban megadott ár – töltsd ki kézzel.':'Az ár nem érhető el');
    if(image){importImage.src=image;importImage.hidden=false;importImage.onerror=()=>{importImage.hidden=true;};}
    importPreview.hidden=false;
    importUrl.value='';
    const missing=[!name?'név':null,price===null?'ár':null,!image?'kép':null].filter(Boolean);
    importFeedback(missing.length?'Részleges kitöltés. Hiányzó adatok: '+missing.join(', ')+'. A kategóriát is válaszd ki, majd ellenőrizd az adatokat.':'Adatok betöltve! Válassz kategóriát, és mentés előtt ellenőrizd az adatokat.','success');
  }catch(error){if(requestId===importRequestId)importFeedback('Nem sikerült automatikusan kitölteni: '+String(error?.message||'Ismeretlen hiba')+' A mezőket kézzel is kitöltheted.','error');}
  finally{if(requestId===importRequestId){importButton.disabled=false;importButton.textContent='✨ Adatok lekérése';}}
});
document.getElementById('product-reset').addEventListener('click',()=>{++importRequestId;importUrl.value='';importFeedback('');clearImportPreview();});

// Foglaláskezelés: kizárólag a szerveroldalon ellenőrzött admin RPC-ket hívjuk.
const reservationList=document.getElementById('reservation-list');
const reservationMessage=document.getElementById('reservation-message');
const reservationSummary=document.getElementById('reservation-summary');
const reservationFilter=document.getElementById('reservation-filter');
const reservationSearch=document.getElementById('reservation-search');
const reservationRefresh=document.getElementById('reservation-refresh');
let reservationsCache=[];
let reservationsLoading=false;
let reservationsGeneration=0;
function reservationFeedback(message,error=false){reservationMessage.textContent=message;reservationMessage.classList.toggle('error',error);}
function reservationDate(value){if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleString('hu-HU',{dateStyle:'medium',timeStyle:'short'});}
function reservationStatus(code){return ({active:'Aktív',reserved:'Lefoglalt',purchased:'Megvásárolt',cancelled:'Visszamondott',expired:'Lejárt'})[code]||code||'Ismeretlen';}
function effectiveStatus(r){return r.status==='active'&&new Date(r.expires_at).getTime()<=Date.now()?'expired':r.status;}
function elt(tag,className,textValue){const node=document.createElement(tag);if(className)node.className=className;if(textValue!==undefined)node.textContent=String(textValue);return node;}
function renderReservations(){
  reservationList.replaceChildren();
  const filter=reservationFilter.value;const search=reservationSearch.value.trim().toLocaleLowerCase('hu-HU');
  const visible=reservationsCache.filter(r=>{
    const items=Array.isArray(r.items)?r.items:[];
    const matchStatus=filter==='all'||effectiveStatus(r)===filter||items.some(i=>i.status===filter);
    const matchSearch=!search||[r.guest_name||'',...items.map(i=>i.name||'')].join(' ').toLocaleLowerCase('hu-HU').includes(search);
    return matchStatus&&matchSearch;
  });
  const active=reservationsCache.filter(r=>effectiveStatus(r)==='active').length;
  const purchased=reservationsCache.reduce((n,r)=>n+(r.items||[]).filter(i=>i.status==='purchased').length,0);
  reservationSummary.textContent=`Összesen ${reservationsCache.length} foglalás · ${active} aktív · ${purchased} megvásárolt ajándék`;
  document.getElementById('reservation-count-active').textContent=String(active);
  document.getElementById('reservation-count-purchased').textContent=String(purchased);
  document.getElementById('reservation-count-expired').textContent=String(reservationsCache.filter(r=>effectiveStatus(r)==='expired').length);
  document.getElementById('reservation-count-cancelled').textContent=String(reservationsCache.filter(r=>effectiveStatus(r)==='cancelled').length);
  if(!visible.length){const panel=elt('div','reservation-empty');panel.append(elt('span','', '📋'),elt('h3','', 'Nincs megjeleníthető foglalás'),elt('p','', 'Próbálj másik szűrőt vagy keresést.'));reservationList.append(panel);return;}
  for(const r of visible){
    const state=effectiveStatus(r);const card=elt('article','reservation-card');
    const head=elt('div','reservation-card-head');const title=elt('div');title.append(elt('strong','',r.guest_name||'Név nélkül'),elt('small','',`Foglalás: ${reservationDate(r.created_at)}`));
    head.append(title,elt('span','reservation-badge status-'+state,reservationStatus(state)));card.append(head);
    const dates=elt('div','reservation-dates');dates.append(elt('span','',`Lejárat: ${reservationDate(r.expires_at)}`));if(r.completed_at)dates.append(elt('span','',`Lezárva: ${reservationDate(r.completed_at)}`));card.append(dates);
    const items=elt('div','reservation-items');
    for(const item of (r.items||[])){
      const line=elt('div','reservation-item');const detail=elt('div','reservation-item-detail');
      detail.append(elt('strong','',item.name||'Ismeretlen ajándék'),elt('small','',reservationStatus(item.status)));
      const controls=elt('div','reservation-item-controls');
      if(item.status==='reserved'&&state==='active'){
        const buy=elt('button','reservation-buy','✓ Megvásárolva');buy.type='button';buy.addEventListener('click',()=>changeReservation(r.id,item.id,'purchase',item.name));
        const release=elt('button','reservation-release','Feloldás');release.type='button';release.addEventListener('click',()=>changeReservation(r.id,item.id,'release',item.name));controls.append(buy,release);
      }
      line.append(detail,controls);items.append(line);
    }
    card.append(items);
    if(state==='active'&&(r.items||[]).some(i=>i.status==='reserved')){
      const footer=elt('div','reservation-card-actions');const all=elt('button','reservation-release','Összes hátralévő foglalás feloldása');all.type='button';all.addEventListener('click',()=>changeReservation(r.id,null,'release_all',r.guest_name||'Név nélküli foglalás'));footer.append(all);card.append(footer);
    }
    reservationList.append(card);
  }
}
async function loadReservations(){
  if(reservationsLoading)return;
  if(!authClient||adminApp.hidden||!verifyIdle())return;
  const generation=++reservationsGeneration;reservationsLoading=true;reservationRefresh.disabled=true;reservationFeedback('Foglalások lekérése…');
  try{
    const {data,error}=await authClient.rpc('admin_list_gift_reservations');
    if(error)throw error;
    if(generation!==reservationsGeneration||adminApp.hidden||!verifyIdle())return;
    reservationsCache=Array.isArray(data)?data:[];
    renderReservations();reservationFeedback('Foglalások frissítve: '+reservationDate(new Date().toISOString()));
  }catch(error){console.error('Foglaláslista hiba:',error);reservationFeedback('Nem sikerült betölteni a foglalásokat. Ellenőrizd, hogy az admin SQL telepítve van-e, és hogy van-e adminjogosultságod.',true);}
  finally{reservationsLoading=false;reservationRefresh.disabled=false;}
}
async function changeReservation(reservationId,itemId,action,name){
  if(!authClient||adminApp.hidden||!verifyIdle())return;
  const labels={purchase:'megvásároltnak jelölni',release:'feloldani',release_all:'minden hátralévő ajándék foglalását feloldani'};
  if(!window.confirm(`Biztosan szeretnéd ${labels[action]} ezt: ${name}?`))return;
  reservationList.querySelectorAll('button').forEach(b=>b.disabled=true);
  reservationFeedback('Módosítás folyamatban…');
  try{
    const {data,error}=await authClient.rpc('admin_manage_gift_reservation',{p_reservation_id:reservationId,p_item_id:itemId,p_action:action});
    if(error)throw error;
    if(!data?.success)throw new Error('A műveletet a szerver nem erősítette meg.');
    reservationFeedback('Sikeres módosítás.');
    await loadReservations();
  }catch(error){console.error('Foglalásmódosítás hiba:',error);reservationFeedback('A művelet nem sikerült. Lehetséges, hogy a foglalás közben megváltozott vagy lejárt. Frissítsd a listát.',true);renderReservations();}
}
reservationFilter.addEventListener('change',renderReservations);
reservationSearch.addEventListener('input',renderReservations);
reservationRefresh.addEventListener('click',loadReservations);


// Valódi terméklista és szerkesztés. Az adatbázis RLS-jogosultságai érvényesek.
let productsCache=[], selectedProductId=null, productsBusy=false;
const productListEl=document.getElementById('products-list');
const productListMessage=document.getElementById('products-message');
const productEditPanel=document.getElementById('product-edit-panel');
const productEditForm=document.getElementById('product-edit-form');
const productsSearch=document.getElementById('products-search');
const productsFilter=document.getElementById('products-filter');
function pmsg(message){productListMessage.textContent=message;}
function safeText(v){return String(v??'');}
function categoryName(value){const el=[...document.getElementById('product-category').options].find(o=>o.value===value);return el?.textContent||value||'Egyéb';}
function fmtPrice(v){return Number(v||0).toLocaleString('hu-HU')+' Ft';}
function renderProducts(){
 const query=productsSearch.value.trim().toLocaleLowerCase('hu');
 const filtered=productsCache.filter(p=>(productsFilter.value==='all'||(productsFilter.value==='active' ? p.is_active===true : p.is_active!==true))&&
  (!query||(safeText(p.name)+' '+safeText(p.category)).toLocaleLowerCase('hu').includes(query)));
 productListEl.replaceChildren();
 pmsg(`${filtered.length} termék megjelenítve · ${productsCache.length} összesen`);
 if(!filtered.length){const el=document.createElement('p');el.textContent='Nincs a szűrésnek megfelelő termék.';productListEl.append(el);return;}
 for(const p of filtered){
  const card=document.createElement('article');card.className='admin-product-card';
  if(p.image_url&&/^https?:\/\//i.test(p.image_url)){const img=document.createElement('img');img.src=p.image_url;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';card.append(img);}
  const info=document.createElement('div');info.className='admin-product-info';
  const name=document.createElement('strong');name.textContent=safeText(p.name);
  const meta=document.createElement('small');meta.textContent=`${safeText(categoryName(p.category))} · ${fmtPrice(p.price)} · ${p.is_active?'Megjelenített':'Elrejtett'}`;
  info.append(name,meta);card.append(info);
  const buttons=document.createElement('div');buttons.className='admin-product-buttons';
  const edit=document.createElement('button');edit.type='button';edit.textContent='Szerkesztés';edit.addEventListener('click',()=>editProduct(p.id));
  const visibility=document.createElement('button');visibility.type='button';visibility.textContent=p.is_active?'Elrejtés':'Megjelenítés';visibility.addEventListener('click',()=>toggleProduct(p));
  const del=document.createElement('button');del.type='button';del.className='delete-product';del.textContent='Törlés';del.addEventListener('click',()=>deleteProduct(p));
  buttons.append(edit,visibility,del);card.append(buttons);productListEl.append(card);
 }
}
async function loadProducts(){
 if(!authClient||adminApp.hidden||!verifyIdle()||productsBusy)return;
 productsBusy=true;pmsg('Termékek betöltése…');
 try{
  // Admin RLS SELECT szükséges az elrejtett termékekhez is.
  const {data,error}=await authClient.from('products').select('id,name,category,price,description,image_url,webshop_url,is_active').order('name',{ascending:true});
  if(error)throw error;
  if(!verifyIdle())return;
  productsCache=data||[];renderProducts();
 }catch(e){console.error(e);pmsg('Nem sikerült betölteni a termékeket. Ellenőrizd a products tábla admin SELECT jogosultságát. '+safeText(e.message));}
 finally{productsBusy=false;}
}
function editProduct(id){
 const p=productsCache.find(x=>String(x.id)===String(id));if(!p)return;
 selectedProductId=p.id;
 document.getElementById('edit-name').value=p.name||'';
 const cat=document.getElementById('edit-category');cat.replaceChildren();
 const categoryLabels=Object.fromEntries([...document.getElementById('product-category').options].filter(o=>o.value).map(o=>[o.value,o.textContent]));
 const options=new Set(Object.keys(categoryLabels));
 if(p.category)options.add(p.category);
 for(const c of options){const option=document.createElement('option');option.value=c;option.textContent=categoryLabels[c]||c;cat.append(option);}
 cat.value=p.category||'';
 document.getElementById('edit-price').value=p.price??0;
 document.getElementById('edit-description').value=p.description||'';
 document.getElementById('edit-image').value=p.image_url||'';
 document.getElementById('edit-webshop').value=p.webshop_url||'';
 document.getElementById('edit-active').checked=!!p.is_active;
 document.getElementById('edit-message').textContent='';
 productEditPanel.hidden=false;productEditPanel.scrollIntoView({behavior:'smooth',block:'start'});
}
document.getElementById('edit-cancel').addEventListener('click',()=>{productEditPanel.hidden=true;selectedProductId=null;});
function validateUrl(value){if(!value)return true;try{return ['http:','https:'].includes(new URL(value).protocol);}catch{return false;}}
productEditForm.addEventListener('submit',async e=>{
 e.preventDefault();if(selectedProductId===null||!verifyIdle())return;
 const price=Number(document.getElementById('edit-price').value);
 const payload={
 name:document.getElementById('edit-name').value.trim(),
 category:document.getElementById('edit-category').value,
 price,
 description:document.getElementById('edit-description').value.trim()||null,
 image_url:document.getElementById('edit-image').value.trim()||null,
 webshop_url:document.getElementById('edit-webshop').value.trim()||null,
 is_active:document.getElementById('edit-active').checked
 };
 const message=document.getElementById('edit-message');
 if(!payload.name||!payload.category||!Number.isSafeInteger(price)||price<0||price>999999999||!validateUrl(payload.image_url)||!validateUrl(payload.webshop_url)){message.textContent='Ellenőrizd a kötelező mezőket, az árat és a linkeket.';return;}
 const save=document.getElementById('edit-save');save.disabled=true;message.textContent='Mentés…';
 try{
  const {error}=await authClient.from('products').update(payload).eq('id',selectedProductId);
  if(error)throw error;
  message.textContent='Sikeresen mentve.';productEditPanel.hidden=true;selectedProductId=null;await loadProducts();
 }catch(err){message.textContent='Nem sikerült menteni: '+safeText(err.message);}
 finally{save.disabled=false;}
});
async function toggleProduct(p){
 if(!verifyIdle())return;
 const action=p.is_active?'elrejteni':'megjeleníteni';
 if(!confirm(`Biztosan szeretnéd ${action} ezt az ajándékot?\n${p.name}`))return;
 const {error}=await authClient.from('products').update({is_active:!p.is_active}).eq('id',p.id);
 if(error){alert('Nem sikerült módosítani: '+error.message);return;}
 await loadProducts();
}
async function deleteProduct(p){
 if(!verifyIdle())return;
 if(!confirm(`VÉGLEGES TÖRLÉS\n\n${p.name}\n\nA korábbi foglalások miatt az adatbázis megakadályozhatja a törlést. Biztosan folytatod?`))return;
 const {error}=await authClient.from('products').delete().eq('id',p.id);
 if(error){alert('Nem sikerült törölni. Foglalási előzmény esetén inkább rejtsd el a terméket.\n'+error.message);return;}
 await loadProducts();
}
productsSearch.addEventListener('input',renderProducts);
productsFilter.addEventListener('change',renderProducts);
document.getElementById('products-refresh').addEventListener('click',loadProducts);

// v63: adatbázis-alapú kategóriakezelés.
let adminCategories=[];
const catForm=document.getElementById('category-form');
const catList=document.getElementById('category-list');
const catMessage=document.getElementById('category-message');
const catLabel=document.getElementById('category-label');
const catEditId=document.getElementById('category-edit-id');
const catSave=document.getElementById('category-save');
function catFeedback(msg,bad=false){catMessage.textContent=msg;catMessage.classList.toggle('error',bad);}
function resetCategoryForm(){catForm.reset();catEditId.value='';catSave.textContent='Új kategória hozzáadása';document.getElementById('category-cancel').hidden=true;}
document.getElementById('category-cancel').addEventListener('click',resetCategoryForm);
function renderAdminCategories(){
 catList.replaceChildren();
 for(const c of adminCategories){
  const row=elt('div','category-admin-item');
  const name=elt('strong','',c.label);const meta=elt('small','',c.slug);
  const info=elt('div','category-admin-info');info.append(name,meta);
  const actions=elt('div','category-admin-actions');
  const edit=elt('button','','Átnevezés');edit.type='button';edit.addEventListener('click',()=>{catEditId.value=c.slug;catLabel.value=c.label;catSave.textContent='Név mentése';document.getElementById('category-cancel').hidden=false;catLabel.focus();});
  const del=elt('button','delete-product','Törlés');del.type='button';del.disabled=c.slug==='other';del.title=del.disabled?'Az Egyéb alapértelmezett kategória nem törölhető':'';
  del.addEventListener('click',async()=>{
   if(!verifyIdle()||!confirm(`Törlöd ezt a kategóriát?\n${c.label}\n\nHa tartozik hozzá termék, a törlés nem engedélyezett.`))return;
   const {count,error:countError}=await authClient.from('products').select('id',{count:'exact',head:true}).eq('category',c.slug);
   if(countError){catFeedback('Nem sikerült ellenőrizni a termékeket: '+countError.message,true);return;}
   if(count){catFeedback('A kategóriához '+count+' termék tartozik. Előbb helyezd át őket másik kategóriába.',true);return;}
   const {error}=await authClient.from('wishlist_categories').delete().eq('slug',c.slug);
   if(error){catFeedback('Törlés sikertelen: '+error.message,true);return;}
   resetCategoryForm();await loadAdminCategories();catFeedback('Kategória törölve.');
  });
  actions.append(edit,del);row.append(info,actions);catList.append(row);
 }
}
async function loadAdminCategories(){
 if(!authClient||adminApp.hidden||!verifyIdle())return;
 const {data,error}=await authClient.from('wishlist_categories').select('slug,label,sort_order').order('sort_order',{ascending:true}).order('label',{ascending:true});
 if(error){catFeedback('A kategóriák nem tölthetők be. Először futtasd a mellékelt Supabase SQL-t. '+error.message,true);return;}
 adminCategories=data||[];
 for(const select of [document.getElementById('product-category'),document.getElementById('edit-category')]){
  const current=select.value;select.replaceChildren();
  if(select.id==='product-category'){const empty=new Option('Válassz kategóriát','');select.add(empty);}
  for(const c of adminCategories)select.add(new Option(c.label,c.slug));
  if([...select.options].some(o=>o.value===current))select.value=current;
 }
 renderAdminCategories();catFeedback(adminCategories.length+' kategória betöltve.');
 if(productsCache.length)renderProducts();
}
catForm.addEventListener('submit',async e=>{
 e.preventDefault();if(!verifyIdle())return;
 const label=catLabel.value.trim();if(!label||label.length>70){catFeedback('Adj meg egy 1–70 karakteres nevet.',true);return;}
 if(adminCategories.some(c=>c.label.toLocaleLowerCase('hu')===label.toLocaleLowerCase('hu')&&c.slug!==catEditId.value)){catFeedback('Ilyen nevű kategória már létezik.',true);return;}
 catSave.disabled=true;catFeedback('Mentés…');
 try{
  let error;
  if(catEditId.value){({error}=await authClient.from('wishlist_categories').update({label}).eq('slug',catEditId.value));}
  else{
   const slug='cat_'+(globalThis.crypto?.randomUUID?.()||String(Date.now())+'_'+Math.floor(Math.random()*100000));
   ({error}=await authClient.from('wishlist_categories').insert({slug,label,sort_order:adminCategories.length*10+10}));
  }
  if(error)throw error;
  resetCategoryForm();await loadAdminCategories();catFeedback('Sikeresen mentve.','');
 }catch(error){catFeedback('Nem sikerült menteni: '+error.message,true);}
 finally{catSave.disabled=false;}
});


// v64 — Átvételi helyek: kizárólag admin írhat, a publikus oldal csak aktív sorokat olvashat.
const shippingProviders=[['gls','GLS','Csomagautomata'],['foxpost','FOXPOST','Csomagautomata'],['dpd','DPD','Pickup pont'],['emag','eMAG','easybox'],['alza','Alza','AlzaBox']];
const shippingEditor=document.getElementById('shipping-editor');
const shippingMessage=document.getElementById('shipping-message');
let shippingLoadToken=0;
function shippingFeedback(message,isError=false){shippingMessage.textContent=message;shippingMessage.classList.toggle('error',isError);shippingMessage.classList.toggle('success',!isError&&!!message);}
async function loadShipping(){
 if(!authClient||adminApp.hidden||!verifyIdle())return;
 const token=++shippingLoadToken;shippingFeedback('Átvételi helyek lekérése…');
 const {data,error}=await authClient.from('shipping_locations').select('provider,location_name,address,location_code,notes,is_active');
 if(token!==shippingLoadToken)return;
 if(error){shippingEditor.replaceChildren(elt('p','','Nem sikerült betölteni az átvételi helyeket.'));shippingFeedback('Adatbázishiba: '+error.message+' — futtasd a mellékelt SQL-fájlt a Supabase SQL Editorban.',true);return;}
 const byProvider=new Map((data||[]).map(r=>[r.provider,r]));shippingEditor.replaceChildren();
 for(const [provider,label,type] of shippingProviders){
  const row=byProvider.get(provider)||{};
  const card=elt('form','shipping-location-card');card.dataset.provider=provider;
  const heading=elt('div','shipping-location-heading');heading.append(elt('strong','',label),elt('small','',type));card.append(heading);
  const fields=elt('div','shipping-fields');
  function field(text,key,placeholder){const wrap=elt('label','',text);const input=elt('input');input.name=key;input.maxLength=key==='notes'?500:250;input.placeholder=placeholder;input.value=row[key]||'';wrap.append(input);fields.append(wrap);}
  field('Automata / átvételi hely neve','location_name','Pl. Budapest, bevásárlóközpont');
  field('Pontos cím','address','Irányítószám, település, utca, házszám');
  field('Automata azonosítója (ha van)','location_code','Pl. automata kódja');
  field('Kiegészítő információ (opcionális)','notes','Pl. bejárat mellett');
  card.append(fields);
  const actions=elt('div','shipping-location-actions');const visibility=elt('label','shipping-visibility');const check=elt('input');check.type='checkbox';check.name='is_active';check.checked=!!row.is_active;visibility.append(check,document.createTextNode(' Megjelenjen a látogatóknak'));
  const save=elt('button','','Mentés');save.type='submit';actions.append(visibility,save);card.append(actions);
  card.addEventListener('submit',async e=>{
   e.preventDefault();if(!verifyIdle())return;
   const fd=new FormData(card);const payload={provider,location_name:String(fd.get('location_name')||'').trim(),address:String(fd.get('address')||'').trim(),location_code:String(fd.get('location_code')||'').trim(),notes:String(fd.get('notes')||'').trim(),is_active:check.checked};
   if(payload.is_active&&(!payload.location_name||!payload.address)){shippingFeedback(label+': megjelenítéshez add meg az átvételi hely nevét és címét.',true);return;}
   save.disabled=true;save.textContent='Mentés…';shippingFeedback(label+' mentése…');
   try{const {error}=await authClient.from('shipping_locations').upsert(payload,{onConflict:'provider'});if(error)throw error;shippingFeedback(label+': sikeresen mentve.');}
   catch(err){shippingFeedback(label+': nem sikerült menteni. '+err.message,true);}
   finally{save.disabled=false;save.textContent='Mentés';}
  });
  shippingEditor.append(card);
 }
 shippingFeedback('Az átvételi helyek betöltve.');
}
document.getElementById('shipping-refresh').addEventListener('click',()=>void loadShipping());
