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
  resetNoButton();

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

/* ---------- 6. Botão NÃO: fuga controlada em 4 posições fixas ---------- */
let noEscapeStep = 0;
let lastNoEscapeAt = -Infinity;
const NO_ESCAPE_GAP = 12;
const NO_SCREEN_MARGIN = 10;
const NO_ESCAPE_DEBOUNCE = 220;

// Guarda o local original do botão. Quando ele escapa, vai para o <body>
// para que position: fixed seja realmente relativo à tela, e não ao cartão.
const noButtonHome = {
  parent: noBtn.parentNode,
  nextSibling: noBtn.nextSibling,
};

function resetNoButton() {
  noEscapeStep = 0;
  lastNoEscapeAt = -Infinity;
  clearTimeout(escapeNoButton._popTimer);

  if (noBtn.classList.contains("is-escaping")) {
    noBtn.classList.remove("is-escaping", "is-popping");
    noBtn.style.left = "";
    noBtn.style.top = "";
    noButtonHome.parent.insertBefore(noBtn, noButtonHome.nextSibling);
  } else {
    noBtn.classList.remove("is-popping");
    noBtn.style.left = "";
    noBtn.style.top = "";
  }
}

function isInsideViewport(x, y, width, height) {
  return (
    x >= NO_SCREEN_MARGIN &&
    y >= NO_SCREEN_MARGIN &&
    x + width <= window.innerWidth - NO_SCREEN_MARGIN &&
    y + height <= window.innerHeight - NO_SCREEN_MARGIN
  );
}

function overlapsCard(x, y, width, height, cardRect, gap = NO_ESCAPE_GAP) {
  return !(
    x + width + gap <= cardRect.left ||
    x - gap >= cardRect.right ||
    y + height + gap <= cardRect.top ||
    y - gap >= cardRect.bottom
  );
}

function getFourFixedSpots(width, height, cardRect) {
  const centerX = cardRect.left + (cardRect.width - width) / 2;
  const centerY = cardRect.top + (cardRect.height - height) / 2;

  // Exatamente 4 pontos, sempre próximos do retângulo:
  // 1 direita → 2 baixo → 3 esquerda → 4 cima.
  return [
    { x: cardRect.right + NO_ESCAPE_GAP, y: centerY },
    { x: centerX, y: cardRect.bottom + NO_ESCAPE_GAP },
    { x: cardRect.left - width - NO_ESCAPE_GAP, y: centerY },
    { x: centerX, y: cardRect.top - height - NO_ESCAPE_GAP },
  ];
}

function chooseFixedSpot(width, height, cardRect) {
  const spots = getFourFixedSpots(width, height, cardRect);

  // A sequência é fixa. Em uma tela estreita, se o ponto atual não couber,
  // procura o próximo ponto dos mesmos 4 que esteja totalmente visível.
  for (let offset = 0; offset < spots.length; offset += 1) {
    const index = (noEscapeStep + offset) % spots.length;
    const spot = spots[index];

    if (
      isInsideViewport(spot.x, spot.y, width, height) &&
      !overlapsCard(spot.x, spot.y, width, height, cardRect)
    ) {
      noEscapeStep = (index + 1) % spots.length;
      return { x: Math.round(spot.x), y: Math.round(spot.y) };
    }
  }

  // Fallback para celulares muito estreitos: tenta os mesmos quatro pontos
  // com uma folga menor, ainda exigindo que o botão não fique sobre o cartão.
  const fallbackGap = 4;
  const fallbackSpots = [
    {
      x: cardRect.right + fallbackGap,
      y: cardRect.top + (cardRect.height - height) / 2,
    },
    {
      x: cardRect.left + (cardRect.width - width) / 2,
      y: cardRect.bottom + fallbackGap,
    },
    {
      x: cardRect.left - width - fallbackGap,
      y: cardRect.top + (cardRect.height - height) / 2,
    },
    {
      x: cardRect.left + (cardRect.width - width) / 2,
      y: cardRect.top - height - fallbackGap,
    },
  ];

  for (const spot of fallbackSpots) {
    if (
      isInsideViewport(spot.x, spot.y, width, height) &&
      !overlapsCard(spot.x, spot.y, width, height, cardRect, fallbackGap)
    ) {
      return { x: Math.round(spot.x), y: Math.round(spot.y) };
    }
  }

  // Último recurso: mantém o botão dentro da tela. Essa situação só ocorre
  // quando não existe espaço físico ao redor do cartão no viewport atual.
  const right = window.innerWidth - width - NO_SCREEN_MARGIN;
  const bottom = window.innerHeight - height - NO_SCREEN_MARGIN;
  return {
    x: Math.round(Math.max(NO_SCREEN_MARGIN, Math.min(right, cardRect.right + 2))),
    y: Math.round(Math.max(NO_SCREEN_MARGIN, Math.min(bottom, cardRect.bottom + 2))),
  };
}

function escapeNoButton(event) {
  if (event) {
    if (event.type === "pointerdown") {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
    }

    if (event.type === "touchstart") {
      event.preventDefault();
    }

    if (event.type === "click") {
      event.preventDefault();
    }

    event.stopPropagation();
  }

  const now = performance.now();
  if (now - lastNoEscapeAt < NO_ESCAPE_DEBOUNCE) return;
  lastNoEscapeAt = now;

  // Mede o cartão antes de tirar o botão do flexbox.
  const cardRect = card.getBoundingClientRect();
  const originalRect = noBtn.getBoundingClientRect();

  if (!noBtn.classList.contains("is-escaping")) {
    // Tira o botão do cartão. Isso evita o problema de position: fixed dentro
    // de um elemento que possui transform/animation.
    document.body.appendChild(noBtn);
    noBtn.classList.add("is-escaping");

    // Mantém a posição visual por um instante antes de aplicar o ponto novo.
    noBtn.style.left = `${originalRect.left}px`;
    noBtn.style.top = `${originalRect.top}px`;
    void noBtn.offsetWidth;
  }

  const currentRect = noBtn.getBoundingClientRect();
  const spot = chooseFixedSpot(currentRect.width, currentRect.height, cardRect);

  noBtn.style.left = `${spot.x}px`;
  noBtn.style.top = `${spot.y}px`;
  noBtn.blur();

  tocarSomFuga();

  if (!prefersReducedMotion) {
    noBtn.classList.add("is-popping");
    clearTimeout(escapeNoButton._popTimer);
    escapeNoButton._popTimer = setTimeout(() => {
      noBtn.classList.remove("is-popping");
    }, 220);
  }
}

// Mouse, touch e clique de fallback. O debounce evita que um único toque
// produza duas fugas (pointerdown + click).
noBtn.addEventListener("pointerdown", escapeNoButton, { passive: false });
noBtn.addEventListener("touchstart", escapeNoButton, { passive: false });
noBtn.addEventListener("click", escapeNoButton);

// Teclado: Enter/Espaço também fazem o botão fugir.
noBtn.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    escapeNoButton(event);
  }
});

// Reposiciona o ponto atual quando a tela é redimensionada ou girada.
window.addEventListener("resize", () => {
  if (!noBtn.classList.contains("is-escaping")) return;

  const btnRect = noBtn.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const currentStep = noEscapeStep;
  noEscapeStep = (currentStep + 3) % 4;
  const spot = chooseFixedSpot(btnRect.width, btnRect.height, cardRect);

  noBtn.style.left = `${spot.x}px`;
  noBtn.style.top = `${spot.y}px`;
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