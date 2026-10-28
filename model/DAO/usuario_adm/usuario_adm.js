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

/* EXPORTANDO FUNÇÕES */
module.exports = {
    insertUsuarioADM,
    updateUsuarioADM,
    selectAllUsuarioADM,
    selectByIdUsuarioADM,
    deleteUsuarioADM
}