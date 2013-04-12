//インターフェース部分
function Interface(event){
	this.event=event;//EventEmitter
	//インターフェース
	this.initui();
	this.cle();
}
Interface.prototype.initui=function(){
	var ev=this.event;
	//ロード終了までonを登録
	function loadEvent(id,eventname,func){
		ev.on(eventname,function handler(id2){
			//本来のイベント
			if(id===id2){
				func.apply(null,arguments);
				ev.removeListener(eventname,handler);
			}
		});
	}
	document.body.appendChild(el("section",function(menu){
		menu.classList.add("uhy-menu");
		menu.appendChild(el("header",function(header){
			header.appendChild(el("h1",function(h1){
				h1.textContent="選択中";
			}));
			//プログレスバー
			header.appendChild(el("div",function(div){
				div.classList.add("uhy-processbox");
				div.appendChild(el("progress",function(progress){
					progress.max=0;
					var max=0;
					ev.on("loadstart",function(id){
						//全体進捗
						progress.max=++max;
						if(isNaN(progress.value)){
							//開始
							progress.value=0;
						}
						loadEvent(id,"loadend",function(){
							//読み込み完了した
							progress.value++;
						});
					});
				}));
			}));
		}));
		menu.appendChild(el("div",function(div){
			div.classList.add("uhy-info");
			var filenum=0;
			div.appendChild(el("output",function(output){
				ev.on("loadend",function(id,error,result){
					if(!error){
						filenum++;
						output.value=filenum+" file(s) zipped";
					}
				});
			}));
			div.appendChild(el("input",function(input){
				input.type="button";
				input.value="download";
				input.addEventListener("click",function(e){
					ev.emit("generate");
				},false);
				/*//zipをつくるぞ!
				  var blob=zip.generate({
				//compression:"DEFLATE",
				compression:"STORE",
				type:"blob",
				});*/
				ev.on("generateResponse",function(blob){
					//ダウンロードさせる
					var filename=prompt("file name?");
					if(!/\.zip$/.test(filename)){
						filename+=".zip";
					}
					el("a",function(a){
						a.href=window.URL.createObjectURL(blob);
						a.download=filename;
					}).click();
				});
				//ダウンロード中はだめ
				var loadingIDs=[];
				ev.on("loadstart",function(id){
					loadingIDs.push(id);
					input.disabled=true;
				});
				ev.on("loadend",function(id){
					loadingIDs=loadingIDs.filter(function(x){return x!==id});
					if(loadingIDs.length===0){
						input.disabled=false;
					}
				});
			}));
		}));
		menu.appendChild(el("div",function(div){
			//入れたやつを表示
			div.classList.add("uhy-contents");
			ev.on("loadstart",function(id){
				div.appendChild(el("div",function(div){
					div.classList.add("uhy-filebox");
					var progress=el("progress");
					var prhandler=function(loaded,total){
						progress.max=total;
						progress.value=loaded;
					}
					div.appendChild(progress);
					ev.on("loadprogress-"+id,prhandler);
					loadEvent(id,"loadend",function(id,error,result){
						ev.removeHandler("loadprogress-"+id,prhandler);
						if(error){
							//あれれーーーーーー
							div.appendChild(el("span",function(span){
								span.classList.add("uhy-error");
								span.textContent="\u2718"+error:
							}));
							return;
						}
						//成功した
						var blob=result.blob, filename=result.filename;
						if(/^image\/.+$/.test(blob.type)){
							//画像だ!!
							//ビューを用意
							div.appendChild(el("img",function(img){
								img.hidden=true;
								img.addEventListener("load",function handler(e){
									//アス比たもったまま縦を圧縮
									//hard
									if(img.naturalHeight>60){
										var zoom=60/img.naturalHeight;
										img.width=Math.floor(img.naturalWidth*zoom);
										img.height=60;
									}
									img.hidden=false;
									img.removeEventListener("load",handler,false);
								},false)
								img.src=window.URL.createObjectURL(blob);
							}));
						}else{
							//とりあえずファイル名
							div.appendChild(document.createTextNode(filename));
						}
						/*//zipに入れる
						  read_file_name=filename;
						  reader.readAsArrayBuffer(blob);
						  gotNewFile(xhr);*/
					});
				}
			});
		}));
	}));
};
Interface.prototype.cle=function(){
	var ev=this.event;
	var zipMap={};
	//デフォルト重複会費
	var default_index=1;
	//クリック検出
	document.addEventListener("click",function(e){
		var t=e.target;
		//a要素を探す
		var a=t;
		do{
			if(/^a$/i.test(a.tagName)){
				//これだ!
				break;
			}
		}while(a=a.parentNode);
	if(a){
		e.preventDefault();
		//これをダウンロードする!
		if(zipMap[a.href]){
			//これはすでにある
			return;
		}
		zipMap[a.href]=true;
		//ファイル名決定
		var filename;
		var res=a.href.match(/(?:^|\/)([^\/]*?)(\.[^\/]*)$/);
		if(a.download){
			filename=a.download+res[2];
		}else if(res){
			filename=(res[1]+res[2]) || "index.html";
		}else{
			filename="default"+(default_index++);
		}
		ev.emit("load",a.href,filename);
	}
	},false);
};
function el(name,callback){
	var result=document.createElement(name);
	if(callback)callback(result);
	return result;
}
/*function loadCSS(filename,callback){
  var ln=document.createElement("link");
  ln.rel="stylesheet";
  ln.type="text/css";
  ln.href=filename;
  ln.addEventListener("load",function handler(e){
  if(callback)callback();
  ln.removeEventListener("load",handler,false);
  },false);
  document.head.appendChild(ln);
  }*/
