montaNav().then(async (u) => {
  if (u === null && false) return;
  if (u) { location.href = u.papel === 'admin' ? '/agendamento/agendamento.html' : '/visaoCliente/agendar/agendar.html'; return; }
  const vai = (r) => location.href = r.papel === 'admin' ? '/agendamento/agendamento.html' : '/visaoCliente/agendar/agendar.html';
  const dados = (f) => Object.fromEntries(new FormData(f));
  document.getElementById('formLogin').onsubmit = async (e) => {
    e.preventDefault();
    try { vai(await api('/api/auth/login', json('POST', dados(e.target)))); } catch (err) { msg(err.message, 'erro'); }
  };
  document.getElementById('formReg').onsubmit = async (e) => {
    e.preventDefault();
    try { vai(await api('/api/auth/registrar', json('POST', dados(e.target)))); } catch (err) { msg(err.message, 'erro'); }
  };
});
