(function(){
  'use strict';
  const mounts=new WeakMap();
  function mount(root, config, {demo=false}={}){
  mounts.get(root)?.abort();
  const controller=new AbortController();
  mounts.set(root,controller);
  const listener={signal:controller.signal};
  const cfg={questions:Array.isArray(config?.questions)?config.questions:[]};
  const answers=Object.assign(Object.create(null),{attendance:'yes'});
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function visible(q){if(!q.showIf||!q.showIf.field)return true; const a=answers[q.showIf.field];return Array.isArray(a)?a.includes(q.showIf.equals):a===q.showIf.equals;}
  function clearHidden(){for(let k=0;k<cfg.questions.length+1;k++){let changed=false;for(const q of cfg.questions){if(!visible(q)&&Object.prototype.hasOwnProperty.call(answers,q.id)){delete answers[q.id];changed=true;}}if(!changed)break;}}
  function choice(v,label,group,type,checked){return `<label class="choice"><input type="${type}" name="${esc(group)}" value="${esc(v)}" ${checked?'checked':''}><span>${esc(label)}</span></label>`}
  function question(q){const isMulti=q.type==='multiple',isText=q.type==='text',a=answers[q.id];return `<div class="field" data-q="${esc(q.id)}"><div class="field-title">${esc(q.title)} ${q.required?'<span aria-label="обязательный вопрос">*</span>':''}</div>`+(isText?`<textarea data-id="${esc(q.id)}" rows="3" maxlength="500" placeholder="Ваш ответ">${esc(a||'')}</textarea>`:`<div class="choices">${(q.options||[]).map(o=>choice(o,o,q.id,isMulti?'checkbox':'radio',isMulti?(Array.isArray(a)&&a.includes(o)):a===o)).join('')}</div>`)+`</div>`}
  function render(){const focus=root.contains(document.activeElement)?document.activeElement:null;clearHidden();root.innerHTML=`<form id="advancedRsvp" novalidate><div class="field"><label class="field-title" for="rsvp-name">Ваше имя и фамилия *</label><input id="rsvp-name" name="guestName" type="text" maxlength="100" autocomplete="name" required placeholder="Например, Анна Иванова" value="${esc(answers.guestName||'')}"></div><div class="field"><div class="field-title">Вы придёте на свадьбу? *</div><div class="choices">${choice('yes','С радостью приду','attendance','radio',answers.attendance==='yes')}${choice('no','К сожалению, не смогу','attendance','radio',answers.attendance==='no')}</div></div>${cfg.questions.filter(visible).map(question).join('')}<button type="submit" class="link-btn action">${demo?'Проверить ответы':'Подтвердить ответ ↗'}</button><div id="rsvpError" class="subnote" role="alert" aria-live="polite"></div></form>`;
    if(focus?.name){
      const replacement=Array.from(root.querySelectorAll('input')).find(input=>input.name===focus.name&&input.value===focus.value);
      replacement?.focus({preventScroll:true});
    }
  }
  root.addEventListener('input',e=>{const t=e.target;if(t.name==='guestName')answers.guestName=t.value;else if(t.tagName==='TEXTAREA'&&t.dataset.id)answers[t.dataset.id]=t.value;},listener);
  root.addEventListener('change',e=>{const t=e.target;if(t.name==='attendance'){answers.attendance=t.value;render();return;}const field=t.dataset.id||t.name;const q=cfg.questions.find(q=>q.id===field);if(!q)return;if(q.type==='multiple'){const selected=Array.isArray(answers[q.id])?[...answers[q.id]]:[];if(t.checked&&!selected.includes(t.value))selected.push(t.value);if(!t.checked&&selected.includes(t.value))selected.splice(selected.indexOf(t.value),1);answers[q.id]=selected;}else{answers[q.id]=t.value;} if(cfg.questions.some(q=>q.showIf?.field===field))render();},listener);
  root.addEventListener('submit',e=>{e.preventDefault();const name=String(answers.guestName||'').trim();const msg=root.querySelector('#rsvpError');if(!name){msg.textContent='Укажите имя и фамилию.';root.querySelector('#rsvp-name').focus();return;}for(const q of cfg.questions.filter(visible)){const a=answers[q.id];if(q.required&&(!a||(Array.isArray(a)&&a.length===0)||(!Array.isArray(a)&&!String(a).trim()))){msg.textContent='Ответьте на обязательный вопрос: '+q.title;return;}}root.innerHTML='<div class="demo-result" role="status"><h3>'+ (demo?'Анкета заполнена':'Спасибо за ответ!') +'</h3><p class="subnote">Это демонстрация. Ответы никуда не отправлены.</p><button class="link-btn outline" type="button" id="returnRsvp">Изменить ответы</button></div>';root.querySelector('#returnRsvp').focus({preventScroll:true});},listener);
  root.addEventListener('click',e=>{if(e.target.id==='returnRsvp'){render();root.querySelector('#rsvp-name').focus({preventScroll:true});}},listener);render();
  }
  window.ETERNA_MOUNT_RSVP=mount;
  const root=document.querySelector('#rsvpDynamic');
  if(root&&!root.hasAttribute('data-manual'))mount(root,window.WEDDING_RSVP_CONFIG);
})();
