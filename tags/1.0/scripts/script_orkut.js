var orkutil = {
	log : true,
	host : window.location.protocol + '//' + window.location.host,
	alturaCaixa : 0,
	teclaG : 0,
	scroll : 9999999999999,
	atalho : {},
	atalhos : [ [ 'aplicativos', 'AppDirectory', 'paginas' ], [ 'comunidades', 'Communities', 'paginas' ], [ 'depoimentos', 'ProfileT', 'paginas' ], [ 'eventos', 'Events', 'paginas' ],
			[ 'fotos', 'AlbumList', 'paginas' ], [ 'fotos_junto', 'PhotoTag', 'paginas' ], [ 'grupos', 'GroupsManagement', 'paginas' ], [ 'home', 'Home', 'paginas' ],
			[ 'mensagens', 'Messages', 'paginas' ], [ 'configuracoes', 'GeneralSettings', 'paginas' ], [ 'perfil', 'Profile', 'paginas' ], [ 'promova', 'Promote', 'paginas' ],
			[ 'recados', 'Scrapbook', 'paginas' ], [ 'perfil_completo', 'FullProfile', 'paginas' ], [ 'proximo', '', 'navegacao' ], [ 'anterior', '', 'navegacao' ], [ 'ajuda', '', 'navegacao' ],
			[ 'buscar', '', 'navegacao' ] ]
};

for (i in orkutil.atalhos) {
	orkutil.atalho[chrome.i18n.getMessage('atalho_' + orkutil.atalhos[i][0])] = orkutil.atalhos[i][1];
}

log(orkutil);

orkutil.carregar = function() {
	log('orkutil.carregar()');
	$('.rightColumnLayout > div').each(function(indice, elemento) {
		if ($(elemento).find('a[href*=Profile]').size() > 0) {
			log('orkutil.carregar(): Criando imagem de zoom-in nas miniaturas');
			$(document.createElement('img')).attr( {
				class : 'zoom',
				src : chrome.extension.getURL('imagens/icones/zoom-in.png'),
				title : chrome.i18n.getMessage('aumentar_fotos')
			}).prependTo($(elemento).find('.themePrimaryBackgroundColor')).click( {
				caixa : elemento
			}, function(evento) {
				if (evento.data.caixa) {
					$(evento.data.caixa).find('.themePrimaryBackgroundColor').parent().addClass('miniatura-maior');
				}
				orkutil.aumentarMiniaturas();
			});

			log('orkutil.carregar(): Criando imagem de zoom-out nas miniaturas');
			$(document.createElement('img')).attr( {
				class : 'zoom',
				src : chrome.extension.getURL('imagens/icones/zoom-out.png'),
				title : chrome.i18n.getMessage('diminuir_fotos')
			}).prependTo($(elemento).find('.themePrimaryBackgroundColor')).click(orkutil.diminuirMiniaturas);
		}

		log('orkutil.carregar(): Criando imagem de tela cheia');
		$(document.createElement('img')).attr( {
			class : 'zoom',
			src : chrome.extension.getURL('imagens/icones/tela-cheia.png'),
			title : chrome.i18n.getMessage('tela_cheia')
		}).prependTo($(elemento).find('.themePrimaryBackgroundColor')).click( {
			caixa : elemento
		}, orkutil.telaCheia);
	});

	$('.demoStream div > div:visible:first').addClass('stream-selecionada');
};

orkutil.carregou = function() {
	log('orkutil.carregou()');
	if ($('#orkutLoading').size() == 0) {
		orkutil.carregar();
	} else {
		window.setTimeout(orkutil.carregou, 1000);
	}
};

window.setTimeout(orkutil.carregou, 1000);

orkutil.telaCheia = function(evento) {
	log('orkutil.telaCheia()');
	if (!evento.data.caixa) {
		return;
	}

	var telaCheia = $(evento.data.caixa).hasClass('tela-cheia');
	$(evento.data.caixa).toggleClass('tela-cheia');
	$(evento.data.caixa).find('div[style*=overflow]').each(function(indice, elemento) {
		$(elemento).find('div > div > div:first').height($(document).height());

		if (telaCheia) {
			$(elemento).height(orkutil.alturaCaixa);
		} else {
			orkutil.alturaCaixa = $(elemento).height();
			$(elemento).height($(document).height() - 65);
		}

		if (!telaCheia) {
			$(elemento).animate( {
				scrollTop : $(document).height()
			}, 0);
			$(elemento).animate( {
				scrollTop : 0
			}, 0);
		}
	});

	$('.tela-cheia input[class][type=text]:first').focus().select();
	orkutil.verificarTamanhoMiniaturas(false);
};

orkutil.aumentarMiniaturas = function() {
	log('orkutil.aumentarMiniaturas()');
	$('.miniatura-maior div[style*=overflow]:first').scroll(orkutil.scrollMiniaturas);
	$('.miniatura-maior td input[type=text]:first').keyup(function() {
		window.setTimeout(orkutil.verificarTamanhoMiniaturas, 2000);
	});
	orkutil.mudarTamanhoMiniaturas('small', 'medium');
}

orkutil.diminuirMiniaturas = function() {
	log('orkutil.diminuirMiniaturas()');
	orkutil.mudarTamanhoMiniaturas('medium', 'small');
	$('.miniatura-maior').removeClass('miniatura-maior');
}

orkutil.mudarTamanhoMiniaturas = function(antes, depois) {
	log('orkutil.mudarTamanhoMiniaturas(' + antes + ', ' + depois + ')');
	$('.miniatura-maior a[href*=Profile]').each(function(indice, elemento) {
		orkutil.mudarTamanhoMiniatura($(elemento).find('img:first'), antes, depois);
	});
}

orkutil.mudarTamanhoMiniatura = function(miniatura, antes, depois) {
	var src = $(miniatura).attr('src');
	if (src) {
		$(miniatura).attr('src', src.replace(antes, depois));
		log('orkutil.mudarTamanhoMiniatura(' + antes + ', ' + depois + '): ' + $(miniatura).attr('title'));
	}
}

orkutil.verificarTamanhoMiniaturas = function(imediatamente) {
	log('orkutil.verificarTamanhoMiniaturas(' + imediatamente + ')');
	if ((typeof imediatamente) != 'undefined' && !imediatamente) {
		window.setTimeout(orkutil.verificarTamanhoMiniaturas, 1000);
	}

	if ($('.miniatura-maior').size() > 0) {
		$('.miniatura-maior a[href*=Profile]').find('img:first').each(function(indice, elemento) {
			if ($(elemento).height() <= 100 && $(elemento).width() <= 100) {
				orkutil.mudarTamanhoMiniatura(elemento, 'small', 'medium');
			}
		});
	}
};

orkutil.scrollMiniaturas = function() {
	log('orkutil.scrollMiniaturas');
	var tempo = (new Date()).getTime() - orkutil.scroll;
	orkutil.scroll = (new Date()).getTime();

	if (tempo > 1000) {
		orkutil.verificarTamanhoMiniaturas(false);
	}
}

$('.themeDesktopColor').scroll(function() {
	if ($('.demoStream > div:nth-child(3)').offset().top < $(window).height()) {
		$('.demoStream > div:nth-child(3)').click();
	}
});

orkutil.keypress = function(evento) {
	var tecla = String.fromCharCode(evento.keyCode).toUpperCase();
	var tempo = (new Date()).getTime() - orkutil.teclaG;

	switch (evento.keyCode) {
	case 47:
		// /
		$('#busca-universal').focus().select();
		break;
	case 63:
		// ?
		orkutil.exibirAtalhos();
		break;
	}

	if (tempo <= 1000 && orkutil.atalho[tecla]) {
		window.location = '#' + orkutil.atalho[tecla];
	}

	switch (tecla) {
	case 'G':
		orkutil.teclaG = (new Date()).getTime();
		break;
	case 'J':
		orkutil.navegar(true);
		break;
	case 'K':
		orkutil.navegar(false);
		break;
	}
};

orkutil.navegar = function(proximo) {
	log('orkutil.navegar()');
	if ($('.stream-selecionada').size() == 0) {
		$('.demoStream div > div:visible:first').addClass('stream-selecionada');
		if (proximo) {
			return;
		}
	}

	if (proximo) {
		$('.stream-selecionada').nextAll('div:visible:first').addClass('stream-selecionada');
		$('.stream-selecionada').prevAll('div').removeClass('stream-selecionada');
	} else {
		$('.stream-selecionada').prevAll('div:visible:first').addClass('stream-selecionada');
		$('.stream-selecionada').nextAll('div').removeClass('stream-selecionada');
	}

	$('.themeDesktopColor').animate( {
		scrollTop : $('.stream-selecionada').attr('offsetTop')
	}, 0);
};

orkutil.resize = function() {
	log('orkutil.resize()');
	$('.tela-cheia').find('div[style*=overflow]').each(function(indice, elemento) {
		$(elemento).height(($(document).height() - 10));
	});
};

orkutil.onpopstate = function(event) {
	log('orkutil.onpopstate()');
	window.setTimeout(orkutil.verificarTamanhoMiniaturas, 3000);
	if ($('.stream-selecionada').size() == 0) {
		$('.demoStream div > div:first').addClass('stream-selecionada');
	}
};

orkutil.exibirAtalhos = function() {
	log('orkutil.exibirAtalhos()');
	if ($('#atalhos').size() != 0) {
		$('#atalhos > div').css('backgroundColor', $('.themePrimaryBackgroundColor:first').css('backgroundColor'));
		$('#atalhos').toggle();
		return;
	}

	log('orkutil.exibirAtalhos(): Criando');
	var _atalhos = [];
	var atalhosPaginas = [];
	var atalhosNavegacao = [];

	_atalhos.push('<div id="atalhos"><div>');
	_atalhos.push('<h3>' + chrome.i18n.getMessage('atalhos') + '</h3>');
	_atalhos.push('<div>');

	for ( var i in orkutil.atalhos) {
		var tecla = chrome.i18n.getMessage('atalho_' + orkutil.atalhos[i][0]);
		var descricao = chrome.i18n.getMessage(orkutil.atalhos[i][0]);
		descricao = descricao.toLowerCase().replace(tecla.toLowerCase(), '<u>' + tecla + '</u>');
		descricao = descricao[0].toUpperCase() + descricao.substr(1, descricao.length);

		var temp = [];
		temp.push('<dl>');
		temp.push('<dt>' + ((orkutil.atalhos[i][2] == 'paginas') ? 'G + ' : '') + tecla + '</dt>');
		temp.push('<dd>' + descricao + '</dd>');
		temp.push('</dl>');

		if (orkutil.atalhos[i][2] == 'paginas') {
			atalhosPaginas.push(temp.join(''));
		} else if (orkutil.atalhos[i][2] == 'navegacao') {
			atalhosNavegacao.push(temp.join(''));
		}
	}

	_atalhos.push('<div class="atalhos"><h4>' + chrome.i18n.getMessage('paginas') + '</h4>' + atalhosPaginas.join('') + '</div>');
	_atalhos.push('<div class="atalhos"><h4>' + chrome.i18n.getMessage('navegacao') + '</h4>' + atalhosNavegacao.join('') + '</div>');
	_atalhos.push('<div style="clear: both;" /></div></div></div>');

	$('body').append(_atalhos.join(''));
	$(document.createElement('div')).attr( {
		class : 'fechar-modal',
		title : chrome.i18n.getMessage('fechar')
	}).click(orkutil.exibirAtalhos).prependTo('#atalhos > div').append('x');

	$('#atalhos > div').css('backgroundColor', $('.themePrimaryBackgroundColor:first').css('backgroundColor'));
	$('#atalhos > div').css('marginTop', (($(window).height() - $('#atalhos > div').height()) / 2) + 'px');
};

$(window).resize(orkutil.resize);
$(document).keypress(orkutil.keypress);
window.onpopstate = orkutil.onpopstate;

function log(s) {
	if (orkutil.log) {
		console.log(s);
	}
}