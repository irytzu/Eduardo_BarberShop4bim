guarda('admin').then(async (u) => {
  if (u === null && true) return;
  const f = document.getElementById('form');
  let cache = [];
  async function carregar() {
    cache = await api('/api/servicos');
    document.getElementById('lista').innerHTML = cache.map(s => `<tr><td>${s.imagem_url ? `<img src="${esc(s.imagem_url)}" alt="" width="50">` : '-'}</td><td>${esc(s.nome)}</td><td>${brl(s.preco)}</td><td>${s.duracao_min}</td><td><button class="btn sec peq" onclick="editar(${s.id})">Editar</button> <button class="btn perigo peq" onclick="remover(${s.id})">Excluir</button></td></tr>`).join('');
  }
  window.editar = (id) => { const s = cache.find(x => x.id === id); f.id.value = s.id; f.nome.value = s.nome; f.descricao.value = s.descricao || ''; f.preco.value = s.preco; f.duracao_min.value = s.duracao_min; scrollTo(0, 0); };
  window.remover = async (id) => { if (!confirm('Excluir serviço?')) return; try { await api('/api/servicos/' + id, { method: 'DELETE' }); carregar(); } catch (e) { msg(e.message, 'erro'); } };
  document.getElementById('limpar').onclick = () => f.reset();
  f.onsubmit = async (e) => {
    e.preventDefault();
    const id = f.id.value;
    const fd = new FormData(f);
    try {
      await api(id ? '/api/servicos/' + id : '/api/servicos', { method: id ? 'PUT' : 'POST', body: fd });
      f.reset(); f.id.value = ''; msg('Salvo com sucesso!'); carregar();
    } catch (err) { msg(err.message, 'erro'); }
  };
  carregar();
});
