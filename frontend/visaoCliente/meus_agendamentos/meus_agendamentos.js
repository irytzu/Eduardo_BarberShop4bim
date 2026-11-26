guarda('cliente').then(async (u) => {
  if (u === null && true) return;
  async function carregar() {
    const a = await api('/api/agendamentos/meus');
    document.getElementById('lista').innerHTML = a.map(x => `<tr><td>${dataBR(x.data_hora)}</td><td>${esc(x.servico)}</td><td>${esc(x.barbeiro)}</td><td>${brl(x.valor)}</td><td>${esc(x.forma_pagamento)}</td><td>${esc(x.status)}</td><td>${x.status === 'confirmado' ? `<button class="btn perigo peq" onclick="cancelar(${x.id})">Cancelar</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="7">Nenhum agendamento.</td></tr>';
  }
  window.cancelar = async (id) => { if (!confirm('Cancelar este agendamento?')) return; await api(`/api/agendamentos/${id}/cancelar`, { method: 'PUT' }); carregar(); };
  carregar();
});
