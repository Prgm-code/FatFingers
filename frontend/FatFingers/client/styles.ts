export const styles = `
  :root {
    color-scheme: light;
    --ink: #171713;
    --ink-2: #1b1b19;
    --ink-3: #242421;
    --paper: #f3f0e8;
    --paper-2: #ebe7dc;
    --paper-3: #ded9cb;
    --card: #fbfaf6;
    --acid: #d9ff43;
    --typo: #ff5a36;
    --muted: #5f5e57;
    --muted-2: #8a887f;
    --on-ink: #f1efe7;
    --on-ink-muted: #a3a29a;
    --on-ink-faint: #6c6b64;
    --line: rgba(23, 23, 19, .13);
    --line-strong: rgba(23, 23, 19, .26);
    --line-ink: rgba(241, 239, 231, .11);
    --sans: 'Manrope', ui-sans-serif, system-ui, sans-serif;
    --serif: 'Newsreader', 'Iowan Old Style', Georgia, serif;
    --mono: 'DM Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
    --ease: cubic-bezier(.2, .8, .2, 1);
    --spring: cubic-bezier(.34, 1.42, .64, 1);
    --wrap: min(1240px, calc(100% - 48px));
    --nav-h: 72px;
    --squiggle: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='8' viewBox='0 0 16 8'%3E%3Cpath d='M0 4 Q4 0.5 8 4 T16 4' fill='none' stroke='%23ff5a36' stroke-width='1.7' stroke-linecap='round'/%3E%3C/svg%3E");
    --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .09 0 0 0 0 .09 0 0 0 0 .07 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 500 16px/1.5 var(--sans); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
  a { color: inherit; text-decoration: none; }
  button { font: inherit; color: inherit; }
  h1, h2, h3, p { overflow-wrap: break-word; }
  ::selection { background: var(--acid); color: var(--ink); }
  :focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; border-radius: 6px; }
  .section-ink :focus-visible, .pg-helper :focus-visible { outline-color: var(--acid); }
  main:focus { outline: none; }
  section[id] { scroll-margin-top: calc(var(--nav-h) - 1px); }
  .icon { display: block; flex: 0 0 auto; width: 1em; height: 1em; }
  .icon-sm { width: 14px; height: 14px; }
  .sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; border: 0; }
  .site { position: relative; min-height: 100vh; overflow-x: clip; }
  .grain { position: fixed; inset: 0; z-index: 90; pointer-events: none; background-image: var(--grain); opacity: .26; }
  .skip { position: fixed; top: 12px; left: 12px; z-index: 120; padding: 10px 14px; border-radius: 10px; background: var(--ink); color: var(--acid); font: 500 13px var(--mono); transform: translateY(-180%); transition: transform .2s var(--ease); }
  .skip:focus { transform: none; }

  .kicker { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 0 0 22px; color: var(--muted); font: 500 12px/1.2 var(--mono); letter-spacing: .14em; text-transform: uppercase; }
  .kicker::before { content: ""; width: 22px; height: 1.5px; background: currentColor; }
  .section-ink .kicker { color: var(--acid); }
  .h2 { margin: 0; font-size: clamp(36px, 4.8vw, 72px); font-weight: 600; line-height: .96; letter-spacing: -.055em; text-wrap: balance; }
  .h2 em { color: #5d5c55; font-family: var(--serif); font-style: italic; font-weight: 300; letter-spacing: -.035em; }
  .section-ink .h2 em { color: #bdbbb2; }
  .h2-sm { font-size: clamp(30px, 3.6vw, 52px); line-height: 1.02; }
  .section-label { width: var(--wrap); margin: 0 auto 28px; }
  .lead { max-width: 34em; margin: 26px 0 0; color: var(--muted); font-size: clamp(17px, 1.3vw, 19px); line-height: 1.62; text-wrap: pretty; }
  .section-ink { background: var(--ink); color: var(--on-ink); }
  .section-ink .lead { color: var(--on-ink-muted); }
  .section-head { width: var(--wrap); margin: 0 auto; display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 20px 40px; align-items: start; }
  .section-head .kicker { margin-top: 16px; }
  .mini-label { margin: 0 0 12px; color: var(--muted); font: 500 11.5px var(--mono); letter-spacing: .12em; text-transform: uppercase; }
  .section-ink .mini-label { color: var(--on-ink-muted); }

  /* Navigation */
  .nav { position: sticky; top: 0; z-index: 60; height: var(--nav-h); border-bottom: 1px solid transparent; transition: background-color .3s ease, border-color .3s ease; }
  .nav[data-scrolled] { border-color: var(--line); background: rgba(243, 240, 232, .84); -webkit-backdrop-filter: saturate(1.3) blur(14px); backdrop-filter: saturate(1.3) blur(14px); }
  .nav-inner { width: var(--wrap); height: 100%; margin: 0 auto; display: flex; align-items: center; gap: 28px; }
  .brand { display: inline-flex; align-items: center; gap: 11px; font-size: 17px; font-weight: 700; letter-spacing: -.025em; }
  .brand-key { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 9px; background: linear-gradient(180deg, #2c2c27, var(--ink)); color: var(--acid); font: italic 400 19px/1 var(--serif); box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 3px 0 #000, 0 8px 14px -6px rgba(23,23,19,.55); transform: translateY(-2px); transition: transform .12s ease, box-shadow .12s ease; }
  .brand:hover .brand-key, .brand:active .brand-key { transform: translateY(1px); box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 0 0 #000, 0 3px 6px -3px rgba(23,23,19,.5); }
  .nav-links { display: flex; align-items: center; gap: 26px; margin-left: auto; font: 500 12px var(--mono); letter-spacing: .08em; text-transform: uppercase; }
  .nav-links a { position: relative; display: inline-flex; align-items: center; gap: 4px; padding: 6px 0; }
  .nav-links a::after { content: ""; position: absolute; left: 0; right: 0; bottom: 1px; height: 1.5px; background: currentColor; transform: scaleX(0); transform-origin: right; transition: transform .3s var(--ease); }
  .nav-links a:hover::after { transform: scaleX(1); transform-origin: left; }
  .nav-actions { display: flex; align-items: center; gap: 10px; }
  .lang-switch { display: inline-flex; align-items: center; padding: 3px; border: 1px solid var(--line-strong); border-radius: 10px; background: rgba(255,255,255,.35); cursor: pointer; font: 500 11px var(--mono); }
  .lang-switch span { padding: 5px 7px; border-radius: 7px; color: var(--muted); transition: background-color .2s ease, color .2s ease; }
  .lang-switch span.is-active { background: var(--ink); color: var(--acid); }
  .nav-download { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 14px 0 11px; border-radius: 11px; background: var(--ink); color: var(--on-ink); font-size: 14px; font-weight: 700; box-shadow: 0 3px 0 #000; transform: translateY(-2px); transition: transform .12s ease, box-shadow .12s ease; }
  .nav-download .icon { width: 18px; height: 18px; color: var(--acid); }
  .nav-download:hover { transform: translateY(-1px); box-shadow: 0 2px 0 #000; }
  .nav-download:active { transform: translateY(1px); box-shadow: 0 0 0 #000; }
  .nav-progress { position: absolute; left: 0; bottom: -1px; width: 100%; height: 2px; background: var(--ink); transform: scaleX(0); transform-origin: 0 50%; pointer-events: none; }
  @supports (animation-timeline: scroll()) {
    .nav-progress { animation: grow-x linear both; animation-timeline: scroll(root); }
  }

  /* Hero */
  .hero { width: var(--wrap); margin: 0 auto; padding: clamp(28px, 5vh, 60px) 0 clamp(48px, 6vw, 72px); }
  .hero-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: clamp(18px, 3vw, 34px); animation: rise .7s .05s var(--ease) both; }
  .eyebrow { display: inline-flex; align-items: center; gap: 12px; margin: 0; font: 500 12px var(--mono); letter-spacing: .14em; text-transform: uppercase; }
  .eyebrow i { width: 9px; height: 9px; border-radius: 50%; background: var(--acid); box-shadow: 0 0 0 1.5px var(--ink), 0 0 0 5px rgba(217,255,67,.35); }
  .release-tag { display: inline-flex; align-items: center; gap: 8px; padding: 7px 11px; border: 1px solid var(--line-strong); border-radius: 99px; color: var(--muted); font: 500 12px var(--mono); transition: border-color .2s ease, color .2s ease; }
  .release-tag:hover { border-color: var(--ink); color: var(--ink); }
  .release-tag b { color: var(--ink); font-weight: 500; }

  .hl { position: relative; margin: 0; font-size: clamp(52px, 10.4vw, 150px); font-weight: 600; line-height: .88; letter-spacing: -.062em; }
  .hl-visual { display: block; transition: opacity .7s var(--ease), transform .7s var(--ease); }
  .hl[data-state="wait"] .hl-visual { opacity: 0; transform: translateY(18px); }
  .hl-line { display: block; }
  .hl-line-2 { margin-top: .07em; padding-right: .04em; color: #5d5c55; font-family: var(--serif); font-size: .86em; font-style: italic; font-weight: 300; letter-spacing: -.035em; text-align: right; }
  .hl-word { position: relative; isolation: isolate; display: inline-block; }
  .hl-swap { display: inline-block; }
  .hl-swap-a { --dy: -.2em; }
  .hl-swap-b { --dy: .08em; }
  .hl[data-state="typo"] .hl-swap { transform: translateX(var(--dx, 0px)); }
  .hl[data-state="fixing"] .hl-swap { animation: hop .72s var(--wd, 0ms) var(--ease) both; }
  .hl-word::after { content: ""; position: absolute; left: -.02em; right: .02em; bottom: -.07em; height: .15em; background: var(--squiggle) repeat-x left center / .3em .15em; opacity: 0; clip-path: inset(0 100% 0 0); pointer-events: none; }
  .hl[data-state="typo"] .hl-word::after { opacity: 1; animation: squiggle .55s calc(var(--wd, 0ms) + .3s) var(--ease) both; }
  .hl[data-state="fixing"] .hl-word::after { opacity: 0; clip-path: inset(0); transition: opacity .3s ease; }
  .hl-word::before { content: ""; position: absolute; z-index: -1; left: -.03em; right: -.01em; bottom: .05em; height: .28em; background: var(--acid); opacity: 0; transform: scaleX(0); transform-origin: 0 50%; }
  .hl[data-state="fixed"] .hl-word::before { animation: marker 2s var(--wd, 0ms) var(--ease) both; }

  .hero-body { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(32px, 5vw, 76px); align-items: start; margin-top: clamp(28px, 4vw, 52px); }
  .hero-copy { position: sticky; top: calc(var(--nav-h) + 28px); padding-top: 6px; animation: rise .8s .35s var(--ease) both; }
  .hero-lead { max-width: 30em; margin: 0 0 32px; color: var(--muted); font-size: clamp(17px, 1.35vw, 19.5px); line-height: 1.6; text-wrap: pretty; }
  .dl-main { display: inline-flex; align-items: center; gap: 16px; max-width: 100%; padding: 12px 24px 12px 12px; border-radius: 18px; background: linear-gradient(180deg, #2c2c27, var(--ink) 55%); color: var(--on-ink); box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 6px 0 #000, 0 22px 34px -16px rgba(23,23,19,.6); transform: translateY(-4px); transition: transform .12s ease, box-shadow .12s ease; }
  .dl-main:hover { transform: translateY(-2px); box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 4px 0 #000, 0 16px 26px -14px rgba(23,23,19,.6); }
  .dl-main:active { transform: translateY(2px); box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 0 0 #000, 0 6px 12px -8px rgba(23,23,19,.6); }
  .dl-icon { flex: 0 0 auto; width: 50px; height: 50px; display: grid; place-items: center; border-radius: 12px; background: var(--acid); color: var(--ink); }
  .dl-icon .icon { width: 23px; height: 23px; }
  .dl-text { min-width: 0; }
  .dl-text strong { display: block; font-size: 17px; font-weight: 700; letter-spacing: -.01em; }
  .dl-text small { display: block; margin-top: 4px; overflow: hidden; color: var(--on-ink-muted); font: 500 12px var(--mono); text-overflow: ellipsis; white-space: nowrap; }
  .dl-secondary { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 22px; margin-top: 22px; }
  .text-link { display: inline-flex; align-items: center; gap: 6px; padding-bottom: 3px; border-bottom: 1px solid var(--line-strong); font: 500 12px var(--mono); letter-spacing: .08em; text-transform: uppercase; transition: border-color .2s ease; }
  .text-link:hover { border-color: var(--ink); }
  .formats { display: flex; flex-wrap: wrap; align-items: stretch; gap: 8px; margin-top: 18px; }
  .formats-label { width: 100%; color: var(--muted); font: 500 11px var(--mono); letter-spacing: .1em; text-transform: uppercase; }
  .format { position: relative; min-width: 108px; padding: 10px 12px; border: 1px solid var(--line-strong); border-radius: 12px; background: rgba(255,255,255,.4); transition: border-color .2s ease, background-color .2s ease, transform .2s ease; }
  .format:hover { border-color: var(--ink); background: var(--card); transform: translateY(-2px); }
  .format strong { display: block; font: 500 13px var(--mono); }
  .format small { display: block; margin-top: 3px; color: var(--muted); font-size: 12px; }
  .format.is-recommended::after { content: ""; position: absolute; top: 10px; right: 10px; width: 7px; height: 7px; border-radius: 50%; background: var(--acid); box-shadow: 0 0 0 1.5px var(--ink); }
  .hero-meta { display: flex; flex-wrap: wrap; gap: 6px 0; margin: 30px 0 0; padding: 0; list-style: none; color: var(--muted); font: 500 11.5px var(--mono); letter-spacing: .08em; text-transform: uppercase; }
  .hero-meta li:not(:last-child)::after { content: "/"; margin: 0 12px; color: var(--muted-2); }
  .hero-scene { min-width: 0; animation: rise .9s .5s var(--ease) both; }

  /* Hero scene */
  .scene { position: relative; }
  .scene-art { position: relative; height: 556px; }
  .scene-deco { position: absolute; inset: -60px -60px 0 -40px; overflow: hidden; pointer-events: none; }
  .scene-disc { position: absolute; top: 24px; right: 34px; width: min(440px, 70%); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #f0ffae 0%, var(--acid) 44%, #c8f02e 100%); }
  .scene-orbit { position: absolute; border: 1px solid rgba(23,23,19,.16); border-radius: 50%; pointer-events: none; }
  .orbit-a { top: 120px; right: 10px; width: 560px; height: 560px; animation: orbit-a 90s linear infinite; }
  .orbit-b { top: 70px; right: -40px; width: 650px; height: 650px; animation: orbit-b 120s linear infinite; }
  .chat { position: absolute; top: 6px; right: 0; z-index: 1; width: 62%; height: 420px; display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(23,23,19,.1); border-radius: 18px; background: var(--card); box-shadow: inset 0 1px 0 #fff, 0 40px 70px -34px rgba(23,23,19,.45), 0 10px 22px -14px rgba(23,23,19,.25); transform: rotate(1.8deg); }
  .win-bar { flex: 0 0 auto; height: 34px; display: flex; align-items: center; gap: 12px; padding: 0 14px; border-bottom: 1px solid var(--line); color: var(--muted); font: 500 11px var(--mono); }
  .win-dots { display: inline-flex; gap: 6px; }
  .win-dots i { width: 9px; height: 9px; border-radius: 50%; background: var(--paper-3); }
  .chat-head { flex: 0 0 auto; display: flex; align-items: center; gap: 10px; padding: 11px 16px; border-bottom: 1px solid var(--line); }
  .chat-hash { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 9px; background: var(--ink); color: var(--acid); font: 500 15px var(--mono); }
  .chat-head strong { display: block; font-size: 14px; font-weight: 700; line-height: 1.2; }
  .chat-head small { display: block; color: var(--muted); font-size: 12px; }
  .chat-log { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; justify-content: flex-end; gap: 10px; padding: 14px 16px 12px; overflow: hidden; -webkit-mask-image: linear-gradient(to bottom, transparent, #000 64px); mask-image: linear-gradient(to bottom, transparent, #000 64px); }
  .bubble { flex: 0 0 auto; display: flex; align-items: flex-end; gap: 8px; max-width: 88%; animation: bubble-in .5s var(--spring) both; }
  .bubble-in { align-self: flex-start; }
  .bubble-out { align-self: flex-end; }
  .bubble-out.is-pending { animation-delay: 1.6s; }
  .bubble-avatar { flex: 0 0 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; background: var(--paper-3); font-size: 11px; font-weight: 700; }
  .bubble-body { padding: 8px 12px 6px; border-radius: 14px 14px 14px 4px; background: var(--paper-2); font-size: 13.5px; line-height: 1.42; }
  .bubble-out .bubble-body { border-radius: 14px 14px 4px 14px; background: var(--ink); color: var(--on-ink); }
  .bubble-body b { display: block; margin-bottom: 2px; font-size: 11.5px; font-weight: 700; }
  .bubble-body p { margin: 0; }
  .bubble-body time { display: block; margin-top: 3px; color: var(--muted); font: 500 10px var(--mono); text-align: right; }
  .bubble-out time { color: var(--on-ink-muted); }
  .chat-compose { position: relative; flex: 0 0 auto; height: 42px; display: flex; align-items: center; gap: 2px; margin: 0 12px 12px; padding: 0 14px; overflow: hidden; border: 1px solid var(--line-strong); border-radius: 12px; color: var(--muted-2); font-size: 13px; }
  .compose-caret { width: 1.5px; height: 16px; background: var(--ink); animation: caret 1s steps(1) infinite; }
  .compose-paste { position: absolute; inset: 0; padding: 0 14px; overflow: hidden; background: #f3ffd0; color: var(--ink); line-height: 40px; text-overflow: ellipsis; white-space: nowrap; opacity: 0; }
  .scene-art[data-phase="sent"] .compose-paste { animation: compose-paste 1.5s 1s both; }

  .scene-helper { position: absolute; top: 232px; left: 0; z-index: 3; width: 78%; padding: 0 16px 12px; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: var(--ink-2); color: var(--on-ink); box-shadow: 0 50px 90px -34px rgba(23,23,19,.75), 0 16px 30px -18px rgba(23,23,19,.55); transform: rotate(-2.2deg); transform-origin: 30% 60%; transition: opacity .45s var(--ease), transform .55s var(--ease); }
  .scene-helper[data-visible="false"] { opacity: 0; transform: rotate(-2.2deg) translateY(16px) scale(.965); }
  .scene-art[data-phase="sent"] .scene-helper { animation: helper-out .5s 1.1s var(--ease) forwards; }
  .scene-helper::before, .pg-helper::before { content: ""; position: absolute; top: 14px; bottom: 14px; left: -1px; width: 2px; border-radius: 2px; background: var(--acid); opacity: 0; transition: opacity .3s ease; }
  .scene-helper[data-review="true"]::before, .pg-helper[data-phase="review"]::before { opacity: 1; }
  .sh-grip { width: 42px; height: 4px; margin: 8px auto 10px; border-radius: 4px; background: #34342f; }
  .sh-close { position: absolute; top: 9px; right: 13px; color: #77766f; font-size: 17px; line-height: 1; }
  .sh-notice, .pg-notice { position: absolute; top: 12px; left: 50%; z-index: 2; display: flex; align-items: center; gap: 8px; margin: 0; padding: 7px 12px; border: 1px solid #45453f; border-radius: 9px; background: #2a2a26; color: #e2e1d9; font: 500 12px var(--mono); white-space: nowrap; transform: translateX(-50%); animation: notice-in .3s var(--ease) both; }
  .sh-notice i, .pg-notice i { color: var(--acid); font-style: normal; }
  .sh-editor { position: relative; min-height: 98px; margin: 0; padding: 0 0 12px; overflow: hidden; color: #e7e6df; font-size: 16px; line-height: 1.55; letter-spacing: -.005em; }
  .sh-editor.is-review { color: #fbfaf3; animation: resolve .45s var(--ease) both; }
  .sh-placeholder { color: #66655e; }
  .is-working { color: #807f78; }
  .is-working::after { content: ""; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 30%, rgba(217,255,67,.24) 50%, transparent 70%); background-size: 240% 100%; animation: scan 1.1s linear infinite; pointer-events: none; }
  .caret { display: inline-block; width: 2px; height: 1.15em; margin-left: 1px; vertical-align: -.2em; background: var(--acid); animation: caret 1s steps(1) infinite; }
  .sh-status, .pg-status { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 28px; color: #8f8e86; font-size: 12px; }
  .sh-controls { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .sh-action { display: inline-flex; align-items: center; gap: 6px; padding: 3px 4px; color: #d8d7cf; white-space: nowrap; animation: flip-in .35s var(--ease) both; }
  .sh-action .icon { width: 11px; height: 11px; color: #77766f; }
  .sh-chip { padding: 2px 10px; border: 1px solid #3c3c37; border-radius: 99px; color: #8f8e86; font-size: 11.5px; white-space: nowrap; animation: chip-pop .4s var(--spring) both; }
  .sh-chip.is-on { border-color: var(--acid); background: rgba(217,255,67,.1); color: var(--acid); }
  .sh-hints, .pg-hints { display: flex; align-items: center; gap: 12px; white-space: nowrap; }
  .sh-hints kbd, .pg-hints kbd { display: inline-block; padding: 1px 6px; border: 1px solid #3f3f39; border-bottom-width: 2px; border-radius: 5px; background: var(--ink-3); color: #cbcac2; font: 500 11px var(--mono); }
  .sh-hints kbd.is-pulse { animation: kbd-pulse .9s ease-in-out infinite; }
  .sh-hints kbd.is-pulse-late { animation: kbd-pulse .9s 1.25s ease-in-out infinite; }
  .sh-muted { color: #6f6e67; }
  .sh-working { display: inline-flex; align-items: center; gap: 7px; color: #d8d7cf; }
  .sh-working i { width: 7px; height: 7px; border-radius: 50%; background: var(--acid); box-shadow: 0 0 0 3px rgba(217,255,67,.14); animation: pulse .8s ease-in-out infinite; }
  .sh-gear { width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid #3c3c37; border-radius: 6px; color: #77766f; }
  .sh-gear .icon { width: 13px; height: 13px; }

  .hud { position: absolute; top: 170px; left: 2%; z-index: 4; display: inline-flex; align-items: center; gap: 10px; padding: 9px 14px 11px 10px; border-radius: 15px; background: rgba(23,23,19,.9); color: var(--on-ink); box-shadow: 0 22px 40px -18px rgba(23,23,19,.65); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); animation: hud-in .45s var(--spring) both; }
  .hud.is-late { animation-delay: 1.25s; }
  .hud.is-later { animation-delay: .8s; }
  .hud-keys { display: inline-flex; gap: 5px; }
  .hud .keycap { animation: key-tap .55s .2s both; }
  .hud.is-late .keycap { animation-delay: 1.45s; }
  .hud.is-later .keycap { animation-delay: 1s; }
  .hud-label { color: #cfcec6; font: 500 12px var(--mono); white-space: nowrap; }

  .rail { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 22px; }
  .rail-item { display: block; padding: 10px 12px 12px; border: 1px solid var(--line); border-radius: 12px; background: rgba(251,250,246,.72); color: var(--muted); text-align: left; cursor: pointer; transition: border-color .2s ease, background-color .2s ease, color .2s ease; }
  .rail-item:hover { border-color: var(--line-strong); color: var(--ink); }
  .rail-item[aria-pressed="true"] { border-color: var(--ink); background: var(--card); color: var(--ink); }
  .rail-num { display: block; font: 500 11px var(--mono); }
  .rail-label { display: block; margin-top: 3px; font-size: 14px; font-weight: 700; }
  .rail-bar { display: block; height: 3px; margin-top: 10px; overflow: hidden; border-radius: 3px; background: var(--line); }
  .rail-bar i { display: block; height: 100%; background: var(--ink); transition-property: width; transition-timing-function: linear; }

  /* Keycaps */
  .combo, .combo-keys { display: inline-flex; align-items: center; gap: 6px; }
  .keycap { --kc-h: 40px; --kc-depth: 4px; --kc-side: #c3bdae; position: relative; display: inline-grid; place-items: center; min-width: var(--kc-h); height: var(--kc-h); padding: 0 11px; border-radius: 9px; background: linear-gradient(180deg, #fffefa, #f1eee5); color: var(--ink); font: 600 14px/1 var(--sans); white-space: nowrap; box-shadow: inset 0 0 0 1px rgba(23,23,19,.1), inset 0 -2px 0 rgba(23,23,19,.06), 0 var(--kc-depth) 0 var(--kc-side), 0 calc(var(--kc-depth) + 6px) 12px -6px rgba(23,23,19,.4); transition: transform .08s ease, box-shadow .08s ease; }
  .keycap-sm { --kc-h: 26px; --kc-depth: 3px; padding: 0 7px; border-radius: 7px; font-size: 11.5px; }
  .keycap-lg { --kc-h: 62px; --kc-depth: 6px; padding: 0 17px; border-radius: 13px; font-size: 19px; }
  .keycap-wide { min-width: 92px; }
  .keycap-sm.keycap-wide { min-width: 58px; }
  .keycap-lg.keycap-wide { min-width: 150px; }
  .keycap-dark { --kc-side: #070706; background: linear-gradient(180deg, #35352f, #262622); color: var(--on-ink); box-shadow: inset 0 0 0 1px rgba(255,255,255,.07), inset 0 1px 0 rgba(255,255,255,.09), 0 var(--kc-depth) 0 var(--kc-side), 0 calc(var(--kc-depth) + 8px) 18px -6px rgba(0,0,0,.7); }
  .keycap.is-down { transform: translateY(calc(var(--kc-depth) - 1px)); box-shadow: inset 0 0 0 1px rgba(23,23,19,.1), 0 1px 0 var(--kc-side), 0 3px 6px -3px rgba(23,23,19,.4); }
  .keycap-dark.is-down, .keycap-dark.is-lit { --kc-side: #7f9a12; background: linear-gradient(180deg, #ebff8f, var(--acid)); color: var(--ink); }
  .keycap-dark.is-lit:not(.is-down) { box-shadow: inset 0 0 0 1px rgba(23,23,19,.15), 0 var(--kc-depth) 0 var(--kc-side), 0 0 34px -4px rgba(217,255,67,.55); }
  .keycap-dark.is-down { box-shadow: inset 0 0 0 1px rgba(23,23,19,.15), 0 1px 0 var(--kc-side), 0 0 26px -6px rgba(217,255,67,.6); }

  /* Typo ticker */
  .ticker { position: relative; z-index: 5; margin: clamp(8px, 2vw, 20px) -3vw -42px; overflow: hidden; border-block: 2px solid var(--ink); background: var(--acid); transform: rotate(-1.6deg); }
  .ticker-track { display: flex; width: max-content; animation: marquee 64s linear infinite; }
  .ticker:hover .ticker-track { animation-play-state: paused; }
  .ticker-item { display: inline-flex; align-items: center; gap: 14px; padding: 15px 0 16px; font-size: clamp(17px, 1.6vw, 22px); white-space: nowrap; }
  .ticker-item s { padding-bottom: 4px; background: var(--squiggle) repeat-x left bottom / 12px 6px; color: rgba(23,23,19,.6); font-family: var(--serif); font-size: 1.08em; font-style: italic; text-decoration: none; }
  .ticker-item b { font-weight: 700; letter-spacing: -.02em; }
  .ticker-item .icon { width: 18px; height: 18px; }
  .ticker-sep { width: 8px; height: 8px; margin: 0 34px; border-radius: 2px; background: var(--ink); transform: rotate(45deg); }

  /* How it works */
  .how { position: relative; padding: clamp(124px, 14vw, 184px) 0 clamp(80px, 9vw, 120px); }
  .try { width: var(--wrap); margin: clamp(40px, 5vw, 60px) auto 18px; display: flex; align-items: center; justify-content: flex-end; gap: 10px; color: var(--on-ink-muted); font: 500 12px var(--mono); }
  .try i { width: 8px; height: 8px; border-radius: 50%; background: var(--acid); animation: pulse 1.8s ease-in-out infinite; }
  .steps { width: var(--wrap); margin: 0 auto; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; list-style: none; }
  .step { position: relative; display: flex; flex-direction: column; padding: 30px 28px 32px; border: 1px solid var(--line-ink); border-radius: 24px; background: linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.01)); transition: border-color .35s ease, box-shadow .35s ease, transform .35s var(--ease), background-color .35s ease; }
  .step.is-lit { border-color: rgba(217,255,67,.55); background: linear-gradient(180deg, rgba(217,255,67,.08), rgba(217,255,67,.02)); box-shadow: 0 40px 80px -40px rgba(217,255,67,.35); transform: translateY(-6px); }
  .step.is-done { border-color: rgba(217,255,67,.25); }
  .step-keys { display: flex; align-items: flex-end; gap: 10px; min-height: 74px; }
  .step-again { padding-bottom: 8px; color: var(--on-ink-muted); font: italic 300 22px var(--serif); }
  .step-num { position: absolute; top: 26px; right: 26px; color: var(--on-ink-faint); font: 500 12px var(--mono); }
  .step.is-done .step-num { color: var(--acid); }
  .step h3 { margin: 34px 0 12px; font-size: clamp(26px, 2.4vw, 32px); font-weight: 600; letter-spacing: -.035em; }
  .step p { margin: 0; color: var(--on-ink-muted); font-size: 15.5px; line-height: 1.66; }
  .shortcuts { width: var(--wrap); margin: clamp(72px, 9vw, 112px) auto 0; padding-top: clamp(40px, 5vw, 56px); display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: 32px 40px; border-top: 1px solid var(--line-ink); }
  .shortcuts h3 { margin: 0 0 14px; font-size: clamp(28px, 3vw, 42px); font-weight: 600; line-height: 1.02; letter-spacing: -.045em; }
  .shortcut-list { margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 40px; list-style: none; }
  .shortcut-list li { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 13px 0; border-bottom: 1px solid var(--line-ink); color: #dddcd4; font-size: 15px; }

  /* Output language playground */
  .pg { position: relative; padding: clamp(80px, 9vw, 120px) 0; overflow: clip; }
  .pg-watermark { position: absolute; top: clamp(30px, 5vw, 80px); right: -1vw; z-index: 0; color: rgba(23,23,19,.045); font: italic 300 clamp(150px, 24vw, 380px)/.8 var(--serif); letter-spacing: -.05em; white-space: nowrap; pointer-events: none; user-select: none; }
  .pg-grid { position: relative; z-index: 1; width: var(--wrap); margin: 0 auto; display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); grid-template-areas: "intro stage" "controls stage"; column-gap: clamp(36px, 6vw, 88px); align-items: start; }
  .pg-intro { grid-area: intro; }
  .pg-controls { grid-area: controls; }
  .new-badge { padding: 4px 8px; border-radius: 99px; background: var(--ink); color: var(--acid); letter-spacing: .12em; }
  .pg-groups { display: grid; gap: 22px; margin-top: 40px; }
  .pg-label { display: block; margin-bottom: 10px; color: var(--muted); font: 500 11.5px var(--mono); letter-spacing: .12em; text-transform: uppercase; }
  .pg-options { display: flex; flex-wrap: wrap; gap: 8px; }
  .pg-option { display: inline-flex; align-items: center; gap: 9px; padding: 8px 14px 8px 8px; border: 1px solid var(--line-strong); border-radius: 13px; background: rgba(255,255,255,.45); color: var(--ink); font-size: 14.5px; font-weight: 700; cursor: pointer; transition: transform .15s ease, box-shadow .15s ease, background-color .2s ease, border-color .2s ease, color .2s ease; }
  .pg-option:hover { border-color: var(--ink); transform: translateY(-1px); }
  .pg-option[aria-pressed="true"] { border-color: var(--ink); background: var(--ink); color: var(--on-ink); box-shadow: 0 4px 0 #000; transform: translateY(-3px); }
  .pg-option kbd, .pg-chip { display: inline-grid; place-items: center; min-width: 24px; height: 24px; padding: 0 6px; border-radius: 7px; background: var(--paper-2); color: var(--muted); font: 500 11.5px var(--mono); }
  .pg-option[aria-pressed="true"] kbd, .pg-option[aria-pressed="true"] .pg-chip { background: var(--acid); color: var(--ink); }
  .pg-equation { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; margin: 30px 0 0; padding: 18px 20px 20px; border: 1px solid var(--line); border-radius: 18px; background: var(--card); box-shadow: 0 20px 40px -30px rgba(23,23,19,.3); }
  .eq-term { padding: 5px 10px; border-radius: 8px; background: var(--ink); color: var(--on-ink); font-size: 14px; font-weight: 700; }
  .eq-term.is-lang { background: var(--acid); color: var(--ink); font: 500 13px var(--mono); box-shadow: inset 0 0 0 1.5px var(--ink); }
  .eq-op { color: var(--muted); font: 500 16px var(--mono); }
  .eq-result { flex-basis: 100%; margin-top: 4px; font: italic 400 clamp(20px, 1.8vw, 24px)/1.3 var(--serif); letter-spacing: -.01em; animation: flip-in .4s var(--ease) both; }
  .pg-stage { grid-area: stage; position: sticky; top: calc(var(--nav-h) + 28px); align-self: start; min-width: 0; padding-top: 10px; }
  .pg-helper { position: relative; padding: 0 22px 16px; border: 1px solid rgba(255,255,255,.08); border-radius: 22px; background: var(--ink-2); color: var(--on-ink); box-shadow: 0 60px 110px -50px rgba(23,23,19,.75), 0 22px 40px -24px rgba(23,23,19,.5); outline: none; transition: box-shadow .25s ease; }
  .pg-helper:focus-visible { box-shadow: 0 0 0 3px var(--paper), 0 0 0 5px var(--ink), 0 60px 110px -50px rgba(23,23,19,.75); }
  .pg-editor { position: relative; min-height: 196px; padding: 2px 0 18px; color: #e7e6df; font-size: clamp(17px, 1.5vw, 20px); line-height: 1.6; }
  .typo { text-decoration: underline wavy var(--typo); text-decoration-thickness: 1.5px; text-decoration-skip-ink: none; text-underline-offset: 5px; }
  .word { animation: word-in .5s var(--ease) both; animation-delay: calc(var(--i) * 22ms); }
  .pg-status { font-size: 12.5px; }
  .hint-btn { display: inline-flex; align-items: center; gap: 6px; padding: 5px 7px; border: 0; border-radius: 8px; background: none; color: #a9a8a0; cursor: pointer; transition: background-color .15s ease, color .15s ease; }
  .hint-btn:hover { background: #2a2a26; color: var(--on-ink); }
  .hint-btn.is-primary { color: var(--on-ink); }
  .pg-hints .hint-btn.is-primary kbd { border-color: var(--acid); color: var(--acid); }
  .pg-keys { display: flex; flex-wrap: wrap; gap: 8px 18px; margin: 18px 0 0; padding: 0; color: var(--muted); font: 500 12px var(--mono); list-style: none; }
  .pg-keys li { display: inline-flex; align-items: center; gap: 8px; }
  .pg-keys kbd { display: inline-grid; place-items: center; min-width: 24px; height: 22px; padding: 0 6px; border: 1px solid var(--line-strong); border-bottom-width: 2px; border-radius: 6px; background: var(--card); color: var(--ink); font: 500 11px var(--mono); }
  .pg-note { max-width: 40em; margin: 14px 0 0; color: var(--muted); font-size: 13.5px; line-height: 1.55; }

  /* Provider setup */
  .setup { padding: clamp(80px, 9vw, 120px) 0; }
  .setup-grid { width: var(--wrap); margin: 0 auto; display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(36px, 6vw, 96px); align-items: center; }
  .setup-steps { margin: 34px 0 30px; padding: 0; list-style: none; }
  .setup-steps li { display: grid; grid-template-columns: 30px minmax(0, 1fr); gap: 14px; align-items: start; padding: 15px 0; border-top: 1px solid var(--line-ink); }
  .setup-steps li:last-child { border-bottom: 1px solid var(--line-ink); }
  .setup-steps li > span { width: 30px; height: 30px; display: grid; place-items: center; border: 1px solid rgba(217,255,67,.5); border-radius: 50%; color: var(--acid); font: 500 12px var(--mono); }
  .setup-steps p { margin: 4px 0 0; color: var(--on-ink-muted); font-size: 16px; }
  .setup-steps strong { color: var(--on-ink); font-weight: 700; }
  .providers { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
  .providers li { padding: 8px 12px; border: 1px solid var(--line-ink); border-radius: 99px; color: #d2d1c9; font: 500 12px var(--mono); }
  .secure { display: flex; align-items: flex-start; gap: 12px; margin: 26px 0 0; padding: 16px 18px; border: 1px solid rgba(217,255,67,.2); border-radius: 14px; background: rgba(217,255,67,.06); color: #d2d1c9; font-size: 14.5px; line-height: 1.6; }
  .secure .icon { width: 18px; height: 18px; margin-top: 2px; color: var(--acid); }
  .fake { position: relative; overflow: hidden; border-radius: 18px; background: var(--card); color: var(--ink); box-shadow: 0 0 0 1px rgba(255,255,255,.06), 0 70px 120px -50px rgba(0,0,0,.9), 0 30px 60px -30px rgba(0,0,0,.6); transform: perspective(1800px) rotateY(-7deg) rotateX(2deg); transform-origin: 40% 50%; }
  .fake .win-bar { background: var(--paper-2); }
  .fake-body { display: grid; grid-template-columns: 168px minmax(0, 1fr); min-height: 392px; }
  .fake-side { display: grid; align-content: start; gap: 2px; padding: 14px 10px; border-right: 1px solid var(--line); background: #f0ece2; }
  .fake-side span { padding: 8px 10px; border-radius: 8px; color: var(--muted); font-size: 13.5px; font-weight: 600; }
  .fake-side span.is-active { background: var(--card); color: var(--ink); box-shadow: 0 1px 2px rgba(23,23,19,.08), 0 0 0 1px var(--line); }
  .fake-main { display: grid; align-content: start; gap: 15px; padding: 22px 26px 26px; }
  .fake-main h3 { margin: 0 0 2px; font-size: 18px; font-weight: 700; letter-spacing: -.02em; }
  .fake-label { display: block; margin-bottom: 6px; color: var(--muted); font-size: 12.5px; font-weight: 600; }
  .fake-input { height: 40px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 12px; overflow: hidden; border: 1px solid var(--line-strong); border-radius: 10px; background: #fff; font-size: 14px; white-space: nowrap; }
  .fake-input .icon { width: 12px; height: 12px; color: var(--muted); }
  .fake-input.mono { font: 500 13px var(--mono); }
  .fake-key { display: inline-block; }
  .fake-keyring { display: inline-flex; align-items: center; gap: 6px; margin-top: 7px; color: var(--muted); font-size: 12px; font-weight: 600; }
  .fake-keyring .icon { width: 12px; height: 12px; }
  .fake-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: 4px; }
  .fake-button { display: inline-block; padding: 10px 15px; border-radius: 10px; background: var(--ink); color: var(--on-ink); font-size: 13.5px; font-weight: 700; box-shadow: 0 3px 0 #000; }
  .fake-status { display: inline-flex; align-items: center; gap: 8px; color: #3b5200; font-size: 13.5px; font-weight: 700; }
  .fake-status i { width: 20px; height: 20px; display: grid; place-items: center; border-radius: 50%; background: var(--acid); color: var(--ink); font-size: 11px; font-style: normal; box-shadow: 0 0 0 1.5px var(--ink); }

  /* Settings index */
  .settings { padding: clamp(72px, 8vw, 104px) 0; }
  .index { width: var(--wrap); margin: 0 auto; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: clamp(20px, 3vw, 40px); border-top: 1px solid var(--line-strong); list-style: none; }
  .index li { position: relative; isolation: isolate; display: grid; grid-template-columns: 40px minmax(0, 1fr); align-content: start; padding: 22px 12px 24px 0; border-bottom: 1px solid var(--line-strong); }
  .index li::before { content: ""; position: absolute; inset: 6px -12px; z-index: -1; border-radius: 16px; background: var(--acid); transform: scaleX(0); transform-origin: 0 50%; transition: transform .5s var(--ease); }
  .index li:hover::before { transform: scaleX(1); }
  .index-num { grid-row: span 2; padding-top: 4px; color: var(--muted); font: 500 12px var(--mono); }
  .index h3 { margin: 0 0 6px; font-size: 18px; font-weight: 700; letter-spacing: -.02em; }
  .index p { margin: 0; color: var(--muted); font-size: 14.5px; line-height: 1.5; }
  .index li:hover .index-num, .index li:hover p { color: var(--ink); }

  /* Principles */
  .principles { padding: clamp(72px, 8vw, 104px) 0; }
  .stats { width: var(--wrap); margin: clamp(36px, 4vw, 56px) auto 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--line-ink); list-style: none; }
  .stat { padding: 24px 24px 4px 0; }
  .stat + .stat { padding-left: 24px; border-left: 1px solid var(--line-ink); }
  .stat-value { display: block; padding-bottom: .06em; overflow: hidden; color: var(--acid); font: italic 300 clamp(52px, 5.6vw, 84px)/.95 var(--serif); letter-spacing: -.04em; }
  .stat-value span { display: inline-block; }
  .stat-label { display: block; margin-top: 10px; color: var(--on-ink-muted); font: 500 12px var(--mono); letter-spacing: .12em; text-transform: uppercase; }

  /* Call to action */
  .cta-wrap { padding: clamp(64px, 7vw, 96px) 0 clamp(32px, 4vw, 48px); }
  .cta { position: relative; isolation: isolate; width: var(--wrap); margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 28px 40px; align-items: center; padding: clamp(28px, 4vw, 52px); overflow: hidden; border-radius: 28px; background: var(--acid); }
  .cta::before { content: ""; position: absolute; inset: 0; z-index: -1; background-image: radial-gradient(rgba(23,23,19,.16) 1px, transparent 1.4px); background-size: 16px 16px; -webkit-mask-image: radial-gradient(circle at 100% 0%, #000, transparent 62%); mask-image: radial-gradient(circle at 100% 0%, #000, transparent 62%); }
  .cta .h2 { font-size: clamp(34px, 4.2vw, 60px); }
  .cta-then { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 18px 0 0; font: 500 12px var(--mono); letter-spacing: .1em; text-transform: uppercase; }
  .cta-then .keycap { letter-spacing: 0; text-transform: none; }
  .cta-key { display: grid; justify-items: start; gap: 4px; min-width: 240px; padding: 18px 22px 20px; border-radius: 20px; background: linear-gradient(180deg, #2c2c27, var(--ink) 60%); color: var(--on-ink); box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 9px 0 #000, 0 34px 50px -24px rgba(23,23,19,.7); transform: translateY(-7px); transition: transform .12s ease, box-shadow .12s ease; }
  .cta-key:hover { transform: translateY(-4px); box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 6px 0 #000, 0 24px 40px -22px rgba(23,23,19,.7); }
  .cta-key:active { transform: translateY(2px); box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 0 0 #000, 0 8px 14px -8px rgba(23,23,19,.7); }
  .cta-key .icon { width: 26px; height: 26px; margin-bottom: 10px; color: var(--acid); }
  .cta-key strong { font-size: 18px; font-weight: 700; letter-spacing: -.02em; }
  .cta-key small { color: var(--on-ink-muted); font: 500 12px var(--mono); }
  .cta-platforms { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 28px; padding-top: 20px; border-top: 1.5px solid rgba(23,23,19,.22); }
  .cta-platforms .mini-label { margin: 0; color: var(--ink); }
  .cta-group { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .cta-group > span { margin-right: 4px; font: 500 12px var(--mono); letter-spacing: .1em; text-transform: uppercase; }
  .cta-group a { padding: 7px 11px; border: 1px solid rgba(23,23,19,.35); border-radius: 10px; font-size: 13.5px; font-weight: 700; transition: background-color .2s ease, color .2s ease, border-color .2s ease; }
  .cta-group a:hover { border-color: var(--ink); background: var(--ink); color: var(--acid); }

  /* Footer */
  .footer { width: var(--wrap); margin: 0 auto; padding: 32px 0 48px; display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) auto; gap: 28px 40px; align-items: start; }
  .footer-brand p { max-width: 24em; margin: 14px 0 0; color: var(--muted); font-size: 15px; line-height: 1.55; }
  .footer-links { display: grid; grid-template-columns: repeat(2, max-content); gap: 12px 32px; font: 500 12px var(--mono); letter-spacing: .08em; text-transform: uppercase; }
  .footer-links a { display: inline-flex; align-items: center; gap: 8px; }
  .footer-links a:hover { text-decoration: underline; text-underline-offset: 4px; }
  .footer-links .icon { width: 15px; height: 15px; }
  .footer-meta { display: grid; justify-items: end; gap: 10px; color: var(--muted); font: 500 11.5px var(--mono); }
  .release-badge { display: block; opacity: .8; transition: opacity .2s ease; }
  .release-badge:hover { opacity: 1; }
  .release-badge img { display: block; width: auto; height: 20px; }

  /* Scroll reveal and scene choreography (motion allowed only) */
  @media (prefers-reduced-motion: no-preference) {
    .js-reveal [data-reveal] { transition: opacity .8s var(--ease), transform .8s var(--ease); transition-delay: var(--d, 0s); }
    .js-reveal [data-reveal]:not([data-in]) { opacity: 0; transform: translateY(28px); }
    .stats[data-in] .stat-value span { animation: roll-in .9s calc(var(--i) * 110ms + .15s) var(--ease) both; }
    .fake[data-in] .fake-key { animation: type-reveal 1.3s .55s steps(22, end) both; }
    .fake[data-in] .fake-button { animation: press 2.4s both; }
    .fake[data-in] .fake-status { animation: fade-up .45s 2.3s var(--ease) both; }
  }

  @keyframes rise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
  @keyframes grow-x { to { transform: scaleX(1); } }
  @keyframes hop { 0% { transform: translate(var(--dx, 0px), 0); } 45% { transform: translate(calc(var(--dx, 0px) * .45), var(--dy)); } 100% { transform: translate(0, 0); } }
  @keyframes squiggle { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0); } }
  @keyframes marker { 0% { opacity: 1; transform: scaleX(0); } 35% { opacity: 1; transform: scaleX(1); } 70% { opacity: 1; transform: scaleX(1); } 100% { opacity: 0; transform: scaleX(1); } }
  @keyframes orbit-a { from { transform: rotate(-18deg) scaleY(.4); } to { transform: rotate(342deg) scaleY(.4); } }
  @keyframes orbit-b { from { transform: rotate(34deg) scaleY(.36); } to { transform: rotate(-326deg) scaleY(.36); } }
  @keyframes caret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
  @keyframes pulse { 50% { opacity: .35; transform: scale(.78); } }
  @keyframes kbd-pulse { 0%, 100% { border-color: var(--acid); color: var(--acid); transform: translateY(0); } 50% { border-color: var(--acid); color: var(--acid); transform: translateY(1.5px); } }
  @keyframes resolve { from { opacity: .3; filter: blur(3px); } to { opacity: 1; filter: none; } }
  @keyframes notice-in { from { opacity: 0; transform: translate(-50%, -6px); } to { opacity: 1; transform: translate(-50%, 0); } }
  @keyframes flip-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @keyframes chip-pop { from { transform: scale(.8); } to { transform: scale(1); } }
  @keyframes bubble-in { from { opacity: 0; transform: translateY(10px) scale(.96); } to { opacity: 1; transform: none; } }
  @keyframes compose-paste { 0% { opacity: 0; } 12%, 55% { opacity: 1; } 100% { opacity: 0; } }
  @keyframes helper-out { to { opacity: 0; transform: rotate(-2.2deg) translateY(16px) scale(.965); } }
  @keyframes scan { from { background-position: 120% 0; } to { background-position: -120% 0; } }
  @keyframes hud-in { from { opacity: 0; transform: translateY(8px) scale(.94); } to { opacity: 1; transform: none; } }
  @keyframes key-tap { 0%, 100% { transform: translateY(0); } 35%, 60% { transform: translateY(calc(var(--kc-depth) - 1px)); box-shadow: inset 0 0 0 1px rgba(23,23,19,.1), 0 1px 0 var(--kc-side); } }
  @keyframes marquee { to { transform: translateX(-50%); } }
  @keyframes word-in { from { opacity: 0; filter: blur(6px); } to { opacity: 1; filter: blur(0); } }
  @keyframes roll-in { from { transform: translateY(105%); } to { transform: none; } }
  @keyframes type-reveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0); } }
  @keyframes press { 0%, 86% { transform: none; box-shadow: 0 3px 0 #000; } 91% { transform: translateY(3px); box-shadow: 0 0 0 #000; } 100% { transform: none; box-shadow: 0 3px 0 #000; } }
  @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { animation-duration: .001ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; transition-delay: 0s !important; }
  }

  @media (hover: none) {
    .try, .pg-keys { display: none; }
  }

  @media (max-width: 1080px) {
    .hero-body, .pg-grid, .setup-grid, .section-head, .shortcuts { grid-template-columns: minmax(0, 1fr); }
    .section-head .kicker { margin-top: 0; }
    .nav-links { gap: 18px; }
    .nav-links a:last-child { display: none; }
    .hero-copy { position: static; }
    .hero-scene { max-width: 780px; }
    .pg-grid { grid-template-areas: "intro" "stage" "controls"; }
    .pg-stage { position: relative; top: auto; margin-top: 40px; }
    .fake { transform: none; }
  }

  @media (max-width: 860px) {
    .nav-links { display: none; }
    .nav-actions { margin-left: auto; }
    .steps, .shortcut-list { grid-template-columns: minmax(0, 1fr); }
    .index { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .footer { grid-template-columns: minmax(0, 1fr) auto; }
    .footer-links { grid-row: 2; }
  }

  @media (max-width: 640px) {
    :root { --wrap: calc(100% - 32px); --nav-h: 64px; }
    .release-tag { display: none; }
    .nav-download { padding: 0 12px 0 10px; }
    .hl { font-size: clamp(46px, 15vw, 72px); }
    .hl-line-2 { text-align: left; }
    .format { flex: 1 1 0; min-width: 0; }
    .sh-status, .pg-status { flex-wrap: wrap; row-gap: 6px; }
    .sh-hints, .pg-hints { margin-left: auto; }
    .dl-main { width: 100%; }
    .scene-art { height: auto; padding-top: 58px; }
    .scene-disc { top: 60px; right: -10px; width: 260px; }
    .scene-orbit { display: none; }
    .chat { position: relative; top: 0; width: 100%; height: 290px; transform: none; }
    .scene-helper { position: relative; top: auto; left: 0; width: calc(100% - 8px); margin: -92px 0 0 4px; transform: rotate(-1.2deg); }
    .scene-helper[data-visible="false"] { transform: rotate(-1.2deg) translateY(14px) scale(.97); }
    .hud { top: 0; left: 0; }
    .sh-editor { min-height: 88px; font-size: 15px; }
    .hide-sm { display: none !important; }
    .rail { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ticker-item { padding: 12px 0 13px; }
    .ticker-sep { margin: 0 24px; }
    .step { padding: 26px 22px 28px; }
    .keycap-lg { --kc-h: 54px; font-size: 17px; }
    .keycap-lg.keycap-wide { min-width: 120px; }
    .pg-editor { min-height: 170px; }
    .fake-body { grid-template-columns: minmax(0, 1fr); }
    .fake-side { display: none; }
    .index { grid-template-columns: minmax(0, 1fr); }
    .stat, .stat + .stat { padding: 18px 10px 4px 0; }
    .stat + .stat { padding-left: 12px; }
    .stat-label { font-size: 11px; letter-spacing: .06em; }
    .cta { grid-template-columns: minmax(0, 1fr); border-radius: 24px; }
    .cta-key { justify-self: stretch; min-width: 0; }
    .footer { grid-template-columns: minmax(0, 1fr); }
    .footer-links { grid-row: auto; }
    .footer-meta { justify-items: start; }
  }
`;
