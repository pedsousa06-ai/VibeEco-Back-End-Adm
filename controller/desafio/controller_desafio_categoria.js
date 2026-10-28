/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de desafio_categoria.
 * Data: 28/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.10.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo de genero do DAO (MODEL)
const desafioCategoriaDAO = require("../../model/DAO/desafio_categoria/desafio_categoria.js")



//função para inserir dados
const inserirNovoDesafioCategoria = async function(desafioCategoria){

    //importando arquivo de mensagens 
    const message = JSON.parse(JSON.stringify(config_message)) //primeiro transforma em ele transformar em string para poder copiar, depois ele tranforma em json para ser utilizavel

    try {


        //enviado dados para a função validar
        let validar = await validarDados(desafioCategoria)

        //tratando retorno da validação
        if(validar){ //se a função validarDados() retornar a mensagem de erro ele envia para o app

            return validar // 400 (O retorno da função já é uma mensagem de erro)

        //se os dados estiverem corretos ele envia para o DAO 
        }else{
                
            //enviando dados para o DAO (mandar pro banco de dados)
            let result = await desafioCategoriaDAO.insertDesafioCategoria(desafioCategoria)

            //validando retorno da função
            if(result){ //se o item for cadastrado corretamente ele envia uma mensagem de sucesso

                desafioCategoria.id = result //pegando o id do dado cadastrado e adicionando no JSON

                message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status //cria um atributo de status no cabeçalho "DEFAULT_MESSAGE" e atribui um valor predefinido no "SUCESS_CHEATED_ITEM"
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                message.DEFAULT_MESSAGE.response = desafioCategoria //aparece os dados no response para o usuário conferir

            //se a função retornar um "false" (o dado não foi cadastrado) ele cai aqui
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL //500 (model) item não cadastrado
            }

            return message.DEFAULT_MESSAGE //201 MENSAGEM DE SUCESSO NO CADASTRO
        }
        
    } catch (error) {
        console.log("Caiu no catch do controller_desafio_categoria.js")
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 (controller)
    }
}

//função para atualizar um dado
const atualizarDesafioCategoria = async function(desafioCategoria, id){

    //importando mensagens
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //validando id e existencia do conteúdo no banco de dados
        let validandoId = await buscarDesafioCategoriaID(id)

        //validando retorno da função
        if(validandoId.status){ //vai olhar o status (true / false) da função

            //enviando dados para a função de validação
            let validarDados = await validarDados(desafioCategoria)

            //validaddo retorno da função
            if(!validarDados){

                //adicionando o id no objeto recebido na requisição, para enviar tudo em um único objeto
                desafioCategoria.id = Number(id)

                //enviando para para o DAO 
                let result = await desafioCategoriaDAO.updateDesafioCategoria(desafioCategoria)

                //tratando retorno do DAO
                if(result){

                    //montando o cabeçalho de resposta, pois a requisição não pede nada pro banco
                    message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                    message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                    message.DEFAULT_MESSAGE.response = desafioCategoria //envia os dados no response, para o usuário visualizar

                    return message.DEFAULT_MESSAGE //200 retornando a mensagem criada
                }else{
                    return message.ERROR_INTERNAL_SERVER_MODEL //500 model
                }

            }else{
                return validarDados //400 mensagem de erro da própria validação 
            }

        }else{
            return validandoId //400(id inválido) ou 404(não encontrado) ou 500 (contraller e model)
        }
        
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 controler
    }
}

//função para listar todos os dados
const listarDesafioCategoria = async function(){

    //importando arquivo de mensagens
    let message = JSON.parse(JSON.stringify(config_message)) //primeiro transforma em ele transformar em string para poder copiar, depois ele tranforma em json para ser utilizavel

    try {

        //chamando a função para enviar os dados
        let result = await desafioCategoriaDAO.selectAllDesafioCategoria()

        //verificando retorno 
        if(result){

            //verificando tamanho do array
            if(result.length > 0){

                //personalizando mensagem de sucesso
                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status // True or False
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code // 200
                message.DEFAULT_MESSAGE.response.count = result.length // Mostra a quantidade de itens
                message.DEFAULT_MESSAGE.response.desafioCategoria = result // Mostra os itens

                return message.DEFAULT_MESSAGE // retorna as mensagens e os dados

            //se estiver vazio ele cai aqui 
            }else{
                return message.ERROR_NOT_FOUND //404 (não encontrado)
            }

        }else{
            return config_message.ERROR_INTERNAL_SERVER_MODEL // 500 (model)
        }
        
    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500 (controller)
    }

}

//função para buscar um genero pelo id
const buscarDesafioCategoriaID = async function(id){

    //importando o arquivo de mensagens
    const message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //validando id
        if(id == undefined || id == "" || id == null || isNaN(id)){ //se o id estiver erra ele vai entrar aqui

            //personalizando mensagem
            message.ERROR_BAD_REQUEST.field = "O campo [ID] está incorreto!"
            return message.ERROR_BAD_REQUEST //400 (requisição incorreta)

        }else{ //se estiver tudo certo com o id ele continua o programa

            //enviando para o DAO
            let result = await desafioCategoriaDAO.selectByIdDesafioCategoria(id)

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

//função para excluir um genero pelo id
const excluirDesafioCategoria = async function(id){
    
    //importando arquivo de mensagem
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //enviando id para função para verificar existencia
        let verificarId = await buscarDesafioCategoriaID(id)

        //tratando retorno da função
        if(verificarId.status){

            //mandando para o DAO
            let result = await desafioCategoriaDAO.deleteDesafioCategoria(id) 

            //tratando retornos
            if(result){
                return message.SUCCESS_DELETED_ITEM //200 registro excluido
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL //500 model
            }

        }else{
            return verificarId //retorna a mensagem criada na função, contendo os possíveis erros no id (não existe, id errado ...)
        }
        
    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 controller
    }
}

//função para fazer a validação dos dados recebidos (POST / PUT)
const validarDados = function(dados){

    //clonando a variável de mensagens para não modificar a original
    let message = JSON.parse(JSON.stringify(config_message))
    //JSON.stringify(config_message) -> transforma o Json em string
    //JSON.parse -> transforma de volta em Json

    try {
        
        //iniciando validação dos dados recebidos
        if(dados.id_desafio == undefined /*undefined sempre deve vir primeiro*/ || dados.id_desafio == "" || dados.id_desafio == null || isNaN(dados.id_desafio)){

            //personalizando mensagem de erro
            message.ERROR_BAD_REQUEST.field /*field = campo (local do erro)*/ = "O campo [ID_DESAFIO] está incorreto!"
            return message.ERROR_BAD_REQUEST

        }else if(dados.id_categoria == undefined /*undefined sempre deve vir primeiro*/ || dados.id_categoria == "" || dados.id_categoria == null || isNaN(dados.id_categoria)){
            //personalizando mensagem de erro
            message.ERROR_BAD_REQUEST.field /*field = campo (local do erro)*/ = "O campo [ID_CATEGORIA] está incorreto!"
            return message.ERROR_BAD_REQUEST
        //se estiver tudo certo ele cai aqui       
        }else{
            return false
        }

    } catch (error) {
        return false
    }
}

/* CONTEÚDOS NOVOS DAQUI PRA BAIXO */

//função para excluir os dados relacionados com a tabela principal, mesma do DAO (exclui pra depois adiconar os novos)
const excluirCategoriaIdDesafio = async function(idDesafio){
    
    //importando arquivo de mensagem
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //mandando para o DAO
        let result = await desafioCategoriaDAO.deleteCategoriaByIdDesafio(idDesafio) //manda o id do dado para a função de excluir os dados relacionados a ele na tabela principal

        //tratando retornos
        if(result){
            return message.SUCCESS_DELETED_ITEM //200 registro excluido
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL //500 model
        }
  
    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 controller
    }
}


//exportando arquivos
module.exports = {
    inserirNovoDesafioCategoria,
    atualizarDesafioCategoria,
    listarDesafioCategoria,
    buscarDesafioCategoriaID,
    excluirDesafioCategoria,
    excluirCategoriaIdDesafio
}
