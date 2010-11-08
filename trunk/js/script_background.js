var orkutil = {
	log : true,
	menus : {
		'perfil' : 'Profile',
		'recados' : 'Scrapbook',
		'fotos' : 'AlbumList',
		'separador1' : '',
		'perfil_completo' : 'FullProfile',
		'amigos' : 'FriendsList',
		'amigos_comum' : 'MutualFriendsList',
		'separador2' : '',
		'depoimentos' : 'ProfileT',
		'fotos_junto' : 'PhotoTag',
		'atualizacoes' : 'Notifications',
		'comunidades' : 'ProfileC',
		'comunidades_comum' : 'ProfileC&tab=1',
		'eventos' : 'Events',
		'videos' : 'FavoriteVideos',
		'separador3' : '',
		'enviar_mensagem' : 'Compose',
		'enviar_cantada' : 'MsgsTeaser'
	}
}

var menuPai = chrome.contextMenus.create( {
	'title' : 'orkut',
	'contexts' : [ 'link' ],
	'targetUrlPatterns' : [ '*://*.orkut.com/*', '*://*.orkut.com.br/*' ]
});

for ( var menu in orkutil.menus) {
	var propriedades = {};
	propriedades.contexts = [ 'link' ];
	propriedades.parentId = menuPai;

	log('Criando menu "' + chrome.i18n.getMessage(menu) + '"');
	if (orkutil.menus[menu] != '') {
		propriedades.title = chrome.i18n.getMessage(menu);
		propriedades.onclick = function(dados) {
			if (dados.linkUrl) {
				var uid = dados.linkUrl.split('uid=');
				if (uid.length == 1) {
					return;
				}

				uid = uid[1].split('&');
				if (dados.pageUrl.indexOf('www.orkut.com') == -1) {
					var url = 'http://www.orkut.com/Main#' + orkutil.menus[dados.menuItemId] + '?uid=' + uid;
					if (orkutil.menus[dados.menuItemId].split('&').length == 2) {
						url = 'http://www.orkut.com/Main#' + orkutil.menus[dados.menuItemId].split('&')[0] + '?uid=' + uid + '&' + orkutil.menus[dados.menuItemId].split('&')[1];
					}

					log('Criando aba: ' + url);
					chrome.tabs.create( {
						'url' : url
					});
				} else {
					var indiceProtocolo = dados.pageUrl.indexOf('//');
					var protocolo = dados.pageUrl.substring(0, indiceProtocolo);
					var url = dados.pageUrl.substring(indiceProtocolo + 2, dados.pageUrl.length);

					if (orkutil.menus[dados.menuItemId].split('&').length == 2) {
						url = protocolo + '//' + url.substring(0, url.indexOf('/')) + '/Main#' + orkutil.menus[dados.menuItemId].split('&')[0] + '?uid=' + uid + '&'
								+ orkutil.menus[dados.menuItemId].split('&')[1];
					} else {
						url = protocolo + '//' + url.substring(0, url.indexOf('/')) + '/Main#' + orkutil.menus[dados.menuItemId] + '?uid=' + uid;
					}

					chrome.windows.getCurrent(function(janela) {
						chrome.tabs.getSelected(janela.id, function(aba) {
							log('Mudando URL: ' + url);
							chrome.tabs.update(aba.id, {
								'url' : url
							});
						})
					});
				}
			}
			
			_gaq.push( [ '_trackEvent', 'Menus', 'clicked', orkutil.menus[dados.menuItemId] ]);
		}
	} else {
		propriedades.type = 'separator';
	}

	var id = chrome.contextMenus.create(propriedades);
	orkutil.menus[id] = orkutil.menus[menu];
}

log(orkutil);

orkutil.clicar = function(elemento) {
	var codigo = 'var evt = document.createEvent("MouseEvents");';
	codigo += 'evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);';
	codigo += 'var r = ' + elemento + '.dispatchEvent(evt);';

	return codigo;
}

chrome.extension.onRequest.addListener(function(requisicao, remetente, resposta) {
	log('chrome.extension.onRequest()');
	log(requisicao);
	log(remetente);

	if (!requisicao.acao) {
		return;
	}

	switch (requisicao.acao) {
	case 'carregarAtualizacoes':
		chrome.tabs.executeScript(null, {
			code : orkutil.clicar('document.getElementsByClassName("demoStream")[0].childNodes[0]');
			_gaq.push( [ '_trackEvent', 'Botões', 'clicked', 'Carregar atualizações');
		});
		break;

	case 'carregarMaisAtualizacoes':
		chrome.tabs.executeScript(null, {
			code : orkutil.clicar('document.getElementsByClassName("demoStream")[0].childNodes[2]');
		});
		break;

	case 'notificarAtualizacoes':
		chrome.windows.getCurrent(function(janela) {
			chrome.tabs.getSelected(janela.id, function(aba) {
				if (remetente.tab.id != aba.id) {
					window.webkitNotifications.createNotification('img/icones/icone-48.png', chrome.i18n.getMessage('novas_atualizacoes'), chrome.i18n.getMessage('notificacao_novas_atualizacoes')).show();
				}
			});
		});
		break;
	}

	resposta( {});
});

function log(s) {
	if (orkutil.log) {
		console.log(s);
	}
}