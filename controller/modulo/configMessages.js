/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela configuração e padronização das mensagen da API.
 * Data: 02/10/2026
 * Autor: Lucas Kolle
 * Versão: 1.0.10.26
 *******************************************************************************************************************************************************************************************/

//Criando cabeçalho padronizado para as devolutivas da API
const DEFAULT_MESSAGE = {
    api_description: "API centralizada para a gestão administrativa, controle de dados e governança da plataforma VibeEco.",
    development: "Lucas Kolle",
    version: "1.0.10.26",
    status: Boolean,
    status_code: Number,
    response: {}
}

//Criando mensagens de erros personalizadas de acordo com os status code
const ERROR_BAD_REQUEST = {
    status: false,
    status_code: 400,
    message: "Os dados enviados na requisição não estão corretos!"
}

const ERROR_INTERNAL_SERVER_MODEL = {
    status: false,
    status_code: 500,
    message: "Não foi possível processar a requição por conta de erro na API (Erro na modelagem de dados MODEL)."
}

const ERROR_INTERNAL_SERVER_CONTROLLER = {
    status: false,
    status_code: 500,
    message: "Não foi possível processar a requição por conta de erro na API (Erro na CONTROLLER)."
}

const ERROR_CONTENT_TYPE = {
    status: false,
    status_code: 415,
    message: "Não foi possível processar a requição pois o formato de dados aceito pela API é somente JSON."
}

const ERROR_NOT_FOUND = {
    status: false,
    status_code: 404,
    message: "Não foi encontrado nenhum dado para retorno."
}

//Criando mensagens de sucesso da API
const SUCESS_CREATED_ITEM = {
    status: true,
    status_code: 201,
    message: "Registro inserido com sucesso!"
}

const SUCESS_CREATED_ITEM_WARNING = {
    status: true,
    status_code: 201,
    message: "Os dados principais foram inseridos com sucesso, porém alguns dados apresentaram problemas e não foram inseridos!"
}

const SUCESS_RESPONSE = {
    status: true,
    status_code: 200
}

const SUCCESS_DELETED_ITEM = {
    status: true,
    status_code: 200,
    message: "Item excluído com sucesso!"
}

const SUCCESS_UPDATE_ITEM = {
    status: true,
    status_code: 200,
    message: "Item atualizado com sucesso"
}


//exportando as mensagens
module.exports = {
    DEFAULT_MESSAGE,
    ERROR_BAD_REQUEST,
    ERROR_INTERNAL_SERVER_MODEL,
    ERROR_INTERNAL_SERVER_CONTROLLER,
    ERROR_CONTENT_TYPE,
    ERROR_NOT_FOUND,
    SUCESS_CREATED_ITEM,
    SUCESS_RESPONSE,
    SUCCESS_DELETED_ITEM,
    SUCCESS_UPDATE_ITEM,
    SUCESS_CREATED_ITEM_WARNING
}