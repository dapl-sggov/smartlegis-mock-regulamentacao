// SmartLegis · Módulo de Regulamentação · Vistas v0.4
// Adaptado pixel-a-pixel ao SmartLegis real:
// - Cores: #F2784B (primary laranja), #3A529C (azul/roxo), #36D7B7 (turquesa wizard)
// - Botões pill 19.5px
// - H1 form centrado 26px
// - Secções colapsáveis com header azul/roxo (em vez de chatter)
// - Statusbar escondida (apenas label "Situação")
// - Terminologia exata: "Está em:", "Ação ▼", "Avançar", "Gravar e sair", "Ver Capa"

// ============ Helpers ============
function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function pillEstado(estadoKey) {
  const map = {
    proposto:     ['Proposto', 'sl-pill--blue'],
    em_redacao:   ['Em Redação', 'sl-pill--orange'],
    em_aprovacao: ['Em Aprovação', 'sl-pill--warn'],
    aprovado:     ['Aprovado', 'sl-pill--green'],
    publicado:    ['Publicado', 'sl-pill--green'],
    dispensado:   ['Dispensado', 'sl-pill--grey'],
    cancelado:    ['Cancelado', 'sl-pill--red'],
  };
  const [label, cls] = map[estadoKey] || [estadoKey, 'sl-pill--grey'];
  return `<span class="sl-pill ${cls}">${label}</span>`;
}
function pillAI(status) {
  const labels = {
    pendente:  ['🤖 Pendente',  'sl-pill--grey'],
    em_curso:  ['🤖 Em curso',  'sl-pill--blue'],
    concluida: ['🤖 Concluída', 'sl-pill--warn'],
    falhou:    ['🤖 Falhou',    'sl-pill--red'],
    validada:  ['🤖 Validada',  'sl-pill--green'],
  };
  const [label, cls] = labels[status] || ['—', 'sl-pill--grey'];
  return `<span class="sl-pill ${cls}">${label}</span>`;
}
function pillApproval(state) {
  const map = {
    pendente:  ['Pendente', 'sl-pill--grey'],
    aprovado:  ['✓ Aprovado', 'sl-pill--green'],
    rejeitado: ['✗ Rejeitado', 'sl-pill--red'],
  };
  const [label, cls] = map[state] || ['—', 'sl-pill--grey'];
  return `<span class="sl-pill ${cls}">${label}</span>`;
}
function badgeIA() {
  return `<span class="sl-pill sl-pill--blue" style="margin-left:6px" title="Preenchido por IA">🤖</span>`;
}
function riskDot(level) { return `<span class="sl-risk sl-risk--${level}"></span>`; }
function fmtDays(d) {
  if (d === null || d === undefined) return '—';
  if (d < 0) return `<span style="color:var(--sl-danger);font-weight:600">${d}d (excedido)</span>`;
  if (d <= 30) return `<span style="color:var(--sl-warn);font-weight:600">${d}d</span>`;
  return `${d}d`;
}

// Control Panel (SmartLegis style: breadcrumb à esquerda + ações à direita + pager)
function renderControlPanel(opts) {
  const bc = opts.breadcrumb || 'Dashboard';
  return `
    <div class="sl-cp">
      <div class="sl-cp__breadcrumb">
        Está em: ${bc}
      </div>
      <div class="sl-cp__buttons">${opts.buttons || ''}</div>
      <div class="sl-cp__right">
        ${opts.search || ''}
        ${opts.pager || ''}
        ${opts.actions || ''}
      </div>
    </div>
  `;
}

// Secção colapsável (em vez de chatter Odoo)
function renderSection(title, content, opts={}) {
  const id = opts.id || `sec-${Math.random().toString(36).slice(2,8)}`;
  const open = opts.open ? 'sl-section--open' : '';
  return `
    <div class="sl-section ${open}" id="${id}">
      <div class="sl-section__header" onclick="toggleSection('${id}')">
        <span>${title}</span>
        <span class="sl-section__chevron">▾</span>
      </div>
      <div class="sl-section__body">${content}</div>
    </div>
  `;
}

// ============ Dashboard ============
function viewDashboard() {
  const ativos = PLANOS.filter(p => !['publicado','dispensado','cancelado'].includes(p.state)).length;
  const iaPendente = PLANOS.filter(p => p.state === 'proposto' && p.ai_status === 'concluida').length;
  const emAprovacao = PLANOS.filter(p => p.state === 'em_aprovacao').length;
  const semProponente = PLANOS.filter(p => p.aguarda_proponente).length;

  return `
    ${renderControlPanel({
      breadcrumb: 'Dashboard',
      buttons: `<a href="#/plano/novo" class="sl-btn sl-btn--primary">Criar</a>`,
    })}

    <div class="sl-card-grid">
      <div class="sl-card">
        <div class="sl-card__number">${PLANOS.filter(p=>p.state!=='publicado').length}</div>
        <h2 class="sl-card__title">MEUS PLANOS</h2>
        <hr>
        <a href="#/planos" class="sl-btn sl-btn--secondary">Ver Todos</a>
      </div>
      <div class="sl-card">
        <div class="sl-card__number">${PLANOS.length}</div>
        <h2 class="sl-card__title">REGULAMENTAÇÃO</h2>
        <hr>
        <a href="#/planos" class="sl-btn sl-btn--secondary">Ver Todos</a>
      </div>
      <div class="sl-card">
        <div class="sl-card__number">${iaPendente}</div>
        <h2 class="sl-card__title" style="font-size:13px">🤖 IA POR VALIDAR</h2>
        <hr>
        <a href="#/dsaag" class="sl-btn sl-btn--secondary">Ver Todos</a>
      </div>
      <div class="sl-card">
        <div class="sl-card__number">${emAprovacao}</div>
        <h2 class="sl-card__title" style="font-size:13px">EM APROVAÇÃO</h2>
        <hr>
        <a href="#/planos" class="sl-btn sl-btn--secondary">Ver Todos</a>
      </div>
      <div class="sl-card">
        <div class="sl-card__number">${semProponente}</div>
        <h2 class="sl-card__title" style="font-size:13px">SEM PROPONENTE</h2>
        <hr>
        <a href="#/dsaag" class="sl-btn sl-btn--secondary">Ver Todos</a>
      </div>
    </div>

    <div style="max-width:1140px; margin:0 auto; padding:0 24px 24px">
      ${renderSection('Planos Recentes', `
        <table class="sl-table">
          <thead><tr>
            <th>Número</th><th>Título</th><th>IA</th><th>Estado</th><th>Aprovações</th><th>Prazo</th>
          </tr></thead>
          <tbody>
            ${PLANOS.map(p => {
              const total = p.approvals?.length || 0;
              const aprovs = p.approvals?.filter(a => a.state === 'aprovado').length || 0;
              return `
                <tr onclick="location.hash='#/plano/${p.id}'">
                  <td><strong>${p.id}</strong></td>
                  <td>${escapeHtml(p.titulo)}</td>
                  <td>${pillAI(p.ai_status)}</td>
                  <td>${pillEstado(p.state)}</td>
                  <td>${total ? `${aprovs}/${total}` : '—'}</td>
                  <td>${riskDot(p.risco)} ${fmtDays(diasAteData(p.prazo_data))}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `, {open: true})}
    </div>
  `;
}

// ============ Lista de planos ============
function viewPlanos() {
  return `
    ${renderControlPanel({
      breadcrumb: '<a href="#/dashboard">Dashboard</a><span class="sl-cp__breadcrumb-sep">›</span> Planos de Regulamentação',
      buttons: `<a href="#/plano/novo" class="sl-btn sl-btn--primary">Criar</a>`,
      search: `<div class="sl-searchbox" style="width:377px"><input placeholder="Procurar..."><span style="color:var(--sl-text-muted)">🔍</span></div>`,
      actions: `
        <button class="sl-filter-pill">▼ Filtros</button>
        <button class="sl-filter-pill">≡ Agrupar por</button>
      `,
      pager: `<div class="sl-pager"><span>1-${PLANOS.length} / ${PLANOS.length}</span><button class="sl-pager__nav">‹</button><button class="sl-pager__nav">›</button></div>`,
    })}
    <div style="padding:0">
      <div class="sl-table-wrap" style="border-radius:0;border-left:0;border-right:0">
        <table class="sl-table">
          <thead><tr>
            <th style="width:34px"><input type="checkbox"></th>
            <th>Número</th><th>Título</th><th>Diploma habilitante</th><th>IA</th><th>Proponente</th>
            <th>Forma de ato</th><th>Estado</th><th>Aprov.</th><th>Prazo</th>
          </tr></thead>
          <tbody>
            ${PLANOS.map(p => {
              const a = getArea(p.area_proponente);
              const total = p.approvals?.length || 0;
              const aprovs = p.approvals?.filter(x => x.state === 'aprovado').length || 0;
              return `
                <tr onclick="location.hash='#/plano/${p.id}'">
                  <td onclick="event.stopPropagation()"><input type="checkbox"></td>
                  <td><strong>${p.id}</strong></td>
                  <td>${escapeHtml(p.titulo)}</td>
                  <td>${p.diploma_habilitante}</td>
                  <td>${pillAI(p.ai_status)}</td>
                  <td>${a ? a.sigla : '<em class="sl-text-muted">—</em>'}</td>
                  <td>${getFormaAtoLabel(p.forma_ato_prevista)}</td>
                  <td>${pillEstado(p.state)}</td>
                  <td>${total ? `<strong>${aprovs}/${total}</strong>` : '—'}</td>
                  <td>${riskDot(p.risco)} ${fmtDays(diasAteData(p.prazo_data))}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============ Detalhe do plano ============
function viewPlanoDetalhe(planoId, tab='dados') {
  const p = getPlano(planoId);
  if (!p) return `${renderControlPanel({breadcrumb:'Plano não encontrado'})}<div class="sl-empty">🤷 ${planoId}</div>`;
  const dipl = getDiploma(p.diploma_habilitante);
  const area = getArea(p.area_proponente);
  const dias = diasAteData(p.prazo_data);

  // Tabs do notebook (estilo SmartLegis: "Dados do procedimento", "Análise IA", etc.)
  const tabs = [
    ['dados', 'Dados do procedimento'],
    ['ia', 'Análise IA'],
    ['documento', 'Documento'],
    ['normas', 'Normas a Regulamentar'],
    ['acessos', 'Acessos Temporários'],
  ];

  let tabBody = '';
  switch(tab) {
    case 'ia': tabBody = renderTabIA(p); break;
    case 'documento': tabBody = renderTabDocumento(p); break;
    case 'normas': tabBody = renderTabNormas(p); break;
    case 'acessos': tabBody = renderTabAcessos(p); break;
    default: tabBody = renderTabDados(p, dipl, area);
  }

  // Botão principal contextual
  let actionButtons = '';
  if (p.state === 'proposto') {
    if (p.ai_status === 'concluida' || p.ai_status === 'falhou') {
      actionButtons = `<button class="sl-btn sl-btn--primary" onclick="validarIA('${p.id}')">Validar IA</button>`;
    } else {
      actionButtons = `<button class="sl-btn sl-btn--secondary" onclick="rerunIA('${p.id}')">Re-correr IA</button>`;
    }
    if (p.aguarda_proponente) {
      actionButtons = `<button class="sl-btn sl-btn--primary" onclick="atribuirProponente('${p.id}')">Atribuir Proponente</button>` + actionButtons;
    }
  } else if (p.state === 'em_redacao') {
    actionButtons = `<button class="sl-btn sl-btn--primary" onclick="submeterAprovacao('${p.id}')">Submeter à Aprovação</button>`;
  } else if (p.state === 'em_aprovacao') {
    actionButtons = `<button class="sl-btn sl-btn--secondary" onclick="devolverRedacao('${p.id}')">Devolver</button>`;
  } else if (p.state === 'aprovado') {
    actionButtons = `<button class="sl-btn sl-btn--primary" onclick="enviarPublicacao('${p.id}')">Enviar para Publicação</button>`;
  }

  // Banner contextual
  let banner = '';
  if (p.ai_status === 'em_curso') {
    banner = `<div class="sl-banner"><div>🤖</div><div><strong>Análise IA em curso…</strong> Aguarde — os campos serão pré-preenchidos automaticamente.</div></div>`;
  } else if (p.state === 'proposto' && p.ai_status === 'concluida') {
    banner = `<div class="sl-banner sl-banner--warn"><div>🤖</div><div><strong>Análise IA concluída · confiança ${(p.ai_confianca * 100).toFixed(0)}%.</strong> Reveja os campos com 🤖 e clique em <em>Validar IA</em>.</div></div>`;
  } else if (p.state === 'em_aprovacao') {
    const total = p.approvals.length;
    const aprovs = p.approvals.filter(a => a.state === 'aprovado').length;
    banner = `<div class="sl-banner sl-banner--warn"><div>🗳️</div><div><strong>Em aprovação multi-proponente · ${aprovs}/${total} aprovaram.</strong> Todos os proponentes têm de aprovar para fechar.</div></div>`;
  } else if (p.state === 'aprovado') {
    banner = `<div class="sl-banner sl-banner--success"><div>✅</div><div><strong>Aprovado por todos os proponentes.</strong> Pronto para envio ao DRE.</div></div>`;
  }

  const idx = PLANOS.findIndex(x => x.id === p.id);

  // Action menu items (estilo SmartLegis "Ação ▼")
  const acaoItems = [
    'Audições', 'Pedir Parecer Prévio', 'Retomar Procedimento',
    'Alterar Gabinete Proponente', 'Revisão de Diploma',
    'Alterar adjunto responsável', 'Alterar adjuntos co-responsáveis',
    'Devolver ao proponente', 'Adic./Rem. Favoritos',
    'Arquivar Procedimento', 'Exportar Capa', 'Exportar Nota Justificativa',
  ];

  return `
    ${renderControlPanel({
      breadcrumb: `<a href="#/dashboard">Dashboard</a><span class="sl-cp__breadcrumb-sep">›</span> <a href="#/planos">Regulamentação</a><span class="sl-cp__breadcrumb-sep">›</span> ${p.id}`,
      buttons: actionButtons,
      pager: `<div class="sl-pager">
        <span>${idx+1} / ${PLANOS.length}</span>
        <button class="sl-pager__nav" onclick="navegarPlano(-1)">‹</button>
        <button class="sl-pager__nav" onclick="navegarPlano(1)">›</button>
      </div>`,
      actions: `
        <div style="position:relative">
          <button class="sl-btn sl-btn--secondary" onclick="toggleAcao(event)">Ação ▾</button>
          <div class="sl-dropdown" id="acao-dropdown" style="right:0;top:100%">
            ${acaoItems.map(a => `<a class="sl-dropdown__item" onclick="toast('${a} (mock)')">${a}</a>`).join('')}
          </div>
        </div>
      `,
    })}

    <div class="sl-form-bg">
      <div class="sl-form-sheet">
        ${banner}

        <h1 class="sl-form__title">${escapeHtml(p.titulo)}</h1>
        <div class="sl-form__subtitle">${p.id} · Diploma habilitante: ${p.diploma_habilitante} · ${pillAI(p.ai_status)}</div>

        <!-- Notebook (tabs) -->
        <div class="sl-notebook">
          <div class="sl-notebook__tabs">
            ${tabs.map(([k, l]) => `
              <button class="sl-notebook__tab ${tab === k ? 'sl-notebook__tab--active' : ''}"
                      onclick="location.hash='#/plano/${p.id}/${k}'">${l}</button>
            `).join('')}
          </div>
          <div class="sl-notebook__page">${tabBody}</div>
        </div>

        <!-- Secções colapsáveis (estilo SmartLegis real, em vez de chatter) -->
        ${renderSection('🗳️ APROVAÇÕES', renderSeccaoAprovacoes(p), {open: p.state === 'em_aprovacao' || p.state === 'aprovado'})}
        ${renderSection('📚 VERSÕES DO DOCUMENTO', renderSeccaoVersoes(p), {open: false})}
        ${renderSection('✉️ EDIÇÃO EXTERNA', renderSeccaoEdicaoExterna(p), {open: false})}
        ${renderSection('📅 HISTÓRICO DE EVENTOS', renderSeccaoHistorico(p), {open: false})}
        ${renderSection('💬 COMENTÁRIOS', renderSeccaoComentarios(p), {open: false})}
        ${renderSection('🔒 PERMISSÕES', renderSeccaoPermissoes(p), {open: false})}
      </div>
    </div>
  `;
}

function renderTabDados(p, dipl, area) {
  return `
    <div class="sl-form__row">
      <div class="sl-form__field">
        <label class="sl-form__label sl-form__label--required">Número</label>
        <div class="sl-form__value">${p.id}</div>
      </div>
      <div class="sl-form__field">
        <label class="sl-form__label sl-form__label--required">Título</label>
        <div class="sl-form__value">${escapeHtml(p.titulo)}</div>
      </div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field">
        <label class="sl-form__label">Diploma Habilitante</label>
        <div class="sl-form__value"><strong>${p.diploma_habilitante}</strong>${dipl ? ` · ${escapeHtml(dipl.sumario.substring(0,60))}…` : ''}</div>
      </div>
      <div class="sl-form__field">
        <label class="sl-form__label">Origem</label>
        <div class="sl-form__value">${p.tipo_origem.replace(/_/g, ' ')}</div>
      </div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field">
        <label class="sl-form__label sl-form__label--required">Forma de Ato Prevista</label>
        <div class="sl-form__value">${getFormaAtoLabel(p.forma_ato_prevista)}${p.forma_ato_origem_ia && p.ai_status !== 'validada' ? badgeIA() : ''}</div>
      </div>
      <div class="sl-form__field">
        <label class="sl-form__label">Prazo Legal</label>
        <div class="sl-form__value">${p.prazo_legal_dias} dias${p.prazo_origem_ia && p.ai_status !== 'validada' ? badgeIA() : ''}</div>
      </div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field">
        <label class="sl-form__label">Prazo Limite</label>
        <div class="sl-form__value">${p.prazo_data || '—'} <span class="sl-text-muted">(${fmtDays(diasAteData(p.prazo_data))})</span></div>
      </div>
      <div class="sl-form__field">
        <label class="sl-form__label">Risco</label>
        <div class="sl-form__value">${riskDot(p.risco)} ${p.risco === 'low' ? 'Baixo' : p.risco === 'mid' ? 'Médio' : 'Alto'}</div>
      </div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field">
        <label class="sl-form__label">Área Governativa Proponente</label>
        <div class="sl-form__value">${area ? `<strong>${area.sigla}</strong> · ${area.nome}` : '<em class="sl-text-muted">não atribuída</em>'}</div>
      </div>
      <div class="sl-form__field">
        <label class="sl-form__label">Adjunto Responsável</label>
        <div class="sl-form__value">${p.adjunto_responsavel || '—'}</div>
      </div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field sl-form__field--full">
        <label class="sl-form__label">Co-proponente(s)</label>
        <div class="sl-form__value">${p.co_proponentes?.map(c => `<span class="sl-pill sl-pill--blue" style="margin-right:4px">${getArea(c)?.sigla}</span>`).join('') || '—'}</div>
      </div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field sl-form__field--full">
        <label class="sl-form__label sl-form__label--required">Objeto da Regulamentação${p.objeto_origem_ia && p.ai_status !== 'validada' ? badgeIA() : ''}</label>
        <div class="sl-form__value" style="white-space:normal">${escapeHtml(p.objeto)}</div>
      </div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field sl-form__field--full">
        <label class="sl-form__label">Situação</label>
        <div class="sl-form__value">${pillEstado(p.state)}</div>
      </div>
    </div>
    <div class="sl-mt-16">
      <a class="sl-btn sl-btn--primary" onclick="toast('Ver Capa (mock)')">Ver Capa</a>
    </div>
  `;
}

function renderTabIA(p) {
  return `
    <div class="sl-form__row">
      <div class="sl-form__field">
        <label class="sl-form__label">Estado IA</label>
        <div class="sl-form__value">${pillAI(p.ai_status)}</div>
      </div>
      <div class="sl-form__field">
        <label class="sl-form__label">Provedor</label>
        <div class="sl-form__value">${p.ai_provider || '—'} (Anthropic Claude)</div>
      </div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field">
        <label class="sl-form__label">Confiança</label>
        <div class="sl-form__value">${(p.ai_confianca * 100).toFixed(0)}%</div>
      </div>
      <div class="sl-form__field">
        <label class="sl-form__label">Validada Por</label>
        <div class="sl-form__value">${p.ai_validated_by || '<em class="sl-text-muted">— por validar —</em>'}</div>
      </div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field sl-form__field--full">
        <label class="sl-form__label">Sumário do Raciocínio</label>
        <div class="sl-form__value" style="white-space:normal;background:var(--sl-info-bg);padding:8px 12px;border-bottom:0;border-radius:var(--sl-radius-sm)">
          ${p.ai_summary ? escapeHtml(p.ai_summary) : '<em class="sl-text-muted">Sem análise.</em>'}
        </div>
      </div>
    </div>
    <h2 class="sl-h2">Campos pré-preenchidos pela IA</h2>
    <table class="sl-table sl-table--inline">
      <thead><tr><th>Campo</th><th>Valor</th><th>Origem</th></tr></thead>
      <tbody>
        <tr><td>Forma de ato</td><td>${getFormaAtoLabel(p.forma_ato_prevista)}</td><td>${p.forma_ato_origem_ia ? '🤖 IA' : '👤'}</td></tr>
        <tr><td>Prazo legal</td><td>${p.prazo_legal_dias}d</td><td>${p.prazo_origem_ia ? '🤖 IA' : '👤'}</td></tr>
        <tr><td>Objeto</td><td>${escapeHtml((p.objeto || '').substring(0,100))}</td><td>${p.objeto_origem_ia ? '🤖 IA' : '👤'}</td></tr>
        <tr><td>Normas</td><td>${p.normas?.length || 0}</td><td>🤖 ${p.normas?.filter(n => n.detetada_por_ia).length || 0} por IA</td></tr>
      </tbody>
    </table>
    ${p.state === 'proposto' && (p.ai_status === 'concluida' || p.ai_status === 'falhou') ? `
      <div class="sl-banner sl-banner--warn sl-mt-16">
        <div>👤</div>
        <div>
          <strong>Validação humana necessária.</strong>
          Reveja os campos sugeridos pela IA. Pode editar antes de validar.
          <div class="sl-mt-8">
            <button class="sl-btn sl-btn--primary" onclick="validarIA('${p.id}')">Validar e Iniciar Redação</button>
          </div>
        </div>
      </div>
    ` : ''}
  `;
}

function renderTabDocumento(p) {
  if (p.state === 'proposto') {
    return `<div class="sl-empty"><div class="sl-empty__icon">📄</div><div class="sl-empty__text"><strong>Sem documento ainda</strong>Documento criado ao validar a análise IA.</div></div>`;
  }
  const ultima = p.versoes?.[p.versoes.length-1]?.numero || 'v0.0';
  return `
    <div class="sl-banner">
      <div>📄</div>
      <div>
        <strong>Editor com track changes (ONLYOFFICE).</strong>
        Versão atual: <code>${ultima}</code>. Cada save consolidado gera nova versão.
        ${p.state !== 'em_redacao' ? `<br><em>Documento bloqueado para edição (estado: ${pillEstado(p.state)}).</em>` : ''}
      </div>
    </div>
    <div class="sl-flex-between sl-mb-8">
      <div class="sl-flex">
        <button class="sl-btn sl-btn--secondary" disabled>🔍 Track Changes ON</button>
        <button class="sl-btn sl-btn--primary" onclick="guardarVersaoLead('${p.id}')">Guardar (LEAD)</button>
        <button class="sl-btn sl-btn--secondary" onclick="guardarVersaoCo('${p.id}')">Guardar (Co-prop.)</button>
        <button class="sl-btn sl-btn--secondary" onclick="guardarVersaoExterno('${p.id}')">Guardar (Externo)</button>
        <button class="sl-btn sl-btn--secondary" onclick="convidarEditor('${p.id}')">Convidar Editor Externo</button>
        <button class="sl-btn sl-btn--secondary" onclick="toast('Export DOCX (mock)')">Export DOCX</button>
      </div>
      <span class="sl-text-muted" style="font-size:11px">Última edição: ${p.versoes?.[p.versoes.length-1]?.data || '—'}</span>
    </div>
    <div class="sl-text-muted sl-mb-8" style="font-size:11px">
      <em>Política de invalidação: <strong>só edições do LEAD</strong> em "Em Aprovação" invalidam aprovações dadas. Decisão DAPL.</em>
    </div>
    <div style="border:1px solid var(--sl-border);border-radius:var(--sl-radius-sm);background:var(--sl-bg-card);padding:24px 32px;min-height:400px;font-family:Georgia,serif;font-size:14px;line-height:1.6;${p.state !== 'em_redacao' ? 'opacity:0.7' : ''}">
      ${p.document_html || '<em class="sl-text-muted">Documento vazio.</em>'}
    </div>
  `;
}

function renderTabNormas(p) {
  return `
    <table class="sl-table sl-table--inline">
      <thead><tr><th>Referência</th><th>Descrição</th><th>Origem</th><th>Estado</th></tr></thead>
      <tbody>
        ${(p.normas || []).map(n => `
          <tr>
            <td><strong>${n.ref}</strong></td>
            <td>${escapeHtml(n.desc)}</td>
            <td>${n.detetada_por_ia ? '🤖 IA' : '👤'}</td>
            <td>${pillEstado(n.estado === 'em_redacao' ? 'em_redacao' : n.estado === 'concluida' ? 'aprovado' : 'proposto')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderTabAcessos(p) {
  return `<div class="sl-empty"><div class="sl-empty__icon">🔒</div><div class="sl-empty__text">Sem acessos temporários configurados.</div></div>`;
}

// ============ Secções colapsáveis (em vez de chatter) ============
function renderSeccaoAprovacoes(p) {
  if (!p.approvals?.length) {
    return `<div class="sl-text-muted">Sem aprovações ainda. Aprovações são criadas ao submeter à aprovação.</div>`;
  }
  const total = p.approvals.length;
  const aprovs = p.approvals.filter(a => a.state === 'aprovado').length;
  const pct = Math.round(100 * aprovs / total);
  return `
    <div class="sl-progress sl-mb-8"><div class="sl-progress__bar" style="width:${pct}%"></div></div>
    <div class="sl-text-muted sl-mb-16" style="font-size:12px">${aprovs}/${total} aprovaram (${pct}%)</div>
    <table class="sl-table sl-table--inline">
      <thead><tr><th>Gabinete</th><th>Tipo</th><th>Estado</th><th>Aprovou</th><th>Em</th><th>Notas</th><th>Ações</th></tr></thead>
      <tbody>
        ${p.approvals.map((a, idx) => `
          <tr>
            <td><strong>${getArea(a.company_id)?.sigla || a.company_id}</strong></td>
            <td>${a.is_lead ? '<span class="sl-approval-row__lead-badge">LEAD</span>' : '<span class="sl-pill sl-pill--grey">CO</span>'}</td>
            <td>${pillApproval(a.state)}</td>
            <td>${a.approver || '—'}</td>
            <td>${a.approved_at || '—'}</td>
            <td><div style="max-width:180px;font-size:11px;color:var(--sl-text-muted)">${escapeHtml(a.notes || '')}</div></td>
            <td>
              ${a.state === 'pendente' && p.state === 'em_aprovacao' ? `
                <button class="sl-btn sl-btn--small sl-btn--primary" onclick="aprovar('${p.id}', ${idx})">Aprovar</button>
                <button class="sl-btn sl-btn--small sl-btn--danger" onclick="rejeitar('${p.id}', ${idx})">Rejeitar</button>
              ` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderSeccaoVersoes(p) {
  if (!p.versoes?.length) return `<div class="sl-text-muted">Sem versões.</div>`;
  return `
    <table class="sl-table sl-table--inline">
      <thead><tr><th>Versão</th><th>Tipo</th><th>Data</th><th>Autor</th><th>Marcas TC</th><th>Sumário</th></tr></thead>
      <tbody>
        ${p.versoes.slice().reverse().map(v => `
          <tr>
            <td><strong>${v.numero}</strong></td>
            <td>${v.tipo.replace('_', ' ')}</td>
            <td>${v.data}</td>
            <td>${escapeHtml(v.autor)}</td>
            <td>${v.track_changes || 0}</td>
            <td>${escapeHtml(v.summary || '')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderSeccaoEdicaoExterna(p) {
  if (!p.edit_invitations?.length) {
    return `
      <div class="sl-text-muted sl-mb-8">Sem convites de edição externa.</div>
      <button class="sl-btn sl-btn--secondary" ${p.state !== 'em_redacao' ? 'disabled' : ''} onclick="convidarEditor('${p.id}')">Convidar Editor Externo</button>
    `;
  }
  return `
    <table class="sl-table sl-table--inline">
      <thead><tr><th>Ator Externo</th><th>Permissão</th><th>Estado</th><th>Criado</th><th>Submetido</th><th>Versão Resultante</th></tr></thead>
      <tbody>
        ${p.edit_invitations.map(i => `
          <tr>
            <td><strong>${escapeHtml(i.partner)}</strong></td>
            <td><span class="sl-pill ${i.permissao==='edit'?'sl-pill--orange':'sl-pill--blue'}">${i.permissao}</span></td>
            <td>${i.state}</td>
            <td>${i.criado_em}</td>
            <td>${i.submetido_em || '—'}</td>
            <td>${i.result_versao || '—'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="sl-mt-16">
      <button class="sl-btn sl-btn--secondary" ${p.state !== 'em_redacao' ? 'disabled' : ''} onclick="convidarEditor('${p.id}')">Novo Convite</button>
    </div>
  `;
}

function renderSeccaoHistorico(p) {
  if (!p.historico?.length) return `<div class="sl-text-muted">Sem eventos.</div>`;
  return `
    <div class="sl-timeline">
      ${p.historico.slice().reverse().map(h => `
        <div class="sl-timeline__item sl-timeline__item--done">
          <div class="sl-timeline__title">${escapeHtml(h.evento)}</div>
          <div class="sl-timeline__meta">${h.data} · ${escapeHtml(h.autor)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderSeccaoComentarios(p) {
  // Estilo SmartLegis real: tabela com Carregar / + Criar
  return `
    <div class="sl-flex sl-mb-8" style="gap:8px">
      <button class="sl-btn sl-btn--secondary">Carregar</button>
      <button class="sl-btn sl-btn--secondary">+ Criar</button>
    </div>
    <table class="sl-table sl-table--inline">
      <thead><tr><th>#</th><th>Comentário</th><th>Criado por</th><th>Data criação</th><th>Tarefa</th></tr></thead>
      <tbody>
        <tr><td colspan="5" class="sl-text-muted" style="text-align:center;padding:16px"><em>Sem comentários.</em></td></tr>
      </tbody>
    </table>
  `;
}

function renderSeccaoPermissoes(p) {
  return `
    <table class="sl-table sl-table--inline">
      <thead><tr><th>Papel</th><th>Ler</th><th>Editar</th><th>Aprovar</th></tr></thead>
      <tbody>
        <tr><td>DSAAG</td><td>✓</td><td>✓</td><td>—</td></tr>
        <tr><td>Proponente Principal</td><td>✓</td><td>✓</td><td>✓</td></tr>
        <tr><td>Co-proponente</td><td>✓</td><td>✓</td><td>✓</td></tr>
        <tr><td>GSEPCM</td><td>✓</td><td>—</td><td>—</td></tr>
        <tr><td>Ator Externo</td><td>(magic link)</td><td>(via convite)</td><td>—</td></tr>
      </tbody>
    </table>
  `;
}

// ============ Wizard (3 passos · estilo SmartLegis com círculos turquesa) ============
let wizardState = {
  step: 1,
  diploma_habilitante: null,
  origem_diploma: 'em_curso',
  tipo_origem: 'proponente_via_diploma',
  titulo: '',
  forma_ato: 'portaria',
  correr_ia: true,
};

function viewWizard() {
  const steps = [
    { num: 1, label: 'INÍCIO' },
    { num: 2, label: 'VALIDAÇÃO OU PREENCHIMENTO DO FORMULÁRIO AVALIAÇÃO LEGISLATIVA' },
    { num: 3, label: 'CONCLUSÃO' },
  ];
  return `
    ${renderControlPanel({
      breadcrumb: '<a href="#/dashboard">Dashboard</a><span class="sl-cp__breadcrumb-sep">›</span> <a href="#/planos">Regulamentação</a><span class="sl-cp__breadcrumb-sep">›</span> Novo',
    })}

    <div class="sl-form-bg">
      <div class="sl-wizard">
        <div class="sl-wizard__stepper">
          ${steps.map((s, i) => `
            <div class="sl-wizard__step ${s.num < wizardState.step ? 'sl-wizard__step--done' : s.num === wizardState.step ? 'sl-wizard__step--active' : ''}">
              <div class="sl-wizard__circle">${s.num}</div>
              <div class="sl-wizard__label">${s.label}</div>
            </div>
            ${i < steps.length - 1 ? '<div class="sl-wizard__connector"></div>' : ''}
          `).join('')}
        </div>

        <div class="sl-wizard__intro">
          ${wizardState.step === 1 ? 'Indique o diploma habilitante. A IA preenche os restantes campos automaticamente.' :
            wizardState.step === 2 ? 'Reveja os campos pré-preenchidos pela análise IA.' :
            'Confirmação final.'}
        </div>

        ${wizardState.step === 1 ? wizardStep1() :
          wizardState.step === 2 ? wizardStep2() :
          wizardStep3()}

        <div class="sl-wizard__footer">
          <button class="sl-btn sl-btn--secondary" onclick="location.hash='#/dashboard'">Cancelar</button>
          <div class="sl-wizard__footer-spacer"></div>
          ${wizardState.step > 1 ? `<button class="sl-btn sl-btn--secondary" onclick="wizardBack()">Anterior</button>` : ''}
          <a class="sl-btn--link sl-btn" onclick="toast('Gravar e sair (mock)')">Gravar e sair</a>
          ${wizardState.step < 3 ?
            `<button class="sl-btn sl-btn--primary" onclick="wizardNext()">Avançar</button>` :
            `<button class="sl-btn sl-btn--primary" onclick="wizardCriar()">Criar Plano</button>`}
        </div>
      </div>
    </div>
  `;
}

function wizardStep1() {
  const diplomas = DIPLOMAS.filter(d => wizardState.origem_diploma === 'em_curso' ? !d.data_publicacao : !!d.data_publicacao);
  const sel = wizardState.diploma_habilitante ? getDiploma(wizardState.diploma_habilitante) : null;
  return `
    <div class="sl-form__row">
      <div class="sl-form__field">
        <label class="sl-form__label">Origem do diploma</label>
        <div class="sl-radio-group">
          <label class="sl-radio">
            <input type="radio" name="origem" ${wizardState.origem_diploma==='em_curso'?'checked':''} onchange="wizardState.origem_diploma='em_curso';wizardState.diploma_habilitante=null;app.rerender()">
            <span>Projeto em curso</span>
          </label>
          <label class="sl-radio">
            <input type="radio" name="origem" ${wizardState.origem_diploma==='publicado'?'checked':''} onchange="wizardState.origem_diploma='publicado';wizardState.diploma_habilitante=null;app.rerender()">
            <span>Diploma publicado</span>
          </label>
        </div>
      </div>
      <div class="sl-form__field">
        <label class="sl-form__label sl-form__label--required">Diploma Habilitante</label>
        <select class="sl-form__select" onchange="wizardState.diploma_habilitante=this.value;app.rerender()">
          <option value="">— escolha —</option>
          ${diplomas.map(d => `<option value="${d.id}" ${wizardState.diploma_habilitante===d.id?'selected':''}>${d.id} · ${escapeHtml(d.sumario.substring(0,70))}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field">
        <label class="sl-form__label">Título</label>
        <input type="text" class="sl-form__input" value="${escapeHtml(wizardState.titulo)}" placeholder="${sel ? 'Regulamentação de ' + sel.id : '...'}" oninput="wizardState.titulo=this.value">
      </div>
      <div class="sl-form__field">
        <label class="sl-form__label">Origem</label>
        <select class="sl-form__select" onchange="wizardState.tipo_origem=this.value">
          <option value="proponente_via_diploma" ${wizardState.tipo_origem==='proponente_via_diploma'?'selected':''}>Proponente (via diploma)</option>
          <option value="dsaag_auto" ${wizardState.tipo_origem==='dsaag_auto'?'selected':''}>DSAAG (auto)</option>
          <option value="dsaag_manual" ${wizardState.tipo_origem==='dsaag_manual'?'selected':''}>DSAAG (manual)</option>
        </select>
      </div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field sl-form__field--full">
        <label class="sl-form__label">Correr análise IA imediatamente?</label>
        <div class="sl-radio-group">
          <label class="sl-radio"><input type="radio" name="corrIA" ${wizardState.correr_ia?'checked':''} onchange="wizardState.correr_ia=true"><span>Sim (recomendado)</span></label>
          <label class="sl-radio"><input type="radio" name="corrIA" ${!wizardState.correr_ia?'checked':''} onchange="wizardState.correr_ia=false"><span>Não</span></label>
        </div>
      </div>
    </div>
    ${sel ? `
      <div class="sl-banner sl-mt-16">
        <div>📄</div>
        <div>
          <strong>${sel.id} · ${sel.tipo}</strong>
          ${escapeHtml(sel.sumario)}<br>
          <span class="sl-text-muted">Proponente: ${getArea(sel.proponente)?.sigla} · Prazo legal: ${sel.prazo_legal_dias}d · ${sel.normas_habilitantes.length} normas habilitantes detetadas no texto</span>
        </div>
      </div>
    ` : ''}
  `;
}

function wizardStep2() {
  const dipl = getDiploma(wizardState.diploma_habilitante);
  return `
    <div class="sl-banner sl-banner--warn">
      <div>🤖</div>
      <div><strong>Pré-visualização da Análise IA.</strong> Os campos abaixo serão pré-preenchidos pela IA Claude após criar o plano. No estado <code>proposto</code> poderá rever, editar e validar.</div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field"><label class="sl-form__label">Diploma habilitante</label><div class="sl-form__value">${dipl?.id}</div></div>
      <div class="sl-form__field"><label class="sl-form__label">Sumário</label><div class="sl-form__value" style="white-space:normal">${escapeHtml(dipl?.sumario || '')}</div></div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field"><label class="sl-form__label">Forma de ato (será sugerida)</label><div class="sl-form__value">🤖 Pendente análise</div></div>
      <div class="sl-form__field"><label class="sl-form__label">Prazo legal (será extraído)</label><div class="sl-form__value">🤖 Pendente análise</div></div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field sl-form__field--full"><label class="sl-form__label">Objeto (será preenchido)</label><div class="sl-form__value" style="font-style:italic">🤖 A IA analisará "${dipl?.tipo || 'o diploma'}" e extrairá as normas habilitantes…</div></div>
    </div>
  `;
}

function wizardStep3() {
  const dipl = getDiploma(wizardState.diploma_habilitante);
  return `
    <div class="sl-banner sl-banner--success">
      <div>✅</div>
      <div><strong>Pronto a criar.</strong> O plano será criado em estado <code>proposto</code>. ${wizardState.correr_ia ? 'A análise IA dispara automaticamente.' : 'Análise IA não será disparada agora.'}</div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field"><label class="sl-form__label">Diploma habilitante</label><div class="sl-form__value"><strong>${dipl?.id}</strong></div></div>
      <div class="sl-form__field"><label class="sl-form__label">Origem</label><div class="sl-form__value">${wizardState.tipo_origem.replace(/_/g,' ')}</div></div>
    </div>
    <div class="sl-form__row">
      <div class="sl-form__field sl-form__field--full"><label class="sl-form__label">Título</label><div class="sl-form__value">${escapeHtml(wizardState.titulo) || `Regulamentação de ${dipl?.id}`}</div></div>
    </div>
  `;
}

// ============ Vista DSAAG ============
function viewDsaag() {
  const pendentes = ALERTAS.filter(a => !a.tratado_em);
  const tratados = ALERTAS.filter(a => a.tratado_em);
  const iaPendente = PLANOS.filter(p => p.state === 'proposto' && p.ai_status === 'concluida');

  return `
    ${renderControlPanel({
      breadcrumb: '<a href="#/dashboard">Dashboard</a><span class="sl-cp__breadcrumb-sep">›</span> Vista DSAAG',
      buttons: `<button class="sl-btn sl-btn--primary" onclick="varrerDR()">Varrer DR Agora</button>`,
    })}

    <div style="padding:24px;max-width:1140px;margin:0 auto">
      <div class="sl-card-grid" style="padding:0 0 16px">
        <div class="sl-card" style="border-left:3px solid var(--sl-danger)">
          <div class="sl-card__number">${pendentes.length}</div>
          <h2 class="sl-card__title" style="font-size:13px">ALERTAS PENDENTES</h2>
        </div>
        <div class="sl-card" style="border-left:3px solid var(--sl-warn)">
          <div class="sl-card__number">${iaPendente.length}</div>
          <h2 class="sl-card__title" style="font-size:13px">🤖 IA POR VALIDAR</h2>
        </div>
        <div class="sl-card">
          <div class="sl-card__number">${tratados.length}</div>
          <h2 class="sl-card__title" style="font-size:13px">TRATADOS (MÊS)</h2>
        </div>
        <div class="sl-card">
          <div class="sl-card__number" style="font-size:14px;font-weight:500">2026-04-26<br>06:00</div>
          <h2 class="sl-card__title" style="font-size:11px">ÚLTIMA VARREDURA</h2>
        </div>
      </div>

      ${iaPendente.length ? renderSection(`🤖 ANÁLISES IA POR VALIDAR (${iaPendente.length})`, `
        <table class="sl-table sl-table--inline">
          <thead><tr><th>Plano</th><th>Diploma</th><th>Confiança</th><th>Há</th><th>Ações</th></tr></thead>
          <tbody>
            ${iaPendente.map(p => `
              <tr>
                <td><strong>${p.id}</strong></td>
                <td>${p.diploma_habilitante}</td>
                <td>${(p.ai_confianca*100).toFixed(0)}%</td>
                <td>${diasAteData(p.historico?.[0]?.data)}d</td>
                <td><a href="#/plano/${p.id}/ia" class="sl-btn sl-btn--small sl-btn--primary">Validar</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `, {open: true}) : ''}

      ${renderSection(`⚠️ ALERTAS PENDENTES (${pendentes.length})`,
        pendentes.length === 0 ? '<div class="sl-text-muted">🎉 Sem alertas pendentes.</div>' :
        pendentes.map(a => alertaRow(a)).join(''),
        {open: true}
      )}

      ${renderSection(`📥 DIPLOMAS DETETADOS (${DIPLOMAS_VARRIDOS.length})`,
        DIPLOMAS_VARRIDOS.length === 0 ?
          `<div class="sl-empty"><div class="sl-empty__icon">📭</div><div class="sl-empty__text"><strong>Nenhum diploma a aguardar.</strong>Clique em <em>Varrer DR Agora</em> para simular.</div></div>` :
          `<table class="sl-table sl-table--inline">
            <thead><tr><th>Diploma</th><th>Publicado</th><th>Normas</th><th>Ações</th></tr></thead>
            <tbody>${DIPLOMAS_VARRIDOS.map(d => `
              <tr>
                <td><strong>${d.id}</strong><div class="sl-text-muted" style="font-size:11px">${escapeHtml(d.sumario.substring(0,70))}…</div></td>
                <td>${d.data_publicacao}</td>
                <td>${d.normas_habilitantes.length}</td>
                <td>
                  <button class="sl-btn sl-btn--small sl-btn--primary" onclick="dsaagAceitar('${d.id}')">Criar plano</button>
                  <button class="sl-btn sl-btn--small sl-btn--secondary" onclick="dsaagAtribuir('${d.id}')">Atribuir</button>
                  <button class="sl-btn sl-btn--small sl-btn--link" onclick="dsaagDispensar('${d.id}')">Dispensar</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>`,
        {open: DIPLOMAS_VARRIDOS.length > 0}
      )}

      ${renderSection(`✅ HISTÓRICO DE TRATAMENTO (${tratados.length})`,
        tratados.length === 0 ? '<div class="sl-text-muted">Nada tratado.</div>' :
        tratados.map(a => alertaRow(a, true)).join(''),
        {open: false}
      )}
    </div>
  `;
}

function alertaRow(a, isHistorico=false) {
  const cls = a.gravidade === 'critical' ? 'sl-alert-row--critical' : a.gravidade === 'warning' ? 'sl-alert-row--warning' : 'sl-alert-row--info';
  const icone = a.gravidade === 'critical' ? '🚨' : a.gravidade === 'warning' ? '⚠️' : 'ℹ️';
  const link = a.plan_id ? `#/plano/${a.plan_id}` : '#/diplomas-publicados';
  return `
    <div class="sl-alert-row ${cls}">
      <div style="font-size:18px">${icone}</div>
      <div>
        <div class="sl-alert-row__title">${escapeHtml(a.titulo)}</div>
        <div class="sl-alert-row__desc">${escapeHtml(a.descricao)} · ${a.gerado_em}</div>
        ${isHistorico ? `<div class="sl-text-muted" style="font-size:11px;margin-top:4px">✓ Tratado por ${a.tratado_por} em ${a.tratado_em}</div>` : ''}
      </div>
      <div>${a.dias_restantes !== null && a.dias_restantes !== undefined ? fmtDays(a.dias_restantes) : ''}</div>
      <div class="sl-alert-row__actions">
        ${isHistorico ? `<a href="${link}" class="sl-btn sl-btn--small sl-btn--link">Ver</a>` :
          `<a href="${link}" class="sl-btn sl-btn--small sl-btn--secondary">Ver</a>
           <button class="sl-btn sl-btn--small sl-btn--primary" onclick="tratarAlerta('${a.id}')">Tratar</button>`}
      </div>
    </div>
  `;
}

function viewDiplomasPublicados() {
  const publicados = DIPLOMAS.filter(d => d.estado === 'Publicado');
  return `
    ${renderControlPanel({
      breadcrumb: '<a href="#/dashboard">Dashboard</a><span class="sl-cp__breadcrumb-sep">›</span> Diplomas Publicados',
      buttons: `<button class="sl-btn sl-btn--primary" onclick="varrerDR()">Varrer DR</button>`,
    })}
    <div style="padding:24px;max-width:1140px;margin:0 auto">
      <div class="sl-banner">
        <div>🔄</div>
        <div><strong>Deteção automática.</strong> Job diário (06h00) varre o DR e identifica diplomas com normas habilitantes via análise IA Claude.</div>
      </div>
      <div class="sl-table-wrap">
        <table class="sl-table">
          <thead><tr>
            <th style="width:34px"><input type="checkbox"></th>
            <th>Diploma</th><th>Sumário</th><th>Publicado</th><th>Normas</th><th>Plano</th>
          </tr></thead>
          <tbody>${publicados.map(d => `
            <tr>
              <td><input type="checkbox"></td>
              <td><strong>${d.id}</strong><div class="sl-text-muted" style="font-size:11px">${d.dr || ''}</div></td>
              <td>${escapeHtml(d.sumario)}</td>
              <td>${d.data_publicacao}</td>
              <td>${d.normas_habilitantes.length}</td>
              <td>${d.tem_plano_regulamentacao ? '<span class="sl-pill sl-pill--green">tem plano</span>' : '<span class="sl-pill sl-pill--warn">sem plano</span>'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============ Helpers de UI dinâmicos ============
function toggleSection(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('sl-section--open');
}
function toggleAcao(e) {
  e.stopPropagation();
  const dd = document.getElementById('acao-dropdown');
  if (dd) dd.classList.toggle('is-open');
}
document.addEventListener('click', () => {
  const dd = document.getElementById('acao-dropdown');
  if (dd) dd.classList.remove('is-open');
  const sb = document.getElementById('sidebar');
  if (sb) sb.classList.remove('is-open');
});
