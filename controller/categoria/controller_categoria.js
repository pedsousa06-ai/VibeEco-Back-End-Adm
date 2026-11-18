/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de categoria.
 * Data: 07/10/2026
 * Autor: Lucas Dias Brnadão Kolle
 * Versão: 1.0.11.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo do DAO (MODEL)
const categoriaDAO = require("../../model/DAO/categoria/categoria.js")

/* FUNÇÕES PARA O CRUD */

//função para inserir um novo dado
const inserirNovaCategoria = async function(contentType, categoria){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //validando content type
        if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

            //validando dados recebidos
            let validando = await validarDadosCategoria(categoria)

            if(!validando){

                //mandando pro banco 
                let result = await categoriaDAO.insertCategoria(categoria)

                if(result){

                    categoria.id = result //criando o atributo ID no Json e colocando o ID gerado no momento do insert

                    message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                    message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                    message.DEFAULT_MESSAGE.response = categoria

                    return message.DEFAULT_MESSAGE //201
                }else{
                    return message.ERROR_INTERNAL_SERVER_MODEL
                }
            }else{
                return validando
            }

        }else{
            return message.ERROR_CONTENT_TYPE //415
        }
        
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500
    }

}

//função para atualizar um dado
const atualizarCategoria = async function(id, contentType, categoria){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        //verificando existencia do id
        let validarId = await buscarCategoriaId(id)

        if(validarId.status){

            //verificando tipo de dados
            if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

                //validar dados
                let validarDados = await validarDadosCategoria(categoria)

                if(!validarDados){

                    //se estiver tudo certo ele adiciona o id no objeto
                    categoria.id = Number(id)
    
                    //enviando para o banco 
                    let result = await categoriaDAO.updateCategoria(categoria)

                    if(result){

                        message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                        message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                        message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                        message.DEFAULT_MESSAGE.response = categoria

                        return message.DEFAULT_MESSAGE //200
                    }else{
                        return message.ERROR_INTERNAL_SERVER_MODEL
                    }
    
                }else{
                    return validarDados //400
                }
            }else{
                return message.ERROR_CONTENT_TYPE //415
            }

        }else{
            return validarId //400, 404 ou 500
        }
        
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500
    }

}

//função para retornar todos os dados
const listarCategoria = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        let result = await categoriaDAO.selectAllCategoria()

        if(result){

            if(result.length > 0){

                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.categoria = result

                return message.DEFAULT_MESSAGE //200

            }else{
                return message.ERROR_NOT_FOUND //404
            }
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL //500
        }
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500
    }
}

//função para bucar um dado pelo id
const buscarCategoriaId = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        if(id == undefined || id == "" || id == null || isNaN(id)){
            message.ERROR_BAD_REQUEST.field = "[ID] INVÁLIDO"
            return message.ERROR_BAD_REQUEST //400
        
        }else{
            
            let result = await categoriaDAO.selectByIdCategoria(id)

            if(result){

                if(result.length > 0){

                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                    message.DEFAULT_MESSAGE.response.categoria = result

                    return message.DEFAULT_MESSAGE //200                 
                }else{
                    return message.ERROR_NOT_FOUND //404
                }
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL //500
            }
        }
        
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500
    }
}

//função para excluir um dado
const excluirCategoria = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //validando id
        let validarId = await buscarCategoriaId(id)

        if(validarId.status){

            //mandando para o banco
            let result = await categoriaDAO.deleteCategoria(id)

            // Verifica se o DAO bloqueou por estar em uso (Foreign Key)
            if(result === 'EM_USO'){
                return {
                    status: false,
                    status_code: 409,
                    message: "Não é possível excluir: esta categoria está vinculada a uma ou mais missões, desafios ou conteúdos."
                }
            }

            if(result){
                return message.SUCCESS_DELETED_ITEM //200
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL //500
            }

        }else{
            return validarId //400, 404 ou 500
        }

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500
    }

}

//função para validar os dados recebidos na requição
const validarDadosCategoria = async function(dados){

    let message = JSON.parse(JSON.stringify(config_message))

    if(dados.nome == undefined || dados.nome == "" || dados.nome == null || dados.nome.length > 50){

        message.ERROR_BAD_REQUEST.field = "[NOME] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else{
        return false
    }
    
}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    inserirNovaCategoria,
    atualizarCategoria,
    listarCategoria,
    buscarCategoriaId,
    excluirCategoria
}