const knex = require("knex")
const knexConfig = require("../../database_config_knex/knex_file.js")
const knexConex = knex(knexConfig.development)

const insertDificuldade = async function(dificuldade){
    try {
        let sql = `insert into tbl_dificuldade (nome) values(?);`
        let result = await knexConex.raw(sql, [dificuldade.nome])
        return result ? result[0].insertId : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const updateDificuldade = async function(dificuldade){
    try {
        let sql = `update tbl_dificuldade set nome = ? where id = ?;`
        let result = await knexConex.raw(sql, [dificuldade.nome, dificuldade.id])
        return result ? true : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const selectAllDificuldade = async function(){
    try {
        let sql = `select * from tbl_dificuldade order by id asc;`
        let result = await knexConex.raw(sql)
        return Array.isArray(result) ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const selectByIdDificuldade = async function(id){
    try {
        let sql = `select * from tbl_dificuldade where id = ${id}`
        let result = await knexConex.raw(sql)
        return Array.isArray(result) ? result[0] : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const deleteDificuldade = async function(id){
    try {
        let sql = `delete from tbl_dificuldade where id = ${id}`
        let result = await knexConex.raw(sql)
        return result ? true : false
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return 'EM_USO'
        }
        console.log(error)
        return false
    }
}

module.exports = {
    insertDificuldade,
    updateDificuldade,
    selectAllDificuldade,
    selectByIdDificuldade,
    deleteDificuldade
}
