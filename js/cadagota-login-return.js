/* CadaGota v24: retorna a la pàgina anterior només si el login ve d'un enllaç de perfil. */
(() => {
  'use strict';
  if(!location.pathname.endsWith('/pages/control.html'))return;
  const candidate=new URLSearchParams(location.search).get('next');
  if(!candidate)return;
  const base=document.querySelector('.identity')?.href;
  if(!base)return;
  let destination;
  try{
    destination=new URL(candidate,location.origin);
    const root=new URL(base);
    // No redirigir a altres dominis ni fora del projecte GitHub Pages.
    if(destination.origin!==location.origin||!destination.pathname.startsWith(root.pathname))return;
    if(destination.pathname===location.pathname)return;
  }catch{return;}
  const area=document.getElementById('auth-private');
  if(!area)return;
  let moved=false;
  function check(){if(moved||area.hidden)return;moved=true;location.replace(destination.href);}
  const observer=new MutationObserver(check);
  observer.observe(area,{attributes:true,attributeFilter:['hidden']});
  check();
})();
