/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de desafio.
 * Data: 09/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.1.10.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo do DAO (MODEL) e da controller da tabela intermediaria
const desafioDAO = require("../../model/DAO/desafio/desafio.js")
const controllerDesafioCategoria = require("./controller_desafio_categoria.js")

/* FUNÇÕES AUXILIARES */

//insere os vínculos desafio x categoria. Retorna true se todos foram inseridos
const vincularCategorias = async function(idDesafio, categorias){

    for(const categoria of categorias){ //const: evita variável global compartilhada entre requisições

        let resultado = await controllerDesafioCategoria.inserirNovoDesafioCategoria({
            "id_desafio": idDesafio,
            "id_categoria": categoria.id
        })

        if(!resultado.status) return false
    }

    return true
}

//busca as categorias do desafio (pelo ID DO DESAFIO) e devolve sempre um array
const categoriasDoDesafio = async function(idDesafio){

    let resultado = await controllerDesafioCategoria.buscarCategoriasPorIdDesafio(idDesafio)

    return resultado.status ? resultado.response.categoria : []
}

/* FUNÇÕES PARA O CRUD */

//função para inserir um novo dado
const inserirNovaDesafio = async function(contentType, desafio){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        if(String(contentType).toUpperCase() != "APPLICATION/JSON")
            return message.ERROR_CONTENT_TYPE //415

        let validando = validarDadosDesafio(desafio)
        if(validando) return validando //400

        let result = await desafioDAO.insertDesafio(desafio)
        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL //500

        desafio.id = result //coloca no JSON o ID gerado no insert

        //inserindo os vínculos na tabela intermediária
        if(!await vincularCategorias(desafio.id, desafio.categoria))
            return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que as categorias não foram inseridas

        message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status
        message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
        message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
        message.DEFAULT_MESSAGE.response = desafio

        return message.DEFAULT_MESSAGE //201

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 (controller)
    }

}

//função para atualizar um dado
const atualizarDesafio = async function(id, contentType, desafio){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //verificando existencia do id
        let validarId = await buscarDesafioId(id)
        if(!validarId.status) return validarId //400 ou 404

<<<<<<< HEAD
        if(validarId.status){

            //verificando tipo de dados
            if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

                //validar dados
                let validarDados = await validarDadosDesafio(desafio)

                if(!validarDados){

                    //se estiver tudo certo ele adiciona o id no objeto
                    desafio.id = Number(id)
    
                    //enviando para o banco 
                    let result = await desafioDAO.updateDesafio(desafio)

                    if(result){

                        //Manipulação de dados na tabela de relação (tabela intermediária)
                        let resultDeleteDesafioCategoria = await controlerDesafioCategoria.excluirCategoriaIdDesafio(desafio.id) //exclui os dados relacionados , para depois inserir os novos dados relacionados a ele

                        //após a exlusão de todos os dados relacionados
                        if(resultDeleteDesafioCategoria.status){

                            //Manipulação de dados para inserir os Generos do Filme
                            for(categoria of desafio.categoria){ //estrutura para percorrer o array recebido na requisição no json 
                       
                                //cria um json com os ids para mandar os dois juntos
                                let desafioCategoria = {
                                    "id_desafio": desafio.id,
                                    "id_categoria": categoria.id
                                }
                                
                                //enviando os ids para a controller da tabela intermediaria
                                let resultInsertDesafioCategoria = await controlerDesafioCategoria.inserirNovoDesafioCategoria(desafioCategoria)

                                if(!resultInsertDesafioCategoria.status){
                                    return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os generos não foram inseridos
                                }
                            }
                        }


                        message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                        message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                        message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                        message.DEFAULT_MESSAGE.response = desafio //envia os dados no response, para o usuário visualizar

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
=======
        if(String(contentType).toUpperCase() != "APPLICATION/JSON")
            return message.ERROR_CONTENT_TYPE

        let validarDados = validarDadosDesafio(desafio)
        if(validarDados) return validarDados

        desafio.id = Number(id)

        let result = await desafioDAO.updateDesafio(desafio)
        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        //apaga os vínculos antigos (pelo ID DO DESAFIO) e recria os novos
        let resultDelete = await controllerDesafioCategoria.excluirCategoriaIdDesafio(desafio.id)
        if(!resultDelete.status) return message.ERROR_INTERNAL_SERVER_MODEL

        if(!await vincularCategorias(desafio.id, desafio.categoria))
            return message.SUCESS_CREATED_ITEM_WARNING

        message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
        message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
        message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
        message.DEFAULT_MESSAGE.response = desafio

        return message.DEFAULT_MESSAGE //200
>>>>>>> 1b12f5829468006a4c9abd5ca3147bd62c9aee85

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }

}

//função para retornar todos os dados
const listarDesafio = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let result = await desafioDAO.selectAllDesafio()

        if(result){

            if(result.length > 0){

<<<<<<< HEAD
                //percorrendo o array
                for(desafio of result){

                    //cria o objeto relacionados 
                    let resultDesafioCategoria = await controlerDesafioCategoria.buscarCategoriaIdDesafio(desafio.id) //enviando o id  para a função que busca os dados relacionados a ele

                    
                    /* SE NÃO DER CERTO FAZ UM CONSOLE NO resultGenero PARA ACHAR O ERRO */
                    //console.log(resultGenero)

                    if(resultDesafioCategoria.status){ //se o status for verdadeiro, ele continua o processo
                        desafio.categoria = resultDesafioCategoria.response.desafioCategoria //cria um atributo  dentro do Json de  e atribui o resultado relacionado a ele
                    }
=======
                //anexando as categorias de cada desafio
                for(const desafio of result){
                    desafio.categoria = await categoriasDoDesafio(desafio.id)
>>>>>>> 1b12f5829468006a4c9abd5ca3147bd62c9aee85
                }

                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.desafio = result

                return message.DEFAULT_MESSAGE

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

//função para buscar um dado pelo id
const buscarDesafioId = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //tratando o id, para não mandar conteúdos errados pro banco
        if(id == undefined || id == "" || id == null || isNaN(id)){
            message.ERROR_BAD_REQUEST.field = "[ID] INVÁLIDO"
            return message.ERROR_BAD_REQUEST //400
        }

        let result = await desafioDAO.selectByIdDesafio(id)

        if(result){

<<<<<<< HEAD
                    for(desafio of result){

                        //cria o objeto relacionado 
                        let resultDesafioCategoria = await controlerDesafioCategoria.buscarCategoriaIdDesafio(id) //enviando o id  para a função que busca os dados relacionados a ele

                        if(resultDesafioCategoria.status){ //se o status for verdadeiro, ele continua o processo
                            desafio.categoria = resultDesafioCategoria.response.desafioCategoria //
                        }
                    }

                    //editando cabeçalho
                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                    message.DEFAULT_MESSAGE.response.desafio = result
=======
            if(result.length > 0){

                result[0].categoria = await categoriasDoDesafio(result[0].id)

                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.desafio = result

                return message.DEFAULT_MESSAGE //200
>>>>>>> 1b12f5829468006a4c9abd5ca3147bd62c9aee85

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
const excluirDesafio = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let validarId = await buscarDesafioId(id)
        if(!validarId.status) return validarId //400 ou 404

<<<<<<< HEAD
            //excluindo relacionamento 
            let resultDeleteDesafioCategoria = await controlerDesafioCategoria.excluirCategoriaIdDesafio(id) //exclui os dados relacionados a ele

            if(!resultDeleteDesafioCategoria.status){
                return message.ERROR_INTERNAL_SERVER_MODEL //500
            }

            //mandadno para o banco
            let result = await desafioDAO.deleteDesafio(id)
=======
        //primeiro os vínculos (FK), depois o desafio
        let resultVinculos = await controllerDesafioCategoria.excluirCategoriaIdDesafio(id)
        if(!resultVinculos.status) return message.ERROR_INTERNAL_SERVER_MODEL
>>>>>>> 1b12f5829468006a4c9abd5ca3147bd62c9aee85

        let result = await desafioDAO.deleteDesafio(id)

<<<<<<< HEAD
                return message.SUCCESS_DELETED_ITEM //200 registro excluido
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL
            }

=======
        if(result){
            return message.SUCCESS_DELETED_ITEM //200 registro excluido
>>>>>>> 1b12f5829468006a4c9abd5ca3147bd62c9aee85
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL //500 (ex.: usuário já participa do desafio)
        }

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }

}

//função para validar os dados recebidos na requisição
const validarDadosDesafio = function(dados){

    let message = JSON.parse(JSON.stringify(config_message))

    if(dados.nome == undefined || dados.nome == "" || dados.nome == null || dados.nome.length > 100){
        message.ERROR_BAD_REQUEST.field = "[NOME] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.super_coins === undefined || dados.super_coins === "" || dados.super_coins === null || isNaN(dados.super_coins)){
        message.ERROR_BAD_REQUEST.field = "[SUPER_COINS] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.id_dificuldade === undefined || dados.id_dificuldade === "" || dados.id_dificuldade === null || isNaN(dados.id_dificuldade)){
        message.ERROR_BAD_REQUEST.field = "[ID_DIFICULDADE] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.data_inicio == undefined || dados.data_inicio == "" || dados.data_inicio == null || dados.data_inicio.length != 10){
        message.ERROR_BAD_REQUEST.field = "[DATA_INICIO] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.data_termino == undefined || dados.data_termino == "" || dados.data_termino == null || dados.data_termino.length != 10){
        message.ERROR_BAD_REQUEST.field = "[DATA_TERMINO] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.data_termino < dados.data_inicio){ //YYYY-MM-DD compara corretamente como texto
        message.ERROR_BAD_REQUEST.field = "[DATA_TERMINO] NÃO PODE SER ANTERIOR À DATA DE INÍCIO"
        return message.ERROR_BAD_REQUEST

    }else if(!Array.isArray(dados.categoria) || dados.categoria.length == 0 || dados.categoria.some(c => !c || c.id == undefined || c.id === null || isNaN(c.id))){
        message.ERROR_BAD_REQUEST.field = "[CATEGORIA] INVALIDA (envie um array com ao menos um {id})"
        return message.ERROR_BAD_REQUEST

    }else{
        return false
    }

}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    inserirNovaDesafio,
    atualizarDesafio,
    listarDesafio,
    buscarDesafioId,
    excluirDesafio
}
