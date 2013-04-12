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
			var event=new EventEmitter();
			var i=new Interface(event);
			var z=new Zipper(event);
			//返事する
			e.source.postMessage("ok");
		}
	};
})();
