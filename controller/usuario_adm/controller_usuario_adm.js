/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de usuario_adm,
 *           além de login (JWT), perfil do administrador logado e recuperação de senha.
 * Data: 28/10/2026
 * Autor: Lucas Dias Brnadão Kolle
 * Versão: 1.0.10.26
 *******************************************************************************************************************************************************************************************/

//importando arquivo de mensagens
const config_message = require("../modulo/configMessages.js")

//importando arquivo do DAO (MODEL)
const usuarioADMDAO = require("../../model/DAO/usuario_adm/usuario_adm.js")

// import do arquivo do JWT (JSON Web Token)
const jwt = require("../../middleware/middlewareJWT.js")

// Importando o arquivo de serviço de envio de e-mails
const arquivoEmail = require("../../service/email.js")

// hash de senha e limitador de tentativas
const senhaService = require("../../service/senha.js")
const limitador = require("../../service/limitador.js")

const crypto = require("crypto")

const SENHA_MIN = 8
const SENHA_MAX = 64
const MAX_TENTATIVAS_LOGIN = 10
const MAX_TENTATIVAS_CODIGO = 5

/* FUNÇÕES AUXILIARES */

const erro = function(status_code, mensagem){
    return { status: false, status_code, message: mensagem }
}

const normalizarEmail = function(email){
    return email ? String(email).trim().toLowerCase() : ""
}

const emailValido = function(email){
    return /^\S+@\S+\.\S+$/.test(email) && email.length <= 255
}

// remove a senha de qualquer objeto antes de devolver ao front
const semSenha = function(obj){
    const copia = { ...obj }
    delete copia.senha
    return copia
}

/* FUNÇÕES PARA O CRUD */

//função para inserir um novo dado
const inserirNovaUsuarioADM = async function(contentType, usuarioADM){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        if(String(contentType).toUpperCase().startsWith("APPLICATION/JSON")){

            let validando = validarUsuarioADM(usuarioADM, true)

            if(!validando){

                let dados = {
                    email: normalizarEmail(usuarioADM.email),
                    senha: senhaService.gerarHash(usuarioADM.senha),
                    id_nivel_acesso: Number(usuarioADM.id_nivel_acesso)
                }

                if(await usuarioADMDAO.selectByEmailUsuarioADM(dados.email)){
                    return erro(409, "Já existe um administrador com esse e-mail.")
                }

                let result = await usuarioADMDAO.insertUsuarioADM(dados)

                if(result){
                    message.DEFAULT_MESSAGE.status = message.SUCESS_CREATED_ITEM.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_CREATED_ITEM.status_code
                    message.DEFAULT_MESSAGE.message = message.SUCESS_CREATED_ITEM.message
                    message.DEFAULT_MESSAGE.response = { id: result, email: dados.email, id_nivel_acesso: dados.id_nivel_acesso }

                    return message.DEFAULT_MESSAGE
                }else{
                    return message.ERROR_INTERNAL_SERVER_MODEL
                }
            }else{
                return validando
            }

        }else{
            return message.ERROR_CONTENT_TYPE
        }

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para atualizar um dado (a senha é opcional: se não vier, permanece a atual)
const atualizarUsuarioADM = async function(id, contentType, usuarioADM){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validarId = await buscarUsuarioADMId(id)

        if(validarId.status){

            if(String(contentType).toUpperCase().startsWith("APPLICATION/JSON")){

                let validarDados = validarUsuarioADM(usuarioADM, false)

                if(!validarDados){

                    let dados = {
                        id: Number(id),
                        email: normalizarEmail(usuarioADM.email),
                        id_nivel_acesso: Number(usuarioADM.id_nivel_acesso),
                        senha: usuarioADM.senha ? senhaService.gerarHash(usuarioADM.senha) : null
                    }

                    let outro = await usuarioADMDAO.selectByEmailUsuarioADM(dados.email)
                    if(outro && Number(outro.id) !== dados.id){
                        return erro(409, "Já existe um administrador com esse e-mail.")
                    }

                    let result = await usuarioADMDAO.updateUsuarioADM(dados)

                    if(result){
                        message.DEFAULT_MESSAGE.status = message.SUCCESS_UPDATE_ITEM.status
                        message.DEFAULT_MESSAGE.status_code = message.SUCCESS_UPDATE_ITEM.status_code
                        message.DEFAULT_MESSAGE.message = message.SUCCESS_UPDATE_ITEM.message
                        message.DEFAULT_MESSAGE.response = { id: dados.id, email: dados.email, id_nivel_acesso: dados.id_nivel_acesso }

                        return message.DEFAULT_MESSAGE
                    }else{
                        return message.ERROR_INTERNAL_SERVER_MODEL
                    }

                }else{
                    return validarDados
                }
            }else{
                return message.ERROR_CONTENT_TYPE
            }

        }else{
            return validarId
        }

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para retornar todos os dados
const listarUsuarioADM = async function(){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await usuarioADMDAO.selectAllUsuarioADM()

        if(result){
            if(result.length > 0){
                message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                message.DEFAULT_MESSAGE.response.count = result.length
                message.DEFAULT_MESSAGE.response.usuarioADM = result

                return message.DEFAULT_MESSAGE
            }else{
                return message.ERROR_NOT_FOUND
            }
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL
        }
    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para bucar um dado pelo id
const buscarUsuarioADMId = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        if(id == undefined || id == "" || id == null || isNaN(id)){
            message.ERROR_BAD_REQUEST.field = "[ID] INVÁLIDO"
            return message.ERROR_BAD_REQUEST
        }else{

            let result = await usuarioADMDAO.selectByIdUsuarioADM(id)

            if(result){
                if(result.length > 0){
                    message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
                    message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
                    message.DEFAULT_MESSAGE.response.usuarioADM = result

                    return message.DEFAULT_MESSAGE
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
const excluirUsuarioADM = async function(id){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validarId = await buscarUsuarioADMId(id)

        if(validarId.status){
            let result = await usuarioADMDAO.deleteUsuarioADM(id)

            if(result){
                return message.SUCCESS_DELETED_ITEM
            }else{
                return message.ERROR_INTERNAL_SERVER_MODEL
            }
        }else{
            return validarId
        }

    } catch (error) {
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

/* LOGIN (JWT) */

// função para validar email e senha do administrador e devolver o token JWT
const validarLogin = async function(login){

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let email = normalizarEmail(login?.email)
        let senha = login?.senha

        if(!email || !emailValido(email)){
            message.ERROR_BAD_REQUEST.field = "[EMAIL] INVALIDO"
            return message.ERROR_BAD_REQUEST

        }else if(typeof senha !== "string" || senha.length < SENHA_MIN || senha.length > 255){
            message.ERROR_BAD_REQUEST.field = "[SENHA] INVALIDO"
            return message.ERROR_BAD_REQUEST
        }

        const chaveLimite = `login:${email}`
        if(limitador.bloqueado(chaveLimite, MAX_TENTATIVAS_LOGIN)){
            return erro(429, "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.")
        }

        let result = await usuarioADMDAO.selectLoginPorEmail(email)

        if(!result){
            return message.ERROR_INTERNAL_SERVER_MODEL
        }

        // mesma resposta para "e-mail não existe" e "senha errada", para não revelar quais e-mails são cadastrados
        if(result.length === 0 || !senhaService.verificarSenha(senha, result[0].senha)){
            limitador.registrarFalha(chaveLimite)
            return erro(401, "E-mail ou senha incorretos.")
        }

        limitador.limpar(chaveLimite)

        let adm = result[0]

        // senha antiga em texto puro: converte para hash agora que sabemos que está correta
        if(!senhaService.ehHash(adm.senha)){
            await usuarioADMDAO.updateSenhaUsuarioADM(adm.id, senhaService.gerarHash(senha))
        }

        let tokenUsuario = await jwt.createJWT(adm.id)

        message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
        message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
        message.DEFAULT_MESSAGE.response.usuarioADM = [{ ...semSenha(adm), token: tokenUsuario }]

        return message.DEFAULT_MESSAGE

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

//função para validar os dados recebidos na requição
const validarUsuarioADM = function(dados, senhaObrigatoria){

    let message = JSON.parse(JSON.stringify(config_message))

    let email = normalizarEmail(dados?.email)

    if(!emailValido(email)){
        message.ERROR_BAD_REQUEST.field = "[EMAIL] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else if((senhaObrigatoria || dados.senha) && (typeof dados.senha !== "string" || dados.senha.length < SENHA_MIN || dados.senha.length > SENHA_MAX)){
        message.ERROR_BAD_REQUEST.field = `[SENHA] INVALIDO (de ${SENHA_MIN} a ${SENHA_MAX} caracteres)`
        return message.ERROR_BAD_REQUEST

    }else if(dados.id_nivel_acesso == undefined || dados.id_nivel_acesso === "" || dados.id_nivel_acesso == null || isNaN(dados.id_nivel_acesso)){
        message.ERROR_BAD_REQUEST.field = "[ID_NIVEL_ACESSO] INVALIDO"
        return message.ERROR_BAD_REQUEST

    }else{
        return false
    }
}

/* PERFIL DO ADMINISTRADOR LOGADO (tela de Configurações) */

// devolve os dados do administrador dono do token
const obterMeuPerfil = async function(adminId){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await usuarioADMDAO.selectByIdUsuarioADM(adminId)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL
        if(result.length === 0) return erro(404, "Administrador não encontrado.")

        message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
        message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
        message.DEFAULT_MESSAGE.response = { usuarioADM: result[0] }
        return message.DEFAULT_MESSAGE

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

// altera o e-mail do administrador logado
const atualizarMeuPerfil = async function(adminId, dados){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let email = normalizarEmail(dados?.email)

        if(!emailValido(email)){
            message.ERROR_BAD_REQUEST.field = "[EMAIL] INVALIDO"
            return message.ERROR_BAD_REQUEST
        }

        let outro = await usuarioADMDAO.selectByEmailUsuarioADM(email)
        if(outro && Number(outro.id) !== Number(adminId)){
            return erro(409, "Já existe um administrador com esse e-mail.")
        }

        if(!await usuarioADMDAO.updateEmailUsuarioADM(adminId, email)){
            return message.ERROR_INTERNAL_SERVER_MODEL
        }

        return await obterMeuPerfil(adminId)

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

// altera a senha do administrador logado, exigindo a senha atual
const alterarMinhaSenha = async function(adminId, dados){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let senhaAtual = dados?.senhaAtual
        let novaSenha = dados?.novaSenha

        if(typeof senhaAtual !== "string" || senhaAtual === ""){
            message.ERROR_BAD_REQUEST.field = "[SENHA_ATUAL] OBRIGATORIA"
            return message.ERROR_BAD_REQUEST
        }
        if(typeof novaSenha !== "string" || novaSenha.length < SENHA_MIN || novaSenha.length > SENHA_MAX){
            message.ERROR_BAD_REQUEST.field = `[NOVA_SENHA] INVALIDA (de ${SENHA_MIN} a ${SENHA_MAX} caracteres)`
            return message.ERROR_BAD_REQUEST
        }

        const chaveLimite = `senha:${adminId}`
        if(limitador.bloqueado(chaveLimite, MAX_TENTATIVAS_LOGIN)){
            return erro(429, "Muitas tentativas. Aguarde alguns minutos e tente novamente.")
        }

        let salva = await usuarioADMDAO.selectSenhaPorId(adminId)
        if(salva === false){
            return erro(404, "Administrador não encontrado.")
        }

        if(!senhaService.verificarSenha(senhaAtual, salva)){
            limitador.registrarFalha(chaveLimite)
            return erro(400, "A senha atual está incorreta.")
        }

        if(senhaAtual === novaSenha){
            return erro(400, "A nova senha deve ser diferente da atual.")
        }

        limitador.limpar(chaveLimite)

        if(!await usuarioADMDAO.updateSenhaUsuarioADM(adminId, senhaService.gerarHash(novaSenha))){
            return message.ERROR_INTERNAL_SERVER_MODEL
        }

        message.DEFAULT_MESSAGE.status = true
        message.DEFAULT_MESSAGE.status_code = 200
        message.DEFAULT_MESSAGE.message = "Senha alterada com sucesso!"
        message.DEFAULT_MESSAGE.response = {}
        return message.DEFAULT_MESSAGE

        const adm = await usuarioADMDAO.validarCodigoRecuperacao(email, codigo)
        if(adm){
            message.DEFAULT_MESSAGE.status = true
            message.DEFAULT_MESSAGE.status_code = 200
            message.DEFAULT_MESSAGE.message = "Código validado com sucesso!"
            message.DEFAULT_MESSAGE.response = { email: adm.email, id: adm.id }
            return message.DEFAULT_MESSAGE
        } else {
            return {
                status: false,
                status_code: 400,
                message: "Código de verificação incorreto ou expirado. Solicite um novo código."
            }
        }
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

/* ESQUECI A SENHA */

//funcao para solicitar o código de recuperação por e-mail
const recuperarAcessoUsuarioADM = async function(contentType, emailUsuario){

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let email = normalizarEmail(emailUsuario?.email)

        if(!emailValido(email)){
            message.ERROR_BAD_REQUEST.field = "[EMAIL] INVALIDO"
            return message.ERROR_BAD_REQUEST
        }

        const chaveLimite = `recuperar:${email}`
        if(limitador.bloqueado(chaveLimite, 5)){
            return erro(429, "Muitas solicitações. Aguarde alguns minutos para pedir um novo código.")
        }
        limitador.registrarFalha(chaveLimite) // conta toda solicitação, para limitar o envio de e-mails

        // A resposta é sempre a mesma, exista o e-mail ou não (evita descobrir quais e-mails são administradores)
        message.DEFAULT_MESSAGE.status = true
        message.DEFAULT_MESSAGE.status_code = 200
        message.DEFAULT_MESSAGE.message = "Se o e-mail estiver cadastrado, enviaremos um código de recuperação."
        message.DEFAULT_MESSAGE.response = { email: email }

        const admExiste = await usuarioADMDAO.selectByEmailUsuarioADM(email)
        if(!admExiste){
            return message.DEFAULT_MESSAGE
        }

        // código numérico de 6 dígitos gerado com fonte criptograficamente segura
        const codigo_redefinicao = String(crypto.randomInt(100000, 1000000))

        // salvando código no banco de dados com validade de 15 minutos
        await usuarioADMDAO.salvarCodigoRecuperacao(email, codigo_redefinicao, 15)

        const resultadoEnvio = await arquivoEmail.enviarEmail(email, "Recuperação de senha - VibeEco", codigo_redefinicao)

        const emDesenvolvimento = process.env.NODE_ENV !== "production"

        if(resultadoEnvio){
            console.log(`[VIBEECO] E-mail de recuperação enviado para: ${email}`)
        }else{
            console.warn("[VIBEECO] Falha ao enviar o e-mail (verifique EMAIL_USER/EMAIL_PASSWORD; no Gmail é preciso usar Senha de App).")
            if(emDesenvolvimento){
                console.warn(`[VIBEECO - DEV] Código de verificação para ${email}: >>> ${codigo_redefinicao} <<<`)
            }
        }

        // O código só volta na resposta se EXPOR_CODIGO_DEV=true E a API não estiver em produção (usado pelo test_recuperacao.js)
        if(emDesenvolvimento && process.env.EXPOR_CODIGO_DEV === "true"){
            message.DEFAULT_MESSAGE.response.codigo_redefinicao = codigo_redefinicao
        }

        return message.DEFAULT_MESSAGE

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

// confere o código e conta as tentativas erradas; após o limite, o código é invalidado
const conferirCodigo = async function(email, codigo){

    const chaveLimite = `codigo:${email}`

    if(limitador.bloqueado(chaveLimite, MAX_TENTATIVAS_CODIGO)){
        await usuarioADMDAO.limparCodigoRecuperacao(email)
        return { erro: erro(429, "Muitas tentativas incorretas. Solicite um novo código.") }
    }

    const adm = await usuarioADMDAO.validarCodigoRecuperacao(email, codigo)

    if(!adm){
        limitador.registrarFalha(chaveLimite)
        return { erro: erro(400, "Código de verificação incorreto ou expirado. Solicite um novo código.") }
    }

    return { adm, chaveLimite }
}

// validar código de recuperação (etapa 2 do "esqueci a senha")
const validarCodigoAcesso = async function(dados){
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let email = normalizarEmail(dados?.email)
        let codigo = dados?.codigo ? String(dados.codigo).trim() : ""

        if(!email || !codigo){
            message.ERROR_BAD_REQUEST.field = "[EMAIL E CODIGO] OBRIGATORIOS"
            return message.ERROR_BAD_REQUEST
        }

        const conferencia = await conferirCodigo(email, codigo)
        if(conferencia.erro){
            return conferencia.erro
        }

        // o contador NÃO é zerado aqui: o código continua sendo conferido na redefinição
        message.DEFAULT_MESSAGE.status = true
        message.DEFAULT_MESSAGE.status_code = 200
        message.DEFAULT_MESSAGE.message = "Código validado com sucesso!"
        message.DEFAULT_MESSAGE.response = { email: conferencia.adm.email }
        return message.DEFAULT_MESSAGE

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

// redefinir senha com código (etapa 3 do "esqueci a senha")
const redefinirSenhaComCodigo = async function(dados){
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let email = normalizarEmail(dados?.email)
        let codigo = dados?.codigo ? String(dados.codigo).trim() : ""
        let novaSenha = typeof dados?.novaSenha === "string" ? dados.novaSenha : ""

        if(!email || !codigo || !novaSenha){
            message.ERROR_BAD_REQUEST.field = "[DADOS_INCOMPLETOS]"
            return message.ERROR_BAD_REQUEST
        }

        if(novaSenha.length < SENHA_MIN || novaSenha.length > SENHA_MAX){
            return erro(400, `A nova senha deve ter de ${SENHA_MIN} a ${SENHA_MAX} caracteres.`)
        }

        const conferencia = await conferirCodigo(email, codigo)
        if(conferencia.erro){
            return conferencia.erro
        }

        // grava o hash da nova senha e apaga o código (uso único)
        const atualizou = await usuarioADMDAO.updateSenhaPorEmail(email, senhaService.gerarHash(novaSenha))

        if(atualizou){
            limitador.limpar(conferencia.chaveLimite)
            limitador.limpar(`login:${email}`)
            message.DEFAULT_MESSAGE.status = true
            message.DEFAULT_MESSAGE.status_code = 200
            message.DEFAULT_MESSAGE.message = "Senha redefinida com sucesso!"
            message.DEFAULT_MESSAGE.response = { email: email }
            return message.DEFAULT_MESSAGE
        }else{
            return message.ERROR_INTERNAL_SERVER_MODEL
        }
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    inserirNovaUsuarioADM,
    atualizarUsuarioADM,
    listarUsuarioADM,
    buscarUsuarioADMId,
    excluirUsuarioADM,
    validarLogin,
    obterMeuPerfil,
    atualizarMeuPerfil,
    alterarMinhaSenha,
    recuperarAcessoUsuarioADM,
    validarCodigoAcesso,
    redefinirSenhaComCodigo
}
