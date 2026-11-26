montaNav().then(() => {
  document.getElementById('formEsqueci').onsubmit = async (e) => {
    e.preventDefault();
    try {
      const r = await api('/api/auth/esqueci-senha', json('POST', Object.fromEntries(new FormData(e.target))));
      msg(r.mensagem);
      e.target.reset();
    } catch (err) { msg(err.message, 'erro'); }
  };
});
