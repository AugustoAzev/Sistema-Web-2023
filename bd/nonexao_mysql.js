//importando o msyql
const mysql = require('mysql2');


//criando a conexao com nosso BD
const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'projeto'

});

//Teste conexao
conexao.connect(function (erro) {
    if (erro) throw erro;
    console.log('conexao efetuada com sucesso');
});

//Exportando o modulo de conexao
module.exports = conexao;