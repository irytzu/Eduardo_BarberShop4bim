// QR Code Pix FALSO: desenho aleatório só para simular (nenhum app consegue ler)
function gerarQrFalso() {
  const N = 25, B = 4, P = 8; // 25x25 módulos, borda de 4, 8px por módulo
  const T = (N + 2 * B) * P;
  const quad = (x, y, w, h, cor) =>
    `<rect x="${(x + B) * P}" y="${(y + B) * P}" width="${w * P}" height="${h * P}" fill="${cor}"/>`;
  const canto = (x, y) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  let r = '';
  // três quadrados de posição, como em todo QR Code
  for (const [x, y] of [[0, 0], [N - 7, 0], [0, N - 7]])
    r += quad(x, y, 7, 7, '#000') + quad(x + 1, y + 1, 5, 5, '#fff') + quad(x + 2, y + 2, 3, 3, '#000');
  // o resto é sorteado
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      if (!canto(x, y) && Math.random() < 0.5) r += quad(x, y, 1, 1, '#000');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${T}" role="img" aria-label="QR Code Pix simulado"><rect width="100%" height="100%" fill="#fff"/>${r}</svg>`;
}

const codigoPixFalso = () =>
  'PIX-SIMULADO-' + Array.from({ length: 24 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
guarda('cliente').then(async (u) => {
  if (u === null && true) return;
  const serv = await api('/api/servicos');
  const barb = await api('/api/barbeiros');
  const f = document.getElementById('form');
  f.servico_id.innerHTML = serv.map(s => `<option value="${s.id}">${esc(s.nome)} - ${brl(s.preco)}</option>`).join('');
  f.barbeiro_id.innerHTML = barb.map(b => `<option value="${b.id}">${esc(b.nome)} (${esc(b.especialidade)})</option>`).join('');
  // mostra um QR Code novo (aleatório) sempre que a forma de pagamento for Pix
  const atualizaPix = () => {
    const pix = f.forma_pagamento.value === 'pix';
    document.getElementById('pixBox').hidden = !pix;
    if (pix) {
      document.getElementById('qr').innerHTML = gerarQrFalso();
      document.getElementById('pixCodigo').textContent = codigoPixFalso();
    }
  };
  f.forma_pagamento.onchange = atualizaPix;
  atualizaPix();
  f.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/agendamentos', json('POST', Object.fromEntries(new FormData(f))));
      msg('Agendamento confirmado! Pagamento aprovado (simulado).');
      setTimeout(() => location.href = '/visaoCliente/meus_agendamentos/meus_agendamentos.html', 1200);
    } catch (err) { msg(err.message, 'erro'); }
  };
});
