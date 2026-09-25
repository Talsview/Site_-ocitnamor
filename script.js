/* =============================================================
   QUESTIONÁRIO AMOROSO — script.js
   JavaScript puro, sem dependências externas.
   ============================================================= */

/* ---------- 1. EDITE AQUI: perguntas, respostas e mensagens ---------- */
const QUESTIONS = [
  {
    question: "Você me ama? ❤️",
    yes: "SIM",
    no: "NÃO",
    response: "Eu sabia! ❤️ Você acabou de deixar meu coração ainda mais feliz. 🥰",
  },
  {
    question: "Então você vai ficar comigo para sempre? 💍❤️",
    yes: "SIM",
    no: "NÃO",
    response: "Combinado! 💍 Para sempre é só o começo da nossa história. ❤️",
  },
  // Para adicionar mais perguntas, é só copiar o bloco acima e mudar o texto.
];

const TEMPO_ATE_PROXIMA_PERGUNTA = 2600; // milissegundos
const EMOJIS_AMBIENTE = ["❤️", "💕", "💖", "🥰", "😍"];
const EMOJIS_COMEMORACAO = ["❤️", "💕", "🥰", "💖", "😍", "💘"];

/* ---------- 2. Referências do DOM ---------- */
const card = document.getElementById("card");
const questionText = document.getElementById("questionText");
const responseText = document.getElementById("responseText");
const actions = document.getElementById("actions");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const yesLabel = document.getElementById("yesLabel");
const noLabel = document.getElementById("noLabel");
const hint = document.getElementById("hint");
const restartBtn = document.getElementById("restartBtn");
const ambientHearts = document.getElementById("ambientHearts");
const burst = document.getElementById("burst");
const soundToggle = document.getElementById("soundToggle");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* ---------- 3. Som — efeitos e trilha sonora (Web Audio API) ----------
   Tudo é sintetizado na hora, então o site continua leve e não depende
   de nenhum arquivo de áudio em assets/. */
let somLigado = true;
let audioCtx = null;

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// Toca uma única nota curta com um envelope suave (sem estalos)
function tocarNota(ctx, freq, tempoInicio, duracao, tipoOnda, volume) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = tipoOnda || "sine";
  osc.frequency.setValueAtTime(freq, tempoInicio);

  gain.gain.setValueAtTime(0, tempoInicio);
  gain.gain.linearRampToValueAtTime(volume || 0.18, tempoInicio + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, tempoInicio + duracao);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(tempoInicio);
  osc.stop(tempoInicio + duracao + 0.05);
}

// Pequeno "jingle" feliz ao clicar em SIM (mais notas na última pergunta)
function tocarSomSim(isLast) {
  if (!somLigado) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const agora = ctx.currentTime;
  const notas = isLast
    ? [523.25, 659.25, 783.99, 1046.5]
    : [587.33, 739.99, 880];

  notas.forEach((freq, i) => tocarNota(ctx, freq, agora + i * 0.09, 0.32));
}

// Bipe curto e divertido quando o botão NÃO escapa
function tocarSomFuga() {
  if (!somLigado) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const agora = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(520, agora);
  osc.frequency.exponentialRampToValueAtTime(220, agora + 0.15);

  gain.gain.setValueAtTime(0.14, agora);
  gain.gain.exponentialRampToValueAtTime(0.0001, agora + 0.16);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(agora);
  osc.stop(agora + 0.2);
}

// Toca um acorde "pad" bem suave — várias notas entrando uma pouquinho
// depois da outra, como um abraço sonoro no fundo
function tocarAcordePad(ctx, frequencias, tempoInicio, duracao) {
  frequencias.forEach((freq, i) => {
    tocarNota(ctx, freq, tempoInicio + i * 0.35, duracao, "sine", 0.045);
  });
}

// Trilha sonora ambiente: dois acordes suaves alternando em loop, tocados
// para sempre enquanto o som estiver ligado. EDITE AQUI para trocar os
// acordes (frequências em Hz) ou a duração de cada volta do loop.
const ACORDES_TRILHA = [
  [261.63, 329.63, 392.0, 493.88], // Dó maior com 7a (quente, esperançoso)
  [220.0, 261.63, 329.63, 392.0], // Lá menor com 7a (mais suave, nostálgico)
];
const DURACAO_LOOP_TRILHA = 8; // segundos

let trilhaTimer = null;
let trilhaAtiva = false;
let acordeAtual = 0;

function agendarProximoAcordeDaTrilha() {
  const ctx = getAudioContext();
  if (!ctx || !somLigado) {
    trilhaAtiva = false;
    return;
  }

  const inicio = ctx.currentTime + 0.05;
  tocarAcordePad(ctx, ACORDES_TRILHA[acordeAtual], inicio, DURACAO_LOOP_TRILHA - 0.5);
  acordeAtual = (acordeAtual + 1) % ACORDES_TRILHA.length;

  trilhaTimer = setTimeout(agendarProximoAcordeDaTrilha, DURACAO_LOOP_TRILHA * 1000);
}

function iniciarTrilhaSonora() {
  if (trilhaAtiva || !somLigado) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  trilhaAtiva = true;
  agendarProximoAcordeDaTrilha();
}

function pararTrilhaSonora() {
  clearTimeout(trilhaTimer);
  trilhaAtiva = false;
  // o acorde que já começou a tocar termina naturalmente, sem corte seco
}

soundToggle.addEventListener("click", () => {
  somLigado = !somLigado;
  soundToggle.textContent = somLigado ? "🔊" : "🔇";
  soundToggle.setAttribute("aria-pressed", String(somLigado));
  soundToggle.setAttribute("aria-label", somLigado ? "Desativar som" : "Ativar som");

  if (somLigado) {
    const ctx = getAudioContext();
    if (ctx) tocarNota(ctx, 660, ctx.currentTime, 0.15, "sine", 0.15);
    iniciarTrilhaSonora();
  } else {
    pararTrilhaSonora();
  }
});

// Navegadores só deixam o som começar depois de uma interação da pessoa,
// então a trilha entra suavemente assim que ela tocar/clicar/apertar
// qualquer coisa na página pela primeira vez.
["pointerdown", "keydown"].forEach((evento) => {
  document.addEventListener(evento, iniciarTrilhaSonora, { once: true });
});

/* ---------- 4. Estado do questionário ---------- */
let currentIndex = 0;
let isShowingResponse = false;
let advanceTimer = null;

function renderQuestion(index) {
  const q = QUESTIONS[index];
  isShowingResponse = false;

  clearTimeout(advanceTimer);

  questionText.hidden = false;
  questionText.textContent = q.question;
  replayFadeIn(questionText);

  responseText.hidden = true;
  responseText.textContent = "";

  actions.hidden = false;
  hint.hidden = true;
  restartBtn.hidden = true;

  yesLabel.textContent = q.yes || "SIM";
  noLabel.textContent = q.no || "NÃO";

  resetNoButton();
}

function showResponse(q, isLast) {
  isShowingResponse = true;

  questionText.hidden = true;
  responseText.hidden = false;
  responseText.textContent = q.response;
  replayFadeIn(responseText);

  actions.hidden = true;

  tocarSomSim(isLast);
  createHeartBurst(isLast ? 22 : 14);

  if (isLast) {
    hint.hidden = true;
    restartBtn.hidden = false;
  } else {
    hint.hidden = false;
    advanceTimer = setTimeout(goToNextQuestion, TEMPO_ATE_PROXIMA_PERGUNTA);
  }
}

function goToNextQuestion() {
  clearTimeout(advanceTimer);
  if (currentIndex < QUESTIONS.length - 1) {
    currentIndex += 1;
    renderQuestion(currentIndex);
  }
}

function replayFadeIn(el) {
  el.classList.remove("fade-in");
  // força o navegador a "esquecer" a animação anterior antes de reaplicar
  void el.offsetWidth;
  el.classList.add("fade-in");
}

/* ---------- 5. Botão SIM ---------- */
yesBtn.addEventListener("click", () => {
  const q = QUESTIONS[currentIndex];
  const isLast = currentIndex === QUESTIONS.length - 1;
  showResponse(q, isLast);
});

// Tocar no cartão durante a mensagem avança mais rápido para quem não quer esperar.
// Ignora cliques que vieram (por bubbling) do próprio botão SIM/NÃO, já que o
// clique em SIM é o mesmo evento que chega até aqui.
card.addEventListener("click", (event) => {
  if (event.target.closest("#actions")) return;
  if (isShowingResponse && currentIndex < QUESTIONS.length - 1) {
    goToNextQuestion();
  }
});

/* ---------- 6. Botão NÃO: fica parado e só foge quando tentam apertar ---------- */
function resetNoButton() {
  noBtn.classList.remove("is-escaping", "is-popping");
  noBtn.style.left = "";
  noBtn.style.top = "";
}

function rectsOverlap(x, y, width, height, avoidRect, buffer) {
  return !(
    x + width + buffer < avoidRect.left ||
    x - buffer > avoidRect.right ||
    y + height + buffer < avoidRect.top ||
    y - buffer > avoidRect.bottom
  );
}

function pickRandomSpot(width, height, avoidRect, currentRect) {
  const margin = 12;
  const gapDoCard = 12;
  const zonaDeFuga = 58;
  const saltoMaximo = 120;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);

  const candidatos = [];

  // Cria uma "faixa" de fuga ao redor do cartão, em vez de usar a tela inteira.
  const areaExpandida = {
    left: Math.max(margin, avoidRect.left - zonaDeFuga),
    right: Math.min(window.innerWidth - margin, avoidRect.right + zonaDeFuga),
    top: Math.max(margin, avoidRect.top - zonaDeFuga),
    bottom: Math.min(window.innerHeight - margin, avoidRect.bottom + zonaDeFuga),
  };

  // Pontos previsíveis ao redor do cartão ajudam principalmente em celulares,
  // onde pode haver pouco espaço nas laterais.
  const pontosDeReferencia = [
    [avoidRect.left - width - gapDoCard, avoidRect.top],
    [avoidRect.right + gapDoCard, avoidRect.top],
    [avoidRect.left - width - gapDoCard, avoidRect.bottom - height],
    [avoidRect.right + gapDoCard, avoidRect.bottom - height],
    [avoidRect.left, avoidRect.top - height - gapDoCard],
    [avoidRect.right - width, avoidRect.top - height - gapDoCard],
    [avoidRect.left, avoidRect.bottom + gapDoCard],
    [avoidRect.right - width, avoidRect.bottom + gapDoCard],
  ];

  pontosDeReferencia.forEach(([x, y]) => {
    if (x < margin || x > maxX || y < margin || y > maxY) return;
    if (rectsOverlap(x, y, width, height, avoidRect, gapDoCard)) return;
    if (currentRect) {
      const atualX = currentRect.left + currentRect.width / 2;
      const atualY = currentRect.top + currentRect.height / 2;
      const novoX = x + width / 2;
      const novoY = y + height / 2;
      const distancia = Math.hypot(novoX - atualX, novoY - atualY);
      if (distancia > saltoMaximo) return;
    }
    candidatos.push({ x, y });
  });

  // Completa a faixa com posições aleatórias próximas do cartão.
  for (let tentativa = 0; tentativa < 30; tentativa += 1) {
    const x = areaExpandida.left + Math.random() * Math.max(0, areaExpandida.right - areaExpandida.left - width);
    const y = areaExpandida.top + Math.random() * Math.max(0, areaExpandida.bottom - areaExpandida.top - height);

    if (x < margin || x > maxX || y < margin || y > maxY) continue;
    if (rectsOverlap(x, y, width, height, avoidRect, gapDoCard)) continue;

    if (currentRect) {
      const atualX = currentRect.left + currentRect.width / 2;
      const atualY = currentRect.top + currentRect.height / 2;
      const novoX = x + width / 2;
      const novoY = y + height / 2;
      const distancia = Math.hypot(novoX - atualX, novoY - atualY);
      if (distancia > saltoMaximo) continue;
    }

    candidatos.push({ x, y });
  }

  // Fallback: nunca joga o botão para o outro lado da tela.
  // Procura primeiro o ponto livre mais próximo da borda do cartão.
  if (candidatos.length === 0) {
    const proximosAoCartao = [
      [avoidRect.left, avoidRect.top - height - gapDoCard],
      [avoidRect.right - width, avoidRect.top - height - gapDoCard],
      [avoidRect.left, avoidRect.bottom + gapDoCard],
      [avoidRect.right - width, avoidRect.bottom + gapDoCard],
      [avoidRect.left - width - gapDoCard, avoidRect.top],
      [avoidRect.right + gapDoCard, avoidRect.top],
    ]
      .map(([x, y]) => ({
        x: Math.min(Math.max(margin, x), maxX),
        y: Math.min(Math.max(margin, y), maxY),
      }))
      .filter(({ x, y }) => !rectsOverlap(x, y, width, height, avoidRect, gapDoCard));

    if (currentRect && proximosAoCartao.length) {
      const atualX = currentRect.left + currentRect.width / 2;
      const atualY = currentRect.top + currentRect.height / 2;
      proximosAoCartao.sort((a, b) => {
        const da = Math.hypot(a.x + width / 2 - atualX, a.y + height / 2 - atualY);
        const db = Math.hypot(b.x + width / 2 - atualX, b.y + height / 2 - atualY);
        return da - db;
      });
    }

    if (proximosAoCartao[0]) return proximosAoCartao[0];
  }

  const escolhido = candidatos[Math.floor(Math.random() * candidatos.length)];
  return escolhido || {
    x: Math.min(Math.max(margin, avoidRect.right + gapDoCard), maxX),
    y: Math.min(Math.max(margin, avoidRect.bottom + gapDoCard), maxY),
  };
}

function escapeNoButton() {
  const btnRect = noBtn.getBoundingClientRect();
  const avoidRect = card.getBoundingClientRect();

  if (!noBtn.classList.contains("is-escaping")) {
    // Trava a posição atual antes de virar "fixed", para não dar salto visual
    noBtn.style.left = `${btnRect.left}px`;
    noBtn.style.top = `${btnRect.top}px`;
    noBtn.classList.add("is-escaping");
    void noBtn.offsetWidth; // força o navegador a aplicar a posição inicial
  }

  const spot = pickRandomSpot(btnRect.width, btnRect.height, avoidRect, btnRect);
  noBtn.style.left = `${spot.x}px`;
  noBtn.style.top = `${spot.y}px`;

  tocarSomFuga();

  if (!prefersReducedMotion) {
    noBtn.classList.add("is-popping");
    clearTimeout(escapeNoButton._popTimer);
    escapeNoButton._popTimer = setTimeout(
      () => noBtn.classList.remove("is-popping"),
      220
    );
  }
}

// O botão fica parado; só foge no instante em que a pessoa tenta apertar.
// pointerdown cobre mouse e toque no celular sem esperar o clique terminar.
noBtn.addEventListener("pointerdown", escapeNoButton);

// A interação por teclado continua funcionando sem causar uma segunda fuga
// quando o navegador dispara o evento de clique depois do pointerdown.
noBtn.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    escapeNoButton();
  }
});

// Mantém o botão dentro da tela se a janela for redimensionada/rotacionada
window.addEventListener("resize", () => {
  if (!noBtn.classList.contains("is-escaping")) return;

  const btnRect = noBtn.getBoundingClientRect();
  const margin = 12;
  const maxX = Math.max(margin, window.innerWidth - btnRect.width - margin);
  const maxY = Math.max(margin, window.innerHeight - btnRect.height - margin);
  const curX = parseFloat(noBtn.style.left) || 0;
  const curY = parseFloat(noBtn.style.top) || 0;

  noBtn.style.left = `${Math.min(Math.max(margin, curX), maxX)}px`;
  noBtn.style.top = `${Math.min(Math.max(margin, curY), maxY)}px`;
});

/* ---------- 7. Corações flutuando ao fundo (decoração ambiente) ---------- */
function spawnAmbientHeart() {
  const heart = document.createElement("span");
  heart.className = "heart-floating";
  heart.textContent =
    EMOJIS_AMBIENTE[Math.floor(Math.random() * EMOJIS_AMBIENTE.length)];
  heart.style.left = `${Math.random() * 100}vw`;
  heart.style.fontSize = `${1 + Math.random() * 0.8}rem`;
  heart.style.animationDuration = `${10 + Math.random() * 8}s`;
  heart.style.animationDelay = `${Math.random() * 6}s`;
  ambientHearts.appendChild(heart);
}

if (!prefersReducedMotion) {
  const QUANTIDADE_CORACOES_AMBIENTE = 7;
  for (let i = 0; i < QUANTIDADE_CORACOES_AMBIENTE; i += 1) {
    spawnAmbientHeart();
  }
}

/* ---------- 8. Explosão de corações (comemoração do SIM) ---------- */
function createHeartBurst(quantidade) {
  const total = prefersReducedMotion
    ? Math.min(quantidade, 6)
    : quantidade;

  const origem = card.getBoundingClientRect();
  const originX = origem.left + origem.width / 2;
  const originY = origem.top + origem.height / 2;

  for (let i = 0; i < total; i += 1) {
    const heart = document.createElement("span");
    heart.className = "burst-heart";
    heart.textContent =
      EMOJIS_COMEMORACAO[Math.floor(Math.random() * EMOJIS_COMEMORACAO.length)];
    heart.style.left = `${originX}px`;
    heart.style.top = `${originY}px`;

    const dx = (Math.random() * 2 - 1) * 220;
    const dy = -(100 + Math.random() * 240);
    heart.style.setProperty("--fly-to", `translate(${dx}px, ${dy}px)`);
    heart.style.setProperty("--fly-rot", `${Math.random() * 60 - 30}deg`);
    heart.style.animationDuration = `${1 + Math.random() * 0.8}s`;

    burst.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }
}

/* ---------- 9. Recomeçar o questionário ---------- */
restartBtn.addEventListener("click", () => {
  currentIndex = 0;
  renderQuestion(currentIndex);
});

/* ---------- 10. Início ---------- */
renderQuestion(currentIndex);