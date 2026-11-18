
/*******************************************************
 * Objetivo: Configuração do Nodemailer para envio
 * de e-mails do VibeEco.
 * Data: 17/11/2026
 * Autor: Lucas Dias Brandão Kolle
 * Versão: 1.0.11.26
 *******************************************************/

// Importando a dependência do Nodemailer
const nodemailer = require("nodemailer");

// Configurando o serviço de envio de e-mail
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Evita que o conteúdo dinâmico seja interpretado como HTML
const escaparHTML = function (texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// Verifica a conexão com o Gmail
const verificarEmail = async function () {
    try {
        await transporter.verify();

        console.log("[VIBEECO] Conexão SMTP com Gmail estabelecida.");

        return true;
    } catch (error) {
        console.error("[VIBEECO] Erro na autenticação SMTP:", error.message);

        return false;
    }
};

// Função responsável pelo envio do e-mail
const enviarEmail = async function (destinatario, assunto, mensagem) {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            throw new Error("Credenciais de e-mail não configuradas no .env.");
        }

        const codigo = escaparHTML(mensagem);

        const emailOptions = {
            from: `"VibeEco" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: assunto,

            text: `
Olá!

Recebemos uma solicitação para redefinir a senha da sua conta no VibeEco.

Código de recuperação: ${mensagem}

Esse código possui validade limitada e deve ser utilizado apenas uma vez.

Por segurança, não compartilhe esse código com outras pessoas.

Caso você não tenha solicitado a recuperação de senha, ignore este e-mail.

Atenciosamente,
Equipe VibeEco

Pequenas atitudes, grandes transformações.
            `,

            html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de senha - VibeEco</title>
</head>

<body style="margin:0;padding:0;background:#F1F5F1;font-family:Arial,Helvetica,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 15px;background:#F1F5F1;">
        <tr>
            <td align="center">

                <table width="100%" cellpadding="0" cellspacing="0"
                    style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;">

                    <tr>
                        <td align="center" style="background:#278343;padding:30px 20px;">
                            <h1 style="color:#FFFFFF;margin:0;font-size:30px;">VibeEco</h1>
                            <p style="color:#E5F5E8;font-size:13px;">
                                Pequenas atitudes, grandes transformações.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:40px 30px;">

                            <h2 style="color:#263D2D;text-align:center;">
                                Recuperação de senha
                            </h2>

                            <p style="color:#555;line-height:1.7;">
                                Olá! Recebemos uma solicitação para redefinir
                                a senha da sua conta no VibeEco.
                            </p>

                            <p style="text-align:center;color:#555;">
                                Utilize o código abaixo para continuar:
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#EFF7F0;border:1px solid #D5E8D8;border-radius:10px;">
                                <tr>
                                    <td align="center" style="padding:25px 10px;">
                                        <p style="color:#54745B;font-size:12px;font-weight:bold;">
                                            SEU CÓDIGO DE VERIFICAÇÃO
                                        </p>

                                        <h1 style="color:#278343;font-size:36px;letter-spacing:8px;margin:0;">
                                            ${codigo}
                                        </h1>
                                    </td>
                                </tr>
                            </table>

                            <p style="color:#555;font-size:13px;line-height:1.7;margin-top:25px;">
                                <strong>Atenção:</strong> Este código possui
                                validade limitada e pode ser utilizado apenas
                                uma vez. Não compartilhe com outras pessoas.
                            </p>

                            <p style="color:#777;font-size:13px;line-height:1.7;">
                                Caso você não tenha solicitado a recuperação,
                                ignore este e-mail. Sua senha atual permanecerá inalterada.
                            </p>

                            <p style="color:#555;margin-top:25px;">
                                Atenciosamente,<br>
                                <strong style="color:#278343;">Equipe VibeEco</strong>
                            </p>

                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background:#F7FAF7;padding:22px;">
                            <p style="color:#278343;font-weight:bold;">VibeEco</p>
                            <p style="color:#888;font-size:11px;">
                                Este é um e-mail automático. Por favor, não responda.
                            </p>
                            <p style="color:#AAA;font-size:11px;">
                                © ${new Date().getFullYear()} VibeEco.
                                Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
            `
        };

        const resultado = await transporter.sendMail(emailOptions);

        console.log("[VIBEECO] E-mail enviado:", resultado.messageId);

        return true;

    } catch (error) {
        console.error("[VIBEECO] Falha ao enviar e-mail:", error.message);

        return false;
    }
};

// Exportando as funções
module.exports = {
    enviarEmail,
    verificarEmail
};
