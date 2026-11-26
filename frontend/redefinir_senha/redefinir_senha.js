montaNav().then(() => {
  // o token vem no link: /redefinir_senha/redefinir_senha.html?token=...
  const token = new URLSearchParams(location.search).get('token');
  if (!token) {
    msg('Link inválido. Peça um novo link de recuperação.', 'erro');
    document.getElementById('formRedefinir').style.display = 'none';
    return;
  }
  document.getElementById('formRedefinir').onsubmit = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (d.senha !== d.confirmar) return msg('As senhas não conferem', 'erro');
    try {
      const r = await api('/api/auth/redefinir-senha', json('POST', { token, senha: d.senha }));
      msg(r.mensagem);
      e.target.style.display = 'none';
      setTimeout(() => location.href = '/login/login.html', 2000);
    } catch (err) { msg(err.message, 'erro'); }
  };
});
