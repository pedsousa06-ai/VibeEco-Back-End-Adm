/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de usuario_recompensa.
 * Data: 09/11/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.10.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo de genero do DAO (MODEL)
const usuarioRecompensaDAO = require("../../model/DAO/usuario_recompensa/usuario_recompensa.js")



//função para inserir dados
const inserirNovoUsuarioRecompensa = async function(usuarioRecompensa){

    //importando arquivo de mensagens 
    const message = JSON.parse(JSON.stringify(config_message)) //primeiro transforma em ele transformar em string para poder copiar, depois ele tranforma em json para ser utilizavel

    try {


        //enviado dados para a função validar
        let validar = await validarDados(usuarioRecompensa)

        //tratando retorno da validação
        if(validar){ //se a função validarDados() retornar a mensagem de erro ele envia para o app

            return validar // 400 (O retorno da função já é uma mensagem de erro)

        //se os dados estiverem corretos ele envia para o DAO 
        }else{
                
            //enviando dados para o DAO (mandar pro banco de dados)
            let result = await usuarioRecompensaDAO.insertUsuarioRecompensa(usuarioRecompensa)

            //validando retorno da função
            if(result){ //se o item for cadastrado corretamente ele envia uma mensagem de sucesso

                usuarioRecompensa.id = result //pegando o id do dado cadastrado e adicionando no JSON

                message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status //cria um atributo de status no cabeçalho "DEFAULT_MESSAGE" e atribui um valor predefinido no "SUCESS_CHEATED_ITEM"
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                message.DEFAULT_MESSAGE.response = usuarioRecompensa //aparece os dados no response para o usuário conferir

            //se a função retornar um "false" (o dado não foi cadastrado) ele cai aqui
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL //500 (model) item não cadastrado
            }

            return message.DEFAULT_MESSAGE //201 MENSAGEM DE SUCESSO NO CADASTRO
        }
        
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 (controller)
    }
}

//função para atualizar um dado
const atualizarUsuarioRecompensa = async function(usuarioRecompensa, id){

    //importando mensagens
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //validando id e existencia do conteúdo no banco de dados
        let validandoId = await buscarUsuarioRecompensaID(id)

        //validando retorno da função
        if(validandoId.status){ //vai olhar o status (true / false) da função

            //enviando dados para a função de validação
            let validarDados = await validarDados(usuarioRecompensa)

            //validaddo retorno da função
            if(!validarDados){

                //adicionando o id no objeto recebido na requisição, para enviar tudo em um único objeto
                usuarioRecompensa.id = Number(id)

                //enviando para para o DAO 
                let result = await usuarioRecompensaDAO.updateUsuarioRecompensa(usuarioRecompensa)

                //tratando retorno do DAO
                if(result){

                    //montando o cabeçalho de resposta, pois a requisição não pede nada pro banco
                    message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                    message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                    message.DEFAULT_MESSAGE.response = usuarioRecompensa //envia os dados no response, para o usuário visualizar

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
        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 controler
    }
}

//função para listar todos os dados
const listarUsuarioRecompensa = async function(){

    //importando arquivo de mensagens
    let message = JSON.parse(JSON.stringify(config_message)) //primeiro transforma em ele transformar em string para poder copiar, depois ele tranforma em json para ser utilizavel

    try {

        //chamando a função para enviar os dados
        let result = await usuarioRecompensaDAO.selectAllUsuarioRecompensa()

        //verificando retorno 
        if(result){

            //verificando tamanho do array
            if(result.length > 0){

                //personalizando mensagem de sucesso
                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status // True or False
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code // 200
                message.DEFAULT_MESSAGE.response.count = result.length // Mostra a quantidade de itens
                message.DEFAULT_MESSAGE.response.usuarioRecompensa = result // Mostra os itens

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
const buscarUsuarioRecompensaID = async function(id){

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
            let result = await usuarioRecompensaDAO.selectByIdUsuarioRecompensa(id)

            //vaidando retorno
            if(result){ //se tiver algo ele cai aqui

                //conferindo tamanho do array de retorno
                if(result.length > 0){ //se estiver conteúdo no array ele cai aqui

                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status //true / false
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code //200
                    message.DEFAULT_MESSAGE.response.usuarioRecompensa = result //conteúdo

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
const excluirUsuarioRecompensa = async function(id){
    
    //importando arquivo de mensagem
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //enviando id para função para verificar existencia
        let verificarId = await buscarUsuarioRecompensaID(id)

        //tratando retorno da função
        if(verificarId.status){

            //mandando para o DAO
            let result = await usuarioRecompensaDAO.deleteUsuarioRecompensa(id) 

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
        if(dados.id_usuario == undefined /*undefined sempre deve vir primeiro*/ || dados.id_usuario == "" || dados.id_usuario == null || isNaN(dados.id_usuario)){

            //personalizando mensagem de erro
            message.ERROR_BAD_REQUEST.field /*field = campo (local do erro)*/ = "O campo [ID_USUARIO] está incorreto!"
            return message.ERROR_BAD_REQUEST

        }else if(dados.id_recompensa == undefined /*undefined sempre deve vir primeiro*/ || dados.id_recompensa == "" || dados.id_recompensa == null || isNaN(dados.id_recompensa)){
            //personalizando mensagem de erro
            message.ERROR_BAD_REQUEST.field /*field = campo (local do erro)*/ = "O campo [ID_RECOMPENSA] está incorreto!"
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
const excluirRecompensaIdUsuario = async function(idUsuario){
    
    //importando arquivo de mensagem
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //mandando para o DAO
        let result = await usuarioRecompensaDAO.deleteRecompensaByIdUsuario(idUsuario) //manda o id do dado para a função de excluir os dados relacionados a ele na tabela principal

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

//função para retornar os dados da tabela princiapl pelo id da tabela secundaria
const buscarUsuarioIdRecompensa = async function(idRecompensa){

    //importando o arquivo de mensagens
    const message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //validando id
        if(idRecompensa == undefined || idRecompensa == "" || idRecompensa == null || isNaN(idRecompensa)){ //se o id estiver erra ele vai entrar aqui

            //personalizando mensagem
            message.ERROR_BAD_REQUEST.field = "O campo [id_recompensa] está incorreto!"
            return message.ERROR_BAD_REQUEST //400 (requisição incorreta)

        }else{ //se estiver tudo certo com o id ele continua o programa

            //enviando para o DAO
            let result = await usuarioRecompensaDAO.selectUsuarioByIdRecompensa(idRecompensa)

            //vaidando retorno
            if(result){ //se tiver algo ele cai aqui

                //conferindo tamanho do array de retorno
                if(result.length > 0){ //se estiver conteúdo no array ele cai aqui

                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status //true / false
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code //200
                    message.DEFAULT_MESSAGE.response.usuarioRecompensa = result //conteúdo

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
const buscarRecompensaIdUsuario = async function(idUsuario){

    //importando o arquivo de mensagens
    const message = JSON.parse(JSON.stringify(config_message))

    try {
        
        //validando id
        if(idUsuario == undefined || idUsuario == "" || idUsuario == null || isNaN(idUsuario)){ //se o id estiver erra ele vai entrar aqui

            //personalizando mensagem
            message.ERROR_BAD_REQUEST.field = "O campo [ID_USUARIO] está incorreto!"
            return message.ERROR_BAD_REQUEST //400 (requisição incorreta)

        }else{ //se estiver tudo certo com o id ele continua o programa

            //enviando para o DAO
            let result = await usuarioRecompensaDAO.selectRecompensaByIdUsuario(idUsuario)

            //vaidando retorno
            if(result){ //se tiver algo ele cai aqui

                //conferindo tamanho do array de retorno
                if(result.length > 0){ //se estiver conteúdo no array ele cai aqui

                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status //true / false
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code //200
                    message.DEFAULT_MESSAGE.response.usuarioRecompensa = result //conteúdo

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


//exportando arquivos
module.exports = {
        inserirNovoUsuarioRecompensa,
        atualizarUsuarioRecompensa,
        listarUsuarioRecompensa,
        buscarUsuarioRecompensaID,
        excluirUsuarioRecompensa,
        buscarUsuarioIdRecompensa,
        buscarRecompensaIdUsuario,
        excluirRecompensaIdUsuario
}
