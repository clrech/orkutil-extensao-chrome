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

function log(s) {
	if (orkutil.log) {
		console.log(s);
	}
}