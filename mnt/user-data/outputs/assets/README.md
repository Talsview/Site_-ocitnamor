# Questionário Amoroso ❤️

Um mini-site romântico e divertido, feito só com HTML, CSS e JavaScript
puro — sem frameworks, sem backend, sem banco de dados. Pensado para
funcionar muito bem no celular.

## Estrutura

```
/
├── index.html      → estrutura da página
├── style.css       → visual: cores, gradiente "lâmpada de lava", animações
├── script.js       → lógica: perguntas, botão SIM, fuga do botão NÃO
├── assets/         → reservada para imagens/sons futuros (vazia por padrão)
└── .gitignore
```

## Como rodar localmente

Não precisa de instalação nem de build. Duas opções:

1. **Mais simples:** dê duplo clique em `index.html` para abrir direto no
   navegador.
2. **Com servidor local** (recomendado para simular melhor o ambiente do
   Netlify), na pasta do projeto:
   ```bash
   npx serve .
   ```
   ou, com Python instalado:
   ```bash
   python3 -m http.server
   ```
   Depois acesse o endereço mostrado no terminal (ex.: `http://localhost:3000`).

## Como testar a interação

- **Botão SIM ❤️**: deve trocar a pergunta por uma mensagem romântica, soltar
  uma pequena explosão de corações e, depois de alguns segundos, avançar
  sozinho para a próxima pergunta (ou tocar no cartão para pular a espera).
- **Botão NÃO 😏**: ele fica parado no lugar até você tentar de fato
  clicar (mouse) ou tocar nele (celular) — só nesse instante ele "foge"
  para outro ponto da tela, sem nunca ser possível confirmar um "não".
  Redimensione a janela ou gire o celular para conferir que ele nunca sai
  da área visível.
- **Última pergunta**: ao responder SIM na última pergunta, aparece uma
  explosão maior de corações e o botão "Recomeçar 💫", que reinicia o
  questionário do zero.
- **Responsividade**: abra o DevTools do navegador (F12 → ícone de celular)
  e teste alguns tamanhos de tela, ou acesse pelo celular mesmo.

## Como personalizar

Tudo que muda com frequência está concentrado no topo de `script.js`, no
array `QUESTIONS`. Cada pergunta é um bloco assim:

```js
{
  question: "Você me ama? ❤️",
  yes: "SIM",
  no: "NÃO",
  response: "Eu sabia! ❤️ ...",
}
```

Para adicionar mais perguntas, basta copiar um bloco, colar depois do
último e editar os textos — não precisa mexer no resto do código.

As cores, fontes e tamanhos ficam nas variáveis no topo de `style.css`
(seção `:root`).

## Deploy no Netlify

Este projeto é 100% estático, então o deploy é direto:

1. Suba o projeto para um repositório no GitHub (pode usar o GitHub
   Desktop: adicione a pasta como repositório local, faça o commit inicial
   e publique o repositório).
2. No [Netlify](https://app.netlify.com), escolha **"Add new site" → "Import
   an existing project"** e selecione o repositório.
3. Configuração de build: **deixe em branco** (não há comando de build nem
   pasta de publicação diferente da raiz — o `index.html` já está na raiz
   do projeto).
4. Clique em "Deploy" — não é necessária nenhuma variável de ambiente,
   função serverless ou banco de dados.

Todos os caminhos de `style.css` e `script.js` no `index.html` são
relativos, então funcionam tanto localmente quanto após o deploy.