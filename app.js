// Carregando as variáveis de ambiente
require("dotenv").config()

// Importação das dependências
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const multer = require("multer")

// Configuração do armazenamento de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads")
    }
})

// Instância do Multer
const upload = multer({ storage: storage })

// Manipulador de dados JSON
const bodyParserJSON = bodyParser.json()

// Criando a aplicação Express
const app = express()

// Configurações do CORS
const corsOption = {
    origin: "*",
    methods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-access-token"
    ]
}

// Configurando as permissões da API
app.use(cors(corsOption))

// Configurando o recebimento de JSON
app.use(bodyParserJSON)

// Proteção da API com JWT
const { protegerApi } = require("./middleware/middlewareJWT.js")

// Todas as rotas administrativas exigem token,
// exceto login e recuperação de acesso.
app.use("/v1/vibeEco/administrador", protegerApi)


// ==========================================
// SESSÃO DE LEVEL_USUARIO
// ==========================================

const level_usuarioRouter = require("./routes/level_usuario.routes.js")

app.use(
    "/v1/vibeEco/administrador/levelUser",
    level_usuarioRouter
)


// ==========================================
// SESSÃO DE ESCOLARIDADE
// ==========================================

const escolaridadeRouter = require("./routes/escolaridade.routes.js")

app.use(
    "/v1/vibeEco/administrador/escolaridade",
    escolaridadeRouter
)


// ==========================================
// SESSÃO DE CATEGORIA
// ==========================================

const categoriaRouter = require("./routes/categoria.routes.js")

app.use(
    "/v1/vibeEco/administrador/categoria",
    categoriaRouter
)


// ==========================================
// SESSÃO DE INSTITUIÇÃO
// ==========================================

const instituicaoRouter = require("./routes/instituicao.routes.js")

app.use(
    "/v1/vibeEco/administrador/instituicao",
    instituicaoRouter
)


// ==========================================
// SESSÃO DE PREMIAÇÃO
// ==========================================

const premiacaoRouter = require("./routes/premiacao.routes.js")

app.use(
    "/v1/vibeEco/administrador/premiacao",
    premiacaoRouter
)


// ==========================================
// SESSÃO DE MISSÃO
// ==========================================

const missaoRouter = require("./routes/missao.routes.js")

app.use(
    "/v1/vibeEco/administrador/missao",
    missaoRouter
)

const dificuldadeRoutes = require("./routes/dificuldade.routes.js") 
// ==========================================
// SESSÃO DE DESAFIO
// ==========================================

const desafioRouter = require("./routes/desafio.routes.js")

app.use(
    "/v1/vibeEco/administrador/desafio",
    desafioRouter
)


// ==========================================
// SESSÃO DE USUÁRIO
// ==========================================

const usuarioRouter = require("./routes/usuario.routes.js")

app.use(
    "/v1/vibeEco/administrador/usuario",
    usuarioRouter
)


// ==========================================
// SESSÃO DE CONQUISTA
// ==========================================

const conquistaRouter = require("./routes/conquista.routes.js")

app.use(
    "/v1/vibeEco/administrador/conquista",
    conquistaRouter
)


// ==========================================
// SESSÃO DE ANEXO
// ==========================================

const anexoRouter = require("./routes/anexo.routes.js")

app.use(
    "/v1/vibeEco/administrador/anexo",
    anexoRouter
)


// ==========================================
// SESSÃO DE OFENSIVA
// ==========================================

const ofensivaRouter = require("./routes/ofensiva.routes.js")

app.use(
    "/v1/vibeEco/administrador/ofensiva",
    ofensivaRouter
)


// ==========================================
// SESSÃO DE DASHBOARD (Início)
// ==========================================

const dashboardRoutes = require("./routes/dashboard.routes.js")

app.use(
    "/v1/vibeEco/administrador/dashboard",
    dashboardRoutes
)


// ==========================================
// SESSÃO DE CONTEÚDO EDUCATIVO
// ==========================================

const conteudoEducativoRouter = require("./routes/conteudo_educativo.routes.js")

app.use(
    "/v1/vibeEco/administrador/conteudoEducativo",
    conteudoEducativoRouter
)


// ==========================================
// SESSÃO DE RECOMPENSA
// ==========================================

const recompensaRouter = require("./routes/recompensa.routes.js")

app.use(
    "/v1/vibeEco/administrador/recompensa",
    recompensaRouter
)


// ==========================================
// SESSÃO DE USUÁRIO ADMINISTRADOR
// ==========================================

const usuarioADMRouter = require("./routes/usuario_adm.routes.js")

app.use(
    "/v1/vibeEco/administrador/usuarioADM",
    usuarioADMRouter
)


const progressoRoutes = require("./routes/progresso.routes.js")
app.use("/v1/vibeEco/administrador/progresso", progressoRoutes)

app.use("/v1/vibeEco/administrador/dificuldade", dificuldadeRoutes) 
// ==========================================
// SESSÃO DE POST
// ==========================================

const postRouter = require("./routes/post.routes.js")

app.use(
    "/v1/vibeEco/administrador/post",
    postRouter
)


// ==========================================
// INICIALIZAÇÃO DA API
// ==========================================

const PORT = process.env.PORT || 8080

app.listen(PORT, function () {
    console.log(`API funcionando e aguardando requisições na porta ${PORT}...`)
})