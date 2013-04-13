//starter!
//待受
(function(){
	var id=null, srv=null;
	opera.extension.onmessage=function(e){
		if(e.data.type==="yourid"){
			//サーバーさんから連絡がきた
			id=e.data.id;
			srv=e.source;	//サーバーさんの連絡先ゲット
		}
		if(e.data.type==="activate"){
			//CSS読み込み
			var style=document.createElement("style");
			style.textContent=e.data.css;
			document.head.appendChild(style);
			//エクステンション起動
			var i=new Interface(new EventClient(opera.extension,srv));
			//返事する
			srv.postMessage({
			  type:"ok",
			  id:id,
			});
		}
	};
})();
