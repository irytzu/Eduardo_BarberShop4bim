guarda('cliente').then(async (u) => {
  if (u === null && true) return;
  const serv = await api('/api/servicos');
  const barb = await api('/api/barbeiros');
  const f = document.getElementById('form');
  f.servico_id.innerHTML = serv.map(s => `<option value="${s.id}">${esc(s.nome)} - ${brl(s.preco)}</option>`).join('');
  f.barbeiro_id.innerHTML = barb.map(b => `<option value="${b.id}">${esc(b.nome)} (${esc(b.especialidade)})</option>`).join('');
  f.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/agendamentos', json('POST', Object.fromEntries(new FormData(f))));
      msg('Agendamento confirmado! Pagamento aprovado (simulado).');
      setTimeout(() => location.href = '/visaoCliente/meus_agendamentos/meus_agendamentos.html', 1200);
    } catch (err) { msg(err.message, 'erro'); }
  };
});
