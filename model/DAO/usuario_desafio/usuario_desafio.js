/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD no Banco de dados MySQL na tabela de usuario_desafio
 * Data: 03/11/2026
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
const insertUsuarioDesafio = async function(usuarioDesafio){

    try {
        
        let sql = 
            `insert into tbl_usuario_desafio (
                id_usuario,
                id_desafio,
                status,
                data_conclusao
            )
            values (
<<<<<<< HEAD
                ${usuarioDesafio.idUsuario},
                ${usuarioDesafio.idDesafio},
                "${usuarioDesafio.status}",
                "${usuarioDesafio.dataConclusao}"
            );`

=======
                ${usuarioDesafio.id_usuario},
                ${usuarioDesafio.id_desafio},
                "${usuarioDesafio.status}",
                "${usuarioDesafio.data_conclusao}"
            );`

            console.log(sql)

>>>>>>> ed866ab41e323ba36deab4dec8fec8a436ccd8ab
        let result = await knexConex.raw(sql) 

        if(result)
            return result[0].insertId 
        else
            return false
        
    } catch (error) {
<<<<<<< HEAD
=======
        console.log(error)
>>>>>>> ed866ab41e323ba36deab4dec8fec8a436ccd8ab
        return false
    }
}

//função para atualizar um dado
const updateUsuarioDesafio = async function(usuarioDesafio){

    try {

        let sql =   `update tbl_usuario_desafio set 
<<<<<<< HEAD
                        id_usuario      = ${usuarioDesafio.idUsuario},
                        id_desafio      = ${usuarioDesafio.idDesafio},
                        status          = "${usuarioDesafio.status}",
                        data_conclusao  = "${usuarioDesafio.dataConclusao}"
=======
                        id_usuario      = ${usuarioDesafio.id_usuario},
                        id_desafio      = ${usuarioDesafio.id_desafio},
                        status          = "${usuarioDesafio.status}",
                        data_conclusao  = "${usuarioDesafio.data_conclusao}"
>>>>>>> ed866ab41e323ba36deab4dec8fec8a436ccd8ab

                    where id = ${usuarioDesafio.id};`

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
const selectAllUsuarioDesafio = async function(){

    try {

        let sql = "select * from tbl_usuario_desafio order by id desc;" 

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
const selectByIdUsuarioDesafio = async function(id){

    try {
        
        let sql = `select * from tbl_usuario_desafio where id = ${id}`

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
const deleteUsuarioDesafio = async function(id){

    try {

        //criando variável sql
        let sql = `delete from tbl_usuario_desafio where id = ${id};`

        console.log(sql)

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
const selectUsuarioByIdDesafio = async function(idDesafio){

    try {
        
        //criando variável sql
        let sql = `select   tbl_usuario.*
                        from tbl_usuario
                            inner join tbl_usuario_desafio
                                on tbl_usuario.id = tbl_usuario_desafio.id_usuario
                            inner join tbl_desafio
                                on tbl_desafio.id = tbl_usuario_desafio.id_desafio
                    where tbl_desafio.id = ${idDesafio};`

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
const selectDesafioByIdUsuario = async function(idUsuario){

    try {
        
        //criando variável sql
        let sql = `select   tbl_desafio.*
                        from tbl_usuario
                            inner join tbl_usuario_desafio
<<<<<<< HEAD
                                on tbl_usuario.id = tbl_usuario_desafio.id_desafio
=======
                                on tbl_usuario.id = tbl_usuario_desafio.id_usuario
>>>>>>> ed866ab41e323ba36deab4dec8fec8a436ccd8ab
                            inner join tbl_desafio
                                on tbl_desafio.id = tbl_usuario_desafio.id_desafio
                    where tbl_usuario.id = ${idUsuario};`

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
const deleteDesafioByIdUsuario = async function(idUsuario){

    try {

        let sql = `delete from tbl_usuario_desafio where id_usuario = ${idUsuario};` //apagando pela chave estrangeira da tabela principal, para apagar todos os dados relacionados a ela

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
    insertUsuarioDesafio,
    updateUsuarioDesafio,
    selectAllUsuarioDesafio,
    selectByIdUsuarioDesafio,
    deleteUsuarioDesafio,
    selectUsuarioByIdDesafio,
    selectDesafioByIdUsuario,
    deleteDesafioByIdUsuario
}