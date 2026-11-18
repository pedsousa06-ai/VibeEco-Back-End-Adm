const config_message = require("../modulo/configMessages.js")
const dificuldadeDAO = require("../../model/DAO/dificuldade/dificuldade.js")

const inserirNovaDificuldade = async function(contentType, dificuldade){
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        if(String(contentType).toUpperCase() == "APPLICATION/JSON"){
            let validando = await validarDadosDificuldade(dificuldade)
            if(!validando){
                let result = await dificuldadeDAO.insertDificuldade(dificuldade)
                if(result){
                    dificuldade.id = result
                    message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                    message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                    message.DEFAULT_MESSAGE.response = dificuldade
                    return message.DEFAULT_MESSAGE
                }else{
                    return message.ERROR_INTERNAL_SERVER_MODEL
                }
            }else{
                return validando
            }
        }else{
            return message.ERROR_CONTENT_TYPE
        }
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarDificuldade = async function(id, contentType, dificuldade){
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validarId = await buscarDificuldadeId(id)
        if(validarId.status){
            if(String(contentType).toUpperCase() == "APPLICATION/JSON"){
                let validarDados = await validarDadosDificuldade(dificuldade)
                if(!validarDados){
                    dificuldade.id = Number(id)
                    let result = await dificuldadeDAO.updateDificuldade(dificuldade)
                    if(result){
                        message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                        message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                        message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                        message.DEFAULT_MESSAGE.response = dificuldade
                        return message.DEFAULT_MESSAGE
                    }else{
                        return message.ERROR_INTERNAL_SERVER_MODEL
                    }
                }else{
                    return validarDados
                }
            }else{
                return message.ERROR_CONTENT_TYPE
            }
        }else{
            return validarId
        }
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarDificuldade = async function(){
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let result = await dificuldadeDAO.selectAllDificuldade()
        if(result){
            if(result.length > 0){
                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.dificuldade = result
                return message.DEFAULT_MESSAGE
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

const buscarDificuldadeId = async function(id){
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        if(id == undefined || id == "" || id == null || isNaN(id)){
            message.ERROR_BAD_REQUEST.field = "[ID] INVALIDO"
            return message.ERROR_BAD_REQUEST
        }else{
            let result = await dificuldadeDAO.selectByIdDificuldade(id)
            if(result){
                if(result.length > 0){
                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                    message.DEFAULT_MESSAGE.response.dificuldade = result
                    return message.DEFAULT_MESSAGE
                }else{
                    return message.ERROR_NOT_FOUND
                }
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL
            }
        }
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const excluirDificuldade = async function(id){
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validarId = await buscarDificuldadeId(id)
        if(validarId.status){
            let result = await dificuldadeDAO.deleteDificuldade(id)
            if(result === 'EM_USO'){
                return {
                    status: false,
                    status_code: 409,
                    message: "Não é possível excluir: esta dificuldade está vinculada a uma ou mais missões ou desafios."
                }
            }
            if(result){
                return message.SUCCESS_DELETED_ITEM
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL
            }
        }else{
            return validarId
        }
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const validarDadosDificuldade = async function(dados){
    let message = JSON.parse(JSON.stringify(config_message))
    if(dados.nome == undefined || dados.nome == "" || dados.nome == null || dados.nome.length > 50){
        message.ERROR_BAD_REQUEST.field = "[NOME] INVALIDO"
        return message.ERROR_BAD_REQUEST
    }else{
        return false
    }
}

module.exports = {
    inserirNovaDificuldade,
    atualizarDificuldade,
    listarDificuldade,
    buscarDificuldadeId,
    excluirDificuldade
}
