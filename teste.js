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