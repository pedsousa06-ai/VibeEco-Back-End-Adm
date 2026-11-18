/********************************************************************************************************************************************************************************************
 * Objetivo: Limitador simples de tentativas (em memória) para login e validação de código, evitando força bruta.
 * Observação: o contador zera se a API reiniciar. Se a API rodar em várias instâncias, trocar por Redis ou tabela no banco.
 *******************************************************************************************************************************************************************************************/

const tentativas = new Map() // chave -> { total, expiraEm }

// registra uma falha e devolve o total de falhas dentro da janela
const registrarFalha = function(chave, janelaMs = 15 * 60 * 1000){
    const agora = Date.now()
    let item = tentativas.get(chave)

    if(!item || item.expiraEm <= agora){
        item = { total: 0, expiraEm: agora + janelaMs }
    }

    item.total += 1
    tentativas.set(chave, item)
    return item.total
}

// verifica se a chave já passou do limite de falhas
const bloqueado = function(chave, limite){
    const item = tentativas.get(chave)
    if(!item) return false
    if(item.expiraEm <= Date.now()){
        tentativas.delete(chave)
        return false
    }
    return item.total >= limite
}

// limpa o contador (usar após sucesso)
const limpar = function(chave){
    tentativas.delete(chave)
}

module.exports = { registrarFalha, bloqueado, limpar }
