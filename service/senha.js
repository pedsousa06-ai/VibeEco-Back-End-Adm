/********************************************************************************************************************************************************************************************
 * Objetivo: Hash e verificação de senhas dos administradores (usa o módulo "crypto" nativo do Node, sem dependências extras).
 * Formato salvo no banco: scrypt$<salt em hex>$<hash em hex>
 * Compatibilidade: senhas antigas (texto puro) continuam válidas e são convertidas para hash no próximo login bem-sucedido.
 *******************************************************************************************************************************************************************************************/

const crypto = require("crypto")

const PREFIXO = "scrypt"
const TAMANHO_CHAVE = 32

// gera o hash de uma senha em texto puro
const gerarHash = function(senha){
    const salt = crypto.randomBytes(16).toString("hex")
    const hash = crypto.scryptSync(String(senha), salt, TAMANHO_CHAVE).toString("hex")
    return `${PREFIXO}$${salt}$${hash}`
}

// informa se o valor salvo no banco já é um hash
const ehHash = function(valorSalvo){
    return typeof valorSalvo === "string" && valorSalvo.startsWith(`${PREFIXO}$`)
}

// compara a senha digitada com o valor salvo (hash ou texto puro antigo)
const verificarSenha = function(senhaDigitada, valorSalvo){

    if(typeof senhaDigitada !== "string" || typeof valorSalvo !== "string" || valorSalvo === ""){
        return false
    }

    let esperado, recebido

    if(ehHash(valorSalvo)){
        const [, salt, hash] = valorSalvo.split("$")
        if(!salt || !hash) return false
        esperado = Buffer.from(hash, "hex")
        recebido = crypto.scryptSync(senhaDigitada, salt, esperado.length)
    }else{
        // senha antiga em texto puro: compara em tempo constante
        esperado = crypto.createHash("sha256").update(valorSalvo).digest()
        recebido = crypto.createHash("sha256").update(senhaDigitada).digest()
    }

    return crypto.timingSafeEqual(esperado, recebido)
}

module.exports = { gerarHash, ehHash, verificarSenha }
