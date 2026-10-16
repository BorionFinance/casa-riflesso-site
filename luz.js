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
    load(img) {
      const k = Math.min(1, 1100 / Math.max(img.naturalWidth, img.naturalHeight));
      const W = this.W = Math.round(img.naturalWidth * k), H = this.H = Math.round(img.naturalHeight * k);
      const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
      const tctx = tmp.getContext('2d'); tctx.drawImage(img, 0, 0, W, H);
      this.src = tctx.getImageData(0, 0, W, H).data;
      const n = W * H, lum = this.lum = new Float32Array(n), hl = new Float32Array(n);
      for (let p = 0, q = 0; p < n; p++, q += 4) {
        const l = (0.2126 * this.src[q] + 0.7152 * this.src[q + 1] + 0.0722 * this.src[q + 2]) / 255;
        lum[p] = l; hl[p] = smooth(0.84, 0.98, l);     // pontos muito claros = luminárias / reflexos
      }
      this.hs = this.blur(hl, W, H, 22);               // brilho curto, perto da luminária
      this.hb = this.blur(hl, W, H, 7);                // luz que se espalha pelo ambiente
      this.cv.width = W; this.cv.height = H;
      this.ctx = this.cv.getContext('2d'); this.out = this.ctx.createImageData(W, H);
      this.ready = true; this.render();
    },
    schedule() { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.render(); }); },
    render() {
      if (!this.ready) return;
      const c = TEMPS[cur].rgb.split(',').map(Number).map(v => v / 255);
      const y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2], g = c.map(v => v / y);   // ganho de cor mantendo o brilho
      const i = on ? dim.value / 100 : 0.03, d = Math.min(1, 0.16 + i * 0.99), s = 0.6, bs = Math.pow(i, 1.3) * 0.9;
      const { src, lum, hs, hb } = this, o = this.out.data, n = this.W * this.H;
      for (let p = 0, q = 0; p < n; p++, q += 4) {
        const l = lum[p], w = 0.3 + 0.7 * smooth(0.05, 0.65, l);   // sombra profunda leva menos cor
        const e = d + (1 - d) * hs[p];                              // luminárias continuam acesas ao reduzir
        const bl = (hs[p] * 0.5 + hb[p] * 0.7) * bs * (1 - 0.45 * l);
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
      say('Pronto! Troque a cor e a intensidade. É uma simulação ilustrativa: ajusta a luz que já aparece na foto.'); light();
    };
    probe.onerror = () => { URL.revokeObjectURL(url); say('Não consegui abrir essa imagem. Tente JPG ou PNG.', true); };
    probe.src = url;
  };
  reset.onclick = useExample;
  light();
})();