guarda().then(async (u) => {
  if (!u) return;

  function desenha(u) {
    document.getElementById('pNome').textContent = u.nome;
    document.getElementById('pEmail').textContent = u.email || '';
    document.getElementById('pPapel').textContent = u.papel === 'admin' ? 'Administrador' : 'Cliente';
    document.getElementById('fotoGrande').innerHTML = u.foto_url
      ? `<img src="${esc(u.foto_url)}" alt="Foto de perfil">`
      : esc(u.nome.trim().charAt(0).toUpperCase());
    document.getElementById('btnRemover').style.display = u.foto_url ? '' : 'none';
  }
  desenha(u);

  const campo = document.getElementById('arquivoFoto');
  document.getElementById('btnEscolher').onclick = () => campo.click();

  // ao escolher o arquivo, já envia e atualiza a bolinha do canto
  campo.onchange = async () => {
    const arq = campo.files[0];
    if (!arq) return;
    if (arq.size > 2 * 1024 * 1024) { msg('Foto muito grande (máximo 2 MB)', 'erro'); campo.value = ''; return; }
    const fd = new FormData();
    fd.append('foto', arq);
    try {
      await api('/api/auth/foto', { method: 'POST', body: fd });
      msg('Foto atualizada!');
      desenha(await montaNav());
    } catch (err) { msg(err.message, 'erro'); }
    campo.value = '';
  };

  document.getElementById('btnRemover').onclick = async () => {
    if (!confirm('Remover sua foto de perfil?')) return;
    try {
      await api('/api/auth/foto', { method: 'DELETE' });
      msg('Foto removida.');
      desenha(await montaNav());
    } catch (err) { msg(err.message, 'erro'); }
  };
});
