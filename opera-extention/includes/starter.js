//starter!
//待受
opera.extension.onmessage=function(e){
	if(e.data==="activate"){
		//エクステンション起動
		var t=opera.extension.tabs.getSelected();
		if(t && t.browserWindow==window){
			//自分が起動するぞ!
			var i=new Interface(new EventClient(e.source));
			//返事する
			e.source.postMessage("ok");
		}
	}
};
