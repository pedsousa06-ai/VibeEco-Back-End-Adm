/********************************************************************************************************************************************************************************************
 * Objetivo: Regras da tela "Usuários" do painel (listar perfis, cadastrar, editar e ativar/desativar).
 * A listagem e a exclusão continuam em controller_usuario.js (listarUsuario / excluirUsuario).
 *******************************************************************************************************************************************************************************************/

const config_message = require("../modulo/configMessages.js")
const usuarioPainelDAO = require("../../model/DAO/usuario/usuario_painel.js")
const usuarioDAO = require("../../model/DAO/usuario/usuario.js")

const erro = function(status_code, mensagem, field){
    let r = { status: false, status_code, message: mensagem }
    if(field) r.field = field
    return r
}

const normalizarEmail = function(email){
    return email ? String(email).trim().toLowerCase() : ""
}

// valida nome, e-mail e perfil (a senha é validada à parte, só no cadastro)
const validarBasico = function(dados){
    let nome = dados?.nome ? String(dados.nome).trim() : ""
    let email = normalizarEmail(dados?.email)

    if(!nome || nome.length > 100)  return erro(400, "Os dados enviados na requisição não estão corretos!", "[NOME] INVALIDO")
    if(!/^\S+@\S+\.\S+$/.test(email) || email.length > 255) return erro(400, "Os dados enviados na requisição não estão corretos!", "[EMAIL] INVALIDO")
    if(dados.id_nivel_acesso === undefined || dados.id_nivel_acesso === null || dados.id_nivel_acesso === "" || isNaN(dados.id_nivel_acesso)){
        return erro(400, "Os dados enviados na requisição não estão corretos!", "[ID_NIVEL_ACESSO] INVALIDO")
    }
    return false
}

// perfis disponíveis (alimenta o select da tela)
const listarPerfis = async function(){
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let result = await usuarioPainelDAO.selectNiveisAcesso()
        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL
        if(result.length === 0) return message.ERROR_NOT_FOUND

        message.DEFAULT_MESSAGE.status = true
        message.DEFAULT_MESSAGE.status_code = 200
        message.DEFAULT_MESSAGE.response = { count: result.length, perfis: result }
        return message.DEFAULT_MESSAGE
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

// cadastro feito pelo administrador
const inserirUsuarioPainel = async function(dados){
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let invalido = validarBasico(dados)
        if(invalido) return invalido

        // a senha de usuários da plataforma segue a mesma regra da API de Usuários (8 a 25 caracteres, texto puro)
        if(typeof dados.senha !== "string" || dados.senha.length < 8 || dados.senha.length > 25){
            return erro(400, "Os dados enviados na requisição não estão corretos!", "[SENHA] INVALIDO (de 8 a 25 caracteres)")
        }

        let usuario = {
            nome: String(dados.nome).trim(),
            email: normalizarEmail(dados.email),
            senha: dados.senha,
            id_nivel_acesso: Number(dados.id_nivel_acesso)
        }

        if(await usuarioPainelDAO.selectIdPorEmail(usuario.email)){
            return erro(409, "Já existe um usuário com esse e-mail.")
        }

        let id = await usuarioPainelDAO.insertUsuarioPainel(usuario)
        if(!id) return message.ERROR_INTERNAL_SERVER_MODEL

        message.DEFAULT_MESSAGE.status = true
        message.DEFAULT_MESSAGE.status_code = 201
        message.DEFAULT_MESSAGE.message = "Registro inserido com sucesso!"
        message.DEFAULT_MESSAGE.response = { id, nome: usuario.nome, email: usuario.email, id_nivel_acesso: usuario.id_nivel_acesso }
        return message.DEFAULT_MESSAGE
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

// edição parcial (nome, e-mail, perfil)
const atualizarUsuarioPainel = async function(id, dados){
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        if(id === undefined || id === "" || isNaN(id)){
            return erro(400, "Os dados enviados na requisição não estão corretos!", "[ID] INVÁLIDO")
        }

        let invalido = validarBasico(dados)
        if(invalido) return invalido

        let existe = await usuarioDAO.selectByIdUsuario(Number(id))
        if(!existe) return message.ERROR_INTERNAL_SERVER_MODEL
        if(existe.length === 0) return message.ERROR_NOT_FOUND

        let usuario = {
            id: Number(id),
            nome: String(dados.nome).trim(),
            email: normalizarEmail(dados.email),
            id_nivel_acesso: Number(dados.id_nivel_acesso)
        }

        let outro = await usuarioPainelDAO.selectIdPorEmail(usuario.email)
        if(outro && Number(outro) !== usuario.id){
            return erro(409, "Já existe um usuário com esse e-mail.")
        }

        if(!await usuarioPainelDAO.updateUsuarioPainel(usuario)) return message.ERROR_INTERNAL_SERVER_MODEL

        message.DEFAULT_MESSAGE.status = true
        message.DEFAULT_MESSAGE.status_code = 200
        message.DEFAULT_MESSAGE.message = "Item atualizado com sucesso"
        message.DEFAULT_MESSAGE.response = usuario
        return message.DEFAULT_MESSAGE
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

// ativar / desativar o acesso
const alterarStatusUsuario = async function(id, dados){
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        if(id === undefined || id === "" || isNaN(id)){
            return erro(400, "Os dados enviados na requisição não estão corretos!", "[ID] INVÁLIDO")
        }
        if(typeof dados?.ativo !== "boolean"){
            return erro(400, "Os dados enviados na requisição não estão corretos!", "[ATIVO] deve ser true ou false")
        }

        let existe = await usuarioDAO.selectByIdUsuario(Number(id))
        if(!existe) return message.ERROR_INTERNAL_SERVER_MODEL
        if(existe.length === 0) return message.ERROR_NOT_FOUND

        if(!await usuarioPainelDAO.updateStatusUsuario(Number(id), dados.ativo)) return message.ERROR_INTERNAL_SERVER_MODEL

        message.DEFAULT_MESSAGE.status = true
        message.DEFAULT_MESSAGE.status_code = 200
        message.DEFAULT_MESSAGE.message = dados.ativo ? "Usuário ativado com sucesso." : "Usuário desativado com sucesso."
        message.DEFAULT_MESSAGE.response = { id: Number(id), ativo: dados.ativo }
        return message.DEFAULT_MESSAGE
    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    listarPerfis,
    inserirUsuarioPainel,
    atualizarUsuarioPainel,
    alterarStatusUsuario
}
