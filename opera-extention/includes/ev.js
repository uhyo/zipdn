( // Module boilerplate to support browser globals and AMD.
  (typeof define === "function" && function (m) { define("EventEmitter", m); }) ||
  (function (m) { this.EventEmitter = m(); })
)(function () {
"use strict";

function EventEmitter() {}

EventEmitter.prototype.on = function (name, callback) {
  if (!this.hasOwnProperty("_handlers")) this._handlers = {};
  var handlers = this._handlers;
  if (!handlers.hasOwnProperty(name)) handlers[name] = [];
  var list = handlers[name];
  list.push(callback);
};
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

EventEmitter.prototype.once = function (name, callback) {
  this.on(name, callback);
  this.on(name, remove);
  function remove() {
    this.off(name, callback);
    this.off(name, remove);
  }
};

EventEmitter.prototype.emit = function (name/*, args...*/) {
  if (!this.hasOwnProperty("_handlers")) return;
  var handlers = this._handlers;
  if (!handlers.hasOwnProperty(name)) return;
  var list = handlers[name];
  var args = Array.prototype.slice.call(arguments, 1);
  for (var i = 0, l = list.length; i < l; i++) {
    if (!list[i]) continue;
    list[i].apply(this, args);
  }
}

EventEmitter.prototype.off = function (name, callback) {
  if (!this.hasOwnProperty("_handlers")) return;
  var handlers = this._handlers;
  if (!handlers.hasOwnProperty(name)) return;
  var list = handlers[name];
  var index = list.indexOf(callback);
  if (index < 0) return;
  list[index] = false;
  if (index === list.length - 1) {
    while (index >= 0 && !list[index]) {
      list.length--;
      index--;
    }
  }
};
EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

return EventEmitter;

});
//------

//EventEmitterみたいな
if(!window.EventClient){
	window.EventClient=EventClient;
}
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


