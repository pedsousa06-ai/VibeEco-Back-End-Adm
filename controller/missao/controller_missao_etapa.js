
/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de missao_etapa.
 * Data: 17/11/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.1.11.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo do DAO (MODEL)
const missaoEtapaDAO = require("../../model/DAO/missao_etapa/missao_etapa.js")


//função para inserir dados
const inserirNovaMissaoEtapa = async function(missaoEtapa){

    const message = JSON.parse(JSON.stringify(config_message)) //copia a mensagem para não alterar a original

    try {

        let validar = validarDados(missaoEtapa)

        if(validar){
            return validar
        }else{

            let result = await missaoEtapaDAO.insertMissaoEtapa(missaoEtapa)

            if(result){

                missaoEtapa.id = result

                message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                message.DEFAULT_MESSAGE.response = missaoEtapa

            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL
            }

            return message.DEFAULT_MESSAGE
        }

    } catch (error) {
        console.log("Caiu no catch do controller_missao_etapa.js")
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para atualizar um dado
const atualizarMissaoEtapa = async function(missaoEtapa, id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let validandoId = await buscarMissaoEtapaID(id)

        if(validandoId.status){

            let validacao = validarDados(missaoEtapa)

            if(!validacao){

                missaoEtapa.id = Number(id)

                let result = await missaoEtapaDAO.updateMissaoEtapa(missaoEtapa)

                if(result){

                    message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                    message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                    message.DEFAULT_MESSAGE.response = missaoEtapa

                    return message.DEFAULT_MESSAGE
                }else{
                    return message.ERROR_INTERNAL_SERVER_MODEL
                }

            }else{
                return validacao
            }

        }else{
            return validandoId
        }

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para listar todos os dados
const listarMissaoEtapa = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let result = await missaoEtapaDAO.selectAllMissaoEtapa()

        if(result){

            if(result.length > 0){

                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.missaoEtapa = result

                return message.DEFAULT_MESSAGE

            }else{
                return message.ERROR_NOT_FOUND
            }

        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL
        }

    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para buscar um dado pelo id DA LINHA da tabela intermediária
const buscarMissaoEtapaID = async function(id){

    const message = JSON.parse(JSON.stringify(config_message))

    try {

        if(id == undefined || id == "" || id == null || isNaN(id)){

            message.ERROR_BAD_REQUEST.field = "O campo [ID] está incorreto!"
            return message.ERROR_BAD_REQUEST

        }else{

            let result = await missaoEtapaDAO.selectByIdMissaoEtapa(id)

            if(result){

                if(result.length > 0){

                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                    message.DEFAULT_MESSAGE.response.missaoEtapa = result

                    return message.DEFAULT_MESSAGE

                }else{
                    return message.ERROR_NOT_FOUND
                }
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL
            }
        }
    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para excluir um dado pelo id DA LINHA da tabela intermediária
const excluirMissaoEtapa = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let verificarId = await buscarMissaoEtapaID(id)

        if(verificarId.status){

            let result = await missaoEtapaDAO.deleteMissaoEtapa(id)

            if(result){
                return message.SUCCESS_DELETED_ITEM
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL
            }

        }else{
            return verificarId
        }

    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para fazer a validação dos dados recebidos (POST / PUT)
const validarDados = function(dados){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        if(dados.id_missao == undefined || dados.id_missao == "" || dados.id_missao == null || isNaN(dados.id_missao)){

            message.ERROR_BAD_REQUEST.field = "O campo [ID_MISSAO] está incorreto!"
            return message.ERROR_BAD_REQUEST

        }else if(dados.titulo == undefined || dados.titulo == "" || dados.titulo == null || !isNaN(dados.titulo)){

            message.ERROR_BAD_REQUEST.field = "O campo [TITULO] está incorreto!"
            return message.ERROR_BAD_REQUEST

        }else if(dados.xp == undefined || dados.xp == "" || dados.xp == null || isNaN(dados.xp)){

            message.ERROR_BAD_REQUEST.field = "O campo [XP] está incorreto!"
            return message.ERROR_BAD_REQUEST

        }else if(dados.ordem == undefined || dados.ordem == "" || dados.ordem == null || isNaN(dados.ordem)){

            message.ERROR_BAD_REQUEST.field = "O campo [ORDEM] está incorreto!"
            return message.ERROR_BAD_REQUEST

        }else{
            return false
        }

    } catch (error) {
        return false
    }
}

/* CONTEÚDOS NOVOS DAQUI PRA BAIXO */

//função para excluir os dados relacionados à etapa pelo ID DA MISSÃO. Sem vínculos para apagar também é sucesso
const excluirEtapaIdMissao = async function(idMissao){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let result = await missaoEtapaDAO.deleteEtapaByIdMissao(idMissao)

        if(result){
            return message.SUCCESS_DELETED_ITEM
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL
        }

    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para buscar as etapas (id e nome) de UMA missão, pelo ID DA MISSÃO
const buscarEtapasPorIdMissao = async function(idMissao){

    const message = JSON.parse(JSON.stringify(config_message))

    try {

        if(idMissao == undefined || idMissao == "" || idMissao == null || isNaN(idMissao)){

            message.ERROR_BAD_REQUEST.field = "O campo [ID_MISSAO] está incorreto!"
            return message.ERROR_BAD_REQUEST

        }

        let result = await missaoEtapaDAO.selectEtapaByIdMissao(idMissao)

        if(result){

            if(result.length > 0){

                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.etapa = result

                return message.DEFAULT_MESSAGE

            }else{
                return message.ERROR_NOT_FOUND
            }
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL
        }

    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}


//exportando arquivos
module.exports = {
    inserirNovaMissaoEtapa,
    atualizarMissaoEtapa,
    listarMissaoEtapa,
    buscarMissaoEtapaID,
    excluirEtapaIdMissao,
    excluirMissaoEtapa,
    buscarEtapasPorIdMissao
}
