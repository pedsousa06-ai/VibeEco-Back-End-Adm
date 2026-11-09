/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de conteudo_educativo_anexo
 * Data: 04/11/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.10.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development) //aciona o knex e passa as configurações estabelecidas no arquivo

/*INICIANDO CRUD DA TABELA DE USUARIO_DESAFIO (TABELA INTERMEDIÁRIA)*/

//função para inserir dados
const insertConteudoEducativoAnexo = async function(conteudoEducativoAnexo){

    try {
        
        let sql = 
            `insert into tbl_conteudo_educativo_anexo (
                id_conteudo_educativo,
                id_anexo
            )
            values (
                ${conteudoEducativoAnexo.id_conteudo_educativo},
                ${conteudoEducativoAnexo.id_anexo}
            );`

        let result = await knexConex.raw(sql) 

        if(result)
            return result[0].insertId 
        else
            return false
        
    } catch (error) {
        return false
    }
}

//função para atualizar um dado
const updateConteudoEducativoAnexo = async function(conteudoEducativoAnexo){

    try {

        let sql =   `update tbl_conteudo_educativo_anexo set 
                        id_conteudo_educativo     = ${conteudoEducativoAnexo.id_conteudo_educativo},
                        id_anexo                  = ${conteudoEducativoAnexo.id_anexo}
                    where id = ${conteudoEducativoAnexo.id};`

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

//função para retornar todos os dados
const selectAllConteudoEducativoAnexo = async function(){

    try {

        let sql = "select * from tbl_conteudo_educativo_anexo order by id desc;" 

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

//função para retornar um dado pelo id
const selectByIdConteudoEducativoAnexo = async function(id){

    try {
        
        let sql = `select * from tbl_conteudo_educativo_anexo where id = ${id}`

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

//função para deletar um dado pelo id
const deleteConteudoEducativoAnexo = async function(id){

    try {

        //criando variável sql
        let sql = `delete from tbl_conteudo_educativo_anexo where id = ${id};`

        //enviando para o banco
        let result = await knexConex.raw(sql)

        //tratando retorno
        if(result){
            return true
        }else{
            return false
        }
        
    } catch (error) {
        return false
    }
}

/* ATÉ AQUI FOI SÓ ALTERAÇÃO SIMPLES, DAQUI PRA BAIXO SÃO IMPLEMENTAÇÕES DIFERENTES */

//função para retornar os dados da tabela principal pelo id da tabela secundaria
const selectConteudoEducativoByIdAnexo = async function(idAnexo){

    try {
        
        //criando variável sql
        let sql = `select   tbl_conteudo_educativo.*
                        from tbl_conteudo_educativo
                            inner join tbl_conteudo_educativo_anexo
                                on tbl_conteudo_educativo.id = tbl_conteudo_educativo_anexo.id_conteudo_educativo
                            inner join tbl_anexo
                                on tbl_anexo.id = tbl_conteudo_educativo_anexo.id_anexo
                    where tbl_anexo.id = ${idAnexo};`

        //executando no banco de dados
        let result = await knexConex.raw(sql)

        //validando retorno
        if(Array.isArray(result)){ //vendo se é um array

            return result[0] //retornando somente o que nós pedimos, sem expecificações da tabela
        //se não for array ele cai aqui
        }else{
            return false
        }
    } catch (error) {
        return false
    }
}

//função para retornar os dados secundarios pelo id da tabela principal
const selectAnexoByIdConteudoEducativo = async function(idConteudoEducativo){

    try {
        
        //criando variável sql
        let sql = `select   tbl_anexo.*
                        from tbl_conteudo_educativo
                            inner join tbl_conteudo_educativo_anexo
                                on tbl_conteudo_educativo.id = tbl_conteudo_educativo_anexo.id_conteudo_educativo
                            inner join tbl_anexo
                                on tbl_anexo.id = tbl_conteudo_educativo_anexo.id_anexo
                    where tbl_conteudo_educativo.id = ${idUsuario};`

        //executando no banco de dados
        let result = await knexConex.raw(sql)

        //validando retorno
        if(Array.isArray(result)){ //vendo se é um array

            return result[0] //retornando somente o que nós pedimos, sem expecificações da tabela
        //se não for array ele cai aqui
        }else{
            return false
        }
    } catch (error) {
        return false
    }
}

//função para excluir os dados filtrando pelo id da tabela principal, essa função será utilizada no update da tabela principal, pois precisa apagar pra depois inserir os novos dados relacionados
const deleteAnexoByIdConteudoEducativo = async function(idConteudoEducativo){

    try {

        let sql = `delete from tbl_conteudo_educativo_anexo where id_conteudo_educativo = ${idConteudoEducativo};` //apagando pela chave estrangeira da tabela principal, para apagar todos os dados relacionados a ela

        console.log(sql)

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


module.exports = {
    insertConteudoEducativoAnexo,
    updateConteudoEducativoAnexo,
    selectAllConteudoEducativoAnexo,
    selectByIdConteudoEducativoAnexo,
    deleteConteudoEducativoAnexo,
    selectConteudoEducativoByIdAnexo,
    selectAnexoByIdConteudoEducativo,
    deleteAnexoByIdConteudoEducativo
}