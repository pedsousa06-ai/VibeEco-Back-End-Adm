
/*
 * Objetivo: Arquivo responsável pelo CRUD no banco de dados MySQL
 * Tabela: tbl_usuario_adm
 * Data: 28/10/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.10.26
 *
 * Observações:
 * - Todas as consultas utilizam parâmetros (?) para evitar SQL Injection.
 * - Consultas de listagem não retornam a coluna senha.
 * - A senha é retornada somente na consulta específica de login.
 */

// Importando o Knex
const knex = require("knex")

// Importando as configurações do banco
const knexConfig = require("../../database_config_knex/knex_file.js")

// Criando a conexão com o banco de dados
const knexConex = knex(knexConfig.development)

// Consulta base para buscar administradores sem a senha
const SELECT_BASE = `
    SELECT
        tbl_usuario_adm.id,
        tbl_usuario_adm.email,
        tbl_nivel_acesso.nivel AS nivel_acesso
    FROM tbl_usuario_adm
    INNER JOIN tbl_nivel_acesso
        ON tbl_usuario_adm.id_nivel_acesso = tbl_nivel_acesso.id
`

// Retorna as linhas de uma consulta SELECT do MySQL2
const obterLinhas = function(resultado) {
    if (Array.isArray(resultado) && Array.isArray(resultado[0])) {
        return resultado[0]
    }

    return []
}

// Retorna o resultado de uma operação de escrita do MySQL2
const obterResultado = function(resultado) {
    if (Array.isArray(resultado)) {
        return resultado[0] || null
    }

    return null
}

// Inserir administrador
// A senha já deve chegar com hash
const insertUsuarioADM = async function(usuarioADM) {
    try {
        const result = await knexConex.raw(
            `INSERT INTO tbl_usuario_adm
                (email, senha, id_nivel_acesso)
             VALUES (?, ?, ?)`,
            [
                usuarioADM.email,
                usuarioADM.senha,
                usuarioADM.id_nivel_acesso
            ]
        )

        const dados = obterResultado(result)

        return dados?.insertId || false

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao inserir:", error)
        return false
    }
}

// Atualizar administrador
// Se a senha não vier, mantém a senha atual
const updateUsuarioADM = async function(usuarioADM) {
    try {
        let result

        if (usuarioADM.senha) {
            result = await knexConex.raw(
                `UPDATE tbl_usuario_adm
                 SET email = ?, senha = ?, id_nivel_acesso = ?
                 WHERE id = ?`,
                [
                    usuarioADM.email,
                    usuarioADM.senha,
                    usuarioADM.id_nivel_acesso,
                    usuarioADM.id
                ]
            )
        } else {
            result = await knexConex.raw(
                `UPDATE tbl_usuario_adm
                 SET email = ?, id_nivel_acesso = ?
                 WHERE id = ?`,
                [
                    usuarioADM.email,
                    usuarioADM.id_nivel_acesso,
                    usuarioADM.id
                ]
            )
        }

        return obterResultado(result) !== null

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao atualizar:", error)
        return false
    }
}

// Retornar todos os administradores
const selectAllUsuarioADM = async function() {
    try {
        const result = await knexConex.raw(
            `${SELECT_BASE} ORDER BY tbl_usuario_adm.id DESC`
        )

        return obterLinhas(result)

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao listar:", error)
        return false
    }
}

// Buscar administrador pelo ID
const selectByIdUsuarioADM = async function(id) {
    try {
        const result = await knexConex.raw(
            `${SELECT_BASE} WHERE tbl_usuario_adm.id = ?`,
            [id]
        )

        return obterLinhas(result)

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao buscar por ID:", error)
        return false
    }
}

// Deletar administrador pelo ID
const deleteUsuarioADM = async function(id) {
    try {
        const result = await knexConex.raw(
            `DELETE FROM tbl_usuario_adm WHERE id = ?`,
            [id]
        )

        return obterResultado(result) !== null

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao deletar:", error)
        return false
    }
}

// Buscar administrador pelo e-mail para realizar login
// Esta função retorna a senha para conferência na controller.
// A senha nunca deve ser enviada ao frontend.
const selectLoginPorEmail = async function(email) {
    try {
        const emailNormalizado = String(email).trim().toLowerCase()

        console.log("[LOGIN DAO] Consultando e-mail:", emailNormalizado)

        const result = await knexConex.raw(
            `SELECT
                tbl_usuario_adm.id,
                tbl_usuario_adm.email,
                tbl_usuario_adm.senha,
                tbl_nivel_acesso.nivel AS nivel_acesso
             FROM tbl_usuario_adm
             INNER JOIN tbl_nivel_acesso
                ON tbl_usuario_adm.id_nivel_acesso = tbl_nivel_acesso.id
             WHERE LOWER(TRIM(tbl_usuario_adm.email)) = ?
             LIMIT 1`,
            [emailNormalizado]
        )

        const usuarios = obterLinhas(result)

        console.log(
            "[LOGIN DAO] Resultado:",
            usuarios.length,
            "registro(s)"
        )

        return usuarios

    } catch (error) {
        console.error("[LOGIN DAO] Erro na consulta:", error)
        return false
    }
}

// Buscar senha salva de um administrador pelo ID
const selectSenhaPorId = async function(id) {
    try {
        const result = await knexConex.raw(
            `SELECT senha
             FROM tbl_usuario_adm
             WHERE id = ?
             LIMIT 1`,
            [id]
        )

        const usuarios = obterLinhas(result)

        if (usuarios.length > 0) {
            return usuarios[0].senha
        }

        return false

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao buscar senha:", error)
        return false
    }
}

// Atualizar somente o e-mail
const updateEmailUsuarioADM = async function(id, email) {
    try {
        const result = await knexConex.raw(
            `UPDATE tbl_usuario_adm
             SET email = ?
             WHERE id = ?`,
            [email, id]
        )

        return obterResultado(result) !== null

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao atualizar e-mail:", error)
        return false
    }
}

// Atualizar senha pelo ID
// A senha já deve chegar com hash
const updateSenhaUsuarioADM = async function(id, senhaHash) {
    try {
        const result = await knexConex.raw(
            `UPDATE tbl_usuario_adm
             SET senha = ?,
                 codigo_recuperacao = NULL,
                 codigo_expiracao = NULL
             WHERE id = ?`,
            [senhaHash, id]
        )

        return obterResultado(result) !== null

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao atualizar senha:", error)
        return false
    }
}

// Buscar administrador pelo e-mail, sem retornar a senha
const selectByEmailUsuarioADM = async function(email) {
    try {
        const result = await knexConex.raw(
            `SELECT id, email, id_nivel_acesso
             FROM tbl_usuario_adm
             WHERE email = ?
             LIMIT 1`,
            [email]
        )

        const usuarios = obterLinhas(result)

        if (usuarios.length > 0) {
            return usuarios[0]
        }

        return false

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao buscar por e-mail:", error)
        return false
    }
}

// Salvar código de recuperação
const salvarCodigoRecuperacao = async function(
    email,
    codigo,
    minutosValidade = 15
) {
    try {
        const result = await knexConex.raw(
            `UPDATE tbl_usuario_adm
             SET codigo_recuperacao = ?,
                 codigo_expiracao = DATE_ADD(NOW(), INTERVAL ? MINUTE)
             WHERE email = ?`,
            [
                codigo,
                Number(minutosValidade),
                email
            ]
        )

        return obterResultado(result) !== null

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao salvar código:", error)
        return false
    }
}

// Validar código de recuperação
const validarCodigoRecuperacao = async function(email, codigo) {
    try {
        const result = await knexConex.raw(
            `SELECT id, email, id_nivel_acesso
             FROM tbl_usuario_adm
             WHERE email = ?
               AND codigo_recuperacao = ?
               AND codigo_expiracao >= NOW()
             LIMIT 1`,
            [email, codigo]
        )

        const usuarios = obterLinhas(result)

        if (usuarios.length > 0) {
            return usuarios[0]
        }

        return false

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao validar código:", error)
        return false
    }
}

// Limpar código de recuperação
const limparCodigoRecuperacao = async function(email) {
    try {
        await knexConex.raw(
            `UPDATE tbl_usuario_adm
             SET codigo_recuperacao = NULL,
                 codigo_expiracao = NULL
             WHERE email = ?`,
            [email]
        )

        return true

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao limpar código:", error)
        return false
    }
}

// Atualizar senha pelo e-mail e limpar o código utilizado
// A senha já deve chegar com hash
const updateSenhaPorEmail = async function(email, senhaHash) {
    try {
        const result = await knexConex.raw(
            `UPDATE tbl_usuario_adm
             SET senha = ?,
                 codigo_recuperacao = NULL,
                 codigo_expiracao = NULL
             WHERE email = ?`,
            [senhaHash, email]
        )

        return obterResultado(result) !== null

    } catch (error) {
        console.error("[USUARIO ADM DAO] Erro ao redefinir senha:", error)
        return false
    }
}

// Exportando as funções
module.exports = {
    insertUsuarioADM,
    updateUsuarioADM,
    selectAllUsuarioADM,
    selectByIdUsuarioADM,
    deleteUsuarioADM,
    selectLoginPorEmail,
    selectSenhaPorId,
    updateEmailUsuarioADM,
    updateSenhaUsuarioADM,
    selectByEmailUsuarioADM,
    salvarCodigoRecuperacao,
    validarCodigoRecuperacao,
    limparCodigoRecuperacao,
    updateSenhaPorEmail
}
