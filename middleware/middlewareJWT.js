/**
 * COLOCAR COMENTÁRISO DEPOIS
**/

const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || "vibeecotokensecret"

const EXPIRES = 60 * 60 * 3 // 3 horas

const createJWT = async function (payload) {
    // gerando o token
    const token = jwt.sign({userID: payload}, SECRET, {expiresIn: EXPIRES})
    return token
}

const validarJWT = async function (token) {
    if (!token) {
        return false
    }

    if (typeof token === 'string' && token.startsWith('Bearer ')) {
        token = token.slice(7).trim()
    }

    try {
        const decoded = jwt.verify(token, SECRET)
        return !!decoded
    } catch (err) {
        return false
    }
}

module.exports = {
    createJWT,
    validarJWT
}