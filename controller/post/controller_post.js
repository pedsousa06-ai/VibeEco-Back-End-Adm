/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de post.
 * Data: 16/11/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.11.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo do DAO (MODEL)
const postDAO = require("../../model/DAO/post/post.js")
const { json } = require("body-parser")
const express = require("express")

// importando controller da tabela intermediaria
const controlerPostAnexo = require("./controller_post_anexo.js")

/* FUNÇÕES PARA O CRUD */

//função para inserir um novo dado
const inserirNovoPost = async function(contentType, post){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //validando content type
        if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

            //validando dados recebidos
            let validando = await validarDadosPost(post)

            if(!validando){

                //mandando pro banco 
                let result = await postDAO.insertPost(post)

                if(result){

                    post.id = result //criando o atributo ID no Json e colocando o ID gerado no momento do insert



                        if (post.anexo != undefined || post.anexo != null || post.anexo != ""){

                            console.log(post.anexo)

                            //Manipulação de dados para inserir na tabela intermediaria
                            for(anexo of post.anexo){ //estrutura para percorrer o array recebido na requisição no json
                            
                                //cria um json com os ids, para mandar os dois juntos
                                let postAnexo = {
                                    "id_post"    : post.id,
                                    "id_anexo"    : anexo.id
                                }

                                //enviando os ids para a controller da tabela intermediaria
                                let resultInsertPostAnexo = await controlerPostAnexo.inserirNovoPostAnexo(postAnexo)    


                                if(!resultInsertPostAnexo.status){
                                    return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os dados não foram inseridos
                                }

                            }

                        }

                    message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status //cria um atributo de status no cabeçalho "DEFAULT_MESSAGE" e atribui um valor predefinido no "SUCESS_CHEATED_ITEM"
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                    message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                    message.DEFAULT_MESSAGE.response = post //aparece os dados do ator do response para o usuário conferir

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
const atualizarPost = async function(id, contentType, post){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        //verificando existencia do id
        let validarId = await buscarPostId(id)

        if(validarId.status){

            //verificando tipo de dados
            if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

                //validar dados
                let validarDados = await validarDadosPost(post)

                if(!validarDados){

                    //se estiver tudo certo ele adiciona o id no objeto
                    post.id = Number(id)
    
                    //enviando para o banco 
                    let result = await postDAO.updatePost(post)

                    if(result){

                        if(post.anexo != undefined || post.anexo != null || post.anexo != ""){
                            //Manipulação de dados na tabela de relação (tabela intermediária)
                            let resultDeletePostAnexo = await controlerPostAnexo.excluirPostAnexoIdPost(post.id) //exclui os dados relacionados , para depois inserir os novos dados relacionados a ele

                            //após a exlusão de todos os dados relacionados
                            if(resultDeletePostAnexo.status){

                                //Manipulação de dados para inserir os Generos do Filme
                                for(anexo of post.anexo){ //estrutura para percorrer o array recebido na requisição no json 
                                    
                                    //cria um json com os ids, para mandar os dois juntos
                                    let postAnexo = {
                                        "id_post"    : post.id,
                                        "id_anexo"    : anexo.id
                                    }
                                    
                                    //enviando os ids para a controller da tabela intermediaria
                                    let resultInsertPostAnexo = await controlerPostAnexo.inserirNovoPostAnexo(postAnexo)

                                    if(!resultInsertPostAnexo.status){
                                        console.log("Erro ao inserir os dados relacionados a tabela intermediária(anexo) do post")
                                        return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os generos não foram inseridos
                                    }
                                }
                            } 
                        }

                        message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                        message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                        message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                        message.DEFAULT_MESSAGE.response = post //envia os dados no response, para o usuário visualizar

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
const listarPosts = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        let result = await postDAO.selectAllPosts()

        if(result){

            if(result.length > 0){

                //percorrendo o array
                for(post of result){

                    //cria o objeto relacionados 
                    let resultPostAnexo = await controlerPostAnexo.buscarAnexoIdPost(post.id) //enviando o id  para a função que busca os dados relacionados a ele

                    if(resultPostAnexo.status){ //se o status for verdadeiro, ele continua o processo
                        post.anexo = resultPostAnexo.response.postAnexo //cria um atributo  dentro do Json de  e atribui o resultado relacionado a ele
                    }

                }

                //personalizando o cabeçalho com a mensagem de sucesso
                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.post = result

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
const buscarPostId = async function(id){

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
            let result = await postDAO.selectByIdPost(id)

            //tratando retorno
            if(result){

                //verificando tamanho do array de resposta
                if(result.length > 0){

                //percorrendo o array
                for(post of result){

                    //cria o objeto relacionados 
                    let resultPostAnexo = await controlerPostAnexo.buscarAnexoIdPost(id) //enviando o id  para a função que busca os dados relacionados a ele

                    if(resultPostAnexo.status){ //se o status for verdadeiro, ele continua o processo
                        post.anexo = resultPostAnexo.response.postAnexo //cria um atributo  dentro do Json de  e atribui o resultado relacionado a ele
                    }

                }

                    //editando cabeçalho
                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                    message.DEFAULT_MESSAGE.response.post = result

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
const excluirPost = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //validando id
        let validarId = await buscarPostId(id)

        if(validarId.status){

            //excluindo relacionamento 
            let resultDeletePostAnexo = await controlerPostAnexo.excluirPostAnexoIdPost(id) //exclui os dados relacionados a ele

            if(!resultDeletePostAnexo.status){
                console.log("Erro ao excluir os dados relacionados a tabela intermediária(anexo) do post")
                return message.ERROR_INTERNAL_SERVER_MODEL //500
            }

            //mandadno para o banco
            let result = await postDAO.deletePost(id)

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
const validarDadosPost = async function(dados){

    let message = JSON.parse(JSON.stringify(config_message))

        // se o "dados.descricao" (conteúdo do Json) vier vazio ou "null" ou undefined ou com mais caracteres do que é permitido (.lenght -> conta a quantidade de caracteres)
        if(dados.descricao == undefined || dados.descricao == "" || dados.descricao == null){

            //Criando um novo atributo no Json de mensagem para personalizar conforme o erro (NESSE CASO O ERRO É 400)
            message.ERROR_BAD_REQUEST.field = "[DESCRICAO] INVALIDA"
            return message.ERROR_BAD_REQUEST
    
        }else{
            return false
        }
    
}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    inserirNovoPost,
    atualizarPost,
    listarPosts,
    buscarPostId,
    excluirPost
}