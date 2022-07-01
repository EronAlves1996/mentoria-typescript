// Como podemos rodar isso em um arquivo .ts sem causar erros? 

interface Employee {
  code:number;
  name: string;
}

let employee = {} as Employee;
employee.code = 10;
employee.name = "John";
