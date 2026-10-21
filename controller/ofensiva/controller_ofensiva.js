/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de categoria.
 * Data: 21/10/2026
 * Autor: Lucas Dias Brnadão Kolle
 * Versão: 1.0.10.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo do DAO (MODEL)
const ofensivaDAO = require("../../model/DAO/ofensiva/ofensiva.js")
const { json } = require("body-parser")
const express = require("express")

/* FUNÇÕES PARA O CRUD */

//função para inserir um novo dado
const inserirNovaOfensiva = async function(contentType, ofensiva){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //validando content type
        if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

            //validando dados recebidos
            let validando = await validarDadosOfensiva(ofensiva)

            if(!validando){

                //mandando pro banco 
                let result = await ofensivaDAO.insertOfensiva(ofensiva)

                if(result){

                    ofensiva.id = result //criando o atributo ID no Json e colocando o ID gerado no momento do insert

                    message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status //cria um atributo de status no cabeçalho "DEFAULT_MESSAGE" e atribui um valor predefinido no "SUCESS_CHEATED_ITEM"
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                    message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                    message.DEFAULT_MESSAGE.response = ofensiva //aparece os dados do ator do response para o usuário conferir

                    return message.DEFAULT_MESSAGE //200 (retorna o cabeçalho com a mensagem de sucesso e os dados)
                }else{
                    return message.ERROR_INTERNAL_SERVER_MODEL
                }
            }else{
                return validando
            }

        }else{
            return message.ERROR_CONTENT_TYPE //415 (retorna erro de tipo de dados) 
        }
        
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 (controller)
    }

}

//função para atualizar um dado
const atualizarOfensiva = async function(id, contentType, ofensiva){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        //verificando existencia do id
        let validarId = await buscarOfensivaId(id)

        if(validarId.status){

            //verificando tipo de dados
            if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

                //validar dados
                let validarDados = await validarDadosOfensiva(ofensiva)

                if(!validarDados){

                    //se estiver tudo certo ele adiciona o id no objeto
                    ofensiva.id = Number(id)
    
                    //enviando para o banco 
                    let result = await ofensivaDAO.updateOfensiva(ofensiva)

                    if(result){

                        message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                        message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                        message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                        message.DEFAULT_MESSAGE.response = ofensiva //envia os dados no response, para o usuário visualizar

                        return message.DEFAULT_MESSAGE //200
                    }else{
                        return message.ERROR_INTERNAL_SERVER_MODEL
                    }
    
                }else{
                    return validarDados //mensagem de erro da própria função
                }
            }else{
                return message.ERROR_CONTENT_TYPE
            }

        }else{
            return validarId //mensagem de erro da própria função
        }
        
    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }

}

//função para retornar todos os dados
const listarOfensiva = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        let result = await ofensivaDAO.selectAllOfensiva()

        if(result){

            if(result.length > 0){

                //personalizando o cabeçalho com a mensagem de sucesso
                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.ofensiva = result

                return message.DEFAULT_MESSAGE //retorna o cabeçalho com o "result" que contém os dados

            }else{
                return message.ERROR_NOT_FOUND //404
            }
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL
        }
    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para bucar um dado pelo id
const buscarOfensivaId = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //tratando id
        //tratando o id, para não mandar conteúdos errados pro banco
        if(id == undefined || id == "" || id == null || isNaN(id)){
            message.ERROR_BAD_REQUEST.field = "[ID] INVÁLIDO"
            return message.ERROR_BAD_REQUEST //400
        
        //se o id estiver no formato correto ele ennvia pro DAO
        }else{
            
            //enviando para o banco
            let result = await ofensivaDAO.selectByIdOfensiva(id)

            //tratando retorno
            if(result){

                //verificando tamanho do array de resposta
                if(result.length > 0){

                    //editando cabeçalho
                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                    message.DEFAULT_MESSAGE.response.ofensiva = result

                    return message.DEFAULT_MESSAGE //200                 
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

//função para excluir um dado
const excluirOfensiva = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //validando id
        let validarId = await buscarOfensivaId(id)

        if(validarId.status){

            //mandadno para o banco
            let result = await ofensivaDAO.deleteOfensiva(id)

            if(result){

                return message.SUCCESS_DELETED_ITEM //200 registro excluido
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL
            }
        }else{
            return message.ERROR_BAD_REQUEST
        }

    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }

}

//função para validar os dados recebidos na requição
const validarDadosOfensiva = async function(dados){

    let message = JSON.parse(JSON.stringify(config_message))

        // se o "dados.nome" (conteúdo do Json) vier vazio ou "null" ou undefined ou com mais caracteres do que é permitido (.lenght -> conta a quantidade de caracteres)
        if(dados.id_usuario == undefined || dados.id_usuario == "" || dados.id_usuario == null || isNaN(dados.id_usuario)){

            //Criando um novo atributo no Json de mensagem para personalizar conforme o erro (NESSE CASO O ERRO É 400)
            message.ERROR_BAD_REQUEST.field = "[ID_USUARIO] INVALIDO"
            return message.ERROR_BAD_REQUEST
    
        }else if(dados.data_ofensiva == undefined || dados.data_ofensiva == "" || dados.data_ofensiva == null || dados.data_ofensiva.length != 10){
    
            message.ERROR_BAD_REQUEST.field = "[DATA_OFENSIVA] INVALIDO"
            return message.ERROR_BAD_REQUEST
        }else if(dados.concluido == undefined || dados.concluido == "" || dados.concluido == null || dados.concluido < 0 || dados.concluido > 1){
    
            message.ERROR_BAD_REQUEST.field = "[CONCLUIDO] INVALIDO"
            return message.ERROR_BAD_REQUEST
        }else{
            return false
        }
    
}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    inserirNovaOfensiva,
    atualizarOfensiva,
    listarOfensiva,
    buscarOfensivaId,
    excluirOfensiva
}