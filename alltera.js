(function(){
var SID="alltera-ui-style";
function addStyle(id,css){if(document.getElementById(id))return;var s=document.createElement("style");s.id=id;s.textContent=css;document.head.appendChild(s)}
function norm(s){return(s||"").replace(/\uFEFF/g,"").replace(/\u00A0/g," ").replace(/\s+/g," ").trim()}
function isUI(el){return el&&(el.closest&&el.closest("a,button,input,textarea,select,script,style"))}
function tileOf(e){return e&&e.closest?e.closest('[class*="ins-tile"]'):null}
function mkCard(text,center){
  var d=document.createElement("div");
  d.className="at-card"+(center?" at-center":"");
  d.dataset.atText=norm(text);
  var sp=document.createElement("span");sp.className="at-t";d.appendChild(sp);
  return d
}
function prepType(e){if(!e||e.dataset.atPrep==="1")return;var tx=norm(e.textContent);if(!tx)return;e.dataset.atText=tx;e.dataset.atPrep="1";e.textContent=""}
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
function convertTextNodes(tile){
  if(!tile)return;
  var tw=document.createTreeWalker(tile,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
    if(!n||!n.nodeValue)return NodeFilter.FILTER_REJECT;
    if(n.nodeValue.indexOf("•")===-1)return NodeFilter.FILTER_REJECT;
    var p=n.parentElement; if(!p||isUI(p))return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }});
  var arr=[],n; while((n=tw.nextNode()))arr.push(tw.currentNode);
  for(var i=0;i<arr.length;i++){
    var tn=arr[i],p=tn.parentElement; if(!p)continue;
    var raw=norm(tn.nodeValue);
    if(raw.indexOf("•")===-1)continue;
    var parts=raw.split("•").map(norm).filter(Boolean);
    if(!parts.length)continue;
    var center=0; try{center=(getComputedStyle(p).textAlign==="center")?1:0}catch(e){}
    var wrap=document.createElement("div");
    wrap.className="at-wrap"+(center?" at-center":"");
    for(var k=0;k<parts.length;k++)wrap.appendChild(mkCard(parts[k],center));
    p.insertBefore(wrap,tn);
    p.removeChild(tn);
  }
}
function convertTaggedBullets(tile){
  if(!tile)return;
  var els=[].slice.call(tile.querySelectorAll("p,li,div,span"));
  for(var i=0;i<els.length;i++){
    var e=els[i]; if(!e||e.classList.contains("at-card")||isUI(e))continue;
    var t=norm(e.textContent);
    if(t.indexOf("•")===0){
      var c=mkCard(norm(t.replace(/^•\s*/,"")),0);
      e.parentNode&&e.parentNode.replaceChild(c,e);
    }
  }
}
function run(){
  addStyle(SID,
    ".at-wrap{margin:0;padding:0}.at-center{text-align:center}"+
    ".at-card{position:relative;border-radius:999px;padding:14px 18px 14px 42px;margin:12px 0;max-width:760px;"+
    "background:linear-gradient(120deg,#efefef,#cfcfcf,#f6f6f6,#bdbdbd);background-size:320% 320%;animation:atshine 7s ease-in-out infinite;"+
    "box-shadow:0 12px 28px rgba(0,0,0,.12);color:#111;opacity:0;transform:translateY(12px);"+
    "transition:opacity .55s ease,transform .55s ease}"+
    ".at-center.at-card,.at-center .at-card{margin:12px auto}"+
    ".at-card:before{content:'•';position:absolute;left:18px;top:12px;font-size:22px;line-height:1;opacity:.75}"+
    ".at-card.at-on{opacity:1;transform:none}"+
    ".at-cur:after{content:'|';display:inline-block;margin-left:2px;opacity:.85;animation:atblink 1s steps(2,end) infinite}"+
    "@keyframes atblink{0%,49%{opacity:1}50%,100%{opacity:0}}"+
    "@keyframes atshine{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}"
  );

  // “Почему мы?”
  var why=[].slice.call(document.querySelectorAll("h1,h2,h3")).find(function(h){return norm(h.textContent).indexOf("Почему мы?")!==-1});
  if(why){
    var t=tileOf(why);
    convertTextNodes(t); convertTaggedBullets(t);
    var cards=[].slice.call(t.querySelectorAll(".at-card"));
    prepType(why);
    var seq=[why].concat(cards);
    whenVisible(t,function(){typeSeq(seq,70,220,220)});
  }

  // Стайлеры/Фены
  var hair=[].slice.call(document.querySelectorAll("h1,h2,h3")).find(function(h){
    var x=norm(h.textContent);return x.indexOf("Стайлеры")!==-1||x.indexOf("Фены")!==-1||x==="Фен";
  });
  if(hair){
    var th=tileOf(hair);
    convertTextNodes(th); convertTaggedBullets(th);
    var ch=[].slice.call(th.querySelectorAll(".at-card"));
    prepType(hair);
    whenVisible(th,function(){typeSeq([hair].concat(ch),52,200,180)});
  }

  // Массажные пистолеты
  var gun=[].slice.call(document.querySelectorAll("h1,h2,h3")).find(function(h){return norm(h.textContent).indexOf("Массажные пистолеты")!==-1});
  if(gun){
    var tg=tileOf(gun);
    convertTextNodes(tg); convertTaggedBullets(tg);
    var cg=[].slice.call(tg.querySelectorAll(".at-card"));
    prepType(gun);
    whenVisible(tg,function(){typeSeq([gun].concat(cg),52,200,180)});
  }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
if("MutationObserver"in window){
  var t=0;new MutationObserver(function(){clearTimeout(t);t=setTimeout(run,200)}).observe(document.body,{childList:true,subtree:true});
}
})();
