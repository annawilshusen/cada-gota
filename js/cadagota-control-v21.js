/* Complement del control privat; no substitueix l'autenticació ni RLS. */
(()=>{'use strict';
const form=document.getElementById('cada-settings-form');if(!form)return;
const zone=document.getElementById('cada-zone');
if(zone){for(let i=3;i<=6;i++){if(!zone.querySelector(`option[value="${i}"]`)){const o=document.createElement('option');o.value=String(i);o.textContent=`Planta ${String(i).padStart(2,'0')}`;zone.append(o)}}}
for(const selector of ['.cada-settings-simulator','.cada-consumption']){const e=document.querySelector(selector);if(e)e.hidden=true;}
const top=document.querySelector('#auth-private > .muted');if(top)top.textContent='La configuració es desa a Supabase. L’Arduino descarrega els llindars de cada jardinera quan disposa de connexió.';
const hint=document.querySelector('#auth-private .callout');if(hint)hint.textContent='Control informatiu: aquesta pàgina no ordena activacions immediates del relé. Els paràmetres desats són consultats pel firmware, que aplica les seves proteccions.';
const description=document.querySelector('.cada-settings-form > .muted');if(description)description.textContent='Els llindars s’interpreten segons la calibració del sensor. Cal calibrar el sensor de cada jardinera abans d’activar-ne el reg automàtic.';
const section=document.querySelector('.cada-settings-history > .muted');if(section)section.textContent='Canvis de configuració de la jardinera seleccionada. Les simulacions antigues es conserven a Supabase, però no es mostren al panell.';
const activity=document.getElementById('cada-activity');if(activity){const observer=new MutationObserver(()=>{for(const e of activity.querySelectorAll('*')){if(e.children.length===0 && /sol·licitud de prova|reg simulat|simulada/i.test(e.textContent||'')){const parent=e.closest('article,li,.cada-activity-item');if(parent)parent.hidden=true;}}});observer.observe(activity,{childList:true,subtree:true})}
})();
