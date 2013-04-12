(function(){
	//イベント登録
	if(document.body){
		start();
	}else{
		document.addEventListener("DOMContentLoaded",function(e){
			start();
		},false);
	}
	function start(){
		//まずJSZipを入れる
		var dir="./";
		var jszipDir=dir+"jszip/", cssDir=dir+"css/";
		loadCSS(cssDir+"css.css");
		loadScript([jszipDir+"jszip.js",jszipDir+"jszip-deflate.js"],function(){
			var zip=new JSZip();
			manage(zip);
		});
	}
	//入れるファイルをきめる
	function manage(zip){
		var addNewFile=eventManager();
		var gotNewFile=eventManager();
		var zipMap={};	//ファイル名をいれる
		//投げたらzipに入れる
		var read_file_name=null;	//ファイル名はここに入れようか
		var reader=new FileReader();
		reader.onload=function(e){
			zip.file(read_file_name,reader.result,{
				binary:true
			});
		};
		//インターフェース
		//うひょー処理とまったく分離してない
		el("section",function(menu){
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
						addNewFile.push(function(xhr){
							//全体進捗
							progress.max=++max;
							if(isNaN(progress.value)){
								//開始
								progress.value=0;
							}
							xhr.addEventListener("loadend",function(e){
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
					gotNewFile.push(function(xhr){
						filenum++;
						output.value=filenum+" file(s) zipped";
					});
				}));
				div.appendChild(el("input",function(input){
					input.type="button";
					input.value="download";
					input.addEventListener("click",function(e){
						//zipをつくるぞ!
						var blob=zip.generate({
							//compression:"DEFLATE",
							compression:"STORE",
							type:"blob",
						});
						//ダウンロードさせる
						var filename=prompt("file name?");
						if(!/\.zip$/.test(filename)){
							filename+=".zip";
						}
						el("a",function(a){
							a.href=URL.createObjectURL(blob);
							a.download=filename;
						}).click();
					},false);
					//ダウンロード中はだめ
					addNewFile.push(function(xhr){
						input.disabled=true;
						xhr.addEventListener("loadend",function (e){
							input.disabled=false;
						});
					});
				}));
			}));
			menu.appendChild(el("div",function(div){
				//入れたやつを表示
				div.classList.add("uhy-contents");
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
						var xhr=new XMLHttpRequest();
						xhr.responseType="blob";
						xhr.open("GET",a.href);
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
						//結果うけとり部分
						(function(href,xhr,filename){
							div.appendChild(el("div",function(div){
								div.classList.add("uhy-filebox");
								div.appendChild(el("progress",function(progress){
									xhr.addEventListener("progress",function(e){
										progress.max=e.total;
										progress.value=e.loaded;
									});
								}));
								xhr.addEventListener("error",function(e){
									//あれれーーーーーー
									div.appendChild(el("span",function(span){
										span.classList.add("uhy-error");
										span.textContent="\u2718"+xhr.status;
										console.log(e);
									}));
								},false);
								xhr.addEventListener("load",function(e){
									//ロードした
									if(xhr.status>=400){
										//あれれーーーーーーー
										div.appendChild(el("span",function(span){
											span.classList.add("uhy-error");
											span.textContent="\u2718"+e.status;
										}));
										return;
									}
									var blob=xhr.response;
									//成功した
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
											img.src=URL.createObjectURL(blob);
										}));
									}else{
										//とりあえずファイル名
										div.appendChild(document.createTextNode(filename));
									}
									//zipに入れる
									read_file_name=filename;
									reader.readAsArrayBuffer(blob);
									gotNewFile(xhr);
								});
								//送信
								xhr.send(null);
								addNewFile(xhr);
							}));
						})(a.href,xhr,filename);
						delete result;
						delete xhr;
					}
				},false);
			}));
			document.body.appendChild(menu);
		});
		//イベントマネージャを作って返す
		function eventManager(){
			var funcs=[];
			addM.push=function(func){
				funcs.push(func);
			};
			return addM;
			function addM(){
				var args=arguments;
				funcs.forEach(function(func){
					func.apply(null,args);
				});
			}
		}
	}
	function el(name,callback){
		var result=document.createElement(name);
		if(callback)callback(result);
		return result;
	}
	function loadScript(files,callback){
		if(!Array.isArray(files)){
			files=[files];
		}
		loadOne();

		function loadOne(){
			if(files.length===0){
				//もうない
				if(callback)callback();
				return;
			}
			var filename=files.shift();
			var scr=document.createElement("script");
			scr.type="application/javascript";
			scr.src=filename;
			scr.addEventListener("load",function handler(e){
				scr.removeEventListener("load",handler,false);
				loadOne();
			},false);
			document.head.appendChild(scr);
		}
	}
	function loadCSS(filename,callback){
		var ln=document.createElement("link");
		ln.rel="stylesheet";
		ln.type="text/css";
		ln.href=filename;
		ln.addEventListener("load",function handler(e){
			if(callback)callback();
			ln.removeEventListener("load",handler,false);
		},false);
		document.head.appendChild(ln);
	}
})();
