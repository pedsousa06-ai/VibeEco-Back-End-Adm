/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de missao_categoria.
 * Data: 17/11/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.1.11.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo do DAO (MODEL)
const missaoCategoriaDAO = require("../../model/DAO/missao_categoria/missao_categoria.js")


//função para inserir dados
const inserirNovoMissaoCategoria = async function(missaoCategoria){

    const message = JSON.parse(JSON.stringify(config_message)) //copia a mensagem para não alterar a original

    try {

        let validar = validarDados(missaoCategoria)

        if(validar){
            return validar // 400 (o retorno da função já é uma mensagem de erro)
        }else{

            let result = await missaoCategoriaDAO.insertMissaoCategoria(missaoCategoria)

            if(result){

                missaoCategoria.id = result //pegando o id do dado cadastrado e adicionando no JSON

                message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                message.DEFAULT_MESSAGE.response = missaoCategoria

            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL //500 (model) item não cadastrado
            }

            return message.DEFAULT_MESSAGE //201
        }

    } catch (error) {
        console.log("Caiu no catch do controller_desafio_categoria.js")
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 (controller)
    }
}

//função para atualizar um dado
const atualizarMissaoCategoria = async function(missaoCategoria, id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let validandoId = await buscarMissaoCategoriaID(id)

        if(validandoId.status){

            //obs.: a variável NÃO pode ter o mesmo nome da função (validarDados), senão dá erro de inicialização
            let validacao = validarDados(missaoCategoria)

            if(!validacao){

                missaoCategoria.id = Number(id)

                let result = await missaoCategoriaDAO.updateMissaoCategoria(missaoCategoria)

                if(result){

                    message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                    message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                    message.DEFAULT_MESSAGE.response = missaoCategoria

                    return message.DEFAULT_MESSAGE //200
                }else{
                    return message.ERROR_INTERNAL_SERVER_MODEL //500 model
                }

            }else{
                return validacao //400 mensagem de erro da própria validação
            }

        }else{
            return validandoId //400 (id inválido) ou 404 (não encontrado) ou 500
        }

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 controller
    }
}

//função para listar todos os dados
const listarMissaoCategoria = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let result = await missaoCategoriaDAO.selectAllMissaoCategoria()

        if(result){

            if(result.length > 0){

                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.missaoCategoria = result

                return message.DEFAULT_MESSAGE

            }else{
                return message.ERROR_NOT_FOUND //404
            }

        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL // 500 (model)
        }

    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500 (controller)
    }
}

//função para buscar um dado pelo id DA LINHA da tabela intermediária
const buscarMissaoCategoriaID = async function(id){

    const message = JSON.parse(JSON.stringify(config_message))

    try {

        if(id == undefined || id == "" || id == null || isNaN(id)){

            message.ERROR_BAD_REQUEST.field = "O campo [ID] está incorreto!"
            return message.ERROR_BAD_REQUEST //400

        }else{

            let result = await missaoCategoriaDAO.selectByIdMissaoCategoria(id)

            if(result){

                if(result.length > 0){

                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                    message.DEFAULT_MESSAGE.response.missaoCategoria = result

                    return message.DEFAULT_MESSAGE

                }else{
                    return message.ERROR_NOT_FOUND //404
                }
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL //500 (model)
            }
        }
    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500 (controller)
    }
}

//função para excluir um dado pelo id DA LINHA da tabela intermediária
const excluirMissaoCategoria = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let verificarId = await buscarMissaoCategoriaID(id)

        if(verificarId.status){

            let result = await missaoCategoriaDAO.deleteMissaoCategoria(id)

            if(result){
                return message.SUCCESS_DELETED_ITEM //200 registro excluido
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL //500 model
            }

        }else{
            return verificarId
        }

    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 controller
    }
}

//função para fazer a validação dos dados recebidos (POST / PUT)
const validarDados = function(dados){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        if(dados.id_missao == undefined || dados.id_missao == "" || dados.id_missao == null || isNaN(dados.id_missao)){

            message.ERROR_BAD_REQUEST.field = "O campo [ID_MISSAO] está incorreto!"
            return message.ERROR_BAD_REQUEST

        }else if(dados.id_categoria == undefined || dados.id_categoria == "" || dados.id_categoria == null || isNaN(dados.id_categoria)){

            message.ERROR_BAD_REQUEST.field = "O campo [ID_CATEGORIA] está incorreto!"
            return message.ERROR_BAD_REQUEST

        }else{
            return false
        }

    } catch (error) {
        return false
    }
}

/* CONTEÚDOS NOVOS DAQUI PRA BAIXO */

//função para excluir os dados relacionados ao desafio (pelo ID DO DESAFIO). Sem vínculos para apagar também é sucesso
const excluirCategoriaIdMissao = async function(idMissao){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let result = await missaoCategoriaDAO.deleteCategoriaByIdMissao(idMissao)

        if(result){
            return message.SUCCESS_DELETED_ITEM //200
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL //500 model
        }

    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 controller
    }
}

//função para buscar as categorias (id e nome) de UM desafio, pelo ID DO DESAFIO
const buscarCategoriasPorIdMissao = async function(idMissao){

    const message = JSON.parse(JSON.stringify(config_message))

    try {

        if(idMissao == undefined || idMissao == "" || idMissao == null || isNaN(idMissao)){

            message.ERROR_BAD_REQUEST.field = "O campo [ID_MISSAO] está incorreto!"
            return message.ERROR_BAD_REQUEST

        }

        let result = await missaoCategoriaDAO.selectCategoriaByIdMissao(idMissao)

        if(result){

            if(result.length > 0){

                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.categoria = result //[{ id, nome }]

                return message.DEFAULT_MESSAGE

            }else{
                return message.ERROR_NOT_FOUND //404
            }
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL //500 model
        }

    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}


//exportando arquivos
module.exports = {
    inserirNovoMissaoCategoria,
    atualizarMissaoCategoria,
    listarMissaoCategoria,
    buscarMissaoCategoriaID,
    excluirCategoriaIdMissao,
    excluirMissaoCategoria,
    buscarCategoriasPorIdMissao
}
