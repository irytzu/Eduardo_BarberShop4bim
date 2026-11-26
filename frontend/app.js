// ---- utilitários compartilhados por todas as páginas ----
async function api(url, opts = {}) {
  const r = await fetch(url, { credentials: 'same-origin', ...opts });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.erro || 'Erro na requisição');
  return d;
}

function json(metodo, corpo) {
  return { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) };
}

function msg(texto, tipo = 'ok') {
  const el = document.getElementById('msg');
  if (!el) return alert(texto);
  el.textContent = texto;
  el.className = tipo;
}

const brl = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataBR = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Bolinha com a foto (ou inicial) no canto da tela + menu: perfil, trocar de conta e sair
let avatarOuvindo = false;
function montaAvatar(u) {
  document.getElementById('avatarWrap')?.remove();
  const inicial = u.nome.trim().charAt(0).toUpperCase();
  const wrap = document.createElement('div');
  wrap.id = 'avatarWrap';
  wrap.innerHTML = `
    <button id="avatarBtn" class="avatar" aria-haspopup="true" aria-expanded="false" title="Minha conta">${u.foto_url ? `<img src="${esc(u.foto_url)}" alt="Foto de ${esc(u.nome)}">` : esc(inicial)}</button>
    <div id="avatarMenu" class="avatar-menu" hidden>
      <div class="avatar-info"><strong>${esc(u.nome)}</strong><span>${esc(u.email)}</span><em>${u.papel === 'admin' ? 'Administrador' : 'Cliente'}</em></div>
      <a href="/perfil/perfil.html">👤 Meu perfil</a>
      <button id="btnTrocar">🔄 Trocar de conta</button>
      <button id="btnSair">🚪 Sair</button>
    </div>`;
  document.body.appendChild(wrap);

  const btn = document.getElementById('avatarBtn');
  const menu = document.getElementById('avatarMenu');
  const img = btn.querySelector('img');
  if (img) img.onerror = () => { img.remove(); btn.textContent = inicial; }; // foto sumiu: mostra a inicial

  btn.onclick = () => {
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  };
  const sair = (destino) => async () => {
    await api('/api/auth/logout', { method: 'POST' });
    location.href = destino;
  };
  document.getElementById('btnSair').onclick = sair('/menu.html');
  document.getElementById('btnTrocar').onclick = sair('/login/login.html');

  // fecha ao clicar fora ou apertar Esc (registra só uma vez)
  if (!avatarOuvindo) {
    avatarOuvindo = true;
    const fecha = () => {
      const m = document.getElementById('avatarMenu');
      if (m && !m.hidden) { m.hidden = true; document.getElementById('avatarBtn').setAttribute('aria-expanded', 'false'); }
    };
    document.addEventListener('click', (e) => { if (!e.target.closest('#avatarWrap')) fecha(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecha(); });
  }
}

// Monta o menu conforme o papel do usuário logado (visão cliente x administrador)
async function montaNav() {
  let u = null;
  try { u = await api('/api/auth/me'); } catch (e) { }
  let links = '<a href="/menu.html">Início</a>';
  if (!u) links += '<a href="/login/login.html">Entrar</a>';
  if (u && u.papel === 'cliente')
    links += '<a href="/visaoCliente/agendar/agendar.html">Agendar</a><a href="/visaoCliente/meus_agendamentos/meus_agendamentos.html">Meus agendamentos</a>';
  if (u && u.papel === 'admin')
    links += '<a href="/servico/servico.html">Serviços</a><a href="/barbeiro/barbeiro.html">Barbeiros</a><a href="/agendamento/agendamento.html">Agendamentos</a>';
  document.getElementById('menu').innerHTML = links;
  if (u) montaAvatar(u); else document.getElementById('avatarWrap')?.remove();
  return u;
}

// Protege a página: exige login e (opcionalmente) um papel
async function guarda(papel) {
  const u = await montaNav();
  if (!u || (papel && u.papel !== papel)) { location.href = '/login/login.html'; return null; }
  return u;
}
