# Handoff — Doce Vale Brownies · Landing animada

## Overview
Landing page de conversão para a **Doce Vale Brownies** — marca artesanal de brownie de doce de leite (Cruzeiro/SP). O objetivo único da página é mover o visitante para o WhatsApp (`5512981710055`). Cada seção tem um CTA contextual, mas todos abrem a mesma conversa com mensagens pré-preenchidas por sabor.

## About the Design Files
Os arquivos `index.html`, `styles.css`, `animations.js` e `image-slot.js` deste bundle são **referências de design**, não código de produção pra copiar tal e qual. A tarefa é **recriar essa landing no codebase do irmão** (provavelmente `tecnosup/projeto-docevale` no GitHub, branch `master`) seguindo os padrões existentes:

- Se o repo já está em HTML+CSS+JS vanilla (que é o caso atual), pode portar quase 1:1 — só substituir os arquivos.
- Se você optar por migrar para Astro/Next/Vite, transforme cada `<section>` num componente isolado mantendo classes e markup.
- Os scripts (`animations.js`) são modulares e cada bloco está separado por comentário — fácil de quebrar em hooks/módulos.

## Fidelity
**Alta fidelidade (hi-fi).** Cores, tipografia, espaçamentos, animações e copy estão finais. Implementação deve ser pixel-perfect dentro do razoável (responsividade pode adaptar breakpoints).

## Design Tokens

### Cores (do CLAUDE.md original do repo — manter exatos)
```css
--cream:    #f2e3c4;  /* fundo claro, body em seções light */
--cream-2:  #ead7b0;  /* layer mais saturada (sabor cards) */
--dark:     #2d1e17;  /* fundo principal escuro */
--dark-2:   #1d130d;  /* footer / contraste extra */
--brownie:  #8c512e;  /* CTAs, acento principal */
--brownie-2:#a3612f;  /* hover/highlight do brownie */
--forest:   #3a501f;  /* "disponível" badge */
--olive:    #8c9028;  /* eyebrows, marcações */
--earth:    #3f4d2b;  /* bg alternativo (não usado nesta versão) */
```

### Tipografia (Google Fonts — `display=swap`)
- **`Playfair Display`** — Display, headlines, números editoriais (700, 900, italic 400/700/900)
- **`DM Sans`** — UI, body, botões (300, 400, 500)
- **`Libre Baskerville`** — Acento, romanos, preços (italic 400/700)

Escala de tamanhos:
- Hero w1: `clamp(4.5rem, 10vw, 11rem)` — 900, letter-spacing -.04em
- Hero w2: `clamp(1.4rem, 2.6vw, 2.8rem)` — 700 italic
- Manifesto body: `clamp(1.5rem, 2.5vw, 2.4rem)` — Playfair italic 400
- Card name: 2rem (hero-card: clamp 2.6-3.8rem)
- Body: 0.85-1.05rem peso 300
- Eyebrows / labels: 0.6-0.68rem peso 500, letter-spacing 0.18-0.22em, uppercase

### Espaçamento e borda
- Seções: padding vertical 5-9rem (mobile 5rem, desktop 7-9rem)
- Hairlines: `1px solid rgba(242,227,196,.14)` ou `1px dashed rgba(140,81,46,.25)`
- Border-radius: 2-3px **só nos botões** — resto é canto reto (parte da identidade editorial)
- Shadows: nunca difusas/genéricas — sempre coloridas com o `--brownie` ou `dark`

## Screens / Views

Uma única landing page com **7 seções verticais** (mais topbar fixa).

### 1. Topbar (fixed)
- `position: fixed`, top 0, z-index 50
- Padding: 1.2rem 2.2rem (mobile 1rem 1.4rem)
- Esquerda: logo `Doce·Vale` (Playfair italic 700, 1rem) — separador `·` em `--brownie-2`
- Direita: `est. MMXXIV`, `Cardápio`, `O produto`, `Pedir`
- Estado `is-scrolled` (≥30px scroll): bg `rgba(29,19,13,.78)` + `backdrop-filter: blur(14px) saturate(140%)` + hairline bottom

### 2. Hero
- Grid 1.05fr / 0.95fr, min-height 100svh, padding 8rem 6vw 4rem
- Bg `--dark`, com glow radial `rgba(140,81,46,.45)` em 68% 52%, e ruído SVG inline 0.04 opacity
- **Esquerda (copy):**
  - Meta superior: 3 spans com bullet `--olive`, font 0.65rem, uppercase, letter-spacing 0.2em
  - Headline: "Escorre." (w1: cream, 900) + "recheio de & doce de leite." (w2: cream 55% opacity, italic 700, ampersand `&` em `--brownie-2`)
  - Sub: 32ch max, cream 60%
  - Specs: 3 colunas com valor (Libre Baskerville italic 1.35rem) + label uppercase
  - CTAs: btn primário "Reservar o meu" + ghost "ver cardápio"
- **Direita (brownie):**
  - `<img id="heroBrownie">` com `--scroll-y / --scroll-s / --scroll-r` custom properties atualizados via JS (parallax)
  - Anima de entrada: scale 1.1 → 1.0, rotate -2° → 0°, opacity 0 → 1 (1.4s easing cubic-bezier(.16,1,.3,1))
  - Float loop infinito: 14px Y, 0.4° rotation (7s)
  - 2 tags absolutas (`i.` 7×7cm denso · `ii.` recheio de doce de leite) com roman number + linha conectora + texto uppercase
- Footer da seção (absolute bottom): nº 01 (Libre Baskerville italic) + "role para mais"

### 3. Manifesto
- Bg `--dark`, padding 7rem 6vw, border-top hairline cream
- Grid 1fr / 1.6fr
- Esquerda: eyebrow "I · Manifesto" + roman `i.` 3.4rem Playfair italic 700 em `--brownie-2`
- Direita: parágrafo Playfair italic, cream 85%, com `<strong>` em 900 cream sólido e `<em>` em `--brownie-2`
- Animação: **word-by-word reveal** via JS — palavras envolvidas em `.word` aparecem em sequência (delay 35ms × idx, transição 0.65s)
- Assinatura: "— Daiane · que faz cada um à mão · Cruzeiro/SP" (uppercase, letter-spacing 0.22em)

### 4. Marquee
- Banda decorativa, bg `--dark`, hairlines top+bottom
- `.marquee-track`: animação `marquee` linear 36s infinita (translateX 0 → -50%)
- Items: Playfair italic 900, com bullets `--brownie-2` e palavras alternadas em destaque

### 5. Produto (exploding object) — `#produto`
- `height: 240vh`, bg `--cream`, color `--dark`, sticky inner 100svh
- **Background:** Playfair italic 900 "Brownie." cor `rgba(140,81,46,.07)` enorme atrás
- **Brownie central:** scale animado de 1.0 → **1.85** na primeira metade do scroll, rotação -4°
- **4 tags ordinais** (i. ii. iii. iv.) — start positions com `clamp(8%, 18%, 22%)` das bordas
- Tags driftam outward **±10vw / ±10vh** com delays escalonados (0, 0.04, 0.08, 0.12) — atingem destino em p=0.5 e **seguram visíveis** até o fim da seção
- Easing: `easeOut` cúbico (`1 - (1-t)^3`)
- **Mobile:** sticky vira static, tags somem, mostra grid 2×2 (`.specs-mobile`) + CTA

### 6. Sabores — `#sabores`
- Bg `--cream`, padding 6rem 6vw 8rem, border-top dashed `rgba(140,81,46,.25)`
- Header em 2 colunas (1fr / 1.4fr): título à esquerda + intro à direita
- Grid 3 colunas, gap 1.5rem
- **Card carro-chefe (doce de leite):** `grid-column: span 2; grid-row: span 2`, bg `--dark`, color cream
  - Inner grid 2 colunas (1fr / 1.1fr) × 3 linhas (auto 1fr auto)
  - Imagem ocupa coluna direita, width 130%, translate-x 10%, scale 1.05 (bleed pra fora)
  - min-height 26rem, padding 2.2rem 2.5rem
- **Cards rotativos:** bg `--cream-2`, padding 2rem 1.8rem, min-height 22rem
  - Top: roman + badge (`Disponível esta semana` ou `Próxima semana` ou `Em breve`)
  - Badge usa cores `--forest` (disponível), `--brownie` (rotating), 35% black (unavailable)
  - Imagem: `<image-slot>` (componente próprio) — usuário arrasta foto real depois
  - State `.unavailable`: opacity 0.55, cursor not-allowed no CTA
- **5º card "Caixa fechada":** bg transparent, border dashed
- **Hover:** translateY(-4px), bg vira `#e6d2a3` (cream mais saturado), pointer-follow radial glow via `--mx / --my` CSS vars + JS

### 7. Pote
- Bg `--dark`, padding 7rem 6vw, grid 2 colunas com 6vw gap
- Imagem do pote: float 9s infinito, drop-shadow profunda, glow radial atrás (blur 40px)
- Roman decorativo "iv." absolute top-left em 4rem Playfair italic `rgba(140,81,46,.25)`
- Copy à direita: eyebrow "IV · Novidade", título "No pote." + em "Do mesmo jeito que você ama.", lista numerada com romanos, CTA "Quero o pote"

### 8. Prova social
- Bg `--cream`, padding 7rem 6vw 8rem
- Head centralizado: eyebrow + h2 Playfair italic com `<strong>` em 900 `--brownie`
- Grid 3 colunas, gap 4rem 3rem
- Cada testimonial: roman 3rem italic + quote Playfair italic 1.15rem com aspas tipográficas " " em `--brownie` + meta com nome + cidade uppercase
- Border-top dashed em cada meta

### 9. CTA final
- Bg `--dark`, padding 9rem 6vw 8rem, border-top cream hairline
- Glow radial central + noise SVG
- Roman "VI · faça seu pedido" no topo (Libre Baskerville italic, brownie-2)
- Título `clamp(3rem, 7vw, 6.5rem)` com `<em>acabe</em>` em italic 700 brownie-2
- Word-by-word reveal no título
- Sub centrado, max 50ch
- CTA grande (`.btn-wa.lg`)
- Meta inferior em 3 colunas: `data-counter="48"` brownies/semana, `data-counter="4"` sabores, `Sáb · Dom` entrega — counters animam de 0 ao target em 1.4s easing cúbico ao entrar viewport

### 10. Footer
- Bg `--dark-2` (mais escuro), padding 4rem 6vw 2rem
- Grid 1.4fr / 1fr / 1fr / 1fr — logo+tag, Cardápio, Contato, Sobre
- Footer-bottom centrado abaixo da hairline: copyright + assinatura italic

## Interactions & Behavior

### WhatsApp
Todos os CTAs chamam `openWhatsApp(sabor)` que abre `https://wa.me/5512981710055?text=<mensagem-pre-encodada-por-sabor>`. Mensagens em `MSG` dict no topo de `animations.js`.

### Animações
- **Reveal** (`[data-reveal]`): IntersectionObserver threshold 0.18, rootMargin -8% bottom. Inicia em opacity 0 + translateY(28px), termina em opacity 1 + translateY(0). Transição 1s cubic-bezier(.16,1,.3,1).
- **Stagger** (`[data-stagger]`): filhos de elementos `[data-reveal]` animam em sequência com delay 90ms × idx.
- **Word-reveal** (`[data-reveal-words]`): texto quebrado em `<span class="word">` por JS (preserva `<strong>`/`<em>`). Cada palavra entra com delay 35ms × idx, transição 0.65s.
- **Hero parallax:** brownie translada -80px Y, escala 0.94, rotaciona +4° conforme scroll na hero.
- **Exploding object:** ver seção 5 acima.
- **Magnetic buttons** (`[data-magnetic]`): no pointermove dentro do botão, ele translada para o cursor (× 0.15 X, × 0.2 Y).
- **Sabor cards:** pointermove atualiza `--mx / --my` para gradient radial follow.
- **Counter** (`[data-counter="N"]`): anima 0 → N em 1.4s easing cubic, formatado `toLocaleString('pt-BR')`.
- **Topbar:** classe `is-scrolled` ≥ 30px.

### Botão WhatsApp (chamativo)
- Gradient linear `--brownie-2` → `--brownie`
- Border 1px cream 18%
- Shadow tripla: 28px blur colored, 6px black, inset highlight
- Text-shadow 1px 2px black 25%
- **Pulse loop 2.4s:** halo de 0 → 12px transparente rgba brownie
- **Shine on hover:** ::before com gradient diagonal 110° transparente → cream 40% → transparente, translateX -110% → +110% em 0.9s
- Hover: lift -3px, brightness 1.08, shadow cresce
- Variante `.lg`: padding 1.45 / 2.9rem, font 1rem, svg 20px

### `prefers-reduced-motion`
Reduz todas as animações para 0.01ms e força reveals para opacity 1.

## State / Data
- Sem backend. Tudo estático.
- `MSG` dict tem mensagens por sabor.
- `<image-slot>` (web component em `image-slot.js`) persiste imagens dropadas em localStorage — usuário faz upload uma vez e fica.

## Assets
- `assets/brownie-doce-de-leite.png` (carro-chefe, PNG sem fundo após remove.bg) — repo `tecnosup/projeto-docevale`
- `assets/brownie-pote.png` (versão pote, PNG sem fundo) — mesmo repo
- **Faltando** (gerar no Gemini conforme CLAUDE.md original):
  - `brownie-leite-ninho.png`
  - `brownie-nutella.png`
  - `brownie-kitkat.png`
- Enquanto não tiver, os cards usam `<image-slot>` que o usuário arrasta foto depois.

## Files neste bundle
```
design_handoff_docevale_landing/
├── README.md            ← este arquivo
├── index.html           ← markup completo das 7 seções
├── styles.css           ← tokens + componentes + responsivo + reveal CSS
├── animations.js        ← reveal observer, parallax, exploding, magnetic, counter
├── image-slot.js        ← web component drag-drop persistido em localStorage
└── assets/
    ├── brownie-doce-de-leite.png
    └── brownie-pote.png
```

## Como rodar localmente
1. Servir a pasta com qualquer servidor estático (não funciona `file://` por causa do `<script src>` e CORS dos fonts):
   - `npx serve .` ou `python3 -m http.server` ou Live Server no VSCode.
2. Abrir `http://localhost:PORTA/index.html`.
3. Pra editar com Claude Code: aponte ele pra esta pasta e peça pra portar ao codebase existente (`tecnosup/projeto-docevale`) ou refatorar em componentes.

## Prompt sugerido pro Claude Code

> Tenho este pacote de handoff (`design_handoff_docevale_landing/`) com a landing animada da Doce Vale em HTML+CSS+JS vanilla. Quero que você:
> 1. Leia o `README.md` inteiro pra entender tokens, seções, animações e copy.
> 2. Substitua o `index.html` atual do repo `tecnosup/projeto-docevale` por esta versão completa (com manifesto, sabores, prova social, CTA final e footer — o atual só tem hero, produto e pote).
> 3. Mantenha o número de WhatsApp e fontes Google atuais.
> 4. Garanta que `<image-slot>` funcione (carregar `image-slot.js` antes de `animations.js`).
> 5. Teste mobile em 375px e desktop em 1440px.
> 6. Commit com mensagem `feat(landing): seções completas + animações editoriais`.
