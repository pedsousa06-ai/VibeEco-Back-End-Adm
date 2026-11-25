
require("dotenv").config()

const knex = require("knex")
const knexConfig = require("../model/database_config_knex/knex_file.js")
const senhaService = require("../service/senha.js")

const db = knex(knexConfig.development)

const administrador = {
    email: "ryllerfeitosa190@gmail.com",
    senha: "    "
}

async function criarAdministrador() {
    try {
        console.log("Verificando administrador de teste...")

        const existente = await db("tbl_usuario_adm")
            .where({ email: administrador.email })
            .first()

        if (existente) {
            console.log("O administrador já está cadastrado.")
            console.log("ID:", existente.id)
            return
        }

        const niveis = await db("tbl_nivel_acesso")
            .select("id", "nivel")

        const nivelAdmin = niveis.find(item =>
            String(item.nivel).trim().toLowerCase().includes("admin")
        )

        if (!nivelAdmin) {
            console.log("Não encontrei um nível administrativo.")
            console.log("Níveis cadastrados:")

            niveis.forEach(item => {
                console.log(`${item.id} - ${item.nivel}`)
            })

            return
        }

        const senhaHash = senhaService.gerarHash(administrador.senha)

        if (!senhaHash || senhaHash.length > 255) {
            throw new Error("Não foi possível gerar o hash da senha.")
        }

        const [id] = await db("tbl_usuario_adm").insert({
            email: administrador.email,
            senha: senhaHash,
            id_nivel_acesso: nivelAdmin.id
        })

        console.log("Administrador criado com sucesso!")
        console.log("ID:", id)
        console.log("E-mail:", administrador.email)
        console.log("Nível:", nivelAdmin.nivel)

    } catch (error) {
        console.error("Erro ao criar administrador:", error)
    } finally {
        await db.destroy()
    }
}

criarAdministrador()
