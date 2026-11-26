guarda('admin').then(async (u) => {
  if (u === null && true) return;
  const f = document.getElementById('form');
  let cache = [];
  async function carregar() {
    cache = await api('/api/barbeiros');
    document.getElementById('lista').innerHTML = cache.map(b => `<tr><td>${esc(b.nome)}</td><td>${esc(b.especialidade)}</td><td>${esc(b.telefone)}</td><td><button class="btn sec peq" onclick="editar(${b.id})">Editar</button> <button class="btn perigo peq" onclick="remover(${b.id})">Excluir</button></td></tr>`).join('');
  }
  window.editar = (id) => { const b = cache.find(x => x.id === id); f.id.value = b.id; f.nome.value = b.nome; f.especialidade.value = b.especialidade || ''; f.telefone.value = b.telefone || ''; scrollTo(0, 0); };
  window.remover = async (id) => { if (!confirm('Excluir barbeiro?')) return; try { await api('/api/barbeiros/' + id, { method: 'DELETE' }); carregar(); } catch (e) { msg(e.message, 'erro'); } };
  document.getElementById('limpar').onclick = () => f.reset();
  f.onsubmit = async (e) => {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(f));
    const id = dados.id; delete dados.id;
    try {
      await api(id ? '/api/barbeiros/' + id : '/api/barbeiros', json(id ? 'PUT' : 'POST', dados));
      f.reset(); f.id.value = ''; msg('Salvo com sucesso!'); carregar();
    } catch (err) { msg(err.message, 'erro'); }
  };
  carregar();
});
