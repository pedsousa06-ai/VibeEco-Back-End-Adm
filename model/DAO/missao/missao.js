/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de missao
 * Data: 17/11/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.11.26
 ********************************************************************************************************************************************************************************************/

//importando a biblioteca para gerenciar o banco de dados no node.js
const knex = require("knex")

//importando o arquivo "database_config_knex" para atribuir as configurações do BD
const knexConfig = require("../../database_config_knex/knex_file.js")

//criando a conexão por meio do arquivo que contém os dados necessários para estabelecer o acesso e a conexão
const knexConex = knex(knexConfig.development) //aciona o knex e passa as configurações estabelecidas no arquivo

/* INICIANDO CRUD DA TABELA DE MISSAO */

//inserir dado
const insertMissao = async function(missao){

    try {

        //valores em "?" (e não dentro do texto do SQL): aspas e apóstrofos no texto não quebram o comando
        let sql =
            `insert into tbl_missao (nome, descricao, coins, total_xp_missao, data_inicio, data_termino, dica, id_dificuldade)
             values (?, ?, ?, ?, ?, ?, ?, ?);`

        let result = await knexConex.raw(sql, [
            missao.nome,
            missao.descricao,
            Number(missao.coins),
            Number(missao.total_xp_missao ?? 0),
            missao.data_inicio,
            missao.data_termino,
            missao.dica ?? "",
            Number(missao.id_dificuldade)
        ])

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
const updateMissao = async function(missao){

    try {

        let sql =
            `update tbl_missao set
                nome            = ?,
                descricao       = ?,
                coins           = ?,
                total_xp_missao = ?,
                data_inicio     = ?,
                data_termino    = ?,
                dica            = ?,
                id_dificuldade  = ?
            where id = ?;`

        let result = await knexConex.raw(sql, [
            missao.nome,
            missao.descricao,
            Number(missao.coins),
            Number(missao.total_xp_missao ?? 0),
            missao.data_inicio,
            missao.data_termino,
            missao.dica ?? "",
            Number(missao.id_dificuldade),
            Number(missao.id)
        ])

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
const selectAllMissao = async function(){

    try {
        
        let sql = `select 	tbl_missao.id, tbl_missao.nome, tbl_missao.descricao, tbl_missao.coins, tbl_missao.total_xp_missao, date_format(tbl_missao.data_inicio, '%Y-%m-%d') as data_inicio, date_format(tbl_missao.data_termino, '%Y-%m-%d') as data_termino, tbl_missao.dica,
		                    tbl_dificuldade.nome as dificuldade,
		                    tbl_categoria.id as id_categoria,
		                    tbl_categoria.nome as categoria
			                    from tbl_missao
				                    inner join tbl_dificuldade 
					                    on tbl_missao.id_dificuldade = tbl_dificuldade.id
				                    left join (select id_missao, min(id_categoria) as id_categoria from tbl_missao_categoria group by id_missao) as mc
					                    on mc.id_missao = tbl_missao.id
				                    left join tbl_categoria
					                    on tbl_categoria.id = mc.id_categoria
	                    order by tbl_missao.id desc;`

        let result = await knexConex.raw(sql)

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
const selectByIdMissao = async function(id){

    try {
        
        let sql = `select 	tbl_missao.id, tbl_missao.nome, tbl_missao.descricao, tbl_missao.coins, tbl_missao.total_xp_missao, date_format(tbl_missao.data_inicio, '%Y-%m-%d') as data_inicio, date_format(tbl_missao.data_termino, '%Y-%m-%d') as data_termino, tbl_missao.dica,
		                    tbl_dificuldade.nome as dificuldade,
		                    tbl_categoria.id as id_categoria,
		                    tbl_categoria.nome as categoria
			                    from tbl_missao
				                    inner join tbl_dificuldade 
					                    on tbl_missao.id_dificuldade = tbl_dificuldade.id
				                    left join (select id_missao, min(id_categoria) as id_categoria from tbl_missao_categoria group by id_missao) as mc
					                    on mc.id_missao = tbl_missao.id
				                    left join tbl_categoria
					                    on tbl_categoria.id = mc.id_categoria
	                    where tbl_missao.id = ?;`

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
const deleteMissao = async function(id){

    try {
        
        let sql = `delete from tbl_missao where id = ?`

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
    insertMissao,
    updateMissao,
    selectAllMissao,
    selectByIdMissao,
    deleteMissao
}