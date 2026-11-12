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
const controlerUsuarioDesafio = require("./controller_usuario_desafio.js")
const controlerUsuarioPremiacao = require("./controller_usuario_premiacao.js")
const controlerUsuarioConquista = require("./controller_usuario_conquista.js")
const controlerUsuarioRecompensa = require("./controller_usuario_recompensa.js")


const { json } = require("body-parser")
const express = require("express")

// import da controller que faz upload da foto
const UPLOAD = require("../upload/controller_upload_azure.js")

// import do arquivo do JWT (JSON Web Token)
const jwt = require("../../middleware/middlewareJWT.js")

// Importando o arquivo de serviço de envio de e-mails
const arquivoEmail  = require("../../service/email.js");

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

                        // Transforma a string em um array real
                        const objetoDesafio = JSON.parse(usuario.desafio);

                        usuario.desafio = objetoDesafio //substituindo a string do json por um array real

                        //Manipulação de dados para inserir na tabela intermediaria
                        for(desafio of usuario.desafio){ //estrutura para percorrer o array recebido na requisição no json
                        
                            //cria um json com os ids, para mandar os dois juntos
                            let usuarioDesafio = {
                                "id_usuario"    : usuario.id,
                                "id_desafio"    : desafio.id,
                                "status"        : desafio.status,
                                "data_conclusao": desafio.data_conclusao
                            }

                            //enviando os ids para a controller da tabela intermediaria
                            let resultInsertUsuarioDesafio = await controlerUsuarioDesafio.inserirNovoUsuarioDesafio(usuarioDesafio)


                            if(!resultInsertUsuarioDesafio.status){
                                return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os dados não foram inseridos
                            }

                        }


                        
                        if(usuario.premiacao != undefined || usuario.premiacao != null || usuario.premiacao != ""){

                            // Transforma a string em um array real
                            const objetoPremiacao = JSON.parse(usuario.premiacao);

                            usuario.premiacao = objetoPremiacao //substituindo a string do json por um array real
                            
                            //Manipulação de dados para inserir na tabela intermediaria
                            for(premiacao of usuario.premiacao){ //estrutura para percorrer o array recebido na requisição no json
                            
                                //cria um json com os ids, para mandar os dois juntos
                                let usuarioPremiacao = {
                                    "id_usuario"    : usuario.id,
                                    "id_premiacao"  : premiacao.id
                                }

                                //enviando os ids para a controller da tabela intermediaria
                                let resultInsertUsuarioPremiacao = await controlerUsuarioPremiacao.inserirNovoUsuarioPremiacao(usuarioPremiacao)


                                if(!resultInsertUsuarioPremiacao.status){
                                    return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os dados não foram inseridos
                                }

                            }
                        }


                        if(usuario.conquista != undefined || usuario.conquista != null || usuario.conquista != ""){

                            // Transforma a string em um array real
                            const objetoConquista = JSON.parse(usuario.conquista);

                            usuario.conquista = objetoConquista //substituindo a string do json por um array real
                            
                            //Manipulação de dados para inserir na tabela intermediaria
                            for(conquista of usuario.conquista){ //estrutura para percorrer o array recebido na requisição no json
                            
                                //cria um json com os ids, para mandar os dois juntos
                                let usuarioConquista = {
                                    "id_usuario"        : usuario.id,
                                    "id_conquista"      : conquista.id,
                                    "data_conquista"    : conquista.data_conquista
                                }

                                //enviando os ids para a controller da tabela intermediaria
                                let resultInsertUsuarioConquista = await controlerUsuarioConquista.inserirNovoUsuarioConquista(usuarioConquista)


                                if(!resultInsertUsuarioConquista.status){
                                    return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os dados não foram inseridos
                                }

                            }
                        }


                        if(usuario.recompensa != undefined || usuario.recompensa != null || usuario.recompensa != ""){

                            // Transforma a string em um array real
                            const objetoRecompensa = JSON.parse(usuario.recompensa);

                            usuario.recompensa = objetoRecompensa //substituindo a string do json por um array real


                            let codigo_resgate = ""
                
                            // gerando um codigo de rastreio aleatório de 20 caracteres (letras maiúsculas e números)
                            for(let i = 0; i < 20; i++) {
                                const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                                const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                                codigo_resgate += caracteres.charAt(indiceAleatorio);
                            }
                            
                            //Manipulação de dados para inserir na tabela intermediaria
                            for(recompensa of usuario.recompensa){ //estrutura para percorrer o array recebido na requisição no json
                            
                                //cria um json com os ids, para mandar os dois juntos
                                let usuarioRecompensa = {
                                    "id_usuario"        : usuario.id,
                                    "id_recompensa"     : recompensa.id,
                                    "data_resgate"      : recompensa.data_resgate,
                                    "codigo_resgate"    : codigo_resgate
                                }

                                //enviando os ids para a controller da tabela intermediaria
                                let resultInsertUsuarioRecompensa = await controlerUsuarioRecompensa.inserirNovoUsuarioRecompensa(usuarioRecompensa)


                                if(!resultInsertUsuarioRecompensa.status){
                                    return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os dados não foram inseridos
                                }

                            }
                        }
    
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
const atualizarUsuario = async function(id, contentType, usuario, foto){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        //verificando existencia do id
        let validarId = await buscarUsuarioId(id)

        if(validarId.status){

            //verificando tipo de dados
            if(contentType){

                //validar dados
                let validarDados = await validarDadosUsuario(usuario)

                if(!validarDados){

                    // Enviando a foto para fazer o upload do arquivo
                    let urlFoto = await UPLOAD.uploadFiles(foto)
                    console.log(urlFoto)

                    if(urlFoto){

                        // Adicionando a url no objeto usuario
                        usuario.foto = urlFoto

                        //se estiver tudo certo ele adiciona o id no objeto
                        usuario.id = Number(id)
        
                        //enviando para o banco 
                        let result = await usuarioDAO.updateUsuario(usuario)

                        if(result){

                            //Manipulação de dados na tabela de relação (tabela intermediária)
                            let resultDeleteUsuarioDesafio = await controlerUsuarioDesafio.excluirDesafioIdUsuario(usuario.id) //exclui os dados relacionados , para depois inserir os novos dados relacionados a ele

                            //após a exlusão de todos os dados relacionados
                            if(resultDeleteUsuarioDesafio.status){

                                // Transforma a string em um array real
                                const objetoDesafio = JSON.parse(usuario.desafio);

                                usuario.desafio = objetoDesafio //substituindo a string do json por um array real

                                //Manipulação de dados para inserir os Generos do Filme
                                for(desafio of usuario.desafio){ //estrutura para percorrer o array recebido na requisição no json 
                                    
                                    //cria um json com os ids, para mandar os dois juntos
                                    let usuarioDesafio = {
                                        "id_usuario"    : usuario.id,
                                        "id_desafio"    : desafio.id,
                                        "status"        : desafio.status,
                                        "data_conclusao": desafio.data_conclusao
                                    }
                                    
                                    //enviando os ids para a controller da tabela intermediaria
                                    let resultInsertUsuarioDesafio = await controlerUsuarioDesafio.inserirNovoUsuarioDesafio(usuarioDesafio)

                                    if(!resultInsertUsuarioDesafio.status){
                                        console.log("Erro ao inserir os dados relacionados a tabela intermediária(desafio)")
                                        return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os generos não foram inseridos
                                    }
                                }
                            } 
                            
                            if(usuario.premiacao != undefined || usuario.premiacao != null || usuario.premiacao != ""){

                                //Manipulação de dados na tabela de relação (tabela intermediária)
                                let resultDeleteUsuarioPremiacao = await controlerUsuarioPremiacao.excluirPremiacaofioIdUsuario(usuario.id) //exclui os dados relacionados , para depois inserir os novos dados relacionados a ele

                                //após a exlusão de todos os dados relacionados
                                if(resultDeleteUsuarioPremiacao.status){


                                    // Transforma a string em um array real
                                    const objetoPremiacao = JSON.parse(usuario.premiacao);

                                    usuario.premiacao = objetoPremiacao //substituindo a string do json por um array real

                                    //Manipulação de dados para inserir os Generos do Filme
                                    for(premiacao of usuario.premiacao){ //estrutura para percorrer o array recebido na requisição no json 
                                        
                                        //cria um json com os ids, para mandar os dois juntos
                                        let usuarioPremiacao = {
                                            "id_usuario"    : usuario.id,
                                            "id_premiacao"  : premiacao.id
                                        }
                                        
                                        //enviando os ids para a controller da tabela intermediaria
                                        let resultInsertUsuarioPremiacao = await controlerUsuarioPremiacao.inserirNovoUsuarioPremiacao(usuarioPremiacao)

                                        if(!resultInsertUsuarioPremiacao.status){
                                            console.log("Erro ao inserir os dados relacionados a tabela intermediária(premiação)")
                                            return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os generos não foram inseridos
                                        }
                                    }
                                } 
                            }


                            if(usuario.conquista != undefined || usuario.conquista != null || usuario.conquista != ""){

                                //Manipulação de dados na tabela de relação (tabela intermediária)
                                let resultDeleteUsuarioConquista = await controlerUsuarioConquista.excluirConquistaIdUsuario(usuario.id) //exclui os dados relacionados , para depois inserir os novos dados relacionados a ele

                                //após a exlusão de todos os dados relacionados
                                if(resultDeleteUsuarioConquista.status){


                                    // Transforma a string em um array real
                                    const objetoConquista = JSON.parse(usuario.conquista);

                                    usuario.conquista = objetoConquista //substituindo a string do json por um array real

                                    //Manipulação de dados para inserir os Generos do Filme
                                    for(conquista of usuario.conquista){ //estrutura para percorrer o array recebido na requisição no json 
                                        
                                        //cria um json com os ids, para mandar os dois juntos
                                        let usuarioConquista = {
                                            "id_usuario"        : usuario.id,
                                            "id_conquista"      : conquista.id,
                                            "data_conquista"    : conquista.data_conquista
                                        }
                                        
                                        //enviando os ids para a controller da tabela intermediaria
                                        let resultInsertUsuarioConquista = await controlerUsuarioConquista.inserirNovoUsuarioConquista(usuarioConquista)

                                        if(!resultInsertUsuarioConquista.status){
                                            console.log("Erro ao inserir os dados relacionados a tabela intermediária(conquista)")
                                            return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os generos não foram inseridos
                                        }
                                    }
                                } 
                            }


                            if(usuario.recompensa != undefined || usuario.recompensa != null || usuario.recompensa != ""){

                                //Manipulação de dados na tabela de relação (tabela intermediária)
                                let resultDeleteUsuarioRecompensa = await controlerUsuarioRecompensa.excluirRecompensaIdUsuario(usuario.id) //exclui os dados relacionados , para depois inserir os novos dados relacionados a ele

                                //após a exlusão de todos os dados relacionados
                                if(resultDeleteUsuarioRecompensa.status){


                                    // Transforma a string em um array real
                                    const objetoRecompensa = JSON.parse(usuario.recompensa);

                                    usuario.recompensa = objetoRecompensa //substituindo a string do json por um array real

                                    let codigo_resgate = ""
                
                                    // gerando um codigo de rastreio aleatório de 20 caracteres (letras maiúsculas e números)
                                    for(let i = 0; i < 20; i++) {
                                        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                                        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                                        codigo_resgate += caracteres.charAt(indiceAleatorio);
                                    }

                                    //Manipulação de dados para inserir os Generos do Filme
                                    for(recompensa of usuario.recompensa){ //estrutura para percorrer o array recebido na requisição no json 
                                        
                                        //cria um json com os ids, para mandar os dois juntos
                                        let usuarioRecompensa = {
                                            "id_usuario"        : usuario.id,
                                            "id_recompensa"     : recompensa.id,
                                            "data_resgate"      : recompensa.data_resgate,
                                            "codigo_resgate"    : codigo_resgate
                                        }
                                        
                                        //enviando os ids para a controller da tabela intermediaria
                                        let resultInsertUsuarioRecompensa = await controlerUsuarioRecompensa.inserirNovoUsuarioRecompensa(usuarioRecompensa)

                                        if(!resultInsertUsuarioRecompensa.status){
                                            console.log("Erro ao inserir os dados relacionados a tabela intermediária(conquista)")
                                            return message.SUCESS_CREATED_ITEM_WARNING //201, mas com aviso de que os generos não foram inseridos
                                        }
                                    }
                                } 
                            }

                            message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                            message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                            message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                            message.DEFAULT_MESSAGE.response = usuario //envia os dados no response, para o usuário visualizar

                            return message.DEFAULT_MESSAGE //200
                        }else{
                            return message.ERROR_INTERNAL_SERVER_MODEL
                        }


                    }else{
                        return message.ERROR_INTERNAL_SERVER_CONTROLLER //500 (erro no controller)
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
const listarUsuario = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        
        let result = await usuarioDAO.selectAllUsuario()

        if(result){

            if(result.length > 0){

                //percorrendo o array
                for(usuario of result){

                    //cria o objeto relacionados 
                    let resultUsuarioDesafio = await controlerUsuarioDesafio.buscarDesafioIdUsuario(usuario.id) //enviando o id  para a função que busca os dados relacionados a ele

                    if(resultUsuarioDesafio.status){ //se o status for verdadeiro, ele continua o processo
                        usuario.desafio = resultUsuarioDesafio.response.usuarioDesafio //cria um atributo  dentro do Json de  e atribui o resultado relacionado a ele
                    }



                    let resultUsuarioPremiacao = await controlerUsuarioPremiacao.buscarPremiacaoIdUsuario(usuario.id) //enviando o id  para a função que busca os dados relacionados a ele

                    if(resultUsuarioPremiacao.status){ //se o status for verdadeiro, ele continua o processo
                        usuario.premiacao = resultUsuarioPremiacao.response.usuarioPremiacao //cria um atributo  dentro do Json de  e atribui o resultado relacionado a ele
                    }



                    let resultUsuarioConquista = await controlerUsuarioConquista.buscarConquistaIdUsuario(usuario.id) //enviando o id  para a função que busca os dados relacionados a ele

                    if(resultUsuarioConquista.status){ //se o status for verdadeiro, ele continua o processo
                        usuario.conquista = resultUsuarioConquista.response.usuarioConquista //cria um atributo  dentro do Json de  e atribui o resultado relacionado a ele
                    }



                    let resultUsuarioRecompensa = await controlerUsuarioRecompensa.buscarRecompensaIdUsuario(usuario.id) //enviando o id  para a função que busca os dados relacionados a ele

                    if(resultUsuarioRecompensa.status){ //se o status for verdadeiro, ele continua o processo
                        usuario.recompensa = resultUsuarioRecompensa.response.usuarioRecompensa //cria um atributo  dentro do Json de  e atribui o resultado relacionado a ele
                    }


                }


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

                    for(usuario of result){

                        //cria o objeto relacionado 
                        let resultUsuarioDesafio = await controlerUsuarioDesafio.buscarDesafioIdUsuario(id) //enviando o id  para a função que busca os dados relacionados a ele

                        if(resultUsuarioDesafio.status){ //se o status for verdadeiro, ele continua o processo
                            usuario.desafio = resultUsuarioDesafio.response.usuarioDesafio //
                        }



                        let resultUsuarioPremiacao = await controlerUsuarioPremiacao.buscarPremiacaoIdUsuario(id) //enviando o id  para a função que busca os dados relacionados a ele

                        if(resultUsuarioPremiacao.status){ //se o status for verdadeiro, ele continua o processo
                            usuario.premiacao = resultUsuarioPremiacao.response.usuarioPremiacao //
                        }



                        let resultUsuarioConquista = await controlerUsuarioConquista.buscarConquistaIdUsuario(id) //enviando o id  para a função que busca os dados relacionados a ele

                        if(resultUsuarioConquista.status){ //se o status for verdadeiro, ele continua o processo
                            usuario.conquista = resultUsuarioConquista.response.usuarioConquista //
                        }



                        let resultUsuarioRecompensa = await controlerUsuarioRecompensa.buscarRecompensaIdUsuario(id) //enviando o id  para a função que busca os dados relacionados a ele

                        if(resultUsuarioRecompensa.status){ //se o status for verdadeiro, ele continua o processo
                            usuario.recompensa = resultUsuarioRecompensa.response.usuarioRecompensa //
                        }
                    }

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

            //excluindo relacionamento 
            let resultDeleteUsuarioDesafio = await controlerUsuarioDesafio.excluirDesafioIdUsuario(id) //exclui os dados relacionados a ele
            console.log(resultDeleteUsuarioDesafio)

            if(!resultDeleteUsuarioDesafio.status){
                return message.ERROR_INTERNAL_SERVER_MODEL //500
            }



            let resultDeleteUsuarioPremiacao = await controlerUsuarioPremiacao.excluirPremiacaofioIdUsuario(id) //exclui os dados relacionados a ele

            if(!resultDeleteUsuarioPremiacao.status){
                return message.ERROR_INTERNAL_SERVER_MODEL //500
            }



            let resultDeleteUsuarioConquista = await controlerUsuarioConquista.excluirConquistaIdUsuario(id) //exclui os dados relacionados a ele

            if(!resultDeleteUsuarioConquista.status){
                return message.ERROR_INTERNAL_SERVER_MODEL //500
            }



            let resultDeleteUsuarioRecompensa = await controlerUsuarioRecompensa.excluirRecompensaIdUsuario(id) //exclui os dados relacionados a ele

            if(!resultDeleteUsuarioRecompensa.status){
                return message.ERROR_INTERNAL_SERVER_MODEL //500
            }



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

// função para validar email e senha do usuário
const validarLogin = async function(login){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        //tratando id
        //tratando o id, para não mandar conteúdos errados pro banco
        if(login.email == undefined || login.email == "" || login.email == null || login.email.length > 255){

            //Criando um novo atributo no Json de mensagem para personalizar conforme o erro (NESSE CASO O ERRO É 400)
            message.ERROR_BAD_REQUEST.field = "[EMAIL] INVALIDO"
            return message.ERROR_BAD_REQUEST
    
        }else if(login.senha == undefined || login.senha == "" || login.senha == null || login.senha.length < 8 || login.senha.length > 25){

            //Criando um novo atributo no Json de mensagem para personalizar conforme o erro (NESSE CASO O ERRO É 400)
            message.ERROR_BAD_REQUEST.field = "[SENHA] INVALIDO"
            return message.ERROR_BAD_REQUEST
    
        }else{
            
            //enviando para o banco
            let result = await usuarioDAO.validarLogin(login)

            //tratando retorno
            if(result){

                //verificando tamanho do array de resposta
                if(result.length > 0){

                    // criando o token JWT com o id do usuario para mandar na resposta
                    let tokenUsuario = await jwt.createJWT(result.id)

                    // adicionando o token JTW no objeto de resposta
                    result[0].token = tokenUsuario

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

//funcao para recuperar a senha do usuario
const recuperarAcessoUsuario = async function(contentType, emailUsuario){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        // variavel para guardar o codigo de redefinição
        let codigo_redefinicao = ""
                
        // gerando um codigo de aleatório de 6 caracteres (letras maiúsculas e números)
        for(let i = 0; i < 6; i++) {
            const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
            codigo_redefinicao += caracteres.charAt(indiceAleatorio);
        }

        // variavel para guardar o assunto do email
        let assunto = "Recuperação de senha - VibeEco"

        // enviando o email para o usuário
        const resultadoEnvio = await arquivoEmail.enviarEmail(emailUsuario.email, assunto, codigo_redefinicao)

        // montando o objeto de resposta
        //enviando para o banco 
        let objetoResposta = {
            "email" : emailUsuario.email,
            "codigo_redefinicao" : codigo_redefinicao
        }

        if(resultadoEnvio){
            message.DEFAULT_MESSAGE.status = message.SUCCESS_EMAIL_SENT.status
            message.DEFAULT_MESSAGE.status_code = message.SUCCESS_EMAIL_SENT.status_code
            message.DEFAULT_MESSAGE.message = message.SUCCESS_EMAIL_SENT.message
            message.DEFAULT_MESSAGE.response = objetoResposta

            return message.DEFAULT_MESSAGE //200
        }else{
            return message.ERROR_EMAIL_SEND //500 (erro ao enviar o email)
        }


    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }

}

//funcao para redefinir a senha
const redefinirSenhaUsuario = async function(id, contentType, usuario){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        //verificando existencia do id
        let validarId = await buscarUsuarioId(id)


        if(validarId.status){

            //verificando tipo de dados
            if(contentType){

                //se estiver tudo certo ele adiciona o id no objeto
                usuario.id = Number(id)

                //enviando para o banco 
                let result = await usuarioDAO.updateSenhaUsuario(usuario)

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
                return message.ERROR_CONTENT_TYPE
            }

        }else{
            return validarId
        }
        
    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }

}


/* EXPORTANDO FUNÇÕES */
module.exports = {
    inserirNovaUsuario,
    atualizarUsuario,
    listarUsuario,
    buscarUsuarioId,
    excluirUsuario,
    validarLogin,
    recuperarAcessoUsuario,
    redefinirSenhaUsuario
}