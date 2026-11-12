/********************************************************************************************************************************************************************************************
 * Objetivo: Arquivo responsável pela configuração do nodemailer, para possibilitar o envio de emails por meio do back-end.
 * Data: 12/11/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.11.26
 *******************************************************************************************************************************************************************************************/

// importando a dependência do nodemailer (nodemailer é uma biblioteca que permite o envio de e-mails a partir do Node.js)
const nodemailer = require("nodemailer");

// Configurando o serviço de envio de e-mail
const transporter = nodemailer.createTransport({

    //service: "gmail" informa que estamos utilizando o Gmail.
    service: "gmail", 

    // Credenciais da conta remetente
    auth: {
        user: process.env.EMAIL_USER, // e-mail do remetente (geralmente é o e-mail da empresa ou do sistema) / pega o valor da variável de ambiente EMAIL_USER (.env)
        pass: process.env.EMAIL_PASSWORD // senha do remetente (gerada nas configurações de segurança da conta) / pega o valor da variável de ambiente EMAIL_PASSWORD (.env)
    }

});

// Função responsável pelo envio do e-mail
const enviarEmail = async function(destinatario, assunto, mensagem){

    try {

        // Configurações da mensagem
        const emailOptions = {
            from: `"VibeEco" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: assunto,

                // Conteúdo em texto
                text: `
                        Olá!

                        Recebemos uma solicitação para redefinir a senha da sua conta no VibeEco.

                        Para continuar com o processo, utilize o código de verificação abaixo:

                        Código de recuperação: {{codigo}}

                        Esse código possui validade limitada e deve ser utilizado apenas uma vez. Por segurança, não compartilhe esse código com outras pessoas.

                        Caso você não tenha solicitado a recuperação de senha, recomendamos que ignore este e-mail. Sua senha atual permanecerá inalterada.

                        Se precisar de ajuda, entre em contato com nossa equipe de suporte.

                        Atenciosamente,

                        Equipe VibeEco

                        Pequenas atitudes, grandes transformações. 🌱
                    `,


                // Versão formatada em HTML
                html: `
                        <CodeBlock language="html" editable>
                        <!DOCTYPE html>
                        <html lang="pt-BR">


                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <meta name="color-scheme" content="light">
                            <title>Recuperação de senha - VibeEco</title>


                        <style>
                        @media only screen and (max-width: 600px) {
                        .container {
                        width: 100% !important;
                        padding: 20px 12px !important;
                        }

                        .content {
                        padding: 28px 20px !important;
                        }

                        .title {
                        font-size: 23px !important;
                        }

                        .code {
                        font-size: 30px !important;
                        letter-spacing: 5px !important;
                        }
                        }
                        </style>

                        </head>


                        <body style="
                            margin: 0;
                            padding: 0;
                            background-color: #F1F5F1;
                            font-family: Arial, Helvetica, sans-serif;
                        ">


                        <!-- Container principal -->
                        <table width="100%" border="0" cellspacing="0"
                                cellpadding="0" role="presentation"
                                style="background-color: #F1F5F1;">

                        <tr>
                        <td align="center" class="container"
                                        style="padding: 40px 15px;">

                        <!-- Cartão do e-mail -->
                        <table width="100%" border="0" cellspacing="0"
                                            cellpadding="0" role="presentation"
                                            style="
                                                max-width: 600px;
                                                background-color: #FFFFFF;
                                                border-radius: 12px;
                                                overflow: hidden;
                                            ">

                        <!-- Cabeçalho -->
                        <tr>
                        <td align="center" style="
                                                    background-color: #278343;
                                                    padding: 30px 20px;
                                                ">
                        <h1 style="
                                                        color: #FFFFFF;
                                                        font-size: 30px;
                                                        margin: 0;
                                                        font-weight: bold;
                                                        letter-spacing: 1px;
                                                    ">
                        VibeEco
                        </h1>

                        <p style="
                                                        color: #E5F5E8;
                                                        font-size: 13px;
                                                        margin: 8px 0 0;
                                                    ">
                        Pequenas atitudes, grandes transformações.
                        </p>
                        </td>
                        </tr>

                        <!-- Conteúdo -->
                        <tr>
                        <td class="content" style="padding: 40px 45px;">

                        <h2 class="title" style="
                                                        color: #263D2D;
                                                        font-size: 26px;
                                                        margin: 0 0 20px;
                                                        text-align: center;
                                                    ">
                        Recuperação de senha
                        </h2>

                        <p style="
                                                        color: #555555;
                                                        font-size: 15px;
                                                        line-height: 1.7;
                                                        margin: 0 0 15px;
                                                    ">
                        Olá!
                        </p>

                        <p style="
                                                        color: #555555;
                                                        font-size: 15px;
                                                        line-height: 1.7;
                                                        margin: 0 0 20px;
                                                    ">
                        Recebemos uma solicitação para redefinir
                        a senha da sua conta no VibeEco.
                        </p>

                        <p style="
                                                        color: #555555;
                                                        font-size: 15px;
                                                        line-height: 1.7;
                                                        text-align: center;
                                                        margin: 0 0 15px;
                                                    ">
                        Utilize o código abaixo para continuar:
                        </p>

                        <!-- Código de recuperação -->
                        <table width="100%" border="0"
                                                        cellspacing="0" cellpadding="0"
                                                        role="presentation"
                                                        style="
                                                            background-color: #EFF7F0;
                                                            border: 1px solid #D5E8D8;
                                                            border-radius: 10px;
                                                        ">

                        <tr>
                        <td align="center"
                                                                style="padding: 25px 10px;">

                        <p style="
                                                                    color: #54745B;
                                                                    font-size: 12px;
                                                                    font-weight: bold;
                                                                    text-transform: uppercase;
                                                                    letter-spacing: 1px;
                                                                    margin: 0 0 12px;
                                                                ">
                        Seu código de verificação
                        </p>

                        <h1 class="code" style="
                                                                    color: #278343;
                                                                    font-size: 36px;
                                                                    letter-spacing: 8px;
                                                                    margin: 0;
                                                                    font-weight: bold;
                                                                ">
                        ${mensagem}
                        </h1>

                        </td>
                        </tr>
                        </table>

                        <!-- Aviso de segurança -->
                        <p style="
                                                        color: #555555;
                                                        font-size: 13px;
                                                        line-height: 1.7;
                                                        margin: 25px 0 15px;
                                                    ">
                        <strong style="color: #263D2D;">
                        Atenção:
                        </strong>

                        Este código possui validade limitada
                        e pode ser utilizado apenas uma vez.
                        Por segurança, não compartilhe esse
                        código com outras pessoas.
                        </p>

                        <p style="
                                                        color: #777777;
                                                        font-size: 13px;
                                                        line-height: 1.7;
                                                        margin: 0;
                                                    ">
                        Caso você não tenha solicitado a
                        recuperação de senha, ignore este
                        e-mail. Sua senha atual permanecerá
                        inalterada.
                        </p>

                        <p style="
                                                        color: #555555;
                                                        font-size: 14px;
                                                        line-height: 1.7;
                                                        margin: 25px 0 0;
                                                    ">
                        Atenciosamente,<br>

                        <strong style="color: #278343;">
                        Equipe VibeEco
                        </strong>
                        </p>

                        </td>
                        </tr>

                        <!-- Rodapé -->
                        <tr>
                        <td align="center" style="
                                                    background-color: #F7FAF7;
                                                    border-top: 1px solid #E6EEE7;
                                                    padding: 22px 20px;
                                                ">

                        <p style="
                                                        color: #278343;
                                                        font-size: 13px;
                                                        font-weight: bold;
                                                        margin: 0 0 8px;
                                                    ">
                        VibeEco
                        </p>

                        <p style="
                                                        color: #888888;
                                                        font-size: 11px;
                                                        line-height: 1.6;
                                                        margin: 0;
                                                    ">
                        Este é um e-mail automático.
                        Por favor, não responda a esta mensagem.
                        </p>

                        <p style="
                                                        color: #AAAAAA;
                                                        font-size: 11px;
                                                        margin: 12px 0 0;
                                                    ">
                        © ${new Date().getFullYear()} VibeEco.
                        Todos os direitos reservados.
                        </p>

                        </td>
                        </tr>

                        </table>
                        <!-- Fim do cartão -->

                        </td>
                        </tr>
                        </table>

                        </body>
                        </html>
                        </CodeBlock>
                    `
        };

        // Realizando o envio
        const resultado = await transporter.sendMail(emailOptions);

        return true

    } catch (error) {

        return false

    }

};

// Exportando a função
module.exports = {
    enviarEmail
};
