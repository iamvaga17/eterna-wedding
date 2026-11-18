(function(){
  'use strict';
  const mounts=new WeakMap();
  function endpointUrl(value){
    try {
      const url=new URL(value);
      return url.protocol==='https:'&&!url.username&&!url.password&&!url.hash ? url.href : '';
    } catch { return ''; }
  }
  window.ETERNA_RSVP_ENDPOINT=endpointUrl;

  function mount(root, config, {demo=false,endpoint=''}={}){
  mounts.get(root)?.abort();
  const controller=new AbortController();
  mounts.set(root,controller);
  const listener={signal:controller.signal};
  let pending=false;
  let attempt;
  const cfg={questions:Array.isArray(config?.questions)?config.questions:[]};
  const attendancePrompt=config?.attendancePrompt||'Вы придёте на свадьбу?';
  const attendanceLabels={yes:'С радостью приду',no:'К сожалению, не смогу',...config?.attendanceLabels};
  const answers=Object.assign(Object.create(null),{attendance:'yes'});
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function visible(q){if(!q.showIf||!q.showIf.field)return true; const a=answers[q.showIf.field];return Array.isArray(a)?a.includes(q.showIf.equals):a===q.showIf.equals;}
  function clearHidden(){for(let k=0;k<cfg.questions.length+1;k++){let changed=false;for(const q of cfg.questions){if(!visible(q)&&Object.prototype.hasOwnProperty.call(answers,q.id)){delete answers[q.id];changed=true;}}if(!changed)break;}}
  function choice(v,label,group,type,checked){return `<label class="choice"><input type="${type}" name="${esc(group)}" value="${esc(v)}" ${checked?'checked':''}><span>${esc(label)}</span></label>`}
  function question(q){const isMulti=q.type==='multiple',isText=q.type==='text',a=answers[q.id];return `<div class="field" data-q="${esc(q.id)}"><div class="field-title">${esc(q.title)} ${q.required?'<span aria-label="обязательный вопрос">*</span>':''}</div>`+(isText?`<textarea data-id="${esc(q.id)}" rows="3" maxlength="500" placeholder="Ваш ответ">${esc(a||'')}</textarea>`:`<div class="choices">${(q.options||[]).map(o=>choice(o,o,q.id,isMulti?'checkbox':'radio',isMulti?(Array.isArray(a)&&a.includes(o)):a===o)).join('')}</div>`)+`</div>`}
  function render(){const focus=root.contains(document.activeElement)?document.activeElement:null;clearHidden();root.innerHTML=`<form id="advancedRsvp" novalidate><div class="field"><label class="field-title" for="rsvp-name">Ваше имя и фамилия *</label><input id="rsvp-name" name="guestName" type="text" maxlength="100" autocomplete="name" required placeholder="Например, Анна Иванова" value="${esc(answers.guestName||'')}"></div><div class="field"><div class="field-title">${esc(attendancePrompt)} *</div><div class="choices">${choice('yes',attendanceLabels.yes,'attendance','radio',answers.attendance==='yes')}${choice('no',attendanceLabels.no,'attendance','radio',answers.attendance==='no')}</div></div>${cfg.questions.filter(visible).map(question).join('')}<button type="submit" class="link-btn action">${endpoint?'Отправить ответ':demo?'Проверить ответы':'Подтвердить ответ ↗'}</button><div id="rsvpError" class="subnote" role="alert" aria-live="polite"></div></form>`;
    if(focus?.name){
      const replacement=Array.from(root.querySelectorAll('input')).find(input=>input.name===focus.name&&input.value===focus.value);
      replacement?.focus({preventScroll:true});
    }
  }
  root.addEventListener('input',e=>{const t=e.target;if(t.name==='guestName')answers.guestName=t.value;else if(t.tagName==='TEXTAREA'&&t.dataset.id)answers[t.dataset.id]=t.value;},listener);
  root.addEventListener('change',e=>{const t=e.target;if(t.name==='attendance'){answers.attendance=t.value;render();return;}const field=t.dataset.id||t.name;const q=cfg.questions.find(q=>q.id===field);if(!q)return;if(q.type==='multiple'){const selected=Array.isArray(answers[q.id])?[...answers[q.id]]:[];if(t.checked&&!selected.includes(t.value))selected.push(t.value);if(!t.checked&&selected.includes(t.value))selected.splice(selected.indexOf(t.value),1);answers[q.id]=selected;}else{answers[q.id]=t.value;} if(cfg.questions.some(q=>q.showIf?.field===field))render();},listener);
  function showResult(){
    const message=endpoint?'Ваш ответ сохранён.':'Это демонстрация. Ответы никуда не отправлены.';
    const heading=demo?'Анкета заполнена':'Спасибо за ответ!';
    const action=endpoint?'':'<button class="link-btn outline" type="button" id="returnRsvp">Изменить ответы</button>';
    root.innerHTML='<div class="demo-result" role="status" tabindex="-1"><h3>'+heading+'</h3><p class="subnote">'+message+'</p>'+action+'</div>';
    (root.querySelector('#returnRsvp')||root.querySelector('.demo-result')).focus({preventScroll:true});
  }

  root.addEventListener('submit',async event=>{
    event.preventDefault();
    if(pending)return;
    const form=event.target;
    const name=root.querySelector('#rsvp-name').value.trim();
    const msg=root.querySelector('#rsvpError');
    if(!name){msg.textContent='Укажите имя и фамилию.';root.querySelector('#rsvp-name').focus();return;}
    const details=[];
    clearHidden();
    for(const question of cfg.questions.filter(visible)){
      const answer=answers[question.id];
      const cleaned=Array.isArray(answer)?answer.map(value=>String(value).trim()).filter(Boolean):String(answer??'').trim();
      if(question.required&&!cleaned.length){msg.textContent='Ответьте на обязательный вопрос: '+question.title;return;}
      if(cleaned.length)details.push({id:question.id,title:question.title,value:cleaned});
    }
    if(!endpoint){showResult();return;}
    const data={name,attendance:answers.attendance,details};
    const fingerprint=JSON.stringify(data);
    if(attempt?.fingerprint!==fingerprint)attempt={fingerprint,id:crypto.randomUUID()};
    pending=true;
    const enabled=[...form.querySelectorAll('input, textarea, button')].filter(control=>!control.disabled);
    enabled.forEach(control=>{control.disabled=true;});
    msg.textContent='Отправляем ответ…';
    const request=new AbortController();
    const abort=()=>request.abort();
    controller.signal.addEventListener('abort',abort,{once:true});
    const timeout=setTimeout(abort,15000);
    try{
      const response=await fetch(endpoint,{
        method:'POST',credentials:'omit',cache:'no-store',
        headers:{'Content-Type':'text/plain;charset=UTF-8'},
        body:JSON.stringify({...data,id:attempt.id}),signal:request.signal
      });
      const result=response.ok?await response.json():null;
      if(result?.ok!==true||result.id!==attempt.id)throw Error('Сохранение не подтверждено');
      if(!controller.signal.aborted)showResult();
    }catch{
      if(!controller.signal.aborted)msg.textContent='Не удалось подтвердить сохранение. Проверьте соединение и попробуйте снова.';
    }finally{
      clearTimeout(timeout);
      controller.signal.removeEventListener('abort',abort);
      pending=false;
      enabled.forEach(control=>{control.disabled=false;});
    }
  },listener);
  root.addEventListener('click',e=>{if(e.target.id==='returnRsvp'){render();root.querySelector('#rsvp-name').focus({preventScroll:true});}},listener);render();
  }
  window.ETERNA_MOUNT_RSVP=mount;
  const root=document.querySelector('#rsvpDynamic');
  if(root&&!root.hasAttribute('data-manual'))mount(root,window.WEDDING_RSVP_CONFIG);
})();
