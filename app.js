
// importando o express
const express = require('express');

//Importando pasta e modulo de conexao
const conexao = require('./bd/nonexao_mysql');

//importar modulo fileupload
const fileupload = require('express-fileupload');

//importando express-handlebars
const { engine } = require('express-handlebars');



//file System
const fs = require('fs');

//adicionar APP
const app = express();

//habilitando o uploadfile
app.use(fileupload());

app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));

//adicionar o estilo.css
app.use('/css', express.static('./css'));

//referenciar a pasta imagens
app.use('/imagens', express.static('./imagens'));

//configuração do express-handlebars
// app.engine('handlebars', engine());
app.engine('handlebars', engine({
    helpers:{
        //funcao auxiliar para verificar igualdade
        condicionalIgualdade: function(parametro1, parametro2, options){
            return parametro1 == parametro2 ? options.fn(this) : options.inverse(this);
        }
    }
}));

app.set('view engine', 'handlebars');
app.set('views', './views');

// Manipulação de conexao de dados via rotas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));




// rota principal
app.get('/', function (req, res) {
    //sql
    let sql = `SELECT * FROM produto`;

    //executando o SQL
    conexao.query(sql, function (erro, retorno) {
        res.render('formulario', { produto: retorno });
    });
});

//Rota principal contendo a situacao
app.get('/:situacao', function (req, res) {
    //sql
    let sql = `SELECT * FROM produto`;

    //executando o SQL
    conexao.query(sql, function (erro, retorno) {
        res.render('formulario', {produto:retorno, situacao:req.params.situacao});
    });
});

//Rota para pesquisa
app.post('/pesquisa', function(req, res){
    //Obter o termo pesquisado
    let termo = req.body.termo;
   //SQL
     let sql = `SELECT * FROM produto WHERE nome LIKE '%${termo}%'`;

    //Executar o comando sql
    conexao.query(sql, function(erro, retorno){
    let semRegistros = retorno.length == 0 ? true:false;
        res.render('lista', {produto:retorno, semRegistros:semRegistros});
    }); 

    //serviço
    //servico.pesquisa(req, res);
});

//rota de cadastrar produto
app.post('/cadastrar', function (req, res) {
    try {
        //obter os dados 
        let nome = req.body.nome;
        let valor = req.body.valor;
        let imagem = req.files.imagem.name;
        let categoria = req.body.categoria;

        //validar o nome do produto
        if (nome == '' || valor == '' || isNaN == (valor) || categoria == '') {
            res.redirect('/falhaCadastro');
        } else {
            //estrutura sql
            let sql = `INSERT INTO produto (nome, valor, imagem, categoria) VALUES ('${nome}', ${valor}, '${imagem}', '${categoria}')`;

            //executar comando SQL
            conexao.query(sql, function (erro, retorno) {
                //caso ocorra error
                if (erro) throw erro;

                //caso ocorra o cadastro
                req.files.imagem.mv(__dirname + '/imagens/' + req.files.imagem.name);
                console.log(retorno)
            });

            // retornar para a rota principal
            res.redirect('/okCadastro');
        }
    } catch (erro) {
        res.redirect('/falhaCadastro');
    }

});


//rota para remover produtos
app.get('/remover/:codigo&:imagem', function(req, res){
    try {
        //sql 
        let sql = `DELETE FROM produto WHERE codigo = ${req.params.codigo}`;

        //executar sql
        conexao.query(sql, function(erro, retorno){
            //em caso de falha
            if(erro) throw erro;

            //em caso de funcione
            fs.unlink(__dirname+'/imagens/'+req.params.imagem, (erro_imagem)=>{
                console.log('falha ao remover a imagem');
            });
        });
        //redirecionar
        res.redirect('/okRemover');

    }catch(erro){
        res.redirect('/falhaRemover');
    }


});

// Rota para redirecionar para o formulário de alteração/edição
app.get('/formularioEditar/:codigo', function(req, res){
    
    // SQL
    let sql = `SELECT * FROM produto WHERE codigo = ${req.params.codigo}`;

    // Executar o comando SQL
    conexao.query(sql, function(erro, retorno){
        // Caso haja falha no comando SQL
        if(erro) throw erro;

        // Caso consiga executar o comando SQL
        res.render('formularioEditar', {produto:retorno[0]});
    });

});

//Rota para editar produtos
app.post('/editar', function(req, res){
    //obter os dados 
    let nome = req.body.nome;
    let valor = req.body.valor;
    let codigo = req.body.codigo;
    let categoria = req.body.categoria;
    let imagem = req.body.nomeImagem;

    //validar nome do produto e valor
    if(nome == ''|| valor == '' || isNaN(valor) || categoria == ''){
        res.redirect('/falhaEdicao');
    }else{
        //definir o tipo de edicao
        try{
            //objeto imagem
            let imagem = req.files.imagem;

            //sql
            let sql = `UPDATE produto SET nome='${nome}', valor=${valor}, imagem='${imagem.name}', categoria='${categoria}' WHERE codigo=${codigo}`;
             // Executar comando SQL
             conexao.query(sql, function(erro, retorno){
                // Caso falhe o comando SQL
                if(erro) throw erro;

                // Remover imagem antiga
                fs.unlink(__dirname+'/imagens/'+nomeImagem, (erro_imagem)=>{
                    console.log('Falha ao atualizar a imagem.');
                });

                // Cadastrar nova imagem
                imagem.mv(__dirname+'/imagens/'+imagem.name);
            });
        }catch(erro){
            
            // SQL
            let sql = `UPDATE produto SET nome='${nome}', valor=${valor} WHERE codigo=${codigo}`;
        
            // Executar comando SQL
            conexao.query(sql, function(erro, retorno){
                // Caso falhe o comando SQL
                if(erro) throw erro;
            });
        }

        // Redirecionamento
        res.redirect('/okEdicao');
    }
});

//rota de listagem
app.get('/listar/:categoria', function(req,res){
   
    listagemProdutos(req, res);

})


// Função para exibir a listagem de produtos
function listagemProdutos(req, res){
    //opbter categoria
    let categoria = req.params.categoria;
    //sql
    let sql = '';

    if(categoria == 'todos'){
        sql = 'SELECT * FROM produto'; //ORDER BY RAND()

    }else{
        sql = `SELECT * FROM produto WHERE categoria = '${categoria}'`; //ORDER BY codigo DESC
    }
    //executar comandos SQL
    conexao.query(sql, function(erro, retorno){
            res.render('lista', {produto:retorno});
    })
}
// Função para realizar a pesquisa de produtos
function pesquisa(req, res){
    //obter o termo pesquisado
    let termo = req.body.termo;
    //sql
    let sql = `SELECT * FROM produto WHERE nome LIKE '%${termo}%'`;

    //executar o comando sql
    conexao.query(sql, function(erro, retorno){
        let semRegistros = retorno.length == 0 ? true:false;
        res.render('lista', {produto:retorno, semRegistros:semRegistros});
    });
}

//servidor
app.listen(8080);