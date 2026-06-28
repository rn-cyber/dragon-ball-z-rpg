let turno = 1
let turnoFinalizado = false

const gokuBaseStats = {
    nome: "Goku",
    hp: 2000,
    atk: 500,
    def: 250,
    esquiva: 12,
    critico: 8,
    ki: 750,
    habilidades: [
        { nome: "Kamehameha", custo: 250, dano: 500 }
    ],
    itens: [
        { nome: "Semente dos Deuses", cura: 500, quantidade: 3 }
    ]
};

function resetGokuParaEstagio(estagio) {
    const multiplicador = 2 ** (estagio - 1);
    personagem1.nome = gokuBaseStats.nome;
    personagem1.hp = gokuBaseStats.hp * multiplicador;
    personagem1.atk = gokuBaseStats.atk * multiplicador;
    personagem1.def = gokuBaseStats.def * multiplicador;
    personagem1.esquiva = gokuBaseStats.esquiva * multiplicador;
    personagem1.critico = gokuBaseStats.critico * multiplicador;
    personagem1.ki = gokuBaseStats.ki * multiplicador;
    personagem1.habilidades = gokuBaseStats.habilidades.map(h => ({
        ...h,
        dano: h.dano * multiplicador
    }));
    personagem1.itens = gokuBaseStats.itens.map(i => ({ ...i }));
    personagem1.atkBase = personagem1.atk;
    personagem1.esquivaBase = personagem1.esquiva;
    personagem1.kaiokenAtivo = false;
    personagem1.kaiokenTurnos = 0;
    personagem1.ssjAtivo = false;
    personagem1.defendendo = false;
}

let audioTrilhaEstagio = null;

function tocarTrilhaEstagio(estagio) {
    const caminho = `sons/trilhaSonoraEstagio${estagio}.mp3`;

    if (audioTrilhaEstagio && audioTrilhaEstagio.src && audioTrilhaEstagio.src.includes(caminho)) {
        return;
    }

    if (audioTrilhaEstagio) {
        audioTrilhaEstagio.pause();
        audioTrilhaEstagio.currentTime = 0;
    }

    audioTrilhaEstagio = new Audio(caminho);
    audioTrilhaEstagio.loop = true;
    audioTrilhaEstagio.volume = 0.4;
    audioTrilhaEstagio.play().catch(() => {
        // Autoplay pode ser bloqueado; o áudio irá iniciar no próximo clique do usuário.
    });
}

function pararTrilhaEstagio() {
    if (!audioTrilhaEstagio) return;
    audioTrilhaEstagio.pause();
    audioTrilhaEstagio.currentTime = 0;
}

function escolherAnimacao(variantes) {
    return variantes[Math.floor(Math.random() * variantes.length)];
}

function criarElementoAnimacao(src) {
    if (src.endsWith('.mp4')) {
        const video = document.createElement('video');
        video.src = src;
        video.autoplay = true;
        video.controls = false;
        video.loop = true;
        video.volume = 0;
        video.style.display = 'block';
        video.style.margin = '10px auto';
        video.style.maxWidth = '50%';
        return video;
    }

    const img = document.createElement('img');
    img.src = src;
    img.style.display = 'block';
    img.style.margin = '10px auto';
    img.style.maxWidth = '50%';
    return img;
}

function obterAnimacaoAtaque(atacante) {
    if (atacante.nome === 'Vegeta') {
        if (atacante.oozaruAtivo) {
            return ['imagens/oozaruAtaque2.mp4'];
        }
        return ['imagens/vegetaAtaque.mp4', 'imagens/vegetaAtaque2.mp4'];
    }

    if (atacante.nome === 'Goku') {
        if (atacante.ssjAtivo) {
            return ['imagens/gokuSSJHitFreezaMax.mp4', 'imagens/gokuSSJAtaque.mp4'];
        }
        if (estagio === 2 && atacante.ssjAtivo === false) {
            return ['imagens/gokuHitFreeza.mp4', 'imagens/gokuHitFreeza.mp4'];
        }
        if (atacante.kaiokenAtivo && atacante.ssjAtivo === false) {
            return ['imagens/ataqueKaioken.mp4', 'imagens/ataqueKaioken2.mp4'];
        }
        return ['imagens/gokuAtaque.mp4', 'imagens/gokuAtaque2.mp4'];
    }

    if (atacante.nome === 'Freeza') {
        if(atacante.transformacaoAtiva){
            return ['imagens/freezaFullAtaque2.mp4', 'imagens/freezaFullAtaque.mp4'];
            }
        }       
        return ['imagens/freezaHitGoku.mp4', 'imagens/freezaAtaque2.mp4'];

    return ['imagens/gokuAtaque.mp4', 'imagens/gokuAtaque2.mp4'];
}

function obterSomHabilidade(habilidade) {
    const nomeHabilidade = habilidade.nome;
    const mapeadorSons = {
        "Kamehameha": "sons/Kamehameha.mp3",
        "SuperKamehameha": "sons/SuperKamehameha.mp3",
        "Kamehameha X20":"sons/kamehamehax20.mp3",
        "Galick Ho": "sons/GalickHo.mp3",
        "Death Beam": "sons/DeathBeam.mp3",
        "Death Ball": "sons/DeathBall.mp3",
        "Chou Makouhou": "sons/ChouMakouhou.mp3",
        "Absorção": "sons/Absorcao.mp3"
    };
    return mapeadorSons[nomeHabilidade] || null;
}

const effectAudios = [];

function tocarSomHabilidade(habilidade) {
    const caminho = obterSomHabilidade(habilidade);
    if (!caminho) return;

    playEffectAudio(caminho);
}

function obterSomEfeito(nomeEfeito) {
    const mapeadorEfeitos = {
        "Kaiokenx20":"sons/kaiokenx20.mp3",
        "Kaioken": "sons/kaioken.mp3",
        "Super Saiyajin": "sons/gokuSSJ.mp3",
        "Oozaru": "sons/oozaru.mp3",
        "Freeza Transformacao": "sons/FreezaTransformacao.mp3"
    };
    return mapeadorEfeitos[nomeEfeito] || null;
}

function tocarSomEfeito(nomeEfeito) {
    const caminho = obterSomEfeito(nomeEfeito);
    if (!caminho) return;

    playEffectAudio(caminho);
}

function playEffectAudio(caminho) {
    // Se já houver um som de efeito em reprodução, interrompe antes de tocar o próximo.
    pararEfeitosAudio();
    const audio = new Audio(caminho);
    audio.volume = 1;
    effectAudios.push(audio);
    audio.play().catch(() => {
        // Falha silenciosa se o áudio não puder ser reproduzido
    });
    audio.addEventListener('ended', () => {
        const index = effectAudios.indexOf(audio);
        if (index !== -1) {
            effectAudios.splice(index, 1);
        }
    });
    return audio;
}

function pararEfeitosAudio() {
    effectAudios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    effectAudios.length = 0;
}

function obterAnimacaoHabilidade(atacante, habilidade) {
    if (atacante.nome === 'Goku') {
        if (atacante.kaiokenAtivo &&  atacante.ssjAtivo === false && estagio === 2 && atacante.ki >= 250) {
            return ['imagens/kamehamehax20.mp4'];
        }
        if (atacante.ssjAtivo && atacante.ki >= 250) {
            return ['imagens/SuperKamehameha2.mp4', 'imagens/SuperKamehameha.mp4'];
        }
        if (atacante.kaiokenAtivo && atacante.ki >= 250) {
            return ['imagens/kameKaioken.mp4'];
        }
        if (atacante.ki >= 250 && atacante.kaiokenAtivo === false && atacante.ssjAtivo === false) {
            return ['imagens/kamehameha2.mp4'];
        }
    }
    
    if (habilidade.nome === 'Galick Ho') {
        return ['imagens/galickHo.mp4'];
    }
    if (habilidade.nome === 'Chou Makouhou') {
        return ['imagens/chouMako.mp4'];
    }
    if (habilidade.nome === 'Death Beam') {
        return ['imagens/deathBeam.mp4'];
    }
    if (habilidade.nome === 'Death Ball') {
        return ['imagens/DeathBall.mp4', 'imagens/DeathBall.mp4'];
    }

    return ['imagens/0.mp4','imagens/01.mp4'];
}

function statusDeBatalha(personagemA, personagemB) {
    logBattle(`
      <div class="status-turno">
        <p><strong>${personagemA.nome}</strong> — HP: ${personagemA.hp} — KI: ${personagemA.ki}</p>
        <p><strong>${personagemB.nome}</strong> — HP: ${personagemB.hp} — KI: ${personagemB.ki}</p>
      </div>
    `);

    verificarTransformacaoGoku(personagemA);
    atualizarKaioken(personagemA);
    atualizarKaioken(personagemB);
}

function getImagemStatus(personagem, estagio) {
    if (personagem.nome === "Goku") {
        if (personagem.ssjAtivo) {
            return "imagens/gokuSSJ.mp4";
        }
        return estagio === 2 ? "imagens/gokuEstagio2.mp4" : "imagens/GokuEstagio1.mp4";
    }
    if (personagem.nome === "Freeza") {
        return personagem.transformacaoAtiva ? "imagens/freeza.mp4" : "imagens/freeza.mp4";//o segundo é os status
    }
    if (personagem.nome === "Vegeta") {
        return "imagens/VegetaEstagio1.mp4";
    }
    return "imagens/goku.png";
}

function getStatusMediaHtml(personagem, estagio) {
    const src = getImagemStatus(personagem, estagio);
    if (src.endsWith('.mp4')) {
        return `
            <video src="${src}" autoplay loop muted playsinline style="display:block;margin:10px auto;max-width:250px;"></video>
        `;
    }
    return `
        <img src="${src}" style="display:block;margin:10px auto;max-width:250px;">
    `;
}

function getStatusHtml(personagem, estagio) {
    return `
        <div class="status-title">STATUS ${personagem.nome}</div>
        <div class="atributos">
            Ataque: ${personagem.atk} | Defesa: ${personagem.def} | HP: ${personagem.hp} | KI: ${personagem.ki} | Esquiva: ${personagem.esquiva} | Crítico: ${personagem.critico}
        </div>
        ${getStatusMediaHtml(personagem, estagio)}
    `;
}


function verificarTransformacaoGoku(personagem) {
    if (personagem.nome !== "Goku" || personagem.ssjAtivo || estagio === 1) return;
    if (personagem.hp <= 900) {
        personagem.ssjAtivo = true;
        personagem.hp += 1000;
        personagem.atk += 400;
        personagem.def += 150;
        personagem.critico += 5;
        personagem.ki += 500;
        personagem.habilidades[0].nome = "SuperKamehameha";
        personagem.habilidades[0].dano += 200;
        logBattle(`<div class="habilidade-msg">${personagem.nome} despertou o Super Saiyajin!</div>`);
        tocarSomEfeito("Super Saiyajin");
        atualizarBotaoKaioken();
        const battleLog = document.getElementById("battle-log");
        const video = document.createElement("video");
        video.src = "imagens/gokuSSJ.mp4";
        video.autoplay = true;
        video.controls = false;
        video.loop = false;
        video.style.display = "block";
        video.style.margin = "10px auto";
        video.style.maxWidth = "50%";
        battleLog.appendChild(video);

        atualizarStatus(personagem, personagem2);
    }
}

function mostrarAnimDerrota(personagem) {
    const battleLog = document.getElementById("battle-log");
    const video = document.createElement("video");
    video.style.display = "block";
    video.style.margin = "10px auto";
    video.autoplay = true;
    video.controls = false;
    video.loop = true;
    video.style.maxWidth = "50%";

    if (personagem.nome === "Goku" && estagio===1) {
        video.src = "imagens/vegetaKO.mp4";
    } else if (personagem.nome === "Freeza") {
        video.src = "imagens/freezaMorreGoku.mp4";
    } else if (personagem.nome === "Vegeta") {
        video.src = "imagens/gokuKO.mp4";
    } else if(personagem.nome === "Goku" && estagio===2) {
        video.src = "imagens/gokuMorreFreeza.mp4";
    }

    battleLog.appendChild(video);
}

function transformarFreeza(defensor) {
    if (defensor.nome !== "Freeza" || defensor.transformacaoAtiva) return;

    defensor.transformacaoAtiva = true;
    defensor.hp += 950;
    defensor.atk += 50;
    defensor.def += 100;
    defensor.critico += 5;
    defensor.ki += 500
    defensor.habilidades[0].nome = "Death Ball";

    logBattle(`<div class="habilidade-msg">${defensor.nome} se transformou em sua forma final!</div>`);
    tocarSomEfeito("Freeza Transformacao");
    const battleLog = document.getElementById("battle-log");
    const video = document.createElement("video");
    video.src = "imagens/freezaTransform.mp4";
    video.autoplay = true;
    video.controls = false;
    video.loop = false;
    video.style.display = "block";
    video.style.margin = "10px auto";
    video.style.maxWidth = "50%";
    battleLog.appendChild(video);
}

function atacar(atacante, defensor) {
    let chanceEsquiva = Math.floor(Math.random() * 100)
    let chanceCritico = Math.floor(Math.random() * 100)
    let dano = atacante.atk - defensor.def
    const battleLog = document.getElementById("battle-log");
    const animacao = escolherAnimacao(obterAnimacaoAtaque(atacante));
    const elementoAnimacao = criarElementoAnimacao(animacao);
    battleLog.appendChild(elementoAnimacao);
    if (defensor.defendendo) {
        dano = Math.floor(dano / 2); // reduz pela metade
        defensor.defendendo = false; // defesa vale só para um turno
    }


    if (chanceCritico <= atacante.critico) {
        dano *= 2
        logBattle(`<div class="critico-msg">*DANO CRÍTICO*</div>`);
    }
    if (chanceEsquiva <= defensor.esquiva) {
        logBattle(`<div class="esquiva-msg">${defensor.nome} esquivou dos ataques de ${atacante.nome}!</div>`);
        return
    }

    if (defensor.def >= atacante.atk) {
        dano = 1
    }

    defensor.hp -= dano
    if (defensor.hp < 0) defensor.hp = 0;
    logBattle(`<div class="dano-msg">${atacante.nome} atacou e causou ${dano} de dano</div>`);
    if (defensor.nome === "Vegeta" && defensor.hp <= 100 && !defensor.oozaruAtivo) {
        transformarEmOozaru(defensor);
        turnoFinalizado = true; // encerra o turno aqui
        return;
    }
    if (defensor.nome === "Freeza" && defensor.hp <= 1200 && !defensor.transformacaoAtiva) {
        transformarFreeza(defensor);
        turnoFinalizado = true;
        return;
    }
    if (defensor.nome === "Goku" && defensor.hp > 0 && defensor.hp <= 900 && !defensor.ssjAtivo) {
        verificarTransformacaoGoku(defensor);
        turnoFinalizado = true;
        return;
    }

    if (defensor.hp <= 0) {
        mostrarAnimDerrota(defensor);
        logBattle(`<div class="derrota-title">${defensor.nome} FOI DERROTADO!</div>`);
        if (defensor === personagem1) {

            document.getElementById("game-over-overlay").style.display = "flex";
            document.getElementById("controls").style.display = "none";
        } else if (defensor === personagem2) {

            // Verifica se existe próximo estágio
            if (estagios[estagio + 1]) {
                mostrarBotaoEstagio2();
            }
        }

    }



}

function batalhar(personagemA, personagemB) {

    while (personagemA.hp > 0 && personagemB.hp > 0) {
        logBattle(`<div class="turno-title">TURNO ${turno}</div>`);
        // Goku decide se ataca ou usa habilidade
        if (Math.random() < 0.25) { // % de chance de usar habilidade
            usarHabilidade(personagemA, personagemB, personagemA.habilidades[0]); // Kamehameha
        } else {
            atacar(personagemA, personagemB)
        }
        if (personagemB.hp <= 0) {

            break
        }
        // Vegeta decide se ataca ou usa habilidade
        if (turnoFinalizado) {
            turnoFinalizado = false; // reseta para o próximo turno
            turno++;
            continue; // Vegeta não age nesse turno
        }
        if (Math.random() < 0.2) {
            usarHabilidade(personagemB, personagemA, personagemB.habilidades[0]); // Final Flash
        } else {
            atacar(personagemB, personagemA)
        }
        if (personagemA.hp <= 0) {

            break
        }
        statusDeBatalha(personagemA, personagemB);

    }
}
function usarHabilidade(atacante, defensor, habilidade) {
    logBattle(`<div class="habilidade-msg">${atacante.nome} usou ${habilidade.nome}!</div>`);

    tocarSomHabilidade(habilidade);

    const battleLog = document.getElementById("battle-log");
    const animacao = escolherAnimacao(obterAnimacaoHabilidade(atacante, habilidade));
    const elementoAnimacao = criarElementoAnimacao(animacao);
    battleLog.appendChild(elementoAnimacao);

    if (atacante.ki < habilidade.custo) {
        logBattle(`<div class="esquiva-msg">${atacante.nome} não tem Ki suficiente!</div>`);
        return;
    }

    atacante.ki -= habilidade.custo;
    let dano = habilidade.dano + Math.floor(atacante.atk * 0.5) - defensor.def;
    if (defensor.defendendo) {
        dano = Math.floor(dano / 2); // reduz pela metade
        defensor.defendendo = false; // defesa vale só para um turno
    }
    if (dano < 1) dano = 1;

    defensor.hp -= dano;
    if (defensor.hp < 0) defensor.hp = 0;
    logBattle(`<div class="dano-msg">${atacante.nome} usou ${habilidade.nome} e causou ${dano} de dano!</div>`);
    if (defensor.nome === "Vegeta" && defensor.hp <= 100 && !defensor.oozaruAtivo) {
        transformarEmOozaru(defensor);
        turnoFinalizado = true;
        return;

    }
    if (defensor.nome === "Freeza" && defensor.hp <= 1200 && !defensor.transformacaoAtiva) {
        transformarFreeza(defensor);
        turnoFinalizado = true;
        return;
    }
    if (defensor.nome === "Goku" && defensor.hp > 0 && defensor.hp <= 900 && !defensor.ssjAtivo) {
        verificarTransformacaoGoku(defensor);
        turnoFinalizado = true;
        return;
    }
    if (defensor.hp <= 0) {
        mostrarAnimDerrota(defensor);
        logBattle(`<div class="derrota-title">${defensor.nome} FOI DERROTADO!</div>`);
        if (defensor === personagem1) {
            document.getElementById("game-over-overlay").style.display = "flex";
            document.getElementById("controls").style.display = "none";
        } else if (defensor === personagem2) {
            // Verifica se existe próximo estágio
            if (estagios[estagio + 1]) {
                mostrarBotaoEstagio2();
            }
        }
    }
}
function logBattle(msg) {
    const logDiv = document.getElementById("battle-log");
    const p = document.createElement("div"); // pode ser div em vez de p
    p.innerHTML = msg; // <-- usar innerHTML em vez de textContent
    logDiv.appendChild(p);
    logDiv.scrollTop = logDiv.scrollHeight;
}

function atualizarStatus(personagemA, personagemB) {
    const statusDiv = document.getElementById("status");

}

function mostrarBotaoEstagio2() {
    const botao = document.getElementById("btnEstagio2");
    if (!botao) return;
    botao.style.display = "inline-block";
}

function ocultarBotaoEstagio2() {
    const botao = document.getElementById("btnEstagio2");
    if (!botao) return;
    botao.style.display = "none";
}

function atualizarBotaoKaioken() {
    const botao = document.querySelector(".btn-kaioken");
    if (!botao) return;

    const bloqueado = estagio === 2 && personagem1 && personagem1.nome === "Goku" && personagem1.ssjAtivo;
    botao.disabled = bloqueado;
    botao.style.opacity = bloqueado ? "0.6" : "1";
    botao.style.cursor = bloqueado ? "not-allowed" : "pointer";
}

// Configuração de estágios e personagens
const estagios = {
    1: {
        nome: "Saga Saiyajin",
        frase: "O príncipe dos Saiyajins",
        inimigo: "Vegeta",
        criarPersonagem2: () => ({
            nome: "Vegeta",
            hp: 2000,
            atk: 450,
            def: 350,
            esquiva: 13,
            critico: 12,
            ki: 1000,
            habilidades: [
                { nome: "Galick Ho", custo: 250, dano: 550 }
            ],
            atkBase: 450,
            esquivaBase: 13,
            kaiokenAtivo: false,
            kaiokenTurnos: 0,
            oozaruAtivo: false
        })
    },
    2: {
        nome: "Saga Freeza",
        frase: "O Imperador do Universo",
        inimigo: "Freeza",
        criarPersonagem2: () => ({
            nome: "Freeza",
            hp: 4000,
            atk: 1200,
            def: 700,
            esquiva: 20,
            critico: 15,
            ki: 1500,
            habilidades: [
                { nome: "Death Beam", custo: 250, dano: 1000 }
            ],
            atkBase: 1200,
            esquivaBase: 20,
            kaiokenAtivo: false,
            kaiokenTurnos: 0,
            oozaruAtivo: false,
            transformacaoAtiva: false
        })
    },
    3: {
        nome: "Saga Cell",
        frase: "O Androide perfeito",
        inimigo: "Cell",
        criarPersonagem2: () => ({
            nome: "Cell",
            hp: 4000,
            atk: 600,
            def: 1400,
            esquiva: 30,
            critico: 12,
            ki: 2000,
            habilidades: [
                { nome: "Absorção", custo: 200, dano: 400 }
            ],
            atkBase: 600,
            esquivaBase: 30,
            kaiokenAtivo: false,
            kaiokenTurnos: 0,
            oozaruAtivo: false
        })
    }
};

function inicializarEstagio(numEstagio) {
    const config = estagios[numEstagio];
    if (!config) return;
    pararEfeitosAudio();
    turno = 1;
    estagio = numEstagio;
    mudarFundoEstagio(estagio);
    tocarTrilhaEstagio(estagio);

    resetGokuParaEstagio(estagio);
    atualizarBotaoKaioken();

    // Reseta personagem2
    personagem2 = config.criarPersonagem2();

    // Log do novo estágio
    logBattle(`<div class="turno-title">ESTÁGIO ${estagio}: ${config.nome}</div>`);
    logBattle(`<div class="habilidade-msg">${config.frase}</div>`);

    // Exibe status dos personagens
    logBattle(getStatusHtml(personagem1, estagio));
    logBattle(getStatusHtml(personagem2, estagio));

    verificarTransformacaoGoku(personagem1);
    ocultarBotaoEstagio2();
}

const botaoEstagio2 = document.getElementById("btnEstagio2");
if (botaoEstagio2) {
    botaoEstagio2.addEventListener("click", () => {
        inicializarEstagio(estagio + 1);
    });
}

function acaoJogador(acao) {
    if (turnoFinalizado) {
        turnoFinalizado = false;
        // Se uma transformação ou efeito encerrou o turno anterior, apenas limpa a flag
        // e permite que o jogador execute a ação no novo turno.
    }

    logBattle(`<div class="turno-title">TURNO ${turno}</div>`);
    if (acao === 'atacar') {
        atacar(personagem1, personagem2);
    } else if (acao === 'habilidade') {
        usarHabilidade(personagem1, personagem2, personagem1.habilidades[0]);
    } else if (acao === 'item') {
        usarItem(personagem1, personagem1.itens[0]);
    } else if (acao === 'defesa') {
        defender(personagem1);
    } else if (acao === 'carregarKi') {
        carregarKi(personagem1);
    } else if (acao === 'kaioken') {
        usarKaioken(personagem1);
    }

    if (personagem2.hp <= 0) return;

    if (turnoFinalizado) {
        turnoFinalizado = false;
        statusDeBatalha(personagem1, personagem2);
        turno++;
        return;
    }


    // Vegeta 
    if (Math.random() < 0.25) {
        usarHabilidade(personagem2, personagem1, personagem2.habilidades[0]);
    } else {
        atacar(personagem2, personagem1);
    }

    if (personagem1.hp <= 0) return;
    statusDeBatalha(personagem1, personagem2);
    turno++

}

function usarItem(personagem, item) {
    if (item.quantidade > 0) {
        logBattle(`<div class="habilidade-msg">${personagem.nome} usou ${item.nome}!</div>`);
        const battleLog = document.getElementById("battle-log");
        const img = document.createElement("img");
        img.src = "imagens/sementeDeuses.png";
        img.style.display = "block";
        img.style.margin = "10px auto";
        img.style.maxWidth = "80px";
        battleLog.appendChild(img);

        personagem.hp += item.cura;
        if (personagem.hp > personagem.hpMax) personagem.hp = personagem.hpMax; // limite máximo de HP

        item.quantidade--; // reduz uma semente

        logBattle(`<div class="dano-msg">${personagem.nome} recuperou ${item.cura} de HP! Restam ${item.quantidade} sementes.</div>`);
    } else {
        logBattle(`<div class="esquiva-msg">${personagem.nome} não tem mais ${item.nome}!</div>`);
    }
}
function defender(personagem) {
    personagem.defendendo = true; // flag para reduzir dano no próximo turno
    logBattle(`<div class="habilidade-msg">${personagem.nome} assumiu postura defensiva!</div>`);

}
function carregarKi(personagem) {
    const ganho = 200;
    personagem.ki += ganho;
    logBattle(`<div class="habilidade-msg">${personagem.nome} concentrou energia e recuperou ${ganho} de Ki!</div>`);
}
function usarKaioken(personagem) {
    const custoKi = 200;
    const desgasteHP = 200;

    if (estagio === 2 && personagem.nome === "Goku" && personagem.ssjAtivo) {
        logBattle(`<div class="esquiva-msg">${personagem.nome} não pode usar Kaioken após se transformar!</div>`);
        return;
    }

    if (personagem.kaiokenAtivo) {
        logBattle(`<div class="esquiva-msg">${personagem.nome} já está usando Kaioken!</div>`);
        return;
    }

    if (personagem.ki < custoKi) {
        logBattle(`<div class="esquiva-msg">${personagem.nome} não tem Ki suficiente para o Kaioken!</div>`);
        return;
    }

    personagem.ki -= custoKi;
    personagem.hp -= desgasteHP;

    personagem.kaiokenAtivo = true;
    personagem.kaiokenTurnos = 4;

    personagem.atk = personagem.atkBase * 1.5;
    personagem.esquivaBase = personagem.esquiva
    personagem.esquiva += 30
    // Altera o nome da habilidade para Kamehameha X20 quando Kaioken é ativado no estágio 2
    if (estagio === 2 && personagem.ssjAtivo === false) {
        personagem.habilidades[0].nome = "Kamehameha X20";
    }
    
    logBattle(`<div class="habilidade-msg">${personagem.nome} usou o Kaioken! Mas isso teve um preço...</div>`);
    if(estagio===1){
    tocarSomEfeito("Kaioken");
    const battleLog = document.getElementById("battle-log");
    const video = document.createElement("video");
    video.src = "imagens/kaioken.mp4";
    video.style.display = "block";
    video.style.margin = "10px auto";
    video.loop = false;
    video.autoplay = true;
    video.controls = false;
    video.style.maxWidth = "50%";
    battleLog.appendChild(video);
    }
    if(estagio===2){
    tocarSomEfeito("Kaiokenx20");
    const battleLog = document.getElementById("battle-log");
    const video = document.createElement("video");
    video.src = "imagens/kaiokenx20.mp4";
    video.style.display = "block";
    video.style.margin = "10px auto";
    video.loop = false;
    video.autoplay = true;
    video.controls = false;
    video.style.maxWidth = "50%";
    battleLog.appendChild(video);
    }
    

}

function atualizarKaioken(personagem) {
    if (personagem.kaiokenAtivo) {
        personagem.kaiokenTurnos--;

        if (personagem.kaiokenTurnos <= 0) {
            personagem.kaiokenAtivo = false;

            personagem.atk = personagem.atkBase;
            personagem.esquiva = personagem.esquivaBase;

            // Reseta o nome da habilidade quando Kaioken acaba
            if (estagio === 2 && personagem.ssjAtivo === false) {
                personagem.habilidades[0].nome = "Kamehameha";
            }

            logBattle(`<div class="esquiva-msg">${personagem.nome} não consegue mais manter o Kaioken!</div>`);
        }
    }
}
function transformarEmOozaru(defensor) {
    defensor.oozaruAtivo = true;
    defensor.hp += 400;
    defensor.habilidades[0].nome = "Chou Makouhou";
    logBattle(`<div class="habilidade-msg">${defensor.nome} se transformou em Oozaru!</div>`);
    tocarSomEfeito("Oozaru");

    const battleLog = document.getElementById("battle-log");
    const video = document.createElement("video");
    video.src = "imagens/oozaru.mp4";
    video.autoplay = true;
    video.controls = false;
    video.loop = false;
    video.style.display = "block";
    video.style.margin = "10px auto";
    video.style.maxWidth = "45%";
    battleLog.appendChild(video);
    return

}

function mudarFundoEstagio(estagio) {
    const body = document.getElementById("body") || document.body;
    if (estagio === 1) {
        body.style.backgroundImage = "url('imagens/cenarioSaiyajin.png')";
    } else if (estagio === 2) {
        body.style.backgroundImage = "url('imagens/cenarioNamek.jpg')";
    } else if (estagio === 3) {
        body.style.backgroundImage = "url('imagens/fase3.jpg')";
    }
}

function reiniciarJogo() {
    pararEfeitosAudio();
    document.getElementById("game-over-overlay").style.display = "none";
    document.getElementById("controls").style.display = "flex";

    const battleLog = document.getElementById("battle-log");
    if (battleLog) {
        battleLog.innerHTML = "";
    }

    const statusDiv = document.getElementById("status");
    if (statusDiv) {
        statusDiv.innerHTML = "";
    }

    turnoFinalizado = false;
    inicializarEstagio(estagio);
}