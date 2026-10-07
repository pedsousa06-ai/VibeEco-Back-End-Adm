/********************************************************************************************************************************************************************************************
 * Objetivo: API centralizada para a gestão administrativa, controle de dados e governança da plataforma VibeEco.
 * Data: 02/10/2026
 * Autor: Lucas Kolle
 * Versão: 1.0.10.26
 *******************************************************************************************************************************************************************************************/

/* IMPORTAÇÃO DAS DEPENDÊNCIAS */
const express       = require("express")
const cors          = require("cors")
const bodyParser    = require("body-parser")

//criando um objeto para manipular dados do body da API em formato Json
const bodyParserJSON = bodyParser.json()

//criando um objeto para manipular o express
const app = express()

//conjunto de permissões a serem aplicados no CORS da API
const corsOption = {
    origin: ["*"], //A origrm da requisição (definido por meio do IP (192.168...), quando colocado o "*" fica livre para todas as máquinas)
    methods: "GET, POST, PUT, DELETE, OPTION", //são os verbos permitidos para serem utilizados na API
    allowedHeaders: ["content-type", "Autorizations"] //são permissões do cabeçalho do CORS
}

//configurando as permissões da API atravez do CORS
app.use(cors(corsOption))



/* SESSÃO DE LEVEL_USUARIO */

//importando o arquivo onde estão as rotas da tabela
const level_usuarioRouter = require("./routes/level_usuario.routes.js")

//definindo a rota para acessar as rotas do generoRouter (o cors() é para liberar o acesso a essa rota, caso contrário, o navegador bloqueia por questões de segurança)
app.use("/v1/vibeEco/administrador/levelUser", cors(), level_usuarioRouter) //quando o usuário acessar a rota "/v1/vibeEco/administrador/levelUser" ele vai ser direcionado para o arquivo "genero.routes.js"



/* SESSÃO DE ESCOLARIDADE */

//importando o arquivo onde estão as rotas da tabela
const escolaridadeRouter = require("./routes/escolaridade.routes.js")

//definindo a rota para acessar as rotas do generoRouter (o cors() é para liberar o acesso a essa rota, caso contrário, o navegador bloqueia por questões de segurança)
app.use("/v1/vibeEco/administrador/escolaridade", cors(), escolaridadeRouter) //quando o usuário acessar a rota "/v1/vibeEco/administrador/levelUser" ele vai ser direcionado para o arquivo "genero.routes.js"



/* SESSÃO DE CATEGORIA */

//importando o arquivo onde estão as rotas da tabela
const categoriaRouter = require("./routes/categoria.routes.js")

//definindo a rota para acessar as rotas do generoRouter (o cors() é para liberar o acesso a essa rota, caso contrário, o navegador bloqueia por questões de segurança)
app.use("/v1/vibeEco/administrador/categoria", cors(), categoriaRouter) //quando o usuário acessar a rota "/v1/vibeEco/administrador/levelUser" ele vai ser direcionado para o arquivo "genero.routes.js"



//iniciando uma API para receber requisições
app.listen(8080, function(){ //decidindo a porta para saída do conteúdo
    console.log("API funcionando e aguardando requisições...") //vai mostrar no terminal que a API já está funcionando
})
