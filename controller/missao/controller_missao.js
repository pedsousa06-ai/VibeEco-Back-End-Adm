/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de missao.
 * Data: 09/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.2.10.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo do DAO (MODEL)
const missaoDAO = require("../../model/DAO/missao/missao.js")

/* FUNÇÕES PARA O CRUD */

//função para inserir um novo dado
const inserirNovaMissao = async function(contentType, missao){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //validando content type
        if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

            //validando dados recebidos
            let validando = await validarDadosMissao(missao)

            if(!validando){

                //mandando pro banco
                let result = await missaoDAO.insertMissao(missao)

                if(result){

                    missao.id = result //criando o atributo ID no Json e colocando o ID gerado no momento do insert

                    message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                    message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                    message.DEFAULT_MESSAGE.response = missao //mostra os dados cadastrados para o usuário conferir

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
const atualizarMissao = async function(id, contentType, missao){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        //verificando existencia do id
        let validarId = await buscarMissaoId(id)

        if(validarId.status){

            //verificando tipo de dados
            if(String(contentType).toUpperCase() == "APPLICATION/JSON"){

                //validar dados
                let validarDados = await validarDadosMissao(missao)

                if(!validarDados){

                    //se estiver tudo certo ele adiciona o id no objeto
                    missao.id = Number(id)

                    //enviando para o banco
                    let result = await missaoDAO.updateMissao(missao)

                    if(result){

                        message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                        message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                        message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                        message.DEFAULT_MESSAGE.response = missao

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
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }

}

//função para retornar todos os dados
const listarMissao = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let result = await missaoDAO.selectAllMissao()

        if(result){

            if(result.length > 0){

                //personalizando o cabeçalho com a mensagem de sucesso
                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.missao = result

                return message.DEFAULT_MESSAGE //retorna o cabeçalho com o "result" que contém os dados

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

//função para bucar um dado pelo id
const buscarMissaoId = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //tratando o id, para não mandar conteúdos errados pro banco
        if(id == undefined || id == "" || id == null || isNaN(id)){
            message.ERROR_BAD_REQUEST.field = "[ID] INVÁLIDO"
            return message.ERROR_BAD_REQUEST //400

        //se o id estiver no formato correto ele envia pro DAO
        }else{

            let result = await missaoDAO.selectByIdMissao(id)

            if(result){

                if(result.length > 0){

                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                    message.DEFAULT_MESSAGE.response.missao = result

                    return message.DEFAULT_MESSAGE //200
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

//função para excluir um dado
const excluirMissao = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //validando id
        let validarId = await buscarMissaoId(id)

        if(validarId.status){

            let result = await missaoDAO.deleteMissao(id)

            if(result){

                return message.SUCCESS_DELETED_ITEM //registro excluido
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL
            }
        }else{
            return validarId //400 (id inválido) ou 404 (não existe), vindo da própria busca
        }

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }

}

//função para validar os dados recebidos na requição
const validarDadosMissao = async function(dados){

    let message = JSON.parse(JSON.stringify(config_message))

    // corpo vazio ou que não é um objeto
    if(dados == undefined || dados == null || typeof dados !== "object"){
        message.ERROR_BAD_REQUEST.field = "[BODY] INVALIDO"
        return message.ERROR_BAD_REQUEST
    }

    if(dados.nome == undefined || dados.nome == "" || dados.nome == null || dados.nome.length > 100){

        message.ERROR_BAD_REQUEST.field = "[NOME] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.descricao == undefined || dados.descricao == null || dados.descricao == "" || dados.descricao.length > 5000){

        message.ERROR_BAD_REQUEST.field = "[DESCRICAO] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.dica != undefined && dados.dica != null && String(dados.dica).length > 5000){

        // a dica é opcional
        message.ERROR_BAD_REQUEST.field = "[DICA] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.id_dificuldade == undefined || dados.id_dificuldade == "" || dados.id_dificuldade == null || isNaN(dados.id_dificuldade)){

        message.ERROR_BAD_REQUEST.field = "[ID_DIFICULDADE] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.id_categoria != undefined && dados.id_categoria != null && dados.id_categoria !== "" && isNaN(dados.id_categoria)){

        // a categoria é opcional
        message.ERROR_BAD_REQUEST.field = "[ID_CATEGORIA] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.coins == undefined || dados.coins === "" || dados.coins == null || isNaN(dados.coins) || Number(dados.coins) < 0){

        message.ERROR_BAD_REQUEST.field = "[COINS] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.data_inicio == undefined || dados.data_inicio == "" || dados.data_inicio == null || dados.data_inicio.length != 10){

        message.ERROR_BAD_REQUEST.field = "[DATA_INICIO] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.data_termino == undefined || dados.data_termino == "" || dados.data_termino == null || dados.data_termino.length != 10){

        message.ERROR_BAD_REQUEST.field = "[DATA_TERMINO] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if(dados.data_termino < dados.data_inicio){

        // formato YYYY-MM-DD: comparar como texto funciona
        message.ERROR_BAD_REQUEST.field = "[DATA_TERMINO] ANTERIOR AO INICIO"
        return message.ERROR_BAD_REQUEST

    }else if(!Array.isArray(dados.etapas) || dados.etapas.length == 0 || dados.etapas.length > 20){

        message.ERROR_BAD_REQUEST.field = "[ETAPAS] INFORME DE 1 A 20 ETAPAS"
        return message.ERROR_BAD_REQUEST

    }else{

        // cada etapa precisa de título e XP positivo
        for(const [i, etapa] of dados.etapas.entries()){

            if(etapa == null || typeof etapa !== "object" || etapa.titulo == undefined || String(etapa.titulo).trim() == "" || String(etapa.titulo).length > 150){
                message.ERROR_BAD_REQUEST.field = `[ETAPAS ${i + 1}: TITULO] INVALIDO`
                return message.ERROR_BAD_REQUEST
            }

            if(etapa.xp == undefined || etapa.xp === "" || etapa.xp == null || isNaN(etapa.xp) || Number(etapa.xp) <= 0){
                message.ERROR_BAD_REQUEST.field = `[ETAPAS ${i + 1}: XP] INVALIDO`
                return message.ERROR_BAD_REQUEST
            }

            etapa.titulo = String(etapa.titulo).trim()
            etapa.xp = Number(etapa.xp)
        }

        // o XP total da missão é sempre a soma das etapas (ignora o valor que veio no body)
        dados.total_xp_missao = dados.etapas.reduce((soma, etapa) => soma + etapa.xp, 0)

        return false
    }

}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    inserirNovaMissao,
    atualizarMissao,
    listarMissao,
    buscarMissaoId,
    excluirMissao
}
