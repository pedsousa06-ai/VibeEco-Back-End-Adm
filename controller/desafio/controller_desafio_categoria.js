/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de desafio_categoria.
 * Data: 28/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.1.10.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo do DAO (MODEL)
const desafioCategoriaDAO = require("../../model/DAO/desafio_categoria/desafio_categoria.js")


//função para inserir dados
const inserirNovoDesafioCategoria = async function(desafioCategoria){

    const message = JSON.parse(JSON.stringify(config_message)) //copia a mensagem para não alterar a original

    try {

        let validar = validarDados(desafioCategoria)

        if(validar){
            return validar // 400 (o retorno da função já é uma mensagem de erro)
        }else{

            let result = await desafioCategoriaDAO.insertDesafioCategoria(desafioCategoria)

            if(result){

                desafioCategoria.id = result //pegando o id do dado cadastrado e adicionando no JSON

                message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                message.DEFAULT_MESSAGE.response = desafioCategoria

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
const atualizarDesafioCategoria = async function(desafioCategoria, id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let validandoId = await buscarDesafioCategoriaID(id)

        if(validandoId.status){

            //obs.: a variável NÃO pode ter o mesmo nome da função (validarDados), senão dá erro de inicialização
            let validacao = validarDados(desafioCategoria)

            if(!validacao){

                desafioCategoria.id = Number(id)

                let result = await desafioCategoriaDAO.updateDesafioCategoria(desafioCategoria)

                if(result){

                    message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                    message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                    message.DEFAULT_MESSAGE.response = desafioCategoria

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
const listarDesafioCategoria = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let result = await desafioCategoriaDAO.selectAllDesafioCategoria()

        if(result){

            if(result.length > 0){

                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.desafioCategoria = result

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
const buscarDesafioCategoriaID = async function(id){

    const message = JSON.parse(JSON.stringify(config_message))

    try {

        if(id == undefined || id == "" || id == null || isNaN(id)){

            message.ERROR_BAD_REQUEST.field = "O campo [ID] está incorreto!"
            return message.ERROR_BAD_REQUEST //400

        }else{

            let result = await desafioCategoriaDAO.selectByIdDesafioCategoria(id)

            if(result){

                if(result.length > 0){

                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                    message.DEFAULT_MESSAGE.response.desafioCategoria = result

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
const excluirDesafioCategoria = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let verificarId = await buscarDesafioCategoriaID(id)

        if(verificarId.status){

            let result = await desafioCategoriaDAO.deleteDesafioCategoria(id)

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

        if(dados.id_desafio == undefined || dados.id_desafio == "" || dados.id_desafio == null || isNaN(dados.id_desafio)){

            message.ERROR_BAD_REQUEST.field = "O campo [ID_DESAFIO] está incorreto!"
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
const excluirCategoriaIdDesafio = async function(idDesafio){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let result = await desafioCategoriaDAO.deleteCategoriaByIdDesafio(idDesafio)

        if(result){
            return message.SUCCESS_DELETED_ITEM //200
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL //500 model
        }

    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 controller
    }
}

<<<<<<< HEAD
//função para retornar os dados da tabela princiapl pelo id da tabela secundaria
const buscarDesafioIdCategoria = async function(idCategoria){

    //importando o arquivo de mensagens
    const message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //validando id
        if(idCategoria == undefined || idCategoria == "" || idCategoria == null || isNaN(idCategoria)){ //se o id estiver erra ele vai entrar aqui

            //personalizando mensagem
            message.ERROR_BAD_REQUEST.field = "O campo [ID_CATEGORIA] está incorreto!"
            return message.ERROR_BAD_REQUEST //400 (requisição incorreta)

        }else{ //se estiver tudo certo com o id ele continua o programa

            //enviando para o DAO
            let result = await desafioCategoriaDAO.selectDesafioByIdCategoria(idCategoria)

            //vaidando retorno
            if(result){ //se tiver algo ele cai aqui

                //conferindo tamanho do array de retorno
                if(result.length > 0){ //se estiver conteúdo no array ele cai aqui

                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status //true / false
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code //200
                    message.DEFAULT_MESSAGE.response.desafioCategoria = result //conteúdo

                    return message.DEFAULT_MESSAGE //retornando dados

                }else{ //se estiver vazio ele cai aqui
                    return message.ERROR_NOT_FOUND //404 não encontrado
                }
            }else{ //se não tiver nada ele cai aqui
                return message.ERROR_INTERNAL_SERVER_MODEL //500 (model) erro no banco 
            }
        }
    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500 (controler)
    }
}

//função para retornar os dados secundarios pelo id da principal
const buscarCategoriaIdDesafio = async function(idDesafio){

    //importando o arquivo de mensagens
    const message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //validando id
        if(idDesafio == undefined || idDesafio == "" || idDesafio == null || isNaN(idDesafio)){ //se o id estiver erra ele vai entrar aqui

            //personalizando mensagem
            message.ERROR_BAD_REQUEST.field = "O campo [ID_DESAFIO] está incorreto!"
            return message.ERROR_BAD_REQUEST //400 (requisição incorreta)

        }else{ //se estiver tudo certo com o id ele continua o programa

            //enviando para o DAO
            let result = await desafioCategoriaDAO.selectCategoriaByIdDesafio(idDesafio)

            //vaidando retorno
            if(result){ //se tiver algo ele cai aqui

                //conferindo tamanho do array de retorno
                if(result.length > 0){ //se estiver conteúdo no array ele cai aqui

                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status //true / false
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code //200
                    message.DEFAULT_MESSAGE.response.desafioCategoria = result //conteúdo

                    return message.DEFAULT_MESSAGE //retornando dados

                }else{ //se estiver vazio ele cai aqui
                    return message.ERROR_NOT_FOUND //404 não encontrado
                }
            }else{ //se não tiver nada ele cai aqui
                return message.ERROR_INTERNAL_SERVER_MODEL //500 (model) erro no banco 
            }
        }
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500 (controler)
=======
//função para buscar as categorias (id e nome) de UM desafio, pelo ID DO DESAFIO
const buscarCategoriasPorIdDesafio = async function(idDesafio){

    const message = JSON.parse(JSON.stringify(config_message))

    try {

        if(idDesafio == undefined || idDesafio == "" || idDesafio == null || isNaN(idDesafio)){

            message.ERROR_BAD_REQUEST.field = "O campo [ID_DESAFIO] está incorreto!"
            return message.ERROR_BAD_REQUEST

        }

        let result = await desafioCategoriaDAO.selectCategoriasByIdDesafio(idDesafio)

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
>>>>>>> 1b12f5829468006a4c9abd5ca3147bd62c9aee85
    }
}


//exportando arquivos
module.exports = {
    inserirNovoDesafioCategoria,
    atualizarDesafioCategoria,
    listarDesafioCategoria,
    buscarDesafioCategoriaID,
    excluirDesafioCategoria,
<<<<<<< HEAD
    buscarDesafioIdCategoria,
    buscarCategoriaIdDesafio,
    excluirCategoriaIdDesafio
=======
    excluirCategoriaIdDesafio,
    buscarCategoriasPorIdDesafio
>>>>>>> 1b12f5829468006a4c9abd5ca3147bd62c9aee85
}
