/********************************************************************************************************************************************************************************************
 * Objetivo: Consultas usadas pela tela "Usuários" do painel administrativo (cadastro simples, edição parcial, status e perfis).
 * Todas as consultas usam parâmetros (?) para evitar SQL Injection.
 ********************************************************************************************************************************************************************************************/

const knex = require("knex")
const knexConfig = require("../../database_config_knex/knex_file.js")
const knexConex = knex(knexConfig.development)

// lista os perfis (níveis de acesso) para o select da tela
const selectNiveisAcesso = async function(){
    try {
        let result = await knexConex.raw(`select id, nivel from tbl_nivel_acesso order by id`)
        return Array.isArray(result) ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

// retorna o id do usuário que já usa o e-mail (ou false)
const selectIdPorEmail = async function(email){
    try {
        let result = await knexConex.raw(`select id from tbl_usuario where email = ? limit 1`, [email])
        if(Array.isArray(result) && result[0].length > 0){
            return result[0][0].id
        }
        return false
    } catch (error) {
        console.log(error)
        return false
    }
}

/*
 * Cadastro feito pelo administrador: recebe só nome, e-mail, senha e perfil.
 * Os demais campos obrigatórios (escolaridade, instituição, level, status) recebem o menor id existente
 * na respectiva tabela de apoio; status = o primeiro status ativo. XP e coins começam em 0.
 */
const insertUsuarioPainel = async function(usuario){
    try {
        let result = await knexConex.raw(
            `insert into tbl_usuario (
                nome, email, senha, foto, total_xp, coins, data_ultimo_acesso,
                id_escolaridade, id_status, id_instituicao, id_nivel_acesso, id_level
             )
             values (
                ?, ?, ?, '', 0, 0, NOW(),
                (select min(id) from tbl_escolaridade),
                (select id from tbl_status where is_active = 1 order by id limit 1),
                (select min(id) from tbl_instituicao),
                ?,
                (select min(id) from tbl_level_user)
             )`,
            [usuario.nome, usuario.email, usuario.senha, usuario.id_nivel_acesso]
        )
        return result ? result[0].insertId : false
    } catch (error) {
        console.log(error)
        return false
    }
}

// edição parcial: só nome, e-mail e perfil (não exige foto, senha, xp etc.)
const updateUsuarioPainel = async function(usuario){
    try {
        let result = await knexConex.raw(
            `update tbl_usuario set nome = ?, email = ?, id_nivel_acesso = ? where id = ?`,
            [usuario.nome, usuario.email, usuario.id_nivel_acesso, usuario.id]
        )
        return !!result
    } catch (error) {
        console.log(error)
        return false
    }
}

// ativa/desativa: procura em tbl_status o registro com is_active correspondente
const updateStatusUsuario = async function(id, ativo){
    try {
        let result = await knexConex.raw(
            `update tbl_usuario
                set id_status = (select id from tbl_status where is_active = ? order by id limit 1)
                where id = ?`,
            [ativo ? 1 : 0, id]
        )
        return !!result
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    selectNiveisAcesso,
    selectIdPorEmail,
    insertUsuarioPainel,
    updateUsuarioPainel,
    updateStatusUsuario
}
