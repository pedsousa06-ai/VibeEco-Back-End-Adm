/**
 * COLOCAR COMENTÁRISO DEPOIS
**/

const jwt = require('jsonwebtoken')

const SECRET = "vibeecotokensecret"

const EXPIRES = 60

const createJWT = async function (payload) {
    // gerando o token (payload é o que vai dentro do token, nesse caso o id do usuário, SECRET é a chave secreta e expiresIn é o tempo de expiração do token, expiresIn é em segundos)
    const token = jwt.sign({userID: payload}, SECRET, {expiresIn: EXPIRES})

    return token
}

const validarJWT = async function (token) {

    let status

    jwt.verify(token, SECRET, async function(err, decoded) {

        if (err) {
            status = false
        }else{
            status = true
        }
    })

    return status
}

module.exports = {
    createJWT,
    validarJWT
}