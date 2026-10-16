// Sala com luz ajustável: a foto muda conforme temperatura de cor e intensidade
(() => {
  const stage = document.getElementById('stage'), lights = document.getElementById('lights');
  if (!stage) return;

  const TEMPS = [
    { k: '2700K', name: 'Quente', rgb: '255,160,80', sub: 'Amarela', t: 'Amarelada e acolhedora. Relaxa e aproxima as pessoas — ideal para salas, quartos e restaurantes.' },
    { k: '3000K', name: 'Branca quente', rgb: '255,196,135', sub: 'Meio amarela', t: 'Meio-termo entre o amarelo e o branco: aconchegante sem perder clareza. Ótima para áreas sociais, jantar e lojas de decoração.' },
    { k: '4000K', name: 'Neutra', rgb: '255,236,215', sub: 'Branca natural', t: 'Branco natural e equilibrado. Boa para cozinhas, closets, escritórios e vitrines.' },
    { k: '6500K', name: 'Fria', rgb: '170,205,255', sub: 'Branca azulada', t: 'Branca azulada: estimula e dá foco. Indicada para bancadas, áreas técnicas e garagens — evite em ambientes de descanso.' }
  ];

  // pontos de luz medidos sobre a foto (% da largura / altura)
  const SPOTS = [[19.3, 2.5], [50, 2.5], [80.7, 2.5], [26.9, 15], [73.4, 15], [31.5, 22.5], [68.7, 22.5]];  // spots embutidos no forro
  const SCONCES = [[50, 46.5, 5], [63, 45, 9], [72.5, 46, 9], [76.8, 43.5, 10], [82, 41, 10]];                 // arandelas nos painéis [x, y, altura]
  const lt = (x, y, w, h, o) => `<i class="lt" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;opacity:${o}"></i>`;
  const PATH = 'M354,60 C356,115 420,160 478,181 C560,188 840,188 922,181 C980,160 1030,115 1034,62';  // borda iluminada do forro (fita LED)
  lights.innerHTML =
    `<svg viewBox="0 0 1400 875" preserveAspectRatio="none"><defs><filter id="b1" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="10"/></filter><filter id="b2"><feGaussianBlur stdDeviation="1.6"/></filter></defs><path class="cv1" d="${PATH}"/><path class="cv2" d="${PATH}"/></svg>` +
    lt(50, 12, 48, 15, .35) +
    SPOTS.map(([x, y]) => lt(x, y, 4.2, 6.7, 1) + lt(x, y, 1.6, 2.5, 1)).join('') +
    SCONCES.map(([x, y, h]) => lt(x, y, 1.8, h, 1) + lt(x, y, 5, h * 1.6, .45)).join('');
  const tempsEl = document.getElementById('temps'), dim = document.getElementById('dim'), pw = document.getElementById('pw');
  let cur = 0, on = true;
  tempsEl.innerHTML = TEMPS.map((t, i) =>
    `<button class="temp" data-i="${i}" style="--sw:rgb(${t.rgb});margin-bottom:10px"><b>${t.name}</b> · ${t.k}<small>${t.sub}</small></button>`).join('');
  function light() {
    const t = TEMPS[cur];
    stage.style.setProperty('--lc', t.rgb);
    stage.style.setProperty('--li', on ? dim.value / 100 : 0.03);
    tempsEl.querySelectorAll('.temp').forEach((b, i) => b.classList.toggle('on', i === cur));
    document.getElementById('ik').textContent = `${t.name} · ${t.k}`;
    document.getElementById('id').textContent = t.t;
    pw.textContent = on ? 'Ligada' : 'Desligada'; pw.classList.toggle('on', on);
    if (engine.ready) engine.schedule();
    const sujeito = userUrl ? 'no meu ambiente' : 'na sala de exemplo';
    wa.href = 'https://wa.me/5517981200526?text=' + encodeURIComponent(
      `Olá Arthur! Testei a luz ${t.name} (${t.k}) ${sujeito} no seu site e gostaria de um orçamento de iluminação.`);
  }
  tempsEl.onclick = e => { const b = e.target.closest('.temp'); if (b) { cur = +b.dataset.i; on = true; light(); } };
  dim.oninput = () => { on = true; light(); };
  pw.onclick = () => { on = !on; light(); };


  // ---- foto do visitante: relight local (sem IA, sem enviar nada) ----
  // Em vez de um filtro por cima, mexe pixel a pixel: a cor da luz age mais nas áreas iluminadas,
  // o "dimmer" escurece o ambiente mas preserva as luminárias acesas, e as luzes da foto ganham brilho (bloom) na cor escolhida.
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const engine = {
    ready: false, raf: 0, cv: document.getElementById('ucv'),
    // desfoque barato e compatível com todos os navegadores: reduz pela metade várias vezes e volta ao tamanho original
    blur(map, W, H, div) {
      const a = document.createElement('canvas'); a.width = W; a.height = H;
      const actx = a.getContext('2d'), im = actx.createImageData(W, H);
      for (let p = 0, q = 0; p < map.length; p++, q += 4) { const v = map[p] * 255; im.data[q] = im.data[q + 1] = im.data[q + 2] = v; im.data[q + 3] = 255; }
      actx.putImageData(im, 0, 0);
      let cur = a, w = W, h = H;
      const tw = Math.max(2, Math.round(W / div)), th = Math.max(2, Math.round(H / div));
      while (w > tw * 1.5) {
        w = Math.max(tw, Math.round(w / 2)); h = Math.max(th, Math.round(h / 2));
        const n = document.createElement('canvas'); n.width = w; n.height = h;
        const nctx = n.getContext('2d'); nctx.imageSmoothingQuality = 'high'; nctx.drawImage(cur, 0, 0, w, h); cur = n;
      }
      const b = document.createElement('canvas'); b.width = W; b.height = H;
      const bctx = b.getContext('2d'); bctx.imageSmoothingQuality = 'high'; bctx.drawImage(cur, 0, 0, W, H);
      const d = bctx.getImageData(0, 0, W, H).data, out = new Float32Array(W * H);
      for (let p = 0, q = 0; p < out.length; p++, q += 4) out[p] = d[q] / 255;
      return out;
    },
    // Fotos de celular são imperfeitas (escuras, amareladas, com ruído). Antes de simular, o programa "normaliza" a foto:
    // ajusta exposição e corrige parte da cor do ambiente, para a luz escolhida valer igual em qualquer foto.
    load(img) {
      const side = (matchMedia('(pointer:coarse)').matches || (navigator.deviceMemory && navigator.deviceMemory <= 4)) ? 760 : 1000;
      const k = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
      const W = this.W = Math.round(img.naturalWidth * k), H = this.H = Math.round(img.naturalHeight * k);
      const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
      const tctx = tmp.getContext('2d'); tctx.imageSmoothingQuality = 'high'; tctx.drawImage(img, 0, 0, W, H);
      const raw = tctx.getImageData(0, 0, W, H).data, n = W * H;
      const lumOf = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      // 1) estatísticas da foto original
      const hist = new Uint32Array(256);
      for (let q = 0; q < raw.length; q += 4) hist[Math.round(lumOf(raw[q], raw[q + 1], raw[q + 2]) * 255)]++;
      const pct = f => { let s = 0, t = f * n; for (let i = 0; i < 256; i++) { s += hist[i]; if (s >= t) return i / 255; } return 1; };
      const p1 = pct(0.01), p50 = pct(0.5), p99 = pct(0.99);
      // 2) exposição: levanta foto escura, abaixa foto estourada, recupera contraste
      let gam = 1;
      if (p50 < 0.28) gam = Math.min(1, Math.max(0.5, Math.log(0.30) / Math.log(Math.max(p50, 0.02))));
      else if (p50 > 0.62) gam = Math.min(1.5, Math.log(0.5) / Math.log(p50));
      const hi = Math.pow(Math.max(p99, 0.05), gam), gain = hi < 0.92 ? Math.min(1.8, 0.96 / hi) : 1;
      const lut = new Float32Array(256);
      for (let i = 0; i < 256; i++) lut[i] = Math.min(1, Math.pow(i / 255, gam) * gain);
      // 3) cor do ambiente: tira parte do amarelado/azulado da foto (modo "mundo cinza", com cautela)
      let sr = 0, sg = 0, sb = 0, cnt = 0;
      for (let q = 0; q < raw.length; q += 16) {
        const r = lut[raw[q]], g = lut[raw[q + 1]], b = lut[raw[q + 2]], l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (l > 0.2 && l < 0.8) { sr += r; sg += g; sb += b; cnt++; }
      }
      let wb = [1, 1, 1];
      if (cnt > 200) {
        const m = (sr + sg + sb) / 3, raw3 = [m / sr, m / sg, m / sb];
        wb = raw3.map(v => Math.min(1.25, Math.max(0.8, 1 + (v - 1) * 0.5)));
        const norm = 0.2126 * wb[0] + 0.7152 * wb[1] + 0.0722 * wb[2]; wb = wb.map(v => v / norm);
      }
      // 4) foto base já corrigida
      const base = this.src = new Uint8ClampedArray(raw.length), lum = this.lum = new Float32Array(n);
      for (let p = 0, q = 0; p < n; p++, q += 4) {
        const r = Math.min(1, lut[raw[q]] * wb[0]), g = Math.min(1, lut[raw[q + 1]] * wb[1]), b = Math.min(1, lut[raw[q + 2]] * wb[2]);
        base[q] = r * 255; base[q + 1] = g * 255; base[q + 2] = b * 255; base[q + 3] = 255;
        lum[p] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
      // 4b) ruído (comum em foto escura de celular): mede e suaviza antes de simular, senão o grão aparece com a cor nova
      let nz = 0, nc = 0;
      for (let y = 1; y < H - 1; y += 3) for (let x = 1; x < W - 1; x += 3) {
        const p = y * W + x; nz += Math.abs(lum[p] - (lum[p - 1] + lum[p + 1] + lum[p - W] + lum[p + W]) / 4); nc++;
      }
      nz /= Math.max(1, nc);
      const passes = nz > 0.07 ? 3 : nz > 0.04 ? 2 : nz > 0.018 ? 1 : 0;
      for (let t = 0; t < passes; t++) {
        const cp = new Uint8ClampedArray(base);
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          const q = (y * W + x) * 4;
          for (let k = 0; k < 3; k++) {
            const m = (cp[q + k] * 4 + cp[q + k - 4] + cp[q + k + 4] + cp[q + k - W * 4] + cp[q + k + W * 4] + cp[q + k - W * 4 - 4] + cp[q + k - W * 4 + 4] + cp[q + k + W * 4 - 4] + cp[q + k + W * 4 + 4]) / 12;
            base[q + k] = m;
          }
        }
      }
      if (passes) for (let p = 0, q = 0; p < n; p++, q += 4) lum[p] = (0.2126 * base[q] + 0.7152 * base[q + 1] + 0.0722 * base[q + 2]) / 255;
      // 5) luminárias = pontos bem claros, com limite que se adapta à foto
      const nh = new Uint32Array(256); for (let p = 0; p < n; p++) nh[Math.round(lum[p] * 255)]++;
      let acc = 0, top = 1; for (let i = 0; i < 256; i++) { acc += nh[i]; if (acc >= 0.995 * n) { top = i / 255; break; } }
      const t0 = Math.min(0.88, Math.max(0.74, top - 0.1));    // quanto mais estourada a foto, mais exigente o limite
      const hl = new Float32Array(n); let lampPx = 0;
      for (let p = 0; p < n; p++) { const v = smooth(t0, t0 + 0.12, lum[p]); hl[p] = v; if (v > 0.5) lampPx++; }
      this.hs = this.blur(hl, W, H, 22);               // brilho curto, perto da luminária
      this.hb = this.blur(hl, W, H, 7);                // luz que se espalha pelo ambiente
      this.cv.width = W; this.cv.height = H;
      this.ctx = this.cv.getContext('2d'); this.out = this.ctx.createImageData(W, H);
      // 6) diagnóstico para avisar o visitante
      // clarão grande (flash, parede estourada) não é luminária: reduz o brilho para não virar uma mancha
      this.glare = Math.min(1, Math.max(0.12, 0.006 / Math.max(lampPx / n, 1e-4)));
      // muita área clara (janelão, sol na parede) = foto dominada pela luz do dia, onde a lâmpada pouco aparece
      this.info = { nz, passes, dark: p50 < 0.1, daylight: lampPx / n > 0.04, small: Math.max(img.naturalWidth, img.naturalHeight) < 600, noLamps: lampPx / n < 0.0003, flat: p99 - p1 < 0.25 };
      this.ready = true; this.render();
    },
    schedule() { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.render(); }); },
    render() {
      if (!this.ready) return;
      const c = TEMPS[cur].rgb.split(',').map(Number).map(v => v / 255);
      const y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2], g = c.map(v => v / y);   // ganho de cor mantendo o brilho
      const i = on ? dim.value / 100 : 0.03, d = Math.min(1, 0.16 + i * 0.99), s = this.info.noLamps ? 0.72 : 0.6, bs = Math.pow(i, 1.3) * 0.9 * this.glare;
      const { src, lum, hs, hb } = this, o = this.out.data, n = this.W * this.H;
      for (let p = 0, q = 0; p < n; p++, q += 4) {
        // janelas = manchas claras grandes (luz do dia): não mudam de cor com a lâmpada. Luminária = mancha pequena.
        const l = lum[p], win = smooth(0.45, 0.85, hb[p]), w = (0.3 + 0.7 * smooth(0.05, 0.65, l)) * (1 - 0.85 * win);   // sombra profunda leva menos cor
        const e = d + (1 - d) * hs[p];                              // luminárias continuam acesas ao reduzir
        const bl = (hs[p] * 0.5 + hb[p] * 0.7) * bs * (1 - 0.45 * l) * (1 - win);
        for (let k = 0; k < 3; k++) {
          let v = (src[q + k] / 255) * (1 + (g[k] - 1) * s * w) * e + bl * c[k];
          if (v > 0.8) v = 0.8 + 0.2 * (1 - Math.exp(-(v - 0.8) / 0.2));
          o[q + k] = v * 255;
        }
        o[q + 3] = 255;
      }
      this.ctx.putImageData(this.out, 0, 0);
    }
  };
  const photo = document.getElementById('photo'), file = document.getElementById('file'), tag = document.getElementById('tag'),
    reset = document.getElementById('reset'), wa = document.getElementById('wa'), note = document.getElementById('upnote');
  const DEFAULT_NOTE = note.textContent, EXAMPLE_RATIO = '1400 / 875';
  let userUrl = null;
  const say = (msg, err) => { note.textContent = msg; note.classList.toggle('err', !!err); };
  function useExample() {
    if (userUrl) URL.revokeObjectURL(userUrl);
    userUrl = null; engine.ready = false;
    stage.style.aspectRatio = EXAMPLE_RATIO; stage.classList.remove('user');
    tag.textContent = 'Projeto de exemplo'; reset.hidden = true; say(DEFAULT_NOTE); light();
  }
  file.onchange = () => {
    const f = file.files[0]; file.value = '';
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|gif|avif|heic|heif)$/i.test(f.type)) return say('Escolha uma imagem (JPG, PNG ou WebP).', true);
    if (f.size > 25 * 1024 * 1024) return say('Foto muito grande (máx. 25 MB).', true);
    const url = URL.createObjectURL(f), probe = new Image();
    probe.onload = () => {
      if (userUrl) URL.revokeObjectURL(userUrl);
      userUrl = url;
      stage.style.aspectRatio = Math.min(1.9, Math.max(0.75, probe.naturalWidth / probe.naturalHeight));
      stage.classList.add('user'); tag.textContent = 'Sua foto'; reset.hidden = false;
      engine.load(probe);
      const f = engine.info;
      say(f.dark ? 'A foto está bem escura, então clareei a imagem automaticamente. Com as luzes acesas o resultado fica bem melhor.'
        : f.small ? 'Foto pequena: a simulação pode perder qualidade. Se puder, envie uma foto maior.'
        : f.daylight ? 'Essa foto tem muita luz natural (janela ou sol). A simulação mostra a luz artificial por cima; fica melhor com a foto tirada à noite ou com as cortinas fechadas.'
        : f.noLamps ? 'Não encontrei luminárias acesas na foto, então a simulação muda só o tom da luz. Tire com as luzes acesas para ver o brilho delas.'
        : 'Pronto! Troque a cor e a intensidade. É uma simulação ilustrativa: ajusta a luz que já aparece na foto.'); light();
    };
    probe.onerror = () => { URL.revokeObjectURL(url); say('Não consegui abrir essa imagem. Tente JPG ou PNG.', true); };
    probe.src = url;
  };
  reset.onclick = useExample;
  light();
})();