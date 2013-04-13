//zip化プロセス
function Zipper(event){
	this.event=event;
	this.zip=new JSZip();
	this.reader=new FileReader();
	this.initEvents(event,this.zip);
	//idをアレする
	this.id=1;
	this.filename=null;
}
Zipper.prototype.initEvents=function(event,zip){
	//読んだら全部入れる
	var _this=this;
	this.reader.onload=function(e){
		zip.file(_this.filename,_this.reader.result,{
			binary:true,
		});
	};
	event.on("load",function(url,filename){
		//このファイルをアレしてほしい!
		var id=_this.id++;
		var xhr=new XMLHttpRequest();
		xhr.responseType="blob";
		xhr.open("GET",url);
		event.emit("loadstart",id);	//id教える
		xhr.addEventListener("loadend",function(e){
			if(xhr.status===0 || xhr.status>=400 || !xhr.response){
				//エラー
				event.emit("loadend",{
					id:id,error:xhr.status,
					blob:null,url:null, filename:filename
				});
				return;
			}
			//zipにいれる
			_this.filename=filename;
			_this.reader.readAsArrayBuffer(xhr.response);
			//読み込み成功
			event.emit("loadend",{
				id:id,erorr:null,
				blob:xhr.response,
				url:url,
				filename:filename,
			});
		});
		xhr.addEventListener("progress",function(e){
			event.emit("loadprogress-"+id,{
				loaded:e.loaded,
				total:e.total
			});
		});
		xhr.send();
	});
	//zipでくれ!
	event.on("generate",function(){
		var blob=zip.generate({
			compression:"STORE",
			type:"blob",
		});
		event.emit("generateResponse",window.URL.createObjectURL(blob));
	});
};
