/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de conteudo_educativo.
 * Data: 21/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.1.10.26
 *******************************************************************************************************************************************************************************************/

const path = require("path")

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo do DAO (MODEL)
const conteudoEducativoDAO = require("../../model/DAO/conteudo_educativo/conteudo_educativo.js")

// import da controller que faz upload dos arquivos para o Azure
const UPLOAD = require("../upload/controller_upload_azure.js")

/* REGRAS DE UPLOAD (as mesmas do front) */
const IMAGEM_TIPOS = ["image/png", "image/jpeg", "image/webp"]
const IMAGEM_MAX = 5 * 1024 * 1024
const ANEXO_EXTENSOES = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt", ".zip", ".png", ".jpg", ".jpeg"]
const ANEXO_MAX = 10 * 1024 * 1024
const ANEXOS_LIMITE = 5

/* FUNÇÕES AUXILIARES */

//a requisição pode ser multipart (com arquivos) ou JSON (sem arquivos)
const tipoAceito = function(contentType){

    let tipo = String(contentType).toUpperCase()

    return tipo.startsWith("MULTIPART/FORM-DATA") || tipo.startsWith("APPLICATION/JSON")
}

//o multer lê o nome do arquivo como latin1: desfaz isso para não gravar "relatÃ³rio.pdf" no lugar de "relatório.pdf"
const corrigirNome = function(nome){

    let texto = String(nome ?? "")
    let corrigido = Buffer.from(texto, "latin1").toString("utf8")

    //se a conversão gerou caractere inválido, o nome já estava certo
    return corrigido.includes("\uFFFD") ? texto : corrigido
}

//tbl_anexo.nome aceita 100 caracteres: encurta o nome mantendo a extensão
const abreviarNome = function(nome, limite = 100){

    if(nome.length <= limite) return nome

    let extensao = path.extname(nome)

    return nome.slice(0, limite - extensao.length) + extensao
}

//categoria chega como array de {id}, array de números ou texto JSON (no multipart). Retorna null se estiver inválida
const lerCategorias = function(valor){

    if(valor === undefined || valor === null || valor === "") return []

    let lista = valor

    if(typeof valor === "string"){
        try {
            lista = JSON.parse(valor)
        } catch (error) {
            return null
        }
    }

    if(!Array.isArray(lista)) lista = [lista]

    let categorias = []

    for(const item of lista){

        let id = (item !== null && typeof item === "object") ? item.id : item

        if(id === undefined || id === null || id === "" || isNaN(id)) return null

        categorias.push({ id: Number(id) })
    }

    //tira repetidas
    return categorias.filter((categoria, i) => categorias.findIndex(c => c.id === categoria.id) === i)
}

//ids dos anexos que devem ser mantidos. undefined = não informado (mantém todos). Retorna false se estiver inválido
const lerIdsAnexos = function(valor){

    if(valor === undefined) return null

    let lista = valor

    if(typeof valor === "string"){
        try {
            lista = JSON.parse(valor)
        } catch (error) {
            return false
        }
    }

    if(!Array.isArray(lista)) return false
    if(lista.some(id => id === null || id === "" || isNaN(id))) return false

    return lista.map(Number)
}

//envia a imagem e os anexos para o Azure. Retorna { img, anexos } ou false se algum envio falhar
const enviarArquivos = async function(arquivos){

    let img = ""
    let anexos = []

    let imagem = arquivos.img?.[0]

    if(imagem){
        img = await UPLOAD.uploadFiles(imagem)
        if(!img) return false
    }

    for(const arquivo of (arquivos.anexos || [])){

        let url = await UPLOAD.uploadFiles(arquivo)
        if(!url) return false

        anexos.push({
            nome: abreviarNome(corrigirNome(arquivo.originalname)),
            endereco_url: url
        })
    }

    return { img, anexos }
}

//anexa categorias e anexos nos conteúdos. Retorna false se o banco falhar
const anexarRelacionados = async function(lista, idConteudo = null){

    let categorias = await conteudoEducativoDAO.selectCategoriasConteudo(idConteudo)
    let anexos = await conteudoEducativoDAO.selectAnexosConteudo(idConteudo)

    if(!categorias || !anexos) return false

    for(const item of lista){
        item.categoria = categorias.filter(c => c.id_conteudo_educativo === item.id).map(c => ({ id: c.id, nome: c.nome }))
        item.anexos = anexos.filter(a => a.id_conteudo_educativo === item.id).map(a => ({ id: a.id, nome: a.nome, endereco_url: a.endereco_url }))
    }

    return true
}

/* FUNÇÕES PARA O CRUD */

//função para inserir um novo dado
const inserirNovaConteudoEducativo = async function(contentType, dados, arquivos){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        if(!tipoAceito(contentType))
            return message.ERROR_CONTENT_TYPE //415

        dados = dados || {}
        arquivos = arquivos || {}

        //valida ANTES de enviar qualquer arquivo para o Azure
        let categorias = lerCategorias(dados.categoria)
        let validando = validarDadosConteudoEducativo(dados, arquivos, categorias)
        if(validando) return validando //400

        let envio = await enviarArquivos(arquivos)
        if(!envio) return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 (erro no envio dos arquivos)

        let conteudoEducativo = {
            nome: String(dados.nome).trim(),
            descricao: dados.descricao === undefined ? null : String(dados.descricao).trim(),
            duracao_leitura: Number(dados.duracao_leitura),
            img: envio.img,
            categoria: categorias,
            anexos: envio.anexos,
            qtde_xp: dados.qtde_xp
        }

        console.log(conteudoEducativo)

        //mandando pro banco (conteúdo + categorias + anexos, tudo ou nada)
        let result = await conteudoEducativoDAO.insertConteudoEducativo(conteudoEducativo)
        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        conteudoEducativo.id = result //criando o atributo ID no Json e colocando o ID gerado no momento do insert

        message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status
        message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
        message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
        message.DEFAULT_MESSAGE.response = conteudoEducativo

        return message.DEFAULT_MESSAGE //201

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 (controller)
    }

}

//função para atualizar um dado
const atualizarConteudoEducativo = async function(id, contentType, dados, arquivos){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //verificando existencia do id
        let validarId = await buscarConteudoEducativoId(id)
        if(!validarId.status) return validarId //400 ou 404

        if(!tipoAceito(contentType))
            return message.ERROR_CONTENT_TYPE

        dados = dados || {}
        arquivos = arquivos || {}

        let categorias = lerCategorias(dados.categoria)
        let validarDados = validarDadosConteudoEducativo(dados, arquivos, categorias)
        if(validarDados) return validarDados

        let existente = validarId.response.conteudoEducativo[0]

        //anexos: o front manda os ids que continuam. Se não mandar nada, mantém todos
        let idsMantidos = lerIdsAnexos(dados.anexos_mantidos)

        if(idsMantidos === false){
            message.ERROR_BAD_REQUEST.field = "[ANEXOS_MANTIDOS] INVALIDO (envie um array de ids)"
            return message.ERROR_BAD_REQUEST
        }

        let idsAtuais = existente.anexos.map(a => a.id)
        let idsManter = idsMantidos === null ? idsAtuais : idsMantidos.filter(idAnexo => idsAtuais.includes(idAnexo))
        let idsRemover = idsAtuais.filter(idAnexo => !idsManter.includes(idAnexo))

        if(idsManter.length + (arquivos.anexos || []).length > ANEXOS_LIMITE){
            message.ERROR_BAD_REQUEST.field = `[ANEXOS] O LIMITE É DE ${ANEXOS_LIMITE} ARQUIVOS`
            return message.ERROR_BAD_REQUEST
        }

        let envio = await enviarArquivos(arquivos)
        if(!envio) return message.ERROR_INTERNAL_SERVER_CONTROLLER

        //imagem: nova (substitui) > removida pelo usuário > mantém a que já existia
        let img = existente.img
        if(arquivos.img?.[0])
            img = envio.img
        else if(String(dados.remover_img).toLowerCase() === "true")
            img = ""

        let conteudoEducativo = {
            id: Number(id),
            nome: String(dados.nome).trim(),
            descricao: dados.descricao === undefined ? null : String(dados.descricao).trim(),
            duracao_leitura: Number(dados.duracao_leitura),
            img: img,
            categoria: categorias,
            anexos: envio.anexos,        //anexos novos
            anexos_remover: idsRemover   //anexos que o usuário tirou
        }

        let result = await conteudoEducativoDAO.updateConteudoEducativo(conteudoEducativo)
        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
        message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
        message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
        message.DEFAULT_MESSAGE.response = conteudoEducativo

        return message.DEFAULT_MESSAGE //200

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }

}

//função para retornar todos os dados
const listarConteudoEducativo = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let result = await conteudoEducativoDAO.selectAllConteudoEducativo()

        if(result){

            if(result.length > 0){

                if(!await anexarRelacionados(result))
                    return message.ERROR_INTERNAL_SERVER_MODEL

                //personalizando o cabeçalho com a mensagem de sucesso
                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.conteudoEducativo = result

                return message.DEFAULT_MESSAGE //retorna o cabeçalho com o "result" que contém os dados

            }else{
                return message.ERROR_NOT_FOUND //404
            }
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL
        }
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para bucar um dado pelo id
const buscarConteudoEducativoId = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //tratando o id, para não mandar conteúdos errados pro banco
        if(id == undefined || id == "" || id == null || isNaN(id)){
            message.ERROR_BAD_REQUEST.field = "[ID] INVÁLIDO"
            return message.ERROR_BAD_REQUEST //400
        }

        let result = await conteudoEducativoDAO.selectByIdConteudoEducativo(id)

        if(result){

            if(result.length > 0){

                if(!await anexarRelacionados(result, result[0].id))
                    return message.ERROR_INTERNAL_SERVER_MODEL

                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.conteudoEducativo = result

                return message.DEFAULT_MESSAGE //200

            }else{
                return message.ERROR_NOT_FOUND
            }
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL
        }

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para excluir um dado
const excluirConteudoEducativo = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let validarId = await buscarConteudoEducativoId(id)
        if(!validarId.status) return validarId //400 ou 404

        //o DAO apaga categorias, anexos e o conteúdo numa transação
        let result = await conteudoEducativoDAO.deleteConteudoEducativo(id)

        if(result){
            return message.SUCCESS_DELETED_ITEM //200 registro excluido
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL //500 (ex.: algum usuário já acessou o conteúdo)
        }

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }

}

//função para validar os dados e os arquivos recebidos na requisição
const validarDadosConteudoEducativo = function(dados, arquivos, categorias){

    let message = JSON.parse(JSON.stringify(config_message))

    let imagem = arquivos.img?.[0]
    let anexos = arquivos.anexos || []

    if(dados.nome == undefined || String(dados.nome).trim() == "" || String(dados.nome).length > 100){
        message.ERROR_BAD_REQUEST.field = "[NOME] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.duracao_leitura === undefined || dados.duracao_leitura === null || dados.duracao_leitura === "" || !Number.isInteger(Number(dados.duracao_leitura)) || Number(dados.duracao_leitura) <= 0){
        message.ERROR_BAD_REQUEST.field = "[DURACAO_LEITURA] INVALIDA (número inteiro maior que 0)"
        return message.ERROR_BAD_REQUEST

    }else if(categorias === null || categorias.length == 0){
        message.ERROR_BAD_REQUEST.field = "[CATEGORIA] INVALIDA (envie ao menos uma categoria)"
        return message.ERROR_BAD_REQUEST

    }else if(imagem && !IMAGEM_TIPOS.includes(imagem.mimetype)){
        message.ERROR_BAD_REQUEST.field = "[IMG] A imagem precisa ser PNG, JPG ou WebP"
        return message.ERROR_BAD_REQUEST

    }else if(imagem && imagem.size > IMAGEM_MAX){
        message.ERROR_BAD_REQUEST.field = "[IMG] A imagem deve ter no máximo 5 MB"
        return message.ERROR_BAD_REQUEST

    }else if(anexos.length > ANEXOS_LIMITE){
        message.ERROR_BAD_REQUEST.field = `[ANEXOS] O limite é de ${ANEXOS_LIMITE} arquivos`
        return message.ERROR_BAD_REQUEST

    }else if(anexos.some(a => !ANEXO_EXTENSOES.includes(path.extname(String(a.originalname)).toLowerCase()))){
        message.ERROR_BAD_REQUEST.field = "[ANEXOS] Formato de arquivo não permitido"
        return message.ERROR_BAD_REQUEST

    }else if(anexos.some(a => a.size > ANEXO_MAX)){
        message.ERROR_BAD_REQUEST.field = "[ANEXOS] Cada arquivo deve ter no máximo 10 MB"
        return message.ERROR_BAD_REQUEST

    }else{
        return false
    }

}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    inserirNovaConteudoEducativo,
    atualizarConteudoEducativo,
    listarConteudoEducativo,
    buscarConteudoEducativoId,
    excluirConteudoEducativo
}
