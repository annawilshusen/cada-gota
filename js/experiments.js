// CadaGota v8: totes les visualitzacions són didàctiques. No es connecten a dades d'Arduino.
(() => {
  'use strict';
  const one=(sel,root=document)=>root.querySelector(sel);
  const many=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  function activateButtons(buttons,active){buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===active)));}
  function bindChoice(buttons,callback){
    buttons.forEach(b=>{
      const go=()=>{activateButtons(buttons,b);callback(b)};
      b.addEventListener('click',go);
      b.addEventListener('mouseenter',()=>{if(matchMedia('(hover: hover) and (pointer: fine)').matches)go();});
      b.addEventListener('focus',()=>{if(matchMedia('(hover: hover) and (pointer: fine)').matches)go();});
    });
  }

  const water=one('[data-demo="water"]');
  if(water){const buttons=many('[data-water]',water),major=one('[data-major]',water),minor=one('[data-minor]',water),rest=one('[data-rest]',water),keys=one('[data-water-keys]',water),caption=one('[data-water-caption]',water),track=one('[data-water-track]',water);
    bindChoice(buttons,b=>{const fresh=b.dataset.water==='fresh';major.style.width=(fresh?68.7:97)+'%';minor.style.width=(fresh?30.1:3)+'%';rest.style.width=(fresh?1.2:0)+'%';
      major.style.background=fresh?'#407e8c':'#407e8c';minor.style.background=fresh?'#e3b43d':'#e3b43d';
      keys.innerHTML=fresh?'<span><i style="background:#407e8c"></i> Gel i glaceres: 68,7%</span><span><i style="background:#e3b43d"></i> Subterrània: 30,1%</span><span><i style="background:#93bcab"></i> Altres: 1,2%</span>':'<span><i style="background:#407e8c"></i> Aigua salada: 97%</span><span><i style="background:#e3b43d"></i> Aigua dolça: 3%</span>';
      const desc=fresh?'De l’aigua dolça, la major part es troba al gel o al subsòl; només una fracció molt petita correspon a altres dipòsits.':'Del conjunt d’aigua terrestre, aproximadament el 97% és salada i el 3% és dolça.';
      track.setAttribute('aria-label',desc);caption.textContent=desc;
    });}

  const river=one('.river-lab');
  if(river){const buttons=many('[data-river]',river),index=one('[data-river-index]',river),title=one('[data-river-title]',river),text=one('[data-river-text]',river);
    const data={fields:['01 / 04','Agricultura i nutrients','Els fertilitzants poden aportar nitrats i fosfats a les masses d’aigua i afavorir l’eutrofització.'],industry:['02 / 04','Abocaments industrials','Els processos industrials poden aportar substàncies químiques i, en determinats casos, aigua a una temperatura més elevada.'],town:['03 / 04','Fonts urbanes','Les aigües residuals poden contenir residus orgànics, patògens i detergents. El seu tractament és essencial.'],runoff:['04 / 04','Contaminació difusa','L’aigua de pluja pot arrossegar fertilitzants i pesticides fins als rius sense un únic punt d’abocament.']};
    bindChoice(buttons,b=>{const item=data[b.dataset.river];index.textContent=item[0];title.textContent=item[1];text.textContent=item[2];});}

  const irri=one('[data-demo="irrigation"]');
  if(irri){const buttons=many('[data-irrigation]',irri),scene=one('.irrigation-scene',irri),out=one('[data-irrigation-output]',irri);const data={manual:['Reg manual','Una persona aporta l’aigua directament. És flexible, però requereix observació i intervenció.'],superficie:['Reg per superfície','La gravetat distribueix l’aigua pel terreny; les condicions del sòl i el pendent afecten les pèrdues.'],aspersio:['Reg per aspersió','L’aigua es projecta en gotes i pot cobrir una superfície àmplia; el vent en pot alterar la distribució.'],degoteig:['Reg per degoteig','L’aigua s’aporta localment, a prop de les arrels; es redueixen les pèrdues per dispersió.']};
    bindChoice(buttons,b=>{const k=b.dataset.irrigation;scene.dataset.mode=k;const x=data[k];out.textContent=x[0]+'. '+x[1];scene.setAttribute('aria-label','Esquema amb '+x[0].toLowerCase());});}

  const edu=one('.education-lab');
  if(edu){const buttons=many('[data-education]',edu),out=one('[data-education-output]',edu);const data={school:'El projecte parteix d’un espai proper als estudiants: l’escola, on la gestió del reg i l’ús de l’aigua poden treballar-se també des de l’educació.',home:'La petjada hídrica recorda que una part del consum no és visible a l’aixeta, sinó que està associada als productes i serveis.',future:'Conèixer els recursos i entendre les decisions tècniques pot ajudar a adquirir hàbits de consum més responsables.'};bindChoice(buttons,b=>out.textContent=data[b.dataset.education]);}
})();
