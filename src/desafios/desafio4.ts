// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu 
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?

// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela

// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction

let apiKey: string;
let requestToken: string;
let username: string;
let password: string;
let sessionId: string;
let listId: string = '7101979';

let loginButton = document.getElementById('login-button') as HTMLInputElement;
let searchButton = document.getElementById('search-button') as HTMLInputElement;
let searchContainer = document.getElementById('search-container') as HTMLInputElement;

loginButton.addEventListener('click', async () => {
  await criarRequestToken();
  await logar();
  await criarSessao();
})

interface ListaFilmes {
  page: number;
  results: Array<itemFilme>;
  total_pages: number;
  total_results: number;
}

interface itemFilme {
  original_title: string;
}

searchButton.addEventListener('click', async () => {
  let lista = document.getElementById("lista") as HTMLElement;
  
  if (lista) {
    lista.outerHTML = "";
  }

  let query: string = (document.getElementById('search') as HTMLInputElement).value;
  let listaDeFilmes = await procurarFilme(query) as ListaFilmes;
  let ul = document.createElement('ul');
  ul.id = "lista";

  if(typeof(listaDeFilmes) === 'object' && listaDeFilmes){
    if('results' in listaDeFilmes){
      for (const item of listaDeFilmes.results) {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(item.original_title))
        ul.appendChild(li)
      }
    }
  }
  searchContainer.appendChild(ul);
})

function preencherSenha() {
  password = (document.getElementById('senha') as HTMLInputElement).value;
  validateLoginButton();
}

function preencherLogin() {
  username = (document.getElementById('login') as HTMLInputElement).value;
  validateLoginButton();
}

function preencherApi() {
  apiKey = (document.getElementById('api-key') as HTMLInputElement).value;
  validateLoginButton();
}

function validateLoginButton() {
  if (password && username && apiKey) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

interface HTTPRequest {
  url: string,
  method: string,
  body?: login | string
}

interface login {
  username: string,
  password: string,
  request_token: string
}

class HttpClient {
  static async get({url, method, body}: HTTPRequest) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }

      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        body = JSON.stringify(body);
      }
      request.send(body);
    })
  }
}

async function procurarFilme(query: string) {
  query = encodeURI(query);
  console.log(query);
  let result: unknown = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
      method: "GET"
  });
  console.log(result);
  return result;
}

async function adicionarFilme(filmeId: string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
      method: "GET"
  })
  console.log(result);
}

interface resultRequestToken {
  request_token: string;
}

async function criarRequestToken () {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
      method: "GET"
  }) as resultRequestToken;

  requestToken = result.request_token;
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
      method: "POST",
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`
    }
  })
}

interface Session {
  session_id: string;
}

async function criarSessao() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
      method: "GET"
  }) as Session;
  sessionId = result.session_id;
}

async function criarLista(nomeDaLista, descricao) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
      method: "POST",
    body: {
      name: nomeDaLista,
      description: descricao,
      language: "pt-br"
    }
  })
  console.log(result);
}

async function adicionarFilmeNaLista(filmeId, listaId) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
      method: "POST",
    body: {
      media_id: filmeId
    }
  })
  console.log(result);
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
      method: "GET"
  })
  console.log(result);
}

{/* <div style="display: flex;">
    <div style="display: flex; width: 300px; height: 100px; justify-content: space-between; flex-direction: column;">
    <input id="login" placeholder="login" onchange="preencherlogin(event)">
    <input id="senha" placeholder="senha" type="password" onchange="preenchersenha(event)">
    <input id="api-key" placeholder="api key" onchange="preencherapi()">
    <button id="login-button" disabled>login</button>
    </div>
    <div id="search-container" style="margin-left: 20px">
    <input id="search" placeholder="escreva...">
    <button id="search-button">pesquisar filme</button>
    </div>
    </div>*/}
