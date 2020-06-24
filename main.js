var parametros;

function start(){
    window.addEventListener('load', windowLoaded);
    window.addEventListener('popstate', urlUpdated);
}

function urlUpdated(){
    updateParametros();
    atualizaSecao();
}

function $(id){
    return document.getElementById(id);
}

function windowLoaded(){
    updateParametros();

    $('btnJogar').addEventListener('click', function(){
        mudarSecao('cartela', true);
        iniciaCartela(true);
    });

    $('btnCantarNumeros').addEventListener('click', function(){
        mudarSecao('cantar', true);
    });

    $('novaCartela').addEventListener('click', function(){
        iniciaCartela(true);
    });

    document.querySelectorAll('#cartela_bingo td').forEach(function(celula){
        celula.addEventListener('click', celulaClicada);
    });

    atualizaSecao();
}

function atualizaSecao(){
    var secao = parametros.mode;

    switch(parametros.mode){
        case 'cantar':
            break;
        case 'cartela':
            iniciaCartela();
            break;
        default:
            secao = 'start';
            break;
    }

    mudarSecao(secao);
}

function updateParametros(){
    var query = window.location.search,
        params = {};

    if(query){
        if(query[0] == '?')
            query = query.substr(1);

        query.split('&').map(paramValue => paramValue.split('='))
            .forEach(function(paramValue){
                params[paramValue[0]] = decodeURIComponent(paramValue[1]);
            });
    }

    parametros = params;
}

function updateUrl(parametros, sobrescrever){
    var url = document.location.origin + document.location.pathname + '?';
    var primeiro = true;
    for(var p in parametros){
        if(parametros.hasOwnProperty(p)){

            if(!primeiro)
                url += '&';

            url += encodeURIComponent(p) + '=' + encodeURIComponent(parametros[p]);

            if(primeiro)
                primeiro = false;
        }
    }

    if(!sobrescrever)
        history.pushState(null, null, url);
    else
        history.replaceState(null, null, url);

    updateParametros();
}

function mudarSecao(secao, atualizaUrl){
    document.querySelectorAll('.secao').forEach(function(secao){
        secao.style.display = '';
    });

    $(secao).style.display = 'block';

    if(atualizaUrl){
        updateUrl({
            mode: secao
        });
    }
}

function iniciaCartela(forcarNova){
    var cartela,
        novaCartela = true,
        marcados = [];

    forcarNova = !!forcarNova;

    if(parametros.cartela && !forcarNova){
        cartela = JSON.parse(atob(parametros.cartela))
        novaCartela = false;

        if(parametros.marcados)
            marcados = JSON.parse(atob(parametros.marcados));
    }

    var nova = atualizaCartela(cartela, marcados);

    if(novaCartela){
        updateUrl(gerarParametros({
            cartela: btoa(JSON.stringify(nova)),
            marcados: btoa(JSON.stringify(marcados))
        }), !forcarNova);
    }
}

function celulaClicada(event){
    var celula = event.target;
    
    if(celula.id != 'joker'){
        var marcados = JSON.parse(atob(parametros.marcados));
        if(celula.classList.contains('marcado')){
            celula.classList.remove('marcado');
            
            var index = marcados.indexOf(parseInt(celula.innerText));
            if(index > -1)
                marcados.splice(index, 1);
        }
        else{
            celula.classList.add('marcado');
            marcados.push(parseInt(celula.innerText));
        }

        parametros.marcados = btoa(JSON.stringify(marcados));
        updateUrl(parametros, true);
    }
}

function atualizaCartela(cartela, marcados){
    if(!cartela){
        var colunas = [
            [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
            [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
            [31,32,33,34,35,36,37,38,39,40,41,42,43,44,45],
            [46,47,48,49,50,51,52,53,54,55,56,57,58,59,60],
            [61,62,63,64,65,66,67,68,69,70,71,72,73,74,75]
        ];

        cartela = colunas.map(function(coluna){
            return shuffle(coluna).slice(0, 5);
        });
    }

    document.querySelectorAll('#cartela_bingo td').forEach(function(celula, index){
        var celulaLinha = Math.floor(index / 5),
            celulaColuna = index % 5,
            valor = cartela[celulaColuna][celulaLinha];

        if(marcados && marcados.indexOf(valor) > -1)
            celula.classList.add('marcado');
        else
            celula.classList.remove('marcado');

        if(celulaLinha != 2 || celulaColuna != 2){
            celula.innerText = valor;
        }
    });

    return cartela;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

function gerarParametros(parametrosAdicionais, mode){
    var novosParametros = {
        mode: mode || parametros.mode,
    };

    for(var p in parametrosAdicionais){
        if(parametrosAdicionais.hasOwnProperty(p))
            novosParametros[p] = parametrosAdicionais[p];
    }

    return novosParametros;
}

start();