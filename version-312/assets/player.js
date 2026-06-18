function initPlayer(videoId,buttonId,layerId,source){
var video=document.getElementById(videoId);
var button=document.getElementById(buttonId);
var layer=document.getElementById(layerId);
if(!video||!button||!layer)return;
var ready=false;
function load(cb){
if(video.canPlayType("application/vnd.apple.mpegurl")){
video.src=source;ready=true;cb();return
}
function run(){
if(window.Hls&&window.Hls.isSupported()){
var hls=new window.Hls({maxBufferLength:60});
hls.loadSource(source);
hls.attachMedia(video);
hls.on(window.Hls.Events.MANIFEST_PARSED,function(){ready=true;cb()});
}else{
video.src=source;ready=true;cb()
}
}
if(window.Hls){run()}else{
var s=document.createElement("script");
s.src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
s.onload=run;
document.head.appendChild(s)
}
}
function play(){
layer.classList.add("hidden");
if(ready){video.play().catch(function(){})}else{load(function(){video.play().catch(function(){})})}
}
button.addEventListener("click",play);
layer.addEventListener("click",play);
video.addEventListener("click",function(){if(video.paused)play()})
}