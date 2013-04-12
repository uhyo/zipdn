//starter!
if(!window.EventClient){
	window.EventClient=EventClient;
}
//待受
opera.extentions.onmessage=function(e){
	if(e.data==="activate"){
		//エクステンション起動
		var i=new Interface(new EventClient(e.source));
	}
};

//EventEmitterみたいな
function EventClient(source){
	this.source=source;
	var event=this.event=new EventEmitter;
	source.onmessage=function(e){
		var d=e.data;
		if(d.type==="event"){
			event.emit(d.name,d.data);
		}
	};
}
EventClient.prototype.on=function(){
	this.event.on.apply(this.event,arguments);
};
EventClient.prototype.once=function(){
	this.event.once.apply(this.event,arguments);
};
EventClient.prototype.removeListener=function(){
	this.event.removeListener.apply(this.event,arguments);
};
EventClient.prototype.emit=function(name,data){
	this.source.postMessage({
		type:"event",
		name:name,
		data:data,
	});
};

