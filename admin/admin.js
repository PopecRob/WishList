'use strict';
// Admin belépés Supabase Auth-tal; az adminfelület tartalma továbbra is bemutató adat.
const titles={overview:['Áttekintés','Minden apró kívánság egy helyen, szeretettel rendezve.'],products:['Termékek','Az ajándékok áttekintése és kezelése.'],new:['Új ajándék','Készítsük elő Nimród következő kívánságát!'],reservations:['Foglalások','Lefoglalt és megvásárolt ajándékok.'],shipping:['Szállítási adatok','Kedvenc átvételi helyeink és csomagautomatáink.']};
const sidebar=document.querySelector('.sidebar');const overlay=document.getElementById('mobile-overlay');const toggle=document.getElementById('menu-toggle');
function closeMenu(){sidebar.classList.remove('open');overlay.classList.remove('open');overlay.hidden=true;toggle.setAttribute('aria-expanded','false');}
function showView(view){if(!titles[view])return;document.querySelectorAll('[data-panel]').forEach(el=>el.classList.toggle('active',el.dataset.panel===view));document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));document.getElementById('page-title').innerHTML=titles[view][0]+' <span>♡</span>';document.getElementById('page-subtitle').textContent=titles[view][1];closeMenu();window.scrollTo({top:0,behavior:'smooth'});}
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
  showAdmin();
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
    productFeedback(active?'Sikeres mentés! Az ajándék megjelenhet a nyilvános kívánságlistán.':'Sikeres mentés! Az ajándék inaktívként került az adatbázisba.','success');
  }catch(error){
    console.error('Termékmentési hiba:',error);
    const message=String(error?.message||'');
    if(/row-level security|permission denied|42501/i.test(message))productFeedback('A Supabase elutasította a mentést. Ellenőrizni kell az adminjogosultságot és az RLS-szabályokat.','error');
    else if(/munkamenet lejárt/i.test(message))productFeedback(message,'error');
    else productFeedback('Nem sikerült menteni az ajándékot. Ellenőrizd az internetkapcsolatot és a Supabase beállításait.','error');
  }finally{productSave.disabled=false;productSave.textContent='Ajándék mentése →';}
});
