(function(){
  var BID="alltera-animated-bg",SID="alltera-bg-style",TSID="alltera-type-style",BSID="alltera-block-style";
  function addStyle(id,css){if(document.getElementById(id))return;var s=document.createElement("style");s.id=id;s.textContent=css;document.head.appendChild(s)}
  function ensureBg(){if(document.getElementById(BID))return;var d=document.createElement("div");d.id=BID;d.setAttribute("aria-hidden","true");document.body.appendChild(d)}
  function norm(s){return(s||"").replace(/\uFEFF/g,"").replace(/\u00A0/g," ").replace(/\s+/g," ").trim()}
  function root(){return document.getElementById("ec-instantsite")||document.querySelector(".ins-tiles")}
  function css(){
    addStyle(SID,
      "html,body{background:#bdbdbd!important}"+
      "#"+BID+"{position:fixed;inset:0;z-index:2147483646;pointer-events:none;opacity:1;mix-blend-mode:soft-light;"+
      "background:radial-gradient(900px 700px at 15% 20%,rgba(0,255,255,.95),transparent 60%),"+
      "radial-gradient(900px 700px at 85% 25%,rgba(255,0,255,.9),transparent 60%),"+
      "radial-gradient(900px 700px at 65% 80%,rgba(255,200,0,.85),transparent 60%),"+
      "linear-gradient(120deg,rgba(30,30,30,1),rgba(240,240,240,1),rgba(80,80,80,1),rgba(230,230,230,1));"+
      "background-size:260% 260%,260% 260%,260% 260%,500% 500%;animation:allteraShift 8s ease-in-out infinite;"+
      "filter:saturate(0) contrast(2.3) brightness(1.05);transform:translate3d(0,var(--atbg,0px),0) scale(1.02)}"+
      "@keyframes allteraShift{0%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}50%{background-position:100% 50%,0% 50%,50% 100%,100% 50%}100%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}}"+
      "@media (max-width:768px){#"+BID+"{background-size:220% 220%,220% 220%,220% 220%,420% 420%;animation-duration:10s;filter:saturate(0) contrast(1.7) brightness(1.05)}}"
    );
    addStyle(TSID,
      ".atw{display:inline-block;white-space:pre-wrap}"+
      ".atc:after{content:\"|\";display:inline-block;margin-left:2px;opacity:.9;animation:atb 1s steps(2,end) infinite}"+
      "@keyframes atb{0%,49%{opacity:1}50%,100%{opacity:0}}"
    );
    addStyle(BSID,
      ".at-b{box-sizing:border-box;display:inline-block;max-width:720px;width:auto;"+
      "padding:14px 18px 14px 44px;margin:12px 0;border-radius:22px;position:relative;"+
      "background:linear-gradient(135deg,rgba(245,245,245,.92),rgba(225,225,225,.92),rgba(250,250,250,.92));"+
      "box-shadow:0 14px 34px rgba(0,0,0,.14);color:#111;text-align:left}"+
      ".at-b:before{content:\"•\";position:absolute;left:18px;top:12px;font-size:22px;line-height:1;opacity:.65}"+
      ".at-off{opacity:0;transform:translateY(12px);transition:opacity .6s ease,transform .6s ease}"+
      ".at-on{opacity:1;transform:none}"+
      ".at-b .atw{min-height:1em}"+
      "@media (max-width:768px){.at-b{max-width:92vw;padding:13px 16px 13px 42px;border-radius:20px}}"
    );
  }

  var q=[],ready=new Set(),typing=0,io=null,moTimer=null,parallaxRaf=0;
  function observe(el){
    if(!io){
      io=new IntersectionObserver(function(es){
        es.forEach(function(e){
          if(e.isIntersecting){
            ready.add(e.target);
            if(e.target.classList.contains("at-off")){e.target.classList.remove("at-off");e.target.classList.add("at-on")}
            kick();
          }
        });
      },{threshold:0.12});
    }
    io.observe(el);
  }

  function makeTypable(el,txt,speed){
    if(!el||el.dataset.atTyped==="1")return;
    el.dataset.atTyped="1";
    el.dataset.atText=txt;
    el.dataset.atSpeed=String(speed||55);
    el.classList.add("atc");
    el.textContent="";
    var sp=document.createElement("span");
    sp.className="atw";
    el.appendChild(sp);
  }

  function enqueue(el){
    if(!el||el.dataset.atQueued==="1")return;
    el.dataset.atQueued="1";
    q.push(el);
    observe(el);
  }

  function typeRun(el){
    var txt=el.dataset.atText||"";
    var speed=parseInt(el.dataset.atSpeed||"55",10)||55;
    var sp=el.querySelector(".atw")||el;
    var i=0;
    (function tick(){
      if(i<txt.length){
        sp.textContent+=txt.charAt(i++);
        setTimeout(tick,speed);
      }else{
        el.classList.remove("atc");
        typing=0;
        setTimeout(kick,120);
      }
    })();
  }

  function kick(){
    if(typing)return;
    for(var i=0;i<q.length;i++){
      var el=q[i];
      if(!el||!document.contains(el)){q.splice(i,1);i--;continue}
      if(ready.has(el)){
        q.splice(i,1);
        typing=1;
        typeRun(el);
        return;
      }
    }
  }

  function isBulletishText(t){
    if(!t)return false;
    if(t.indexOf("•")!==-1)return true;
    var starters=[
      "Быстрая сушка","Нагрев до 100","3 температурных режима",
      "Снимает напряжение","Скорость 1800","8 насадок",
      "Под любую задачу","Точная настройка","Удобно в руке","Бережно и быстро"
    ];
    for(var i=0;i<starters.length;i++) if(t.indexOf(starters[i])===0) return true;
    return false;
  }

  function decorateBulletEl(el,txt){
    if(!el||el.dataset.atBullet==="1")return;
    el.dataset.atBullet="1";
    el.classList.add("at-b","at-off");
    if(typeof txt==="string"){el.textContent=txt}
    var clean=norm(el.textContent).replace(/^[•\u2022]\s*/,"");
    makeTypable(el,clean,45);
    enqueue(el);
  }

function splitBullets(el){
  if(!el||el.dataset.atSplit==="1")return false;
  var raw=(el.innerText||el.textContent||"");
  if(raw.indexOf("•")===-1 && raw.indexOf("\u2022")===-1)return false;

  var parts=raw.split(/[•\u2022]+/).map(function(x){return norm(x)}).filter(Boolean);
  if(parts.length<2)return false;

  var p=el.parentNode, ref=el;
  for(var i=0;i<parts.length;i++){
    var n=document.createElement(el.tagName==="LI"?"li":"p");
    n.textContent=parts[i];
    p.insertBefore(n,ref);
    decorateBulletEl(n,parts[i]); // делает 1 пункт = 1 блок + печать
  }
  p.removeChild(ref);
  el.dataset.atSplit="1";
  return true;
}
    p.removeChild(ref);
    el.dataset.atSplit="1";
    return true;
  }

  function process(){
    var r=root();
    if(!r)return;

    var whyTitle=null, whyText=null;
    var hs=[].slice.call(r.querySelectorAll("h1,h2,h3"));
    for(var i=0;i<hs.length;i++){
      var t=norm(hs[i].textContent);
      if(t.indexOf("Почему мы")!==-1){whyTitle=hs[i];break}
    }
    if(whyTitle && whyTitle.dataset.atTyped!=="1"){
      makeTypable(whyTitle,norm(whyTitle.textContent),70);
      enqueue(whyTitle);
    }
    var ps=[].slice.call(r.querySelectorAll("p"));
    for(var j=0;j<ps.length;j++){
      var pt=norm(ps[j].textContent);
      if(pt.indexOf("Мы выбираем устройства")!==-1){whyText=ps[j];break}
    }
    if(whyText && whyText.dataset.atTyped!=="1"){
      makeTypable(whyText,norm(whyText.textContent),40);
      enqueue(whyText);
    }

    var items=[].slice.call(r.querySelectorAll("p,li,[class*='ins-tile__body'],[class*='ins-tile__text']"));
    for(var k=0;k<items.length;k++){
      var el=items[k];
      if(!el||el.dataset.atBullet==="1")continue;
      var t2=(el.textContent||"").trim();
      if(!t2)continue;

      if(splitBullets(el))continue;

      var n2=norm(t2);
      if(isBulletishText(n2)){
        decorateBulletEl(el,n2.replace(/^[•\u2022]\s*/,""));
      }
    }
  }

  function parallax(){
    if(parallaxRaf) return;
    parallaxRaf=requestAnimationFrame(function(){
      parallaxRaf=0;
      var b=document.getElementById(BID);
      if(!b)return;
      var y=Math.max(-18,Math.min(18,(window.scrollY||0)*0.02));
      b.style.setProperty("--atbg",y+"px");
    });
  }

  function run(){
    css(); ensureBg();
    process();
    window.addEventListener("scroll",parallax,{passive:true});
    parallax();

    if("MutationObserver" in window){
      var r=root()||document.body;
      new MutationObserver(function(){
        clearTimeout(moTimer);
        moTimer=setTimeout(function(){process();kick()},150);
      }).observe(r,{childList:true,subtree:true});
    }

    setInterval(function(){process();kick()},1200);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",run);
  else run();
})();
