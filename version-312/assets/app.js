(function(){
var b=document.querySelector("[data-menu-button]"),m=document.querySelector("[data-mobile-menu]");
if(b&&m){b.addEventListener("click",function(){m.classList.toggle("hidden")})}
var slides=[].slice.call(document.querySelectorAll(".hero-slide"));
if(slides.length){
var dots=[].slice.call(document.querySelectorAll(".hero-dot"));
var i=0;
function show(n){i=(n+slides.length)%slides.length;slides.forEach(function(s,k){s.classList.toggle("active",k===i)});dots.forEach(function(d,k){d.classList.toggle("active",k===i)})}
dots.forEach(function(d,k){d.addEventListener("click",function(){show(k)})});
var next=document.querySelector("[data-hero-next]"),prev=document.querySelector("[data-hero-prev]");
if(next)next.addEventListener("click",function(){show(i+1)});
if(prev)prev.addEventListener("click",function(){show(i-1)});
setInterval(function(){show(i+1)},5200)
}
var input=document.querySelector("[data-search]");
var filterButtons=[].slice.call(document.querySelectorAll("[data-filter]"));
function applyFilter(){
var q=input?input.value.trim().toLowerCase():"";
var active=document.querySelector("[data-filter].active");
var f=active?active.getAttribute("data-filter"):"all";
document.querySelectorAll(".movie-card").forEach(function(card){
var text=(card.getAttribute("data-search-text")||"").toLowerCase();
var genre=card.getAttribute("data-genre")||"";
var type=card.getAttribute("data-type")||"";
var okText=!q||text.indexOf(q)>-1;
var okFilter=f==="all"||genre.indexOf(f)>-1||type.indexOf(f)>-1||text.indexOf(f.toLowerCase())>-1;
card.hidden=!(okText&&okFilter)
})
}
if(input)input.addEventListener("input",applyFilter);
filterButtons.forEach(function(btn){btn.addEventListener("click",function(){filterButtons.forEach(function(b){b.classList.remove("active","bg-cyan-400","text-slate-950");b.classList.add("bg-slate-800/50","text-slate-300")});btn.classList.add("active","bg-cyan-400","text-slate-950");btn.classList.remove("bg-slate-800/50","text-slate-300");applyFilter()})});
})();