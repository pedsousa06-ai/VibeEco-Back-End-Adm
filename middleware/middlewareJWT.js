
    const jwt = require('jsonwebtoken')

    // Segredo carregado pelo arquivo .env
    const SECRET = process.env.JWT_SECRET

    // Tempo de validade do token: 3 horas
    const EXPIRES = Number(process.env.JWT_EXPIRES_IN) || 10800

    // Verifica se o segredo foi configurado
    if (!SECRET) {
        throw new Error('JWT_SECRET não foi configurado no arquivo .env')
    }

    // Gera o token JWT do administrador ou usuário
    const createJWT = async function (payload) {
        return jwt.sign(
            { userID: payload },
            SECRET,
            { expiresIn: EXPIRES }
        )
    }

    // Verifica o token e retorna os dados armazenados nele
    const verificarToken = function (token) {
        if (!token) {
            throw new Error('Token não informado.')
        }

        return jwt.verify(token, SECRET)
    }

    // Verifica se o token é válido
    const validarJWT = async function (token) {
        try {
            verificarToken(token)
            return true
        } catch (erro) {
            return false
        }
    }

    // Protege as rotas da API utilizando JWT
    const protegerApi = function (request, response, next) {

        // Permite requisições de verificação do CORS
        if (request.method === 'OPTIONS') {
            return next()
        }

        // Rotas que não precisam de autenticação
        const rotasPublicas = [
            '/usuarioADM/login',
            '/usuarioADM/recuperarAcesso',
            '/usuarioADM/validarCodigo',
            '/usuarioADM/redefinirSenha'
        ]

        // Permite acesso às rotas públicas somente pelos métodos esperados
        if (
            request.method === 'POST' &&
            rotasPublicas.includes(request.path)
        ) {
            return next()
        }

        // Busca o token nos cabeçalhos da requisição
        const token =
            request.headers['x-access-token'] ||
            request.headers.authorization?.replace(/^Bearer\s+/i, '')

        try {
            // Verifica a validade do token
            const dadosToken = verificarToken(token)

            // Armazena o ID do administrador autenticado
            request.adminId = dadosToken.userID

            return next()

        } catch (erro) {
            return response.status(401).json({
                status: false,
                status_code: 401,
                message: 'Acesso não autorizado. Token inválido ou expirado.'
            })
        }
    }

    module.exports = {
        createJWT,
        validarJWT,
        verificarToken,
        protegerApi
    }
