/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de desafio
 * Data: 09/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.1.10.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development) //aciona o knex e passa as configurações estabelecidas no arquivo

/* INICIANDO CRUD DA TABELA DE DESAFIO */
/* As datas saem como texto 'YYYY-MM-DD' (date_format), igual ao select de missões: evita o fuso horário deslocar o dia. */
/* Os valores são enviados por "?" (bindings do knex): evita quebrar a query com aspas no texto e SQL injection */

//inserir dado
const insertDesafio = async function(desafio){

    try {

        let sql =
            `insert into tbl_desafio (
                nome,
                descricao,
                super_coins,
                data_inicio,
                data_termino,
                id_dificuldade
            )
            values (?, ?, ?, ?, ?, ?);`

        let result = await knexConex.raw(sql, [
            desafio.nome,
            desafio.descricao ?? null,
            desafio.super_coins,
            desafio.data_inicio,
            desafio.data_termino,
            desafio.id_dificuldade
        ])

        //validando retorno do banco
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
const updateDesafio = async function(desafio){

    try {

        let sql =
            `update tbl_desafio set
                nome            = ?,
                descricao       = ?,
                super_coins     = ?,
                data_inicio     = ?,
                data_termino    = ?,
                id_dificuldade  = ?
            where id = ?;`

        let result = await knexConex.raw(sql, [
            desafio.nome,
            desafio.descricao ?? null,
            desafio.super_coins,
            desafio.data_inicio,
            desafio.data_termino,
            desafio.id_dificuldade,
            desafio.id
        ])

        //validando retorno
        if(result){
            return true
        }else{
            return false
        }

    } catch (error) {
        console.log(error)
        return false
    }

}

//retornar todos os dados
const selectAllDesafio = async function(){

    try {

        let sql = `select	tbl_desafio.id, tbl_desafio.nome, tbl_desafio.descricao, tbl_desafio.super_coins,
                            date_format(tbl_desafio.data_inicio, '%Y-%m-%d') as data_inicio,
                            date_format(tbl_desafio.data_termino, '%Y-%m-%d') as data_termino,
                            tbl_dificuldade.nome as dificuldade
                                from tbl_desafio
                                    inner join tbl_dificuldade
                                        on tbl_desafio.id_dificuldade = tbl_dificuldade.id
                        order by tbl_desafio.id desc;`

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
const selectByIdDesafio = async function(id){

    try {

        let sql = `select	tbl_desafio.id, tbl_desafio.nome, tbl_desafio.descricao, tbl_desafio.super_coins,
                            date_format(tbl_desafio.data_inicio, '%Y-%m-%d') as data_inicio,
                            date_format(tbl_desafio.data_termino, '%Y-%m-%d') as data_termino,
                            tbl_dificuldade.nome as dificuldade
                                from tbl_desafio
                                    inner join tbl_dificuldade
                                        on tbl_desafio.id_dificuldade = tbl_dificuldade.id
                        where tbl_desafio.id = ?;`

        let result = await knexConex.raw(sql, [id])

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

//deletar dado pelo id
const deleteDesafio = async function(id){

    try {

        let sql = `delete from tbl_desafio where id = ?;`

        let result = await knexConex.raw(sql, [id])

        if(result){
            return true
        }else{
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

/* EXPORTANDO FUNÇÕES */
module.exports = {
    insertDesafio,
    updateDesafio,
    selectAllDesafio,
    selectByIdDesafio,
    deleteDesafio
}
