(function client(){
'use strict';
const KEY='wedletter_odnazhdy_blocks_v3';
const types=[['story','История пары'],['ball','Королевский бал'],['invitation','Приглашение'],['timing','Тайминг дня'],['dresscode','Дресс-код'],['notes','Пожелания'],['rsvp','RSVP'],['finale','Финал'],['custom','Авторский блок']];
const defaults=()=>({version:3,couple:'Алина & Матвей',date:'14 июня 2027',venue:'Усадьба «Сказка»',arrival:'16:00',blocks:[
{id:'story',type:'story',on:true,title:'Однажды два сердца встретились…',subtitle:'И обычный мир вдруг стал немного волшебным.'},
{id:'ball',type:'ball',on:true,title:'И целый мир закружился в танце',subtitle:'Случайный взгляд, первая улыбка — и уже невозможно представить жизнь друг без друга.'},
{id:'invitation',type:'invitation',on:true,title:'Карета уже отправляется…',subtitle:'И нам не терпится разделить этот день с вами.'},
{id:'timing',type:'timing',on:true,title:'Программа волшебного дня',subtitle:'Каждая минута нашей сказки будет особенной.'},
{id:'dresscode',type:'dresscode',on:true,title:'Идеальный наряд для особенного вечера',subtitle:'Будем рады, если вы поддержите атмосферу праздника.'},
{id:'notes',type:'notes',on:true,title:'Несколько пожеланий',subtitle:'Самый главный подарок — ваше присутствие. Вместо цветов будем рады тёплым словам и улыбкам.'},
{id:'rsvp',type:'rsvp',on:true,title:'До встречи в нашей сказке',subtitle:'Пожалуйста, подтвердите своё присутствие.'},
{id:'finale',type:'finale',on:true,title:'И жили они долго и счастливо…',subtitle:'А вы стали частью их сказки. До скорой встречи!'}],
timing:[{time:'15:30',name:'Сбор гостей',detail:'Волшебные встречи и приветственные напитки'},{time:'16:00',name:'Церемония',detail:'Самое главное «да»'},{time:'17:00',name:'Праздничный ужин',detail:'Тосты, музыка и танцы'},{time:'20:30',name:'Свадебный торт',detail:'Сладкий финал вечера'}],
palette:['#f0dcca','#deb9c4','#a3b5d2','#bc94ad','#b5aa99']});
const clone=v=>JSON.parse(JSON.stringify(v));
function load(){try{let v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&v.version===3&&Array.isArray(v.blocks))return v}catch(e){}return defaults()}
function save(v){localStorage.setItem(KEY,JSON.stringify(v))}
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const set=(e,t)=>{if(e)e.textContent=t};
function build(block,c){
 const s=document.createElement('section');s.className='scene fairy-extra';s.dataset.section=block.id;
 const mid=block.type==='timing'?'<div class="fairy-panel"><div class="fairy-eyebrow">РАСПИСАНИЕ КОРОЛЕВСКОГО БАЛА</div><div class="fairy-timeline">'+c.timing.map(i=>'<div class="fairy-event"><b>'+esc(i.time)+'</b><div><strong>'+esc(i.name)+'</strong><small>'+esc(i.detail)+'</small></div></div>').join('')+'</div></div>':
 '<div class="fairy-panel"><div class="fairy-eyebrow">'+(block.type==='finale'?'ЭПИЛОГ':block.type==='notes'?'ПОСЛАНИЕ ГОСТЯМ':'НАША СКАЗКА')+'</div><div class="fairy-note">'+esc(block.subtitle)+'</div><div class="fairy-medallion">✧</div>'+(block.type==='finale'?'<button class="gold-button" type="button" data-top>Начать сказку сначала ↑</button>':'')+'</div>';
 s.innerHTML='<div class="fairy-scenery" aria-hidden="true"><i class="fairy-spark">✦</i><i class="fairy-spark two">✧</i><div class="fairy-moon"></div><div class="fairy-hills"></div></div><div class="chapter-label reveal">'+(block.type==='timing'?'Тайминг':block.type==='notes'?'Пожелания':block.type==='finale'?'Эпилог':'Новая глава')+'</div><h2 class="reveal">'+esc(block.title)+'</h2>'+(block.type==='timing'||block.type==='custom'?'<p class="scene-sub reveal">'+esc(block.subtitle)+'</p>':'')+'<div class="reveal">'+mid+'</div>';
 s.querySelector('[data-top]')?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));return s;
}
function style(){
 if(document.getElementById('wedletter-modules-css'))return;
 let x=document.createElement('style');x.id='wedletter-modules-css';x.textContent=`
.fairy-extra{background:linear-gradient(150deg,#0d1435,#30416d 54%,#111a38);padding-top:115px}
.fairy-scenery{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:-1;background:radial-gradient(ellipse at 60% 34%,#656da04d,transparent 65%)}
.fairy-moon{position:absolute;top:10%;right:-15%;width:68vw;max-width:400px;aspect-ratio:1;border-radius:50%;background:#ffedc1;opacity:.15;box-shadow:0 0 90px #ffe3ac88;animation:moonbreath 7s infinite alternate}
.fairy-hills{position:absolute;inset:auto 0 0;height:25%;background:#101b39;clip-path:polygon(0 60%,20% 14%,43% 59%,69% 5%,100% 60%,100% 100%,0 100%)}
.fairy-spark{position:absolute;top:22%;left:14%;font-size:29px;color:#ffebac;animation:float 4s infinite alternate}
.fairy-spark.two{top:36%;left:84%;font-size:18px;animation-delay:-2s}
.fairy-panel{border:1px solid #ecd7a4;background:linear-gradient(155deg,#111b3df7,#18264df5);border-radius:24px;box-shadow:0 22px 50px #020718a6;color:#fff3d8;padding:27px 23px;max-width:430px;width:100%;text-align:center}
.fairy-eyebrow{font-size:10px;font-weight:600;letter-spacing:.15em;color:#f1d79c;margin-bottom:19px}
.fairy-timeline{text-align:left}.fairy-event{display:grid;grid-template-columns:65px 1fr;gap:10px;align-items:start;padding:13px 0;border-bottom:1px solid #fff2d72f}.fairy-event:last-child{border:0}
.fairy-event b{font:700 14px Manrope,sans-serif;color:#f8dba2}.fairy-event strong{font-size:15px;display:block}.fairy-event small{font-size:12px;line-height:1.4;display:block;margin-top:5px;opacity:.8}
.fairy-note{font:400 24px/1.4 'Cormorant Garamond',Georgia,serif}.fairy-medallion{font-size:44px;color:#ffe5b6;margin-top:16px}
.fairy-panel .gold-button{font-size:11px;margin-top:20px}.fairy-extra .scene-sub{text-shadow:0 2px 10px #071021;background:#08102a8f;border-radius:14px;padding:10px}
@media(prefers-reduced-motion:reduce){.fairy-moon,.fairy-spark{animation:none!important}}
`;document.head.append(x);
}
function apply(){
let root=document.getElementById('story');if(!root)return;
const c=load();style();
set(document.querySelector('.s1 .big-names'),c.couple);set(document.querySelector('.s3 .big-names'),c.date);
const strs=document.querySelectorAll('.s3 .cards strong');set(strs[0],c.venue);set(strs[1],'Сбор гостей в '+c.arrival);
const palette=document.querySelector('.palette');if(palette)palette.innerHTML=c.palette.map(h=>'<i style="background:'+(/^#[0-9a-f]{6}$/i.test(h)?h:'#ead8c7')+'"></i>').join('');
const basic={story:root.querySelector('.s1'),ball:root.querySelector('.s2'),invitation:root.querySelector('.s3'),dresscode:root.querySelector('[data-section=dresscode]'),rsvp:root.querySelector('[data-section=rsvp]')};
root.querySelectorAll('.fairy-extra').forEach(n=>n.remove());
for(const b of c.blocks){
let node=(b.id===b.type&&basic[b.type])||build(b,c);
node.dataset.section=b.id;node.style.display=b.on?'':'none';
if(basic[b.type]===node){set(node.querySelector('h2'),b.title);if(b.type==='rsvp')set(node.querySelector('.inv-card p'),b.subtitle);else if(b.type==='dresscode')set(node.querySelector('.glass p'),b.subtitle);else set(node.querySelector('.scene-sub'),b.subtitle);}
root.append(node);
}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.querySelectorAll('.reveal').forEach((n,i)=>setTimeout(()=>n.classList.add('shown'),i*120))}),{threshold:.08});
root.querySelectorAll('.fairy-extra').forEach(x=>io.observe(x));
}
window.WedletterOdnazhdy={KEY,types,defaults,load,save,clone,esc,apply};
if(document.getElementById('story')){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply()}
})();