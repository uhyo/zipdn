//starter!
//待受
opera.extension.onmessage=function(e){
	if(e.data==="activate"){
		//エクステンション起動
		var i=new Interface(new EventClient(e.source));
		//返事する
		e.source.postMessage("ok");
	}
};
