montaNav().then(async (u) => {
    if (u === null && false) return;
    const s = await api('/api/servicos');
    document.getElementById('servicos').innerHTML = s.map(x => `<article class="card"><div class="img">${x.imagem_url ? `<img src="${esc(x.imagem_url)}" alt="${esc(x.nome)}">` : '✂'}</div><div class="body"><h3>${esc(x.nome)}</h3><p>${esc(x.descricao)}</p><p class="preco">${brl(x.preco)} · ${x.duracao_min} min</p></div></article>`).join('');
    const b = await api('/api/barbeiros');
    document.getElementById('barbeiros').innerHTML = b.map(x => `<article class="card"><div class="body"><h3>${esc(x.nome)}</h3><p>${esc(x.especialidade)}</p></div></article>`).join('');
});
