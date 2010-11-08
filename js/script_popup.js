var orkutil = {
	log : true
}

$(document).ready(function() {
	$('#buscar input[type=text]').focus();

	$('.adicionar-agenda').click(function() {
		_gaq.push( [ '_trackEvent', 'Links', 'clicked', 'Adicionar na agenda' ]);
	});
	
	$('#buscar input[type=text]').attr('placeholder', chrome.i18n.getMessage('buscar'));
	$('#buscar input[type=submit]').attr('value', chrome.i18n.getMessage('buscar_orkut'));

	$('#buscar').submit(function() {
		var texto = $('#buscar input[type=text]').val();
		if (texto == '') {
			texto.focus();
			return false;
		}

		var opcao = $('#buscar input[type=radio]:checked').val();
		var url = '';

		if (opcao == 'M') {
			url = 'http://www.orkut.com/Main#FriendsList?origin=Orkutil&q=' + texto;
		} else {
			url = 'http://www.orkut.com/Main#UniversalSearch?origin=Orkutil&q=' + texto + '&searchFor=' + opcao;
		}

		log('Criando aba: ' + url);
		chrome.tabs.create( {
			'url' : url
		});

		_gaq.push( [ '_trackEvent', 'Buscar', 'submitted', opcao ]);
		return false;
	});
});

function log(s) {
	if (orkutil.log) {
		console.log(s);
	}
}