// Camada de dados compartilhada (site + admin)
const KEY = 'cr_projects';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Converte link do Google Drive em URL de imagem exibível
function driveImg(url) {
  const m = String(url).match(/\/d\/([\w-]+)|[?&]id=([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1] || m[2]}&sz=w1600` : url.trim();
}

// Projetos de exemplo (fotos do Instagram @casariflesso) — o Arthur substitui pelo painel admin
const DEMO = [
  {id:'d1',title:'Sala integrada',cat:'Residencial',desc:'Luz indireta no teto, spots direcionáveis nos detalhes, abajur e pendentes sobre a mesa de refeições.',imgs:['assets/obra2.jpg'],r:'3/4'},
  {id:'d2',title:'Sala de jantar',cat:'Residencial',desc:'Pendentes sobre a mesa e luz suave pelas cortinas criam um ambiente acolhedor.',imgs:['assets/obra4.jpg'],r:'1/1'},
  {id:'d3',title:'Marcenaria iluminada',cat:'Residencial',desc:'Iluminação na marcenaria que vai além do perfil: soluções para iluminar com intenção.',imgs:['assets/obra5.jpg'],r:'4/5'},
  {id:'d4',title:'Cantinho de jantar',cat:'Residencial',desc:'A luz também arquiteta: pendente escultural que revela a essência do espaço.',imgs:['assets/obra6.jpg'],r:'4/5'},
  {id:'d5',title:'Sala com trilhos',cat:'Reforma',desc:'Trilhos e spots que transformam o ambiente sem depender de grandes reformas.',imgs:['assets/obra7.jpg'],r:'4/5'},
  {id:'d6',title:'Abajur e atmosfera',cat:'Reforma',desc:'Mais que um abajur: uma nova atmosfera, íntima e confortável, para a casa.',imgs:['assets/obra8.jpg'],r:'4/5'},
  {id:'d7',title:'Layering de iluminação',cat:'Conteúdo',desc:'Como diferentes camadas de luz transformam a percepção de um ambiente.',imgs:['assets/obra3.jpg'],r:'4/5'}
];
function loadProjects() {
  try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {}
  return DEMO;
}
function saveProjects(list) { localStorage.setItem(KEY, JSON.stringify(list)); }
