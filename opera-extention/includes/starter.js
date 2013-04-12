//starter!
//待受
(function(){
	opera.extension.onmessage=function(e){
		if(e.data.type==="activate"){
			//CSS読み込み
			var style=document.createElement("style");
			style.textContent=e.data.css;
			document.head.appendChild(style);
			//エクステンション起動
			var i=new Interface(new EventClient(e.source));
			//返事する
			e.source.postMessage("ok");
		}
	};
})();
