/**
 * Private image-generation endpoint for ÉTERNA ATELIER.
 * Deploy as a Cloudflare Worker; configure encrypted secrets:
 *   OPENAI_API_KEY, EDITOR_ACCESS_TOKEN, ALLOWED_ORIGIN
 * Do NOT expose these secrets in GitHub Pages.
 * Optional: IMAGE_MODEL (default gpt-image-2.5-flare).
 * Security: token is entered per session in editor, NOT saved in localStorage.
 * Each request generates one scene using BOTH original reference photos.
 */
const SCENES = Object.freeze({
  sceneCover: "Comedic breaking-news wedding investigation: a bride and groom face microphones and journalists, cinematic television newsroom, humorous but sophisticated. Visual style of an expensive satirical TV news segment. Square image.",
  sceneArchive: "Authentic analog 1990s archival photograph of the SAME bride and groom at their first meeting. Editorially staged with intimate candid natural poses, film grain, vintage warm colors, square photo. Adapt location if user provides another meeting place.",
  sceneForecast: "The SAME bride and groom presenting a whimsical wedding weather forecast in a retro TV news studio, elegant lighting, floating confetti weather graphics, cinematic photographic realism. Square."
});
function json(data,status=200,extra={}) {
  return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});
}
export default {
 async fetch(request,env) {
  const origin=request.headers.get("Origin")||"";
  const permitted=origin===env.ALLOWED_ORIGIN;
  const cors=permitted?{"Access-Control-Allow-Origin":origin,"Vary":"Origin","Access-Control-Allow-Headers":"Authorization, Content-Type","Access-Control-Allow-Methods":"POST, OPTIONS"}:{};
  if(request.method==="OPTIONS")return new Response(null,{status:permitted?204:403,headers:cors});
  if(!permitted)return json({error:"Origin not allowed"},403);
  if(request.method!=="POST")return json({error:"POST only"},405,cors);
  if(!env.OPENAI_API_KEY||!env.EDITOR_ACCESS_TOKEN)return json({error:"Backend has not been configured"},503,cors);
  const supplied=request.headers.get("Authorization")||"";
  if(supplied!==("Bearer "+env.EDITOR_ACCESS_TOKEN))return json({error:"Unauthorized"},401,cors);
  const len=Number(request.headers.get("Content-Length")||0);
  if(len>12_000_000)return json({error:"File upload too large"},413,cors);
  try {
    const input=await request.formData();
    const scene=String(input.get("scene")||"");
    if(!Object.hasOwn(SCENES,scene))return json({error:"Unknown scene"},400,cors);
    const bride=input.get("bride"),groom=input.get("groom");
    if(!(bride instanceof File)||!(groom instanceof File))return json({error:"Two reference photos required"},400,cors);
    for(const photo of [bride,groom]) {
      if(!["image/jpeg","image/png","image/webp"].includes(photo.type)||photo.size>5_000_000||photo.size<1024)
        return json({error:"Use jpeg/png/webp references below 5MB"},400,cors);
    }
    const context=String(input.get("context")||"").slice(0,700);
    const names=String(input.get("names")||"").slice(0,150);
    const form=new FormData();
    form.append("model",env.IMAGE_MODEL||"gpt-image-2.5-flare");
    form.append("size","1024x1024");
    form.append("quality","medium");
    form.append("output_format","jpeg");
    form.append("n","1");
    form.append("image",bride,"bride.jpg");
    form.append("image",groom,"groom.jpg");
    form.append("prompt",[
      "INPUT IMAGE 1: bride identity reference. INPUT IMAGE 2: groom identity reference.",
      "Create exactly ONE new photo including BOTH these exact people together. Keep the woman's face, features, build, approximate age and hair matching image 1; keep the man's corresponding identity and build matching image 2.",
      "Preserve identity across the entire set of scenes, facial structure and body proportions; do not replace people with generic models.",
      "Natural bodies, correct hand anatomy, high-end photographic realism. No text, logos, watermarks or fictional news subtitles.",
      "Scene: "+SCENES[scene],"Pair: "+names,"User-provided scene details: "+context
    ].join("\n"));
    const response=await fetch("https://api.openai.com/v1/images/edits",{
      method:"POST",headers:{Authorization:"Bearer "+env.OPENAI_API_KEY},body:form
    });
    if(!response.ok) {
      const error=await response.text();
      return json({error:"Image provider returned an error",detail:error.slice(0,450)},502,cors);
    }
    const result=await response.json();
    const b64=result?.data?.[0]?.b64_json;
    if(typeof b64!=="string"||!b64)return json({error:"No image received"},502,cors);
    return json({image:"data:image/jpeg;base64,"+b64,scene,model:env.IMAGE_MODEL||"gpt-image-2.5-flare"},200,cors);
  } catch(err) { return json({error:"Generation failed",detail:String(err?.message||err).slice(0,200)},500,cors); }
 }
};
