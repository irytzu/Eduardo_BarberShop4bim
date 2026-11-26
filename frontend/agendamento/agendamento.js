guarda('admin').then(async (u) => {
  if (u === null && true) return;
  async function carregar() {
    const a = await api('/api/agendamentos');
    const total = a.filter(x => x.status !== 'cancelado').reduce((s, x) => s + Number(x.valor), 0);
    document.getElementById('resumo').textContent = `${a.length} agendamentos · faturamento previsto (sem cancelados): ${brl(total)}`;
    const ops = (s) => ['confirmado', 'concluido', 'cancelado'].map(o => `<option ${o === s ? 'selected' : ''}>${o}</option>`).join('');
    document.getElementById('lista').innerHTML = a.map(x => `<tr><td>${dataBR(x.data_hora)}</td><td>${esc(x.cliente)}</td><td>${esc(x.servico)}</td><td>${esc(x.barbeiro)}</td><td>${brl(x.valor)}</td><td>${esc(x.forma_pagamento)}</td><td><select onchange="mudar(${x.id}, this.value)">${ops(x.status)}</select></td></tr>`).join('');
  }
  window.mudar = async (id, status) => { await api(`/api/agendamentos/${id}/status`, json('PUT', { status })); carregar(); };
  carregar();
});
