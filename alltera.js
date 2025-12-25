(function(){
var BID="alltera-animated-bg",SID="alltera-bg-style",UID="alltera-ui-style",PI=[],RAF=0;
function addStyle(id,css){if(document.getElementById(id))return;var s=document.createElement("style");s.id=id;s.textContent=css;document.head.appendChild(s)}
function ensureBg(){if(document.getElementById(BID))return;var d=document.createElement("div");d.id=BID;d.setAttribute("aria-hidden","true");document.body.appendChild(d)}
function norm(s){return(s||"").replace(/\uFEFF/g,"").replace(/\u00A0/g," ").replace(/\s+/g," ").trim()}
function tileOf(e){return e&&e.closest?e.closest('[class*="ins-tile"]'):null}
function prepType(e){if(!e||e.dataset.atPrep==="1")return;var tx=norm(e.textContent);if(!tx)return;e.dataset.atText=tx;e.dataset.atPrep="1";e.textContent=""}
function mkCard(text,center){
  var d=document.createElement("div");
  d.className="at-card"+(center?" at-center":"");
  d.dataset.atText=norm(text);
  var sp=document.createElement("span");sp.className="at-t";d.appendChild(sp);
  return d
}
function isUI(el){return el&&(el.closest&&el.closest("a,button,input,textarea,select"))}
function allCandidates(root){
  return [].slice.call((root||document).querySelectorAll("h1,h2,h3,p,li,div,span,em,strong"))
}
function countBullets(t){var m=(t.match(/•/g)||[]);return m.length}
function splitInlineBullets(el){
  if(!el||el.dataset.atSplit==="1"||isUI(el))return null;
  var tx=norm(el.textContent); if(countBullets(tx)<2)return null;
  var parts=tx.split("•").map(function(x){return norm(x)}).filter(Boolean);
  if(parts.length<2)return null;
  var center=0; try{center=(getComputedStyle(el).textAlign==="center")?1:0}catch(e){}
  var wrap=document.createElement("div");wrap.className="at-wrap"+(center?" at-center":"");wrap.dataset.atSplit="1";
  for(var i=0;i<parts.length;i++)wrap.appendChild(mkCard(parts[i],center));
  el.parentNode&&el.parentNode.replaceChild(wrap,el);
  return wrap
}
function wrapLineBullet(el){
  if(!el||el.dataset.atLine==="1"||isUI(el))return null;
  var tx=norm(el.textContent); if(tx.indexOf("•")!==0)return null;
  var clean=norm(tx.replace(/^•\s*/,""));
  if(!clean)return null;
  var center=0; try{center=(getComputedStyle(el).textAlign==="center")?1:0}catch(e){}
  var c=mkCard(clean,center);
  c.dataset.atFrom="line";
  el.dataset.atLine="1";
  el.parentNode&&el.parentNode.replaceChild(c,el);
  return c
}
function convertBullets(tile){
  if(!tile)return;
  var els=allCandidates(tile);

  // 1) сначала режем “склеенные” буллеты (• внутри одного текста)
  for(var i=0;i<els.length;i++){
    var e=els[i];
    if(!e||e.classList&&e.classList.contains("at-card"))continue;
    var tx=e.textContent||"";
    if(countBullets(tx)>=2)splitInlineBullets(e);
  }

  // 2) потом каждую строку, начинающуюся с •, делаем отдельной карточкой
  els=allCandidates(tile);
  for(var j=0;j<els.length;j++){
    var e2=els[j];
    if(!e2||e2.classList&&e2.classList.contains("at-card"))continue;
    var t2=norm(e2.textContent);
    if(t2.indexOf("•")===0)wrapLineBullet(e2);
  }
}
function typeSeq(list,speed,delay,gap){
  var i=0;
  function next(){
    if(i>=list.length)return;
    var el=list[i++]; if(!el)return next();
    var tx=norm(el.dataset.atText||""); if(!tx)return next();
    el.classList.add("at-on","at-cur");
    var tgt=el.classList.contains("at-card")?el.querySelector(".at-t"):el;
    if(!tgt)return next();
    tgt.textContent="";
    var k=0;
    setTimeout(function tick(){
      if(k<tx.length){tgt.textContent+=tx.charAt(k++);setTimeout(tick,speed)}
      else{el.classList.remove("at-cur");setTimeout(next,gap)}
    },delay);
  }
  next();
}
function whenVisible(el,cb){
  if(!el||!cb)return;
  try{
    if("IntersectionObserver"in window){
      var io=new IntersectionObserver(function(es){
        for(var i=0;i<es.length;i++)if(es[i].isIntersecting){io.disconnect();cb();break}
      },{threshold:.18});
      io.observe(el);return;
    }
  }catch(e){}
  cb();
}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function addParallax(tile){
  if(!tile||tile.dataset.atPar==="1")return;
  tile.dataset.atPar="1";
  var img=tile.querySelector("img"); if(!img)return;
  img.classList.add("at-par"); PI.push(img);
  if(RAF)return;
  RAF=1;
  window.addEventListener("scroll",parTick,{passive:true});
  window.addEventListener("resize",parTick);
  parTick();
}
function parTick(){
  requestAnimationFrame(function(){
    var vh=window.innerHeight||800;
    for(var i=0;i<PI.length;i++){
      var im=PI[i]; if(!im||!im.getBoundingClientRect)continue;
      var r=im.getBoundingClientRect();
      var p=(r.top+r.height*.5-vh*.5)/vh;
      var y=clamp(p*14,-12,12);
      im.style.transform="translate3d(0,"+y+"px,0)";
    }
  });
}
function findHeadingByTextContains(arr){
  var hs=[].slice.call(document.querySelectorAll("h1,h2,h3"));
  for(var i=0;i<hs.length;i++){
    var t=norm(hs[i].textContent);
    for(var k=0;k<arr.length;k++) if(t.indexOf(arr[k])!==-1) return hs[i];
  }
  return null;
}
function buildAndRunForTile(tile,head,desc,speed){
  if(!tile||!head)return;
  convertBullets(tile);
  var cards=[].slice.call(tile.querySelectorAll(".at-card"));
  prepType(head);
  if(desc&&tileOf(desc)===tile)prepType(desc);
  for(var i=0;i<cards.length;i++){ if(cards[i]&&cards[i].dataset.atPrep!=="1"){ cards[i].dataset.atPrep="1"; } }
  var seq=[head];
  if(desc&&tileOf(desc)===tile)seq.push(desc);
  for(var j=0;j<cards.length;j++)seq.push(cards[j]);
  whenVisible(tile,function(){typeSeq(seq,speed,220,220)});
}
function scan(){
  // Почему мы?
  var why=findHeadingByTextContains(["Почему мы?"]);
  if(why){
    var t=tileOf(why);
    var d=null;
    var ps=[].slice.call(t.querySelectorAll("p,div,span"));
    for(var i=0;i<ps.length;i++){
      var tx=norm(ps[i].textContent);
      if(tx.indexOf("Мы выбираем устройства")===0){d=ps[i];break}
    }
    addParallax(t);
    buildAndRunForTile(t,why,d,70);
  }

  // Стайлеры/Фены (на всякий случай ловим оба варианта)
  var hair=findHeadingByTextContains(["Стайлеры","Фены","Фен"]);
  if(hair){
    var th=tileOf(hair);
    addParallax(th);
    buildAndRunForTile(th,hair,null,52);
  }

  // Массажные пистолеты
  var gun=findHeadingByTextContains(["Массажные пистолеты","пистолеты"]);
  if(gun){
    var tg=tileOf(gun);
    addParallax(tg);
    buildAndRunForTile(tg,gun,null,52);
  }
}
function start(){
  addStyle(SID,
    "html,body{background:#bdbdbd!important}#"+BID+
    "{position:fixed;inset:0;z-index:2147483646;pointer-events:none;"+
    "background:radial-gradient(900px 700px at 15% 20%,rgba(0,255,255,.95),transparent 60%),"+
    "radial-gradient(900px 700px at 85% 25%,rgba(255,0,255,.9),transparent 60%),"+
    "radial-gradient(900px 700px at 65% 80%,rgba(255,200,0,.85),transparent 60%),"+
    "linear-gradient(120deg,rgba(30,30,30,1),rgba(240,240,240,1),rgba(80,80,80,1),rgba(230,230,230,1));"+
    "background-size:260% 260%,260% 260%,260% 260%,500% 500%;"+
    "animation:allteraShift 8s ease-in-out infinite;filter:saturate(0) contrast(2.3) brightness(1.05);opacity:1;mix-blend-mode:soft-light}"+
    "@keyframes allteraShift{0%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}50%{background-position:100% 50%,0% 50%,50% 100%,100% 50%}100%{background-position:0% 50%,100% 50%,50% 0%,0% 50%}}"+
    "@media (max-width:768px){#"+BID+"{background-size:220% 220%,220% 220%,220% 220%,420% 420%;animation-duration:10s;filter:saturate(0) contrast(1.7) brightness(1.05)}}"
  );
  addStyle(UID,
    ".at-wrap{margin:0;padding:0}.at-center{text-align:center}"+
    ".at-card{position:relative;border-radius:999px;padding:14px 18px 14px 42px;margin:12px 0;max-width:760px;"+
    "background:linear-gradient(120deg,#efefef,#cfcfcf,#f6f6f6,#bdbdbd);background-size:320% 320%;animation:atshine 7s ease-in-out infinite;"+
    "box-shadow:0 12px 28px rgba(0,0,0,.12);color:#111;opacity:0;transform:translateY(12px);"+
    "transition:opacity .55s ease,transform .55s ease;will-change:transform,opacity}"+
    ".at-center.at-card,.at-center .at-card{margin:12px auto}"+
    ".at-card:before{content:'•';position:absolute;left:18px;top:12px;font-size:22px;line-height:1;opacity:.75}"+
    ".at-card.at-on{opacity:1;transform:none}"+
    ".at-cur:after{content:'|';display:inline-block;margin-left:2px;opacity:.85;animation:atblink 1s steps(2,end) infinite}"+
    ".at-par{will-change:transform;transform:translate3d(0,0,0)}"+
    "@keyframes atblink{0%,49%{opacity:1}50%,100%{opacity:0}}"+
    "@keyframes atshine{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}"
  );
  ensureBg();
  scan();
  if("MutationObserver"in window){
    var t=0;
    new MutationObserver(function(){clearTimeout(t);t=setTimeout(scan,200)})
      .observe(document.body,{childList:true,subtree:true});
  }
  setInterval(scan,1200);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
