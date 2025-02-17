// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu 
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?

// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela

// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction


// DECLARING INTERFACES

interface ListaFilmes {
  page: number;
  results: Array<itemFilme>;
  total_pages: number;
  total_results: number;
}

interface itemFilme {
  original_title: string;
  id: number;
}

interface HTTPRequest {
  url: string,
  method: string,
  body?: request | string
}

interface requestLogin {
  username: string,
  password: string,
  request_token: string,
}

interface requestSearch {
  name: string;
  description: string;
  language: string
}

interface requestAddFilm {
  media_id: string;
}

interface resultRequestToken {
  request_token: string;
}

interface Session {
  session_id: string;
}

interface accountDetails {
  id:string;
}

//DECLARING TYPES

type request = requestLogin | requestSearch | requestAddFilm;


//DECLARING CLASSES

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


//DECLARING VARIABLES

let apiKey: string;
let requestToken: string;
let username: string;
let password: string;
let sessionId: string;
let listId: string = '7101979';

let loginButton = document.getElementById('login-button') as HTMLInputElement;
let searchButton = document.getElementById('search-button') as HTMLInputElement;
let searchContainer = document.getElementById('search-container') as HTMLInputElement;
const createListButton = document.getElementById('create-list-button') as HTMLButtonElement;

//DECLARING FUNCTIONS

loginButton.addEventListener('click', async () => {
  await criarRequestToken();
  await logar();
  await criarSessao();
  await pegarTodasAsListas();
})

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
        let button: HTMLButtonElement = document.createElement('button');

        button.classList.add("add-to-list-button");
        button.textContent = "Adicionar em uma lista";
        button.dataset.filmeId = item.id.toString();

        button.addEventListener('click', (e)=>{
          if(e){
            let filmeId: string = (e.target as HTMLButtonElement).dataset.filmeId as string;
            const lists = document.getElementById('show-lists') as HTMLElement;
            const filmButtons = document.getElementsByClassName('add-to-list-button') as HTMLCollectionOf<HTMLButtonElement>;

            for(let btn of Array.from(filmButtons)){
              btn.style.display = 'none';
            }

            console.log(lists);

            for(let list of Array.from(lists.getElementsByTagName('ul')[0].childNodes)){
              let buttonList: HTMLButtonElement = document.createElement('button');
              buttonList.classList.add('add-to-this-list-button');
              buttonList.textContent = "Adicionar filme a esta lista";
              buttonList.dataset.listId = (list as HTMLElement).dataset.listId;

              buttonList.addEventListener('click', async (e)=>{
                const listButtons = document.getElementsByClassName('add-to-this-list-button');
                try{
                  await adicionarFilmeNaLista(filmeId, (e.target as HTMLButtonElement).dataset.listId as string);
                  alert("Adicionado com sucesso");
                  for (let n of Array.from(listButtons)){
                    n.remove();
                  }
                  for (let btn of Array.from(filmButtons)){
                    btn.style.display = "inline";
                  }
                }catch (e) {
                  console.log(e);
                  alert("algo inesperado ocorreu");
                }
              });
              list.appendChild(buttonList);
            }
          }
        });

        li.appendChild(document.createTextNode(item.original_title));
        li.appendChild(button);
        ul.appendChild(li)
      }
    }
  }
  searchContainer.appendChild(ul);
});

createListButton.addEventListener('click', ()=>{
  createListButton.remove();

  const listsContainer = document.getElementById('create-list') as HTMLElement;
  const nome: HTMLInputElement = document.createElement('input');
  const descricao: HTMLInputElement = document.createElement('input');
  const criarListaBotao: HTMLButtonElement = document.createElement('button');

  nome.placeholder = 'nome';
  descricao.placeholder = 'descricao';
  criarListaBotao.textContent = 'Criar Nova Lista';

  criarListaBotao.addEventListener('click', async ()=>{
    if(!(nome.value && descricao.value)) alert("Nome e/ou descricao são obrigatorios");
    else {
      try{
        await criarLista(nome.value, descricao.value);
        nome.remove();
        descricao.remove();
        criarListaBotao.remove();
        listsContainer.appendChild(createListButton);
        pegarTodasAsListas();
      } catch (e) {
        if(e.status !== 200){
          alert("Algo deu errado! Verifique se está tudo certo e tente novamente!");
        }
      }
    }
  });

  listsContainer.append(nome, descricao, criarListaBotao);
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

async function criarSessao() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
      method: "GET"
  }) as Session;
  console.log(result);
  sessionId = result.session_id;
}

async function criarLista(nomeDaLista: string, descricao: string) {
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

async function adicionarFilmeNaLista(filmeId: string, listaId: string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
      method: "POST",
    body: {
      media_id: filmeId
    }
  })
  console.log(result);
}

async function pegarLista(idList: string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${idList}?api_key=${apiKey}`,
      method: "GET"
  }) as {items: Array<{original_title: string}>};
  let list: string = "";
  for(let items of result.items){
    list += items.original_title + "\n";
  };
  alert(list);
}

async function pegarTodasAsListas() {
  let getAccountDetails = await HttpClient.get({   
    url:`https://api.themoviedb.org/3/account?api_key=${apiKey}&session_id=${sessionId}`,
      method: "GET"
  }) as accountDetails;

  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/account/${getAccountDetails.id}/lists?api_key=${apiKey}&language=pt-BR&session_id=${sessionId}&page=1`,
      method: "GET"
  }) as {results: Array<{name:string, description:string, id: number}>};

  const showLists = document.getElementById('show-lists') as HTMLElement;
  const ul = document.createElement('ul');

  showLists.innerHTML = "";

  for(let item in result.results){
    let newLi: HTMLElement = document.createElement('li');
    let button: HTMLButtonElement = document.createElement('button');

    newLi.textContent = result.results[item].name;
    newLi.title = result.results[item].description;
    newLi.dataset.listId = result.results[item].id.toString();

    button.textContent = "Mostrar Lista";
    button.dataset.listId = result.results[item].id.toString();

    button.addEventListener('click', e=>{
      pegarLista((e.target as HTMLButtonElement).dataset.listId as string);
    });

    newLi.appendChild(button);
    ul.appendChild(newLi);
  }

  showLists.appendChild(ul);
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
