//starter!
//待受
(function(){
	var id=getUniqueid();
	opera.extension.onmessage=function(e){
		if(e.data.type==="activate" && e.data.id===id){
			//エクステンション起動
			var i=new Interface(new EventClient(e.source));
			//返事する
			e.source.postMessage("ok");
		}
	};
	opera.extension.postMessage({
		type:"myid",
		id:id,
	});
	function getUniqueid(){
		var result="";
		for(var i=0;i<50;i++){
			//a-z
			result+=String.fromCharCode(97+Math.floor(Math.random()*26));
		}
		return result;
	}
})();
