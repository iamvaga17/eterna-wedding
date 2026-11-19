/**
 * ÉTERNA Publisher v27: GitHub Pages atomic site deployment.
 * Cloudflare secrets required (never put them into GitHub):
 *  - EDITOR_ACCESS_TOKEN: existing per-session editor access password
 *  - GITHUB_PUBLISH_TOKEN: fine-grained GitHub PAT with Contents read/write,
 *    restricted to iamvaga17/eterna-wedding repository.
 * Keep existing Workers AI routes intact.
 */
import aiWorker from "./cloudflare-free-worker-v23.js";
const REPO = "iamvaga17/eterna-wedding";
const BRANCH = "main";
const GH = "https://api.github.com/repos/"+REPO;
const PREFIX = "https://iamvaga17.github.io/eterna-wedding/orders/";
const MAX_BASE64 = 14_000_000;
function result(body,status=200,headers={}){
 return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff",...headers}});
}
function safeId(id){return typeof id==="string"&&/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/.test(id);}
function safePath(id,path){
 if(typeof path!=="string"||path.length>220||!path.startsWith("orders/"+id+"/"))return false;
 const inside=path.slice(("orders/"+id+"/").length);
 return inside.length>0 && inside.split("/").every(seg=>/^[A-Za-z0-9][A-Za-z0-9._-]{0,100}$/.test(seg)&&seg!==".."&&!seg.startsWith(".")) &&
 /\.(?:html|js|css|jpg|jpeg|png|webp|json|txt|mp3|m4a|svg|woff2?)$/i.test(inside);
}
async function github(env,endpoint,method="GET",data){
 const res=await fetch(GH+endpoint,{method,headers:{
  Authorization:"Bearer "+env.GITHUB_PUBLISH_TOKEN,
  Accept:"application/vnd.github+json",
  "X-GitHub-Api-Version":"2022-11-28",
  "User-Agent":"eterna-wedding-private-publisher",
  ...(data?{"Content-Type":"application/json"}:{})
 },...(data?{body:JSON.stringify(data)}:{})});
 const output=await res.json().catch(()=>({}));
 if(!res.ok)throw Error("GitHub "+res.status+": "+String(output.message||"Request failed").slice(0,160));
 return output;
}
export default {
 async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(!url.pathname.startsWith("/publish/"))return aiWorker.fetch(request,env,ctx);
  const origin=request.headers.get("Origin")||"";
  const allowed=env.ALLOWED_ORIGIN||"https://iamvaga17.github.io";
  const cors=origin===allowed?{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"POST, OPTIONS, GET","Access-Control-Allow-Headers":"Authorization, Content-Type","Vary":"Origin"}:{};
  if(request.method==="OPTIONS")return new Response(null,{status:origin===allowed?204:403,headers:cors});
  if(request.method==="GET"&&url.pathname==="/publish/status"){
    // No credentials or private details are exposed.
    return result({ready:!!env.GITHUB_PUBLISH_TOKEN&&!!env.EDITOR_ACCESS_TOKEN},200,cors);
  }
  if(origin!==allowed)return result({error:"Origin not allowed"},403);
  if(request.method!=="POST")return result({error:"POST only"},405,cors);
  if(!env.EDITOR_ACCESS_TOKEN||!env.GITHUB_PUBLISH_TOKEN)return result({error:"Сначала добавь GITHUB_PUBLISH_TOKEN в секреты Cloudflare Worker."},503,cors);
  if(request.headers.get("Authorization")!=="Bearer "+env.EDITOR_ACCESS_TOKEN)return result({error:"Неверный пароль редактора."},401,cors);
  if(Number(request.headers.get("content-length")||0)>MAX_BASE64+1000)return result({error:"Файл слишком большой для публикации."},413,cors);
  try{
   const body=await request.json();
   const id=body.orderId;
   if(!safeId(id))return result({error:"Некорректный идентификатор заказа."},400,cors);
   if(url.pathname==="/publish/blob"){
    const path=body.path,base64=body.content;
    if(!safePath(id,path)||typeof base64!=="string"||base64.length<1||base64.length>MAX_BASE64||!/^[A-Za-z0-9+/]+={0,2}$/.test(base64))
      return result({error:"Неправильный файл или размер."},400,cors);
    const blob=await github(env,"/git/blobs","POST",{content:base64,encoding:"base64"});
    return result({path,sha:blob.sha},200,cors);
   }
   if(url.pathname==="/publish/commit"){
    const ownerId=body.ownerId||id;
    if(!safeId(ownerId))return result({error:"Некорректный владелец заказа."},400,cors);
    // Claim each public path once; only its original editor order can update it.
    const currentOwner=await github(env,"/contents/orders/"+encodeURIComponent(id)+"/site-owner.json").catch(e=>{
      if(String(e.message).startsWith("GitHub 404:"))return null;
      throw e;
    });
    if(currentOwner){
      const decoded=JSON.parse(atob((currentOwner.content||"").replace(/\\s/g,"")));
      if(decoded.ownerId!==ownerId)return result({error:"Этот короткий адрес уже занят другим заказом."},409,cors);
    }else{
      const existing=await github(env,"/contents/orders/"+encodeURIComponent(id)+"/index.html").catch(e=>{
        if(String(e.message).startsWith("GitHub 404:"))return null;
        throw e;
      });
      if(existing && id!==ownerId)return result({error:"Адрес уже занят ранее опубликованным сайтом."},409,cors);
    }
    const list=body.files;
    if(!Array.isArray(list)||list.length<1||list.length>140)return result({error:"Неверный список файлов."},400,cors);
    const seen=new Set();
    for(const file of list){
     if(!file||!safePath(id,file.path)||seen.has(file.path)||!/^[a-f0-9]{40}$/.test(file.sha||""))
      return result({error:"Некорректный список файлов."},400,cors);
     seen.add(file.path);
    }
    if(!seen.has("orders/"+id+"/index.html"))return result({error:"Отсутствует главная страница."},400,cors);
    const head=await github(env,"/git/ref/heads/"+BRANCH);
    const previousSha=head.object?.sha;
    if(!/^[a-f0-9]{40}$/.test(previousSha||""))throw Error("Unable to fetch main HEAD");
    const commit=await github(env,"/git/commits/"+previousSha);
    const base=commit.tree?.sha;
    const tree=await github(env,"/git/trees","POST",{base_tree:base,tree:[...list.map(f=>({path:f.path,mode:"100644",type:"blob",sha:f.sha})),{
      path:"orders/"+id+"/site-owner.json",mode:"100644",type:"blob",
      content:JSON.stringify({ownerId})
    }]});
    const newCommit=await github(env,"/git/commits","POST",{
      message:"Publish WEDLETTER wedding order "+id,
      tree:tree.sha,
      parents:[previousSha]
    });
    await github(env,"/git/refs/heads/"+BRANCH,"PATCH",{sha:newCommit.sha,force:false});
    return result({ok:true,url:PREFIX+encodeURIComponent(id)+"/",commit:newCommit.sha},200,cors);
   }
   return result({error:"Unknown publish route"},404,cors);
  }catch(error){
   // Short sanitized errors for debugging; no user photos or tokens returned.
   return result({error:String(error?.message||"Ошибка публикации").slice(0,220)},502,cors);
  }
 }
};
