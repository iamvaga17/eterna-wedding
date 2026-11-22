// WEDLETTER Telegram Worker — isolated deployment via GitHub
const ALLOWED = new Set(["https://iamvaga17.github.io","https://wedletter.ru","https://www.wedletter.ru"]);
function reply(status,data,origin=""){const headers={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};if(ALLOWED.has(origin)){headers["Access-Control-Allow-Origin"]=origin;headers["Access-Control-Allow-Methods"]="POST, OPTIONS";headers["Access-Control-Allow-Headers"]="content-type";headers.Vary="Origin";}return new Response(status===204?null:JSON.stringify(data),{status,headers});}
function clean(value,limit){return typeof value==="string"?value.trim().replace(/[\u0000-\u001f\u007f]/g,"").slice(0,limit):"";}
export default {async fetch(request,env){const origin=request.headers.get("Origin")||"";
if(request.method==="OPTIONS")return reply(ALLOWED.has(origin)?204:403,{},origin);
if(request.method!=="POST")return reply(405,{ok:false,message:"Use POST"},origin);
if(!ALLOWED.has(origin))return reply(403,{ok:false,message:"Origin not allowed"},origin);
if(!(request.headers.get("Content-Type")||"").toLowerCase().startsWith("application/json"))return reply(415,{ok:false,message:"JSON required"},origin);
let data;try{const raw=await request.text();if(raw.length>8192)return reply(413,{ok:false,message:"Слишком длинная заявка"},origin);data=JSON.parse(raw);}catch{return reply(400,{ok:false,message:"Некорректная заявка"},origin);}
if(!data||typeof data!=="object"||Array.isArray(data))return reply(400,{ok:false,message:"Некорректная заявка"},origin);
if(data.website)return reply(200,{ok:true,message:"Заявка принята"},origin);
const name=clean(data.name,100),contact=clean(data.contact,120),date=clean(data.date,20),design=clean(data.design,120),details=clean(data.details,2000);
if(name.length<2||contact.length<3)return reply(422,{ok:false,message:"Укажи имя и контакт"},origin);
if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))return reply(422,{ok:false,message:"Неверная дата"},origin);
if(!env.BOT_TOKEN||!env.CHAT_ID)return reply(503,{ok:false,message:"Бот ещё не настроен"},origin);
const message=["💌 Новая заявка WEDLETTER","","Имя: "+name,"Связь: "+contact,"Дата: "+(date||"Не указана"),"Дизайн: "+(design||"Не выбран"),"","Пожелания: "+(details||"Не указаны")].join("\n");
try{const result=await fetch("https://api.telegram.org/bot"+env.BOT_TOKEN+"/sendMessage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:env.CHAT_ID,text:message}),signal:AbortSignal.timeout(12000)});const body=await result.json().catch(()=>null);if(!result.ok||body?.ok!==true){console.error("Telegram delivery rejected",result.status,body?.error_code);return reply(502,{ok:false,message:"Telegram отклонил сообщение"},origin);}return reply(200,{ok:true,message:"Заявка отправлена"},origin);}catch(err){console.error("Telegram connection failed",err?.name);return reply(502,{ok:false,message:"Не удалось связаться с Telegram"},origin);}
}};