/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de usuario.
 * Data: 19/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.10.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo do DAO (MODEL)
const usuarioDAO = require("../../model/DAO/usuario/usuario.js")
const { json } = require("body-parser")
const express = require("express")

// import da controller que faz upload da foto
const UPLOAD = require("../upload/controller_upload_azure.js")

/* FUNÇÕES PARA O CRUD */

//função para inserir um novo dado
const inserirNovaUsuario = async function(contentType, usuario, foto){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //validando content type
        if(contentType){

            //validando dados recebidos
            let validando = await validarDadosUsuario(usuario)

            // Enviando a foto para fazer o upload do arquivo
            let urlFoto = await UPLOAD.uploadFiles(foto)

            // validando se a foto foi enviada corretamente
            if(urlFoto){

                // Adicionando a url no objeto usuario
                usuario.foto = urlFoto
                
                if(!validando){

                    //mandando pro banco 
                    let result = await usuarioDAO.insertUsuario(usuario)
    
                    if(result){
    
                        usuario.id = result //criando o atributo ID no Json e colocando o ID gerado no momento do insert
    
                        message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status //cria um atributo de status no cabeçalho "DEFAULT_MESSAGE" e atribui um valor predefinido no "SUCESS_CHEATED_ITEM"
                        message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                        message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                        message.DEFAULT_MESSAGE.response = usuario //aparece os dados do ator do response para o usuário conferir
    
                        return message.DEFAULT_MESSAGE //200 (retorna o cabeçalho com a mensagem de sucesso e os dados)
                    }else{
                        return message.ERROR_INTERNAL_SERVER_MODEL
                    }

                }else{
                    return validando
                }

            }else{
                return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 (erro no controller)
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
const atualizarUsuario= async function(id, contentType, usuario){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        //verificando existencia do id
        let validarId = await buscarUsuarioId(id)

        if(validarId.status){

            //verificando tipo de dados
            if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

                //validar dados
                let validarDados = await validarDadosUsuario(usuario)

                if(!validarDados){

                    //se estiver tudo certo ele adiciona o id no objeto
                    usuario.id = Number(id)
    
                    //enviando para o banco 
                    let result = await usuarioDAO.updateUsuario(usuario)

                    if(result){

                        message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                        message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                        message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                        message.DEFAULT_MESSAGE.response = usuario //envia os dados no response, para o usuário visualizar

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
const listarUsuario = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        let result = await usuarioDAO.selectAllUsuario()

        if(result){

            if(result.length > 0){

                //personalizando o cabeçalho com a mensagem de sucesso
                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.usuario = result

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
const buscarUsuarioId = async function(id){

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
            let result = await usuarioDAO.selectByIdUsuario(id)

            //tratando retorno
            if(result){

                //verificando tamanho do array de resposta
                if(result.length > 0){

                    //editando cabeçalho
                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                    message.DEFAULT_MESSAGE.response.usuario = result

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
const excluirUsuario = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //validando id
        let validarId = await buscarUsuarioId(id)

        if(validarId.status){

            //mandadno para o banco
            let result = await usuarioDAO.deleteUsuario(id)

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
const validarDadosUsuario = async function(dados){

    let message = JSON.parse(JSON.stringify(config_message))

        // se o "dados.nome" (conteúdo do Json) vier vazio ou "null" ou undefined ou com mais caracteres do que é permitido (.lenght -> conta a quantidade de caracteres)
        if(dados.nome == undefined || dados.nome == "" || dados.nome == null || dados.nome.length > 100){

            //Criando um novo atributo no Json de mensagem para personalizar conforme o erro (NESSE CASO O ERRO É 400)
            message.ERROR_BAD_REQUEST.field = "[NOME] INVALIDO"
            return message.ERROR_BAD_REQUEST
    
        }else if(dados.email == undefined || dados.email == "" || dados.email == null || dados.email.length > 255){

            //Criando um novo atributo no Json de mensagem para personalizar conforme o erro (NESSE CASO O ERRO É 400)
            message.ERROR_BAD_REQUEST.field = "[EMAIL] INVALIDO"
            return message.ERROR_BAD_REQUEST
    
        }else if(dados.senha == undefined || dados.senha == "" || dados.senha == null || dados.senha.length < 8 || dados.senha.length > 25){

            //Criando um novo atributo no Json de mensagem para personalizar conforme o erro (NESSE CASO O ERRO É 400)
            message.ERROR_BAD_REQUEST.field = "[SENHA] INVALIDO"
            return message.ERROR_BAD_REQUEST
    
        }else{
            return false
        }
    
}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    inserirNovaUsuario,
    atualizarUsuario,
    listarUsuario,
    buscarUsuarioId,
    excluirUsuario
}