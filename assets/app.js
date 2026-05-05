// SmartLegis · Módulo de Regulamentação · Mock app v0.5 (auth + permissões + edição IA)

const app = {
  current: null,
  rerender() { router(); },
};

// ============ Auth ============
function loadAuth() {
  const stored = sessionStorage.getItem('sl_user');
  if (stored) {
    try { currentUser = JSON.parse(stored); }
    catch (e) { currentUser = null; }
  }
}
function login(perfilId) {
  const p = getPerfil(perfilId);
  if (!p) return;
  currentUser = p;
  sessionStorage.setItem('sl_user', JSON.stringify(p));
  if (location.hash === '#/dashboard') router();
  else location.hash = '#/dashboard';
}
function logout() {
  currentUser = null;
  sessionStorage.removeItem('sl_user');
  router();
}
function refreshUserPill() {
  const avatar = document.getElementById('userAvatar');
  const name = document.getElementById('userName');
  const role = document.getElementById('userMenuRole');
  const fullName = document.getElementById('userMenuName');
  if (!avatar) return;
  if (currentUser) {
    avatar.textContent = currentUser.avatar;
    avatar.style.background = currentUser.cor;
    name.textContent = currentUser.nome + ' ▼';
    if (role) role.textContent = currentUser.role + (currentUser.gabinete ? ' · ' + currentUser.gabinete : '');
    if (fullName) fullName.textContent = currentUser.nome;
  }
}
function toggleUserMenu(e) {
  if (e) e.stopPropagation();
  document.getElementById('userMenu').classList.toggle('is-open');
}

// ============ Routing ============
function router() {
  loadAuth();
  const main = document.getElementById('main');
  const topbar = document.getElementById('topbar');

  // Route guard: sem auth → login screen
  if (!currentUser) {
    if (topbar) topbar.style.display = 'none';
    main.innerHTML = viewLogin();
    return;
  }
  if (topbar) topbar.style.display = '';
  refreshUserPill();

  const hash = location.hash.replace(/^#\//, '') || 'dashboard';
  const parts = hash.split('/').filter(Boolean);
  const breadcrumb = document.getElementById('breadcrumb');

  const route = parts[0];

  let html = '';
  let bc = 'Dashboard';
  if (route === 'dashboard') { html = viewDashboard(); bc = 'Dashboard'; }
  else if (route === 'planos') { html = viewPlanos(); bc = 'Planos'; }
  else if (route === 'plano' && parts[1] === 'novo') {
    if (!app.lastRoute || app.lastRoute !== 'plano-novo') {
      wizardState = {
        step: 1,
        diploma_habilitante: null, origem_diploma: 'em_curso',
        tipo_origem: 'proponente_via_diploma', titulo: '',
        forma_ato: 'portaria', correr_ia: true,
      };
    }
    html = viewWizard(); bc = 'Planos · Novo';
    app.lastRoute = 'plano-novo';
  }
  else if (route === 'plano' && parts[1]) {
    let id, tab;
    if (parts.length >= 4) {
      id = parts.slice(1, 4).join('/');
      tab = parts[4] || 'dados';
    } else {
      id = parts[1]; tab = parts[2] || 'dados';
    }
    html = viewPlanoDetalhe(id, tab);
    bc = `Planos · ${id}`;
  }
  else if (route === 'dsaag') { html = viewDsaag(); bc = 'DSAAG'; }
  else if (route === 'diplomas-publicados') { html = viewDiplomasPublicados(); bc = 'Diplomas publicados'; }
  else { html = viewDashboard(); }

  main.innerHTML = html;
  // Breadcrumb na topbar SmartLegis: "Está em: ..."
  const segments = bc.split(' · ');
  if (breadcrumb) {
    breadcrumb.innerHTML = `Está em: <a href="#/dashboard">Dashboard</a>${segments.length > 1 ? ' › ' + segments.slice(1).join(' › ') : ''}`;
  }
  // Marca item ativo no sidebar
  document.querySelectorAll('.sl-sidebar__item').forEach(a => a.classList.remove('sl-sidebar__item--active'));
  const sideLink = document.querySelector(`.sl-sidebar__item[data-route="${route}"]`);
  if (sideLink) sideLink.classList.add('sl-sidebar__item--active');
  if (route !== 'plano' || parts[1] !== 'novo') app.lastRoute = route;
  refreshAlertCount();
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => {
  router();
  // Sidebar como popup acionado pelo logo (estilo SmartLegis real)
  const logo = document.getElementById('logoToggle');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('sidebar').classList.toggle('is-open');
    });
  }
  const ab = document.getElementById('alertsBtn');
  if (ab) ab.addEventListener('click', () => location.hash = '#/dsaag');
  // Fecha user menu ao clicar fora
  document.addEventListener('click', () => {
    const m = document.getElementById('userMenu');
    if (m) m.classList.remove('is-open');
  });
});

function refreshAlertCount() {
  const el = document.getElementById('alertCount');
  const pendentes = ALERTAS.filter(a => !a.tratado_em).length + DIPLOMAS_VARRIDOS.length;
  el.textContent = pendentes;
  el.style.display = pendentes > 0 ? '' : 'none';
}

function toast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'sl-toast is-open' + (type ? ` sl-toast--${type}` : '');
  setTimeout(() => { t.className = 'sl-toast'; }, 2400);
}

// Atualiza um campo de um plano (usado nos inputs editáveis da Análise IA)
function updatePlanField(planId, field, value) {
  const p = getPlano(planId);
  if (!p) return;
  p[field] = value;
  // Limpa flag de origem IA quando humano edita
  const flagMap = {
    objeto: 'objeto_origem_ia',
    forma_ato_prevista: 'forma_ato_origem_ia',
    prazo_legal_dias: 'prazo_origem_ia',
  };
  if (flagMap[field]) p[flagMap[field]] = false;
  // Recalcula prazo limite se mudou prazo legal
  if (field === 'prazo_legal_dias' && p.data_publicacao_habilitante) {
    p.prazo_data = new Date(new Date(p.data_publicacao_habilitante).getTime() + value * 86400000).toISOString().slice(0,10);
  }
}

// Wizard navigation (3-step SmartLegis)
function wizardNext() {
  if (wizardState.step === 1 && !wizardState.diploma_habilitante) {
    toast('Selecione um diploma habilitante', 'error');
    return;
  }
  if (wizardState.step < 3) {
    wizardState.step++;
    app.rerender();
  }
}
function wizardBack() {
  if (wizardState.step > 1) {
    wizardState.step--;
    app.rerender();
  }
}

// ============ Wizard ============
function wizardCriar() {
  if (!wizardState.diploma_habilitante) { toast('Selecione um diploma', 'error'); return; }
  const d = getDiploma(wizardState.diploma_habilitante);
  const next = String(PLANOS.length + 1).padStart(5, '0');
  const novoId = `REG-${next}/XXIV/2026`;
  const titulo = wizardState.titulo || `Regulamentação de ${d.id}`;
  // Criar plano em estado 'proposto' com IA pendente
  const novoPlano = {
    id: novoId, titulo,
    tipo_origem: wizardState.tipo_origem,
    diploma_habilitante: d.id,
    state: 'proposto',
    ai_status: wizardState.correr_ia ? 'em_curso' : 'pendente',
    ai_provider: 'mock',
    ai_executed_at: new Date().toISOString().slice(0,16).replace('T',' '),
    ai_validated_by: null, ai_validated_at: null,
    ai_confianca: 0,
    ai_summary: '',
    objeto: '(a preencher pela IA…)',
    objeto_origem_ia: false, forma_ato_origem_ia: false, prazo_origem_ia: false,
    forma_ato_prevista: 'portaria',
    prazo_legal_dias: d.prazo_legal_dias,
    prazo_data: d.data_publicacao
      ? new Date(new Date(d.data_publicacao).getTime() + d.prazo_legal_dias * 86400000).toISOString().slice(0,10)
      : null,
    area_proponente: wizardState.tipo_origem === 'proponente_via_diploma' ? d.proponente : null,
    co_proponentes: [], adjunto_responsavel: 'Utilizador DAPL (DAPL)',
    entidades_externas: [], normas: [],
    approvals: [], versoes: [], edit_invitations: [],
    document_html: '',
    historico: [{ data: new Date().toISOString().slice(0,10), evento: 'Plano criado · análise IA disparada', autor: 'Utilizador DAPL' }],
    risco: 'low',
    aguarda_proponente: wizardState.tipo_origem !== 'proponente_via_diploma',
  };
  PLANOS.push(novoPlano);
  toast(`Plano ${novoId} criado · IA a correr…`, 'success');

  // Simular IA assíncrona após 1s
  if (wizardState.correr_ia) {
    setTimeout(() => {
      const result = mockAIAnalysis(d.id);
      novoPlano.ai_status = 'concluida';
      novoPlano.ai_confianca = result.confianca_global;
      novoPlano.ai_summary = result.raciocinio;
      novoPlano.objeto = result.objeto;
      novoPlano.objeto_origem_ia = true;
      novoPlano.forma_ato_prevista = result.forma_ato_sugerida;
      novoPlano.forma_ato_origem_ia = true;
      novoPlano.prazo_legal_dias = result.prazo_legal_dias;
      novoPlano.prazo_origem_ia = true;
      novoPlano.normas = result.normas_habilitantes;
      novoPlano.entidades_externas = result.entidades_externas_sugeridas;
      novoPlano.historico.push({
        data: new Date().toISOString().slice(0,10),
        evento: `🤖 Análise IA concluída (confiança ${(result.confianca_global*100).toFixed(0)}%)`,
        autor: 'Sistema',
      });
      app.rerender();
      toast(`🤖 Análise IA concluída · confiança ${(result.confianca_global*100).toFixed(0)}%`, 'success');
    }, 1500);
  }
  setTimeout(() => location.hash = `#/plano/${novoId}`, 700);
}

// ============ Ações no detalhe do plano ============
function validarIA(planoId) {
  const p = getPlano(planoId);
  if (!p) return;
  p.ai_status = 'validada';
  p.ai_validated_by = 'Utilizador DAPL (DAPL)';
  p.ai_validated_at = new Date().toISOString().slice(0,16).replace('T',' ');
  p.state = 'em_redacao';
  // Cria v0.1
  if (!p.versoes.length) {
    p.versoes.push({
      numero: 'v0.1', tipo: 'interna',
      data: new Date().toISOString().slice(0,10),
      autor: 'Utilizador DAPL', track_changes: 0,
      summary: 'Versão inicial gerada do template',
    });
  }
  if (!p.document_html) {
    p.document_html = `<h1>${getFormaAtoLabel(p.forma_ato_prevista)} n.º __/2026</h1><h2>Preâmbulo</h2><p>[a desenvolver]</p><h2>Articulado</h2><h3>Artigo 1.º · Objeto</h3><p>${escapeHtml(p.objeto)}</p>`;
  }
  p.historico.push({
    data: new Date().toISOString().slice(0,10),
    evento: '✅ Análise IA validada · em redação',
    autor: 'Utilizador DAPL',
  });
  toast('IA validada · plano em redação', 'success');
  app.rerender();
}

function rerunIA(planoId) {
  const p = getPlano(planoId);
  if (!p) return;
  p.ai_status = 'em_curso';
  app.rerender();
  toast('🤖 A re-correr análise IA...');
  setTimeout(() => {
    const result = mockAIAnalysis(p.diploma_habilitante);
    p.ai_status = 'concluida';
    p.ai_confianca = result.confianca_global;
    p.ai_summary = result.raciocinio;
    p.objeto = result.objeto; p.objeto_origem_ia = true;
    p.forma_ato_prevista = result.forma_ato_sugerida; p.forma_ato_origem_ia = true;
    p.prazo_legal_dias = result.prazo_legal_dias; p.prazo_origem_ia = true;
    p.normas = result.normas_habilitantes;
    p.historico.push({ data: new Date().toISOString().slice(0,10), evento: '🤖 IA re-executada', autor: 'Utilizador DAPL' });
    toast('🤖 IA atualizada', 'success');
    app.rerender();
  }, 1500);
}

function guardarVersao(planoId, autorRole='lead') {
  // autorRole: 'lead' | 'co' | 'externo'
  // Só edições do lead invalidam aprovações já dadas (decisão DAPL 2026-04-28)
  const p = getPlano(planoId);
  if (!p) return;
  if (p.state !== 'em_redacao' && p.state !== 'em_aprovacao') {
    toast('Só pode guardar em "Em Redação" ou "Em Aprovação"', 'error'); return;
  }
  const last = p.versoes[p.versoes.length-1]?.numero || 'v0.0';
  const [maj, min] = last.replace('v','').split('.');
  const next = `v${maj}.${parseInt(min)+1}`;
  const autorLabel = autorRole === 'lead' ? 'Utilizador DAPL (LEAD)'
                   : autorRole === 'co' ? 'Co-proponente · Sofia Lima'
                   : 'Externo · CEJURE';
  p.versoes.push({
    numero: next, tipo: 'interna',
    data: new Date().toISOString().slice(0,10),
    autor: autorLabel, track_changes: Math.floor(Math.random()*15),
    summary: `Save consolidado por ${autorRole === 'lead' ? 'lead' : autorRole}`,
  });
  p.historico.push({
    data: new Date().toISOString().slice(0,10),
    evento: `💾 Versão ${next} guardada (autor: ${autorRole})`,
    autor: autorLabel,
  });
  // Política: só edição do LEAD invalida aprovações
  if (p.state === 'em_aprovacao') {
    if (autorRole === 'lead') {
      p.approvals.forEach(a => { if (a.state === 'aprovado') { a.state = 'pendente'; a.approver = null; a.approved_at = null; }});
      p.state = 'em_redacao';
      p.historico.push({
        data: new Date().toISOString().slice(0,10),
        evento: '⚠️ LEAD alterou · aprovações invalidadas · plano volta a Em Redação',
        autor: 'Sistema',
      });
      toast(`${next} guardada · aprovações invalidadas (lead editou)`, 'success');
    } else {
      p.historico.push({
        data: new Date().toISOString().slice(0,10),
        evento: `ℹ️ ${autorRole} editou · aprovações mantidas (não é lead)`,
        autor: 'Sistema',
      });
      toast(`${next} guardada · aprovações mantidas (não é edição do lead)`, 'success');
    }
  } else {
    toast(`${next} guardada`, 'success');
  }
  app.rerender();
}

// Helpers para demonstração — simular edição de cada perfil
function guardarVersaoLead(planoId) { guardarVersao(planoId, 'lead'); }
function guardarVersaoCo(planoId) { guardarVersao(planoId, 'co'); }
function guardarVersaoExterno(planoId) { guardarVersao(planoId, 'externo'); }

function convidarEditor(planoId) {
  const p = getPlano(planoId);
  if (!p) return;
  const partner = prompt('Nome do ator externo:', 'CEJURE · Dr. Ferreira');
  if (!partner) return;
  const permissao = confirm('OK = edição (track changes), Cancelar = apenas comentar') ? 'edit' : 'comment_only';
  p.edit_invitations.push({
    partner, permissao, state: 'pendente',
    criado_em: new Date().toISOString().slice(0,10),
    submetido_em: null, result_versao: null,
  });
  p.historico.push({ data: new Date().toISOString().slice(0,10), evento: `✉️ Convite de ${permissao} enviado a ${partner}`, autor: 'Utilizador DAPL' });
  toast(`Convite enviado a ${partner}`, 'success');
  app.rerender();
}

function submeterAprovacao(planoId) {
  const p = getPlano(planoId);
  if (!p) return;
  if (!p.versoes.length) { toast('Sem versão para aprovar', 'error'); return; }
  // Sincroniza linhas de aprovação
  const proponentes = [p.area_proponente, ...(p.co_proponentes || [])].filter(Boolean);
  if (!proponentes.length) { toast('Defina proponentes primeiro', 'error'); return; }
  p.approvals = proponentes.map((cid, i) => ({
    company_id: cid, is_lead: i === 0, state: 'pendente',
    approver: null, approved_at: null, notes: '',
  }));
  p.state = 'em_aprovacao';
  p.historico.push({ data: new Date().toISOString().slice(0,10), evento: `🗳️ Submetido a aprovação · ${proponentes.length} proponentes`, autor: 'Utilizador DAPL' });
  toast(`Submetido · aguarda ${proponentes.length} aprovações`, 'success');
  app.rerender();
}

function devolverRedacao(planoId) {
  const p = getPlano(planoId);
  if (!p) return;
  p.approvals.forEach(a => { a.state = 'pendente'; a.approver = null; a.approved_at = null; });
  p.state = 'em_redacao';
  p.historico.push({ data: new Date().toISOString().slice(0,10), evento: '↩️ Devolvido à redação · aprovações invalidadas', autor: 'Utilizador DAPL' });
  toast('Devolvido à redação', 'success');
  app.rerender();
}

function aprovar(planoId, idx) {
  const p = getPlano(planoId);
  if (!p) return;
  const a = p.approvals[idx];
  if (a.state !== 'pendente') { toast('Já tratado', 'error'); return; }
  const notes = prompt('Notas / reservas (opcional):', '') || '';
  a.state = 'aprovado';
  a.approver = 'Utilizador DAPL';
  a.approved_at = new Date().toISOString().slice(0,16).replace('T',' ');
  a.notes = notes;
  p.historico.push({ data: new Date().toISOString().slice(0,10), evento: `✓ Aprovação ${getArea(a.company_id)?.sigla}`, autor: 'Utilizador DAPL' });
  // Verificar se todos aprovaram
  const todos = p.approvals.every(x => x.state === 'aprovado');
  if (todos) {
    p.state = 'aprovado';
    p.historico.push({ data: new Date().toISOString().slice(0,10), evento: '✅ Todos aprovaram · plano em estado APROVADO', autor: 'Sistema' });
    toast(`${getArea(a.company_id)?.sigla} aprovou · TODOS aprovaram → estado APROVADO`, 'success');
  } else {
    const aprovs = p.approvals.filter(x => x.state === 'aprovado').length;
    toast(`${getArea(a.company_id)?.sigla} aprovou (${aprovs}/${p.approvals.length})`, 'success');
  }
  app.rerender();
}

function rejeitar(planoId, idx) {
  const p = getPlano(planoId);
  if (!p) return;
  const a = p.approvals[idx];
  const motivo = prompt('Motivo da rejeição (obrigatório):');
  if (!motivo || !motivo.trim()) { toast('Motivo obrigatório', 'error'); return; }
  a.state = 'rejeitado';
  a.approver = 'Utilizador DAPL';
  a.notes = motivo;
  // Outras aprovações voltam a pendente; estado vai para em_redacao
  p.approvals.forEach(x => { if (x !== a && x.state === 'aprovado') { x.state = 'pendente'; x.approver = null; }});
  p.state = 'em_redacao';
  p.historico.push({ data: new Date().toISOString().slice(0,10), evento: `✗ Rejeição ${getArea(a.company_id)?.sigla} · ${motivo}`, autor: 'Utilizador DAPL' });
  toast(`Rejeitado · plano devolvido à redação`, 'error');
  app.rerender();
}

function enviarPublicacao(planoId) {
  const p = getPlano(planoId);
  if (!p) return;
  p.state = 'publicado';
  p.versoes.push({
    numero: 'v1.0-final', tipo: 'aprovada',
    data: new Date().toISOString().slice(0,10),
    autor: 'Sistema', track_changes: 0,
    summary: 'Versão final assinada e submetida ao DRE',
  });
  p.historico.push({ data: new Date().toISOString().slice(0,10), evento: '📤 Submetido ao DRE para publicação', autor: 'Utilizador DAPL' });
  toast('Submetido ao DRE', 'success');
  app.rerender();
}

function navegarPlano(delta) {
  const parts = location.hash.replace(/^#\//,'').split('/').filter(Boolean);
  if (parts[0] !== 'plano' || parts.length < 4) return;
  const id = parts.slice(1, 4).join('/');
  const tab = parts[4] || 'visao';
  const idx = PLANOS.findIndex(p => p.id === id);
  if (idx === -1) return;
  const novoIdx = (idx + delta + PLANOS.length) % PLANOS.length;
  location.hash = `#/plano/${PLANOS[novoIdx].id}/${tab}`;
}

// ============ Vista DSAAG ============
function varrerDR() {
  toast('🔍 A varrer Diário da República...');
  setTimeout(() => {
    const ja = new Set(DIPLOMAS_VARRIDOS.map(d => d.id));
    const semPlano = DIPLOMAS.filter(d => d.estado === 'Publicado' && !d.tem_plano_regulamentacao && !ja.has(d.id));
    if (!semPlano.length) {
      toast('Sem novos diplomas. 🎉', 'success');
    } else {
      DIPLOMAS_VARRIDOS = [...DIPLOMAS_VARRIDOS, ...semPlano];
      toast(`Detetados ${semPlano.length} novos diplomas`, 'success');
      app.rerender();
    }
  }, 800);
}

function dsaagAceitar(diplomaId) {
  DIPLOMAS_VARRIDOS = DIPLOMAS_VARRIDOS.filter(d => d.id !== diplomaId);
  // Pré-popular wizard e ir
  wizardState = {
    diploma_habilitante: diplomaId, origem_diploma: 'publicado',
    tipo_origem: 'dsaag_manual', titulo: '', correr_ia: true,
  };
  toast('Diploma aceite · IA será disparada...', 'success');
  setTimeout(() => location.hash = '#/plano/novo', 500);
}

function dsaagAtribuir(diplomaId) {
  const d = getDiploma(diplomaId);
  if (!d) return;
  DIPLOMAS_VARRIDOS = DIPLOMAS_VARRIDOS.filter(x => x.id !== diplomaId);
  const next = String(PLANOS.length + 1).padStart(5, '0');
  const novoId = `REG-${next}/XXIV/2026`;
  const novoPlano = {
    id: novoId, titulo: `Regulamentação de ${d.id}`,
    tipo_origem: 'dsaag_manual', diploma_habilitante: d.id,
    state: 'proposto', ai_status: 'em_curso', ai_provider: 'mock',
    ai_confianca: 0, ai_summary: '',
    objeto: '(a preencher pela IA...)',
    forma_ato_prevista: 'portaria',
    prazo_legal_dias: d.prazo_legal_dias,
    prazo_data: d.data_publicacao ? new Date(new Date(d.data_publicacao).getTime() + d.prazo_legal_dias * 86400000).toISOString().slice(0,10) : null,
    area_proponente: d.proponente,
    co_proponentes: [], adjunto_responsavel: null,
    entidades_externas: [], normas: [], approvals: [], versoes: [], edit_invitations: [],
    document_html: '',
    historico: [
      { data: new Date().toISOString().slice(0,10), evento: 'Plano criado pela DSAAG · proponente atribuído', autor: 'Utilizador DAPL (DSAAG)' },
    ],
    risco: 'low', aguarda_proponente: false,
  };
  PLANOS.push(novoPlano);
  // Simular IA
  setTimeout(() => {
    const result = mockAIAnalysis(d.id);
    Object.assign(novoPlano, {
      ai_status: 'concluida', ai_confianca: result.confianca_global,
      ai_summary: result.raciocinio,
      objeto: result.objeto, objeto_origem_ia: true,
      forma_ato_prevista: result.forma_ato_sugerida, forma_ato_origem_ia: true,
      prazo_legal_dias: result.prazo_legal_dias, prazo_origem_ia: true,
      normas: result.normas_habilitantes,
    });
    novoPlano.historico.push({ data: new Date().toISOString().slice(0,10), evento: `🤖 IA concluída (${(result.confianca_global*100).toFixed(0)}%)`, autor: 'Sistema' });
    app.rerender();
  }, 1500);
  toast(`Plano ${novoId} criado · ${getArea(d.proponente)?.sigla} notificado`, 'success');
  app.rerender();
}

function dsaagDispensar(diplomaId) {
  DIPLOMAS_VARRIDOS = DIPLOMAS_VARRIDOS.filter(d => d.id !== diplomaId);
  toast('Dispensa registada (mock)');
  app.rerender();
}

function tratarAlerta(alertId) {
  const a = ALERTAS.find(x => x.id === alertId);
  if (!a) return;
  a.tratado_em = new Date().toISOString().slice(0,16).replace('T',' ');
  a.tratado_por = 'Utilizador DAPL (DSAAG)';
  a.acao_tomada = 'criar_plano';
  toast('Alerta tratado');
  app.rerender();
}

function atribuirProponente(planoId) {
  const p = getPlano(planoId);
  if (!p) return;
  const sigla = prompt('Sigla da área proponente (ex.: METD, MAAC, MP):', 'MP');
  if (!sigla) return;
  const area = AREAS_GOVERNATIVAS.find(a => a.sigla.toLowerCase() === sigla.toLowerCase());
  if (!area) { toast('Não encontrado', 'error'); return; }
  p.area_proponente = area.id;
  p.aguarda_proponente = false;
  p.adjunto_responsavel = `Adjunto ${area.sigla}`;
  p.historico.push({ data: new Date().toISOString().slice(0,10), evento: `Proponente atribuído: ${area.nome}`, autor: 'Utilizador DAPL (DSAAG)' });
  toast(`${area.sigla} atribuído`, 'success');
  app.rerender();
}
