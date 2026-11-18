/**
 * ÉTERNA ATELIER / Workers AI — safe single-scene endpoint.
 * Required: Workers AI binding named AI
 * Secrets: EDITOR_ACCESS_TOKEN (long random string)
 * Variables (optional): ALLOWED_ORIGIN = https://iamvaga17.github.io
 * NO OpenAI API key, NO paid API endpoint.
 * Model: @cf/black-forest-labs/flux-2-klein-4b
 * IMPORTANT: The editor resizes input photos to at most 480x480.
 */
const MODEL = "@cf/black-forest-labs/flux-2-klein-4b";
const SCENES = Object.freeze({
 sceneCover: "High-end cinematic Russian TV newsroom wedding press conference: both newlyweds seated side by side at a desk with broadcast microphones. Serious dramatic expressions with subtle playful atmosphere. No text or logos. Photorealistic square photograph.",
 sceneCake: "Funny cinematic wedding-cake investigation: groom playfully protects an enormous beautiful wedding cake from curious journalists with microphones, bride laughing naturally beside him, both visible, realistic candid TV news photo. No text or logos. Square photograph.",
 sceneArchive: "Warm vintage analog film photograph of bride and groom meeting for the first time, close together, grainy 1990s editorial snapshot, intimate natural smiles. Adapt meeting location to supplied context. No text or logos. Square photograph.",
 sceneForecast: "Bride and groom together presenting a playful wedding-day forecast in a retro television weather studio, large blue weather map without any words, cinematic lighting, sophisticated editorial photography, square."
});
function json(value,status=200,headers={}){
 return new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json;charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff",...headers}});
}
export default {
 async fetch(request,env){
  const origin=request.headers.get("Origin")||"";
  const allowed=env.ALLOWED_ORIGIN||"https://iamvaga17.github.io";
  const cors=origin===allowed?{"access-control-allow-origin":origin,"access-control-allow-methods":"OPTIONS, POST","access-control-allow-headers":"Authorization, Content-Type","vary":"Origin"}:{};
  if(request.method==="OPTIONS")return new Response(null,{status:origin===allowed?204:403,headers:cors});
  // Health endpoint is private-data free and never invokes the model.
  if(request.method==="GET" && new URL(request.url).pathname==="/health")
   return json({ok:true,service:"eterna-cloudflare-ai",aiBinding:!!env.AI,authConfigured:!!env.EDITOR_ACCESS_TOKEN,model:MODEL});
  if(origin!==allowed)return json({error:"Origin not allowed"},403);
  if(request.method!=="POST")return json({error:"POST required"},405,cors);
  if(!env.AI)return json({error:"Workers AI binding AI is not configured"},503,cors);
  if(!env.EDITOR_ACCESS_TOKEN)return json({error:"Set EDITOR_ACCESS_TOKEN in Worker Secrets before generation"},503,cors);
  if(request.headers.get("Authorization")!=="Bearer "+env.EDITOR_ACCESS_TOKEN)
    return json({error:"Unauthorized"},401,cors);
  if(Number(request.headers.get("content-length")||0)>4_000_000)
    return json({error:"Input too large"},413,cors);
  try{
    const input=await request.formData();
    const scene=String(input.get("scene")||"");
    if(!Object.hasOwn(SCENES,scene))return json({error:"Unknown scene"},400,cors);
    const bride=input.get("bride"),groom=input.get("groom"),brideFace=input.get("brideFace"),groomFace=input.get("groomFace");
    if(!(bride instanceof File)||!(groom instanceof File))return json({error:"Two reference photos required"},400,cors);
    for(const f of [bride,groom,brideFace,groomFace].filter(Boolean)){
      if(!["image/jpeg","image/png","image/webp"].includes(f.type)||f.size>1_500_000||f.size<100)
        return json({error:"Reference photo must be JPEG/PNG/WebP under 1.5 MB"},400,cors);
    }
    const form=new FormData();
    form.append("input_image_0",brideFace instanceof File?brideFace:bride,"bride-face.jpg");
    form.append("input_image_1",groomFace instanceof File?groomFace:groom,"groom-face.jpg");
    form.append("input_image_2",bride,"bride-body.jpg");
    form.append("input_image_3",groom,"groom-body.jpg");
    form.append("width","1024");
    form.append("height","1024");
    form.append("prompt",[
      "IDENTITY LOCK: image 0 is a close-up of the BRIDE real face; image 1 is a close-up of the GROOM real face. Image 2 shows bride overall physique, image 3 shows groom overall physique.",
      "Create a NEW realistic photo of precisely these TWO PEOPLE. Woman has the facial structure, eye shape, nose, eyebrows, lips, hair, and age of image 0; man has the bald head, beard, facial structure, eye shape, nose, and age of image 1. Physiques match images 2 and 3. Exact recognizable identity takes priority over cinematic styling. Do not substitute generic models, morph faces, idealize, or change age. Only two people.",
      SCENES[scene],
      "Names: "+String(input.get("names")||"").slice(0,120),
      "Context: "+String(input.get("context")||"").slice(0,450)
    ].join("\n"));
    const serialized=new Response(form);
    const result=await env.AI.run(MODEL,{multipart:{body:serialized.body,contentType:serialized.headers.get("content-type")}});
    const encoded=result?.image;
    if(typeof encoded!=="string"||encoded.length<100)return json({error:"Model returned no image"},502,cors);
    return json({image:"data:image/png;base64,"+encoded,scene,model:MODEL},200,cors);
  }catch(e){
    // Don't return untrusted internal error metadata and uploaded files.
    const message=String(e?.message||"");
    if(/quota|limit|neuron|credit|billing|payment|plan/i.test(message))
      return json({error:"Cloudflare Workers AI limit or model access reached. Check Workers AI usage."},429,cors);
    return json({error:"Image generation failed. Check Worker logs and Workers AI access."},502,cors);
  }
 }
};