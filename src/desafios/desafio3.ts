// O código abaixo tem alguns erros e não funciona como deveria. Você pode identificar quais são e corrigi-los em um arquivo TS?

let botaoAtualizar = document.getElementById('atualizar-saldo') as HTMLInputElement;
let botaoLimpar = document.getElementById('limpar-saldo') as HTMLInputElement;
let soma = document.getElementById('soma') as HTMLInputElement;
let campoSaldo = document.getElementById('campo-saldo') as HTMLInputElement;

campoSaldo.innerHTML = '0';

function somarAoSaldo(soma: number): void {
  let saldo: number = Number(campoSaldo.innerHTML);
  saldo += soma;
  campoSaldo.innerHTML = saldo.toString();
}

function limparSaldo(): void {
    campoSaldo.innerHTML = '0';
}

botaoAtualizar.addEventListener('click', function () {
    somarAoSaldo(Number(soma.value));
});

botaoLimpar.addEventListener('click', function () {
    limparSaldo();
});

/**
    <h4>Valor a ser adicionado: <input id="soma"> </h4>
    <button id="atualizar-saldo">Atualizar saldo</button>
    <button id="limpar-saldo">Limpar seu saldo</button>
    <h1>"Seu saldo é: " <span id="campo-saldo"></span></h1>
 */
