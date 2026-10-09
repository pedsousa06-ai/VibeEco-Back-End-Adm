/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de premiacao.
 * Data: 09/10/2026
 * Autor: Lucas Dias Brnadão Kolle
 * Versão: 1.0.10.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo do DAO (MODEL)
const premiacaoDAO = require("../../model/DAO/premiacao/premiacao.js")
const { json } = require("body-parser")
const express = require("express")

/* FUNÇÕES PARA O CRUD */

//função para inserir um novo dado
const inserirNovaPremiacao = async function(contentType, premiacao){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //validando content type
        if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

            //validando dados recebidos
            let validando = await validarDadosPremiacao(premiacao)

            if(!validando){

                premiacao.codigo_rastreio = ""
    
                // gerando um codigo de rastreio aleatório de 20 caracteres (letras maiúsculas e números)
                for(let i = 0; i < 20; i++) {
                    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                    premiacao.codigo_rastreio += caracteres.charAt(indiceAleatorio);
                }


                //mandando pro banco 
                let result = await premiacaoDAO.insertPremiacao(premiacao)

                if(result){

                    premiacao.id = result //criando o atributo ID no Json e colocando o ID gerado no momento do insert

                    message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status //cria um atributo de status no cabeçalho "DEFAULT_MESSAGE" e atribui um valor predefinido no "SUCESS_CHEATED_ITEM"
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                    message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                    message.DEFAULT_MESSAGE.response = premiacao //aparece os dados do ator do response para o usuário conferir

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
const atualizarPremiacao = async function(id, contentType, premiacao){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        //verificando existencia do id
        let validarId = await buscarPremiacaoId(id)

        if(validarId.status){

            //verificando tipo de dados
            if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

                //validar dados
                let validarDados = await validarDadosPremiacao(premiacao)

                if(!validarDados){

                    //se estiver tudo certo ele adiciona o id no objeto
                    premiacao.id = Number(id)
    
                    //enviando para o banco 
                    let result = await premiacaoDAO.updatePremiacao(premiacao)

                    if(result){

                        message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                        message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                        message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                        message.DEFAULT_MESSAGE.response = premiacao //envia os dados no response, para o usuário visualizar

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
const listarPremiacao = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        let result = await premiacaoDAO.selectAllPremiacao()

        if(result){

            if(result.length > 0){

                //personalizando o cabeçalho com a mensagem de sucesso
                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.premiacao = result

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
const buscarPremiacaoId = async function(id){

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
            let result = await premiacaoDAO.selectByIdPremiacao(id)

            //tratando retorno
            if(result){

                //verificando tamanho do array de resposta
                if(result.length > 0){

                    //editando cabeçalho
                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                    message.DEFAULT_MESSAGE.response.premiacao = result

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
const excluirPremiacao = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //validando id
        let validarId = await buscarPremiacaoId(id)

        if(validarId.status){

            //mandadno para o banco
            let result = await premiacaoDAO.deletePremiacao(id)

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
const validarDadosPremiacao = async function(dados){

    let message = JSON.parse(JSON.stringify(config_message))

        // se o "dados.nome" (conteúdo do Json) vier vazio ou "null" ou undefined ou com mais caracteres do que é permitido (.lenght -> conta a quantidade de caracteres)
        if(dados.nome == undefined || dados.nome == "" || dados.nome == null || dados.nome.length > 50){

            //Criando um novo atributo no Json de mensagem para personalizar conforme o erro (NESSE CASO O ERRO É 400)
            message.ERROR_BAD_REQUEST.field = "[NOME] INVALIDO"
            return message.ERROR_BAD_REQUEST
    
        }else{
            return false
        }
    
}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    inserirNovaPremiacao,
    atualizarPremiacao,
    listarPremiacao,
    buscarPremiacaoId,
    excluirPremiacao
}