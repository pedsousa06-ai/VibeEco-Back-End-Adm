/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de categoria
 * Data: 07/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.11.26
 ********************************************************************************************************************************************************************************************/

const knex = require("knex")
const knexConfig = require("../../database_config_knex/knex_file.js")
const knexConex = knex(knexConfig.development)

//inserir dado
const insertCategoria = async function(categoria){
    try {
        let sql = `
            insert into tbl_categoria (nome)
            values("${categoria.nome}");
        `
        let result = await knexConex.raw(sql)
        
        if(result){
            return result[0].insertId
        }else{
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

//atualizar dado
const updateCategoria = async function(categoria){
    try {
        let sql = `
            update tbl_categoria set 
                nome = "${categoria.nome}"
            where id = ${categoria.id};
        `
        let result = await knexConex.raw(sql)
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

//retornar todos os dados
const selectAllCategoria = async function(){
    try {
        let sql = `select * from tbl_categoria order by id asc;`
        let result = await knexConex.raw(sql)
        
        // No Knex, o raw() do mysql2 retorna [rows, fields]. Por isso result[0] é o array de linhas.
        if(Array.isArray(result)){
            return result[0] // Retorna TODAS as categorias
        }else{
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

//retornar dado com base no id
const selectByIdCategoria = async function(id){
    try {
        let sql = `select * from tbl_categoria where id = ${id}`
        let result = await knexConex.raw(sql)

        // Como é uma busca por ID, a gente retorna o array todo (mesmo que tenha 0 ou 1 item),
        // pra manter o padrão dos outros controllers que usam `existe.length > 0`.
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
const deleteCategoria = async function(id){
    try {
        let sql = `delete from tbl_categoria where id = ${id}`
        let result = await knexConex.raw(sql)
        
        if(result){
            return true
        }else{
            return false
        }
    } catch (error) {
        // Verifica se o erro é de Foreign Key (registro em uso)
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return 'EM_USO'
        }
        
        console.log(error)
        return false
    }
}

module.exports = {
    insertCategoria,
    updateCategoria,
    selectAllCategoria,
    selectByIdCategoria,
    deleteCategoria
}