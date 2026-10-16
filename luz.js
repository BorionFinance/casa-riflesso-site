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
  }
  tempsEl.onclick = e => { const b = e.target.closest('.temp'); if (b) { cur = +b.dataset.i; on = true; light(); } };
  dim.oninput = () => { on = true; light(); };
  pw.onclick = () => { on = !on; light(); };
  light();
})();