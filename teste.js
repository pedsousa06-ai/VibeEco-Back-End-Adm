function gerarCaractereAleatorio() {

    var caractereAleatorio = ""
    
    for(let i = 0; i < 20; i++) {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        caractereAleatorio += caracteres.charAt(indiceAleatorio);
    }

    return caractereAleatorio;
}


// Exibindo os resultados
console.log(`Caractere gerado: ${gerarCaractereAleatorio()}`);




/********* TESTANDO ALTERS TABLE PARA EXCLUIR ALTOMATICAMENTE *********/

/**
-- ============================================================
-- 01. OFENSIVA DO USUÁRIO
-- Configura a exclusão automática das ofensivas vinculadas
-- ao usuário quando seu cadastro for removido.
-- ============================================================

ALTER TABLE tbl_ofensiva
DROP FOREIGN KEY FK_USUARIO_OFENSIVA;

ALTER TABLE tbl_ofensiva
ADD CONSTRAINT FK_USUARIO_OFENSIVA
FOREIGN KEY (id_usuario)
REFERENCES tbl_usuario(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


-- ============================================================
-- 02. PUBLICAÇÕES DO USUÁRIO
-- Configura a exclusão automática das publicações criadas
-- pelo usuário quando seu cadastro for removido.
-- ============================================================

ALTER TABLE tbl_post
DROP FOREIGN KEY FK_USUARIO_POST;

ALTER TABLE tbl_post
ADD CONSTRAINT FK_USUARIO_POST
FOREIGN KEY (id_usuario)
REFERENCES tbl_usuario(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


-- ============================================================
-- 03. CURTIDAS DO USUÁRIO
-- Configura a exclusão automática das curtidas realizadas
-- pelo usuário quando seu cadastro for removido.
-- ============================================================

ALTER TABLE tbl_post_curtida
DROP FOREIGN KEY FK_CURTIDA_USUARIO;

ALTER TABLE tbl_post_curtida
ADD CONSTRAINT FK_CURTIDA_USUARIO
FOREIGN KEY (id_usuario)
REFERENCES tbl_usuario(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


-- ============================================================
-- 04. COMENTÁRIOS DO USUÁRIO
-- Configura a exclusão automática dos comentários publicados
-- pelo usuário quando seu cadastro for removido.
-- ============================================================

ALTER TABLE tbl_post_comentario
DROP FOREIGN KEY FK_COMENTARIO_USUARIO;

ALTER TABLE tbl_post_comentario
ADD CONSTRAINT FK_COMENTARIO_USUARIO
FOREIGN KEY (id_usuario)
REFERENCES tbl_usuario(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


-- ============================================================
-- 05. NOTIFICAÇÕES DO USUÁRIO
-- Configura a exclusão automática das notificações associadas
-- ao usuário quando seu cadastro for removido.
-- ============================================================

ALTER TABLE tbl_notificacao
DROP FOREIGN KEY FK_NOTIFICACAO_USUARIO;

ALTER TABLE tbl_notificacao
ADD CONSTRAINT FK_NOTIFICACAO_USUARIO
FOREIGN KEY (id_usuario)
REFERENCES tbl_usuario(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


-- ============================================================
-- 06. MISSÕES DO USUÁRIO
-- Configura a exclusão automática dos vínculos entre usuários
-- e missões quando o cadastro do usuário for removido.
-- ============================================================

ALTER TABLE tbl_usuario_missao
DROP FOREIGN KEY FK_UM_USUARIO;

ALTER TABLE tbl_usuario_missao
ADD CONSTRAINT FK_UM_USUARIO
FOREIGN KEY (id_usuario)
REFERENCES tbl_usuario(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


-- ============================================================
-- 07. PREMIAÇÕES DO USUÁRIO
-- Configura a exclusão automática dos registros de premiações
-- associados ao usuário quando seu cadastro for removido.
-- ============================================================

ALTER TABLE tbl_usuario_premiacao
DROP FOREIGN KEY FK_USUARIO_USUARIOPREMIACAO;

ALTER TABLE tbl_usuario_premiacao
ADD CONSTRAINT FK_USUARIO_USUARIOPREMIACAO
FOREIGN KEY (id_usuario)
REFERENCES tbl_usuario(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


-- ============================================================
-- 08. DESAFIOS DO USUÁRIO
-- Configura a exclusão automática dos vínculos entre usuários
-- e desafios quando o cadastro do usuário for removido.
-- ============================================================

ALTER TABLE tbl_usuario_desafio
DROP FOREIGN KEY FK_UD_USUARIO;

ALTER TABLE tbl_usuario_desafio
ADD CONSTRAINT FK_UD_USUARIO
FOREIGN KEY (id_usuario)
REFERENCES tbl_usuario(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


-- ============================================================
-- 09. RECOMPENSAS DO USUÁRIO
-- Configura a exclusão automática dos registros de recompensas
-- associados ao usuário quando seu cadastro for removido.
-- ============================================================

ALTER TABLE tbl_usuario_recompensa
DROP FOREIGN KEY FK_UR_USUARIO;

ALTER TABLE tbl_usuario_recompensa
ADD CONSTRAINT FK_UR_USUARIO
FOREIGN KEY (id_usuario)
REFERENCES tbl_usuario(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


-- ============================================================
-- 10. CONTEÚDOS EDUCATIVOS DO USUÁRIO
-- Configura a exclusão automática dos vínculos entre usuários
-- e conteúdos educativos quando seu cadastro for removido.
-- ============================================================

ALTER TABLE tbl_usuario_conteudo_educativo
DROP FOREIGN KEY FK_UCE_USUARIO;

ALTER TABLE tbl_usuario_conteudo_educativo
ADD CONSTRAINT FK_UCE_USUARIO
FOREIGN KEY (id_usuario)
REFERENCES tbl_usuario(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


-- ============================================================
-- 11. CONQUISTAS DO USUÁRIO
-- Configura a exclusão automática dos registros de conquistas
-- associados ao usuário quando seu cadastro for removido.
-- ============================================================

ALTER TABLE tbl_usuario_conquista
DROP FOREIGN KEY FK_UC_USUARIO;

ALTER TABLE tbl_usuario_conquista
ADD CONSTRAINT FK_UC_USUARIO
FOREIGN KEY (id_usuario)
REFERENCES tbl_usuario(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


-- ============================================================
-- FIM DA CONFIGURAÇÃO DE EXCLUSÃO EM CASCATA DO USUÁRIO
-- Ao remover um usuário, os registros dependentes configurados
-- com ON DELETE CASCADE serão removidos automaticamente.
-- ============================================================
**/