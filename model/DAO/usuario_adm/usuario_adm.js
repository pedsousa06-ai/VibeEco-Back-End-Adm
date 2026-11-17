/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de usuario_adm
 * Data: 28/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.10.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development) //aciona o knex e passa as configurações estabelecidas no arquivo

/* INICIANDO CRUD DA TABELA DE CATEGORIA */

//inserir dado
const insertUsuarioADM = async function(usuarioADM){

    try {

        //criando variável sql
        let sql = 
            `
                insert into tbl_usuario_adm (
                    email,
                    senha,
                    id_nivel_acesso
                )
                values(
                    "${usuarioADM.email}",
                    "${usuarioADM.senha}",
                    ${usuarioADM.id_nivel_acesso}
                );
            `

        //executando no banco de dados
        let result = await knexConex.raw(sql) //usa a coneção com banco para executar a variável sql

        //validadndo retorno do banco
        if(result){
            return result[0].insertId //pega o id do item adicionado para retornar, ao invés de retornar só o "true"
        }else{
            return false
        }
        
    } catch (error) {
        console.log(error)
        return false
    }

}

//atualizar dado
const updateUsuarioADM = async function(usuarioADM){

    try {

        //criando variável sql
        let sql = 
        `
            update tbl_usuario_adm set 
                email 	        = "${usuarioADM.email}",
                senha 	        = "${usuarioADM.senha}",    
                id_nivel_acesso = ${usuarioADM.id_nivel_acesso}
            where id = ${usuarioADM.id};
        `

        let result = await knexConex.raw(sql)

        //validando retorno
        if(result){
            return true
        }else{
            return false
        }
        
    } catch (error) {
        return false
    }

}

//retornar todos os dados
const selectAllUsuarioADM = async function(){

    try {
        
        //criando variável sql
        let sql = `select	tbl_usuario_adm.id, tbl_usuario_adm.email, tbl_usuario_adm.senha, 
                            tbl_nivel_acesso.nivel as nivel_acesso
                                from tbl_usuario_adm
                                    inner join tbl_nivel_acesso
                                        on tbl_usuario_adm.id_nivel_acesso = tbl_nivel_acesso.id
                        order by tbl_usuario_adm.id desc;`

        //enviando para o banco de dados
        let result = await knexConex.raw(sql)

        //Verificando se é um array
        if(Array.isArray(result)){

            return result[0]
        }else{
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

//retornar dado com base no id
const selectByIdUsuarioADM = async function(id){

    try {
        
        let sql = `select	tbl_usuario_adm.id, tbl_usuario_adm.email, tbl_usuario_adm.senha, 
                            tbl_nivel_acesso.nivel as nivel_acesso
                                from tbl_usuario_adm
                                    inner join tbl_nivel_acesso
                                        on tbl_usuario_adm.id_nivel_acesso = tbl_nivel_acesso.id
                        where tbl_usuario_adm.id = ${id};`

        let result = await knexConex.raw(sql)

        if(Array.isArray(result)){
            return result[0]
        }else{
            return false
        }
    } catch (error) {
        return false
    }
}

//deletar dado pelo id
const deleteUsuarioADM = async function(id){

    try {
        
        let sql = `delete from tbl_usuario_adm where id = ${id}`

        let result = await knexConex.raw(sql)

        if(result){
            return true
        }else{
            return false
        }
    } catch (error) {
        return false
    }
}

//validar login do usuário
const validarLogin = async function(login){

    try {
        
        let sql = `select	tbl_usuario_adm.id, tbl_usuario_adm.email, tbl_usuario_adm.senha, 
                            tbl_nivel_acesso.nivel as nivel_acesso
                                from tbl_usuario_adm
                                    inner join tbl_nivel_acesso
                                        on tbl_usuario_adm.id_nivel_acesso = tbl_nivel_acesso.id
                        where tbl_usuario_adm.email = "${login.email}" and tbl_usuario_adm.senha = "${login.senha}";`

        let result = await knexConex.raw(sql)

        if(Array.isArray(result)){
            return result[0]
        }else{
            return false
        }
    } catch (error) {
        return false
    }
}

//redefinir a senha do usuario
const updateSenhaUsuarioADM = async function(senha){

    try {

        //criando variável sql
        let sql =  `UPDATE tbl_usuario_adm
            SET senha = '${senha.senha}',
                codigo_recuperacao = NULL,
                codigo_expiracao = NULL
            WHERE id = ${senha.id};`


        let result = await knexConex.raw(sql)

        //validando retorno
        if(result){
            return true
        }else{
            return false
        }
        
    } catch (error) {
        return false
    }

}

//buscar usuario_adm por email
const selectByEmailUsuarioADM = async function(email){
    try {
        let sql = `SELECT * FROM tbl_usuario_adm WHERE email = '${email}' LIMIT 1;`
        let result = await knexConex.raw(sql)
        if (Array.isArray(result) && result[0].length > 0) {
            return result[0][0]
        }
        return false
    } catch (error) {
        return false
    }
}

//salvar codigo de recuperacao
const salvarCodigoRecuperacao = async function(email, codigo, minutosValidade = 15){
    try {
        let sql = `UPDATE tbl_usuario_adm 
                   SET codigo_recuperacao = '${codigo}', 
                       codigo_expiracao = DATE_ADD(NOW(), INTERVAL ${minutosValidade} MINUTE) 
                   WHERE email = '${email}';`
        let result = await knexConex.raw(sql)
        return !!result
    } catch (error) {
        return false
    }
}

//validar codigo de recuperacao
const validarCodigoRecuperacao = async function(email, codigo){
    try {
        let sql = `SELECT id, email, id_nivel_acesso 
                   FROM tbl_usuario_adm 
                   WHERE email = '${email}' 
                     AND codigo_recuperacao = '${codigo}' 
                     AND codigo_expiracao >= NOW() 
                   LIMIT 1;`
        let result = await knexConex.raw(sql)
        if (Array.isArray(result) && result[0].length > 0) {
            return result[0][0]
        }
        return false
    } catch (error) {
        return false
    }
}

//atualizar senha por email
const updateSenhaPorEmail = async function(email, novaSenha){
    try {
        let sql = `UPDATE tbl_usuario_adm 
                   SET senha = '${novaSenha}', 
                       codigo_recuperacao = NULL, 
                       codigo_expiracao = NULL 
                   WHERE email = '${email}';`
        let result = await knexConex.raw(sql)
        return !!result
    } catch (error) {
        return false
    }
}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    insertUsuarioADM,
    updateUsuarioADM,
    selectAllUsuarioADM,
    selectByIdUsuarioADM,
    deleteUsuarioADM,
    validarLogin,
    updateSenhaUsuarioADM,
    selectByEmailUsuarioADM,
    salvarCodigoRecuperacao,
    validarCodigoRecuperacao,
    updateSenhaPorEmail
}