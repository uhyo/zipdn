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
	event.on("load",function(obj){
		var url=obj.url, filename=obj.filename;
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
			var blob=xhr.response;
			//タイプを得る
			var type=blob.type;
			if(!type){
				//分からない!画像の場合は推測する
				if(/\.jpe?g$/.test(url)){
					type="image/jpeg";
				}else if(/\.png$/.test(url)){
					type="image/png";
				}else if(/\.gif$/.test(url)){
					type="image/gif";
				}
			}
			event.emit("loadend",{
				id:id,erorr:null,
				blob:blob,
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
	event.on("remove",function(filename){
		//やっぱりこれはいらない!
		zip.remove(filename);
		event.emit("removed",filename);
	});
	//zipでくれ!
	event.on("generate",function(){
		var blob=zip.generate({
			compression:"STORE",
			type:"blob",
		});
		cro(blob,function(result){
			event.emit("generateResponse",result);
		});
	});
};
function cro(blob,callback){
	if(window.URL && window.URL.createObjectURL){
		callback(window.URL.createObjectURL(blob));
		return;
	}
	//仕方ない、自前で
	var r=new FileReader();
	r.onload=function(e){
		callback(r.result);
	};
	r.readAsDataURL(blob);
}
