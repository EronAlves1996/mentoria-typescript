// Como podemos melhorar o esse código usando TS? 

interface Person {
  nome: string;
  idade: number;
  profissao: string;
}

let pessoa1 = {} as Person;
pessoa1.nome = "maria";
pessoa1.idade = 29;
pessoa1.profissao = "atriz"

let pessoa2 = {} as Person;
pessoa2.nome = "roberto";
pessoa2.idade = 19;
pessoa2.profissao = "Padeiro";

let pessoa3: Person = {
    nome: "laura",
    idade: 32,
    profissao: "Atriz"
};

let pessoa4: Person = {
    nome: "carlos",
    idade: 19,
    profissao: "padeiro"
}
