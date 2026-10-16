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
    const sujeito = userUrl ? 'no meu ambiente' : 'na sala de exemplo';
    wa.href = 'https://wa.me/5517981200526?text=' + encodeURIComponent(
      `Olá Arthur! Testei a luz ${t.name} (${t.k}) ${sujeito} no seu site e gostaria de um orçamento de iluminação.`);
  }
  tempsEl.onclick = e => { const b = e.target.closest('.temp'); if (b) { cur = +b.dataset.i; on = true; light(); } };
  dim.oninput = () => { on = true; light(); };
  pw.onclick = () => { on = !on; light(); };

  // foto do visitante: fica só no navegador (URL local), nada é enviado
  const photo = document.getElementById('photo'), file = document.getElementById('file'), tag = document.getElementById('tag'),
    reset = document.getElementById('reset'), dl = document.getElementById('dl'), wa = document.getElementById('wa'), note = document.getElementById('upnote');
  const DEFAULT_NOTE = note.textContent, EXAMPLE_SRC = photo.getAttribute('src'), EXAMPLE_RATIO = '1400 / 875';
  let userUrl = null;
  const say = (msg, err) => { note.textContent = msg; note.classList.toggle('err', !!err); };
  function useExample() {
    if (userUrl) URL.revokeObjectURL(userUrl);
    userUrl = null;
    photo.src = EXAMPLE_SRC; stage.style.aspectRatio = EXAMPLE_RATIO; stage.classList.remove('user');
    tag.textContent = 'Projeto de exemplo'; reset.hidden = dl.hidden = true; say(DEFAULT_NOTE); light();
  }
  file.onchange = () => {
    const f = file.files[0]; file.value = '';
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|gif|avif|heic|heif)$/i.test(f.type)) return say('Escolha uma imagem (JPG, PNG ou WebP).', true);
    if (f.size > 25 * 1024 * 1024) return say('Foto muito grande (máx. 25 MB).', true);
    const url = URL.createObjectURL(f), probe = new Image();
    probe.onload = () => {
      if (userUrl) URL.revokeObjectURL(userUrl);
      userUrl = url; photo.src = url;
      stage.style.aspectRatio = Math.min(1.9, Math.max(0.75, probe.naturalWidth / probe.naturalHeight));
      stage.classList.add('user'); tag.textContent = 'Sua foto'; reset.hidden = dl.hidden = false;
      say('Pronto! Troque a cor e a intensidade da luz. É uma simulação ilustrativa.'); light();
    };
    probe.onerror = () => { URL.revokeObjectURL(url); say('Não consegui abrir essa imagem. Tente JPG ou PNG.', true); };
    probe.src = url;
  };
  reset.onclick = useExample;
  dl.onclick = () => {
    const w0 = photo.naturalWidth, h0 = photo.naturalHeight, k = Math.min(1, 1800 / Math.max(w0, h0));
    const cv = document.createElement('canvas'); cv.width = Math.round(w0 * k); cv.height = Math.round(h0 * k);
    const ctx = cv.getContext('2d'), li = on ? dim.value / 100 : 0.03;
    ctx.filter = `brightness(${0.26 + li * 0.8}) saturate(${0.7 + li * 0.35})`;   // mesmos valores do CSS
    ctx.drawImage(photo, 0, 0, cv.width, cv.height);
    ctx.filter = 'none'; ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.85;   // igual ao .stage.user .tint
    ctx.fillStyle = `rgb(${TEMPS[cur].rgb})`; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.4; ctx.fillRect(0, 0, cv.width, cv.height);   // igual ao .tint2
    cv.toBlob(b => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(b);
      a.download = `simulacao-luz-${TEMPS[cur].k}.jpg`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/jpeg', 0.9);
  };
  light();
})();