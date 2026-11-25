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

// import da controller das tabelas auxiliares
const controllerMissaoCategoria = require("./controller_missao_categoria.js")
const controllerMissaoEtapa = require("./controller_missao_etapa.js")

/* FUNÇÕES AUXILIARES */

//o painel manda "id_categoria" (um número) e "etapas"; o CRUD usa "categoria" ([{id}]) e "etapa" ([{titulo, xp, ordem}]).
//Aceita os dois formatos e deixa sempre arrays prontos, com a ordem das etapas numerada de 1 em diante.
const prepararMissao = function(missao){

    if(!Array.isArray(missao.categoria)){
        let idCategoria = missao.id_categoria
        missao.categoria = (idCategoria === undefined || idCategoria === null || idCategoria === "") ? [] : [{ id: Number(idCategoria) }]
    }

    let etapas = Array.isArray(missao.etapa) ? missao.etapa : (Array.isArray(missao.etapas) ? missao.etapas : [])
    missao.etapa = etapas.map((e, i) => ({
        titulo: String(e.titulo ?? "").trim(),
        xp: Number(e.xp),
        ordem: i + 1
    }))
    delete missao.etapas

    missao.dica = (missao.dica === undefined || missao.dica === null) ? "" : String(missao.dica)
}

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

                prepararMissao(missao)

                //mandando pro banco
                let result = await missaoDAO.insertMissao(missao)

                if(result){

                    missao.id = result //criando o atributo ID no Json e colocando o ID gerado no momento do insert


                    {


                        //Manipulação de dados para inserir na tabela intermediaria
                        for(const categoria of missao.categoria){ //estrutura para percorrer o array recebido na requisição no json
                        
                            //cria um json com os ids, para mandar os dois juntos
                            let missaoCategoria = {
                                "id_missao"         : missao.id,
                                "id_categoria"      : categoria.id
                            }

                            //enviando os ids para a controller da tabela intermediaria
                            let resultInsertMissaoCategoria = await controllerMissaoCategoria.inserirNovoMissaoCategoria(missaoCategoria)


                            if(!resultInsertMissaoCategoria.status){
                                console.log("ERRO: missao categoria")
                                return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os dados não foram inseridos
                            }

                        }

                    }



                    {


                        //Manipulação de dados para inserir na tabela intermediaria
                        for(const etapa of missao.etapa){ //estrutura para percorrer o array recebido na requisição no json
                        
                            //cria um json com os ids, para mandar os dois juntos
                            let missaoEtapa = {
                                "id_missao"         : missao.id,
                                "titulo"            : etapa.titulo,
                                "xp"                : etapa.xp,
                                "ordem"             : etapa.ordem
                            }

                            //enviando os ids para a controller da tabela intermediaria
                            let resultInsertMissaoEtapa = await controllerMissaoEtapa.inserirNovaMissaoEtapa(missaoEtapa)


                            if(!resultInsertMissaoEtapa.status){
                                console.log("ERRO: missao etapa")
                                return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os dados não foram inseridos
                            }

                        }

                    }



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

                    prepararMissao(missao)

                    //se estiver tudo certo ele adiciona o id no objeto
                    missao.id = Number(id)

                    //enviando para o banco
                    let result = await missaoDAO.updateMissao(missao)

                    if(result){



                        {
                            //Manipulação de dados na tabela de relação (tabela intermediária)
                            let resultDeleteMissaoCategoria = await controllerMissaoCategoria.excluirCategoriaIdMissao(missao.id) //exclui os dados relacionados , para depois inserir os novos dados relacionados a ele

                            //após a exlusão de todos os dados relacionados
                            if(resultDeleteMissaoCategoria.status){


                                //Manipulação de dados para inserir os Generos do Filme
                                for(const categoria of missao.categoria){ //estrutura para percorrer o array recebido na requisição no json 
                                    
                                    //cria um json com os ids, para mandar os dois juntos
                                    let missaoCategoria = {
                                        "id_missao"         : missao.id,
                                        "id_categoria"      : categoria.id
                                    }
                                    
                                    //enviando os ids para a controller da tabela intermediaria
                                    let resultInsertMissaoCategoria = await controllerMissaoCategoria.inserirNovoMissaoCategoria(missaoCategoria)

                                    if(!resultInsertMissaoCategoria.status){
                                        console.log("Erro ao inserir os dados relacionados a tabela intermediária(categoria)")
                                        return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os generos não foram inseridos
                                    }
                                }
                            } 
                        }



                        {

                            //Manipulação de dados na tabela de relação (tabela intermediária)
                            let resultDeleteMissaoEtapa = await controllerMissaoEtapa.excluirEtapaIdMissao(missao.id) //exclui os dados relacionados , para depois inserir os novos dados relacionados a ele

                            //após a exlusão de todos os dados relacionados
                            if(resultDeleteMissaoEtapa.status){


                                //Manipulação de dados para inserir os Generos do Filme
                                for(const etapa of missao.etapa){ //estrutura para percorrer o array recebido na requisição no json 
                                    
                                    //cria um json com os ids, para mandar os dois juntos
                                    let missaoEtapa = {
                                        "id_missao"         : missao.id,
                                        "titulo"            : etapa.titulo,
                                        "xp"                : etapa.xp,
                                        "ordem"             : etapa.ordem
                                    }
                                    
                                    //enviando os ids para a controller da tabela intermediaria
                                    let resultInsertMissaoEtapa = await controllerMissaoEtapa.inserirNovaMissaoEtapa(missaoEtapa)

                                    if(!resultInsertMissaoEtapa.status){
                                        console.log("Erro ao inserir os dados relacionados a tabela intermediária(etapa)")
                                        return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os generos não foram inseridos
                                    }
                                }
                            } 
                        }



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



                //percorrendo o array
                for(const missao of result){

                    //cria o objeto relacionados 
                    let resultMissaoCategoria = await controllerMissaoCategoria.buscarCategoriasPorIdMissao(missao.id) //enviando o id  para a função que busca os dados relacionados a ele

                    if(resultMissaoCategoria.status){ //se o status for verdadeiro, ele continua o processo
                        missao.categoria = resultMissaoCategoria.response.categoria //cria um atributo  dentro do Json de  e atribui o resultado relacionado a ele
                    }



                    //cria o objeto relacionados 
                    let resultMissaoEtapa = await controllerMissaoEtapa.buscarEtapasPorIdMissao(missao.id) //enviando o id  para a função que busca os dados relacionados a ele

                    if(resultMissaoEtapa.status){ //se o status for verdadeiro, ele continua o processo
                        missao.etapa = resultMissaoEtapa.response.etapa //cria um atributo  dentro do Json de  e atribui o resultado relacionado a ele
                    }

                }



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


                    for(const missao of result){

                        //cria o objeto relacionado 
                        let resultMissaoCategoria = await controllerMissaoCategoria.buscarCategoriasPorIdMissao(id) //enviando o id  para a função que busca os dados relacionados a ele

                        if(resultMissaoCategoria.status){ //se o status for verdadeiro, ele continua o processo
                            missao.categoria = resultMissaoCategoria.response.categoria //
                        }



                        //cria o objeto relacionado 
                        let resultMissaoEtapa = await controllerMissaoEtapa.buscarEtapasPorIdMissao(id) //enviando o id  para a função que busca os dados relacionados a ele

                        if(resultMissaoEtapa.status){ //se o status for verdadeiro, ele continua o processo
                            missao.etapa = resultMissaoEtapa.response.etapa //
                        }

                    }



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

    }else{

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
