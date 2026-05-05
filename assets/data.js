// SmartLegis · Módulo de Regulamentação · Mock data v0.2
// Alterações vs v0.1:
// - Novo workflow simplificado (proposto → em_redacao → em_aprovacao → aprovado → publicado)
// - Campos de Análise IA
// - Aprovações multi-proponente
// - Convites de edição em track changes
// - Documento na plataforma com versões incrementais

const DSAAG_LABEL = 'DSAAG';

const AREAS_GOVERNATIVAS = [
  { id: 'mai', nome: 'Ministério da Administração Interna', sigla: 'MAI' },
  { id: 'maac', nome: 'Ministério do Ambiente e Ação Climática', sigla: 'MAAC' },
  { id: 'mj', nome: 'Ministério da Justiça', sigla: 'MJ' },
  { id: 'mne', nome: 'Ministério dos Negócios Estrangeiros', sigla: 'MNE' },
  { id: 'mf', nome: 'Ministério das Finanças', sigla: 'MF' },
  { id: 'metd', nome: 'Min. Estado/Economia/Transição Digital', sigla: 'METD' },
  { id: 'mp', nome: 'Ministério da Presidência', sigla: 'MP' },
  { id: 'me', nome: 'Ministério da Educação', sigla: 'ME' },
  { id: 'mctes', nome: 'Min. Ciência, Tecnologia e Ensino Superior', sigla: 'MCTES' },
  { id: 'mc', nome: 'Ministério da Cultura', sigla: 'MC' },
  { id: 'msau', nome: 'Ministério da Saúde', sigla: 'MS' },
  { id: 'mtsss', nome: 'Min. Trabalho e Solidariedade', sigla: 'MTSSS' },
  { id: 'magri', nome: 'Ministério da Agricultura', sigla: 'MAGRI' },
  { id: 'mih', nome: 'Min. Infraestruturas e Habitação', sigla: 'MIH' },
];

const ENTIDADES_EXTERNAS = [
  { id: 'ces', nome: 'Conselho Económico e Social', tipo: 'obrigatoria' },
  { id: 'anmp', nome: 'ANMP - Municípios Portugueses', tipo: 'obrigatoria' },
  { id: 'anafre', nome: 'ANAFRE - Freguesias', tipo: 'obrigatoria' },
  { id: 'cnpd', nome: 'CNPD - Proteção de Dados', tipo: 'obrigatoria' },
  { id: 'erc', nome: 'ERC - Comunicação Social', tipo: 'obrigatoria' },
  { id: 'ordem-advogados', nome: 'Ordem dos Advogados', tipo: 'facultativa' },
  { id: 'ordem-medicos', nome: 'Ordem dos Médicos', tipo: 'facultativa' },
  { id: 'ordem-engenheiros', nome: 'Ordem dos Engenheiros', tipo: 'facultativa' },
  { id: 'tcontas', nome: 'Tribunal de Contas', tipo: 'facultativa' },
  { id: 'cejure', nome: 'CEJURE', tipo: 'facultativa' },
  { id: 'utail', nome: 'UTAIL (PlanAPP)', tipo: 'facultativa' },
];

const DIPLOMAS = [
  {
    id: 'DL00012/XXIV/2026', tipo: 'Decreto-Lei',
    sumario: 'Estabelece o regime jurídico da economia circular',
    proponente: 'maac', estado: 'Publicado',
    data_publicacao: '2026-03-15', dr: 'DR Nº 52, Série I',
    em_smartlegis: true, tem_plano_regulamentacao: false,
    normas_habilitantes: [
      { ref: 'Artigo 14.º, n.º 2', desc: 'Critérios de certificação' },
      { ref: 'Artigo 22.º, n.º 1', desc: 'Regime de taxas' },
    ],
    prazo_legal_dias: 90,
  },
  {
    id: 'DL00018/XXIV/2026', tipo: 'Decreto-Lei',
    sumario: 'Aprova o regime jurídico da identificação eletrónica',
    proponente: 'metd', estado: 'Publicado',
    data_publicacao: '2026-03-28', dr: 'DR Nº 62, Série I',
    em_smartlegis: true, tem_plano_regulamentacao: true,
    normas_habilitantes: [
      { ref: 'Artigo 8.º', desc: 'Requisitos técnicos dos meios de identificação' },
    ],
    prazo_legal_dias: 60,
  },
  {
    id: 'L00005-A/2026', tipo: 'Lei (AR)',
    sumario: 'Pegada legislativa a nível governamental',
    proponente: 'mp', estado: 'Publicado',
    data_publicacao: '2026-04-08', dr: 'DR Nº 70, Série I',
    em_smartlegis: false, tem_plano_regulamentacao: false,
    normas_habilitantes: [
      { ref: 'Artigo 5.º, n.º 1', desc: 'Procedimento de registo' },
      { ref: 'Artigo 11.º', desc: 'Requisitos do sistema de informação' },
    ],
    prazo_legal_dias: 120,
  },
  {
    id: 'DL00025/XXIV/2026', tipo: 'Decreto-Lei',
    sumario: 'Trabalho remoto na Administração Pública',
    proponente: 'mp', estado: 'Em estudo',
    data_publicacao: null, dr: null,
    em_smartlegis: true, tem_plano_regulamentacao: false,
    normas_habilitantes: [
      { ref: 'Artigo 9.º', desc: 'Limites máximos de trabalho remoto' },
      { ref: 'Artigo 16.º', desc: 'Subsídio de teletrabalho' },
    ],
    prazo_legal_dias: 120,
  },
];

// Estados v0.2 (simplificados)
const ESTADOS_PLANO = {
  proposto:        { label: 'Proposto',         pill: 'pill-blue',  ordem: 1 },
  em_redacao:      { label: 'Em Redação',       pill: 'pill-blue',  ordem: 2 },
  em_aprovacao:    { label: 'Em Aprovação',     pill: 'pill-amber', ordem: 3 },
  aprovado:        { label: 'Aprovado',         pill: 'pill-green', ordem: 4 },
  publicado:       { label: 'Publicado',        pill: 'pill-green', ordem: 5 },
  dispensado:      { label: 'Dispensado',       pill: 'pill-grey',  ordem: 99 },
  cancelado:       { label: 'Cancelado',        pill: 'pill-red',   ordem: 99 },
};

const ESTADOS_SEQUENCIA = ['proposto', 'em_redacao', 'em_aprovacao', 'aprovado', 'publicado'];

const FORMAS_ATO = [
  ['decreto_lei', 'Decreto-Lei'],
  ['decreto', 'Decreto'],
  ['decreto_regulamentar', 'Decreto Regulamentar'],
  ['portaria', 'Portaria'],
  ['rcm', 'Resolução do Conselho de Ministros'],
];

const PLANOS = [
  {
    id: 'REG-00001/XXIV/2026',
    titulo: 'Regulamentação do regime de identificação eletrónica',
    tipo_origem: 'proponente_via_diploma',
    diploma_habilitante: 'DL00018/XXIV/2026',
    state: 'em_aprovacao',
    // IA
    ai_status: 'validada',
    ai_provider: 'mock',
    ai_executed_at: '2026-04-01 14:23',
    ai_validated_by: 'Rita Silva (METD)',
    ai_validated_at: '2026-04-01 16:08',
    ai_confianca: 0.82,
    ai_summary: 'Análise mock detetou forma "Portaria" baseada em padrões textuais; prazo de 60 dias extraído do texto; 1 norma habilitante (Artigo 8.º). Sugeridas CNPD e CEJURE como entidades externas (palavras-chave: "biometria", "identificação", "proteção de dados").',
    objeto: 'Regulamentação dos requisitos técnicos dos meios de identificação eletrónica, incluindo critérios de segurança, interoperabilidade e usabilidade.',
    objeto_origem_ia: false, // já editada após validação
    forma_ato_prevista: 'portaria', forma_ato_origem_ia: true,
    prazo_legal_dias: 60, prazo_origem_ia: true,
    prazo_data: '2026-05-27',
    area_proponente: 'metd',
    co_proponentes: ['mp', 'mj'],
    adjunto_responsavel: 'Rita Silva (METD)',
    entidades_externas: ['cnpd', 'cejure'],
    normas: [
      { ref: 'Artigo 8.º', desc: 'Requisitos técnicos dos meios de identificação', estado: 'em_redacao', detetada_por_ia: true },
    ],
    // Aprovações multi-proponente
    approvals: [
      { company_id: 'metd', is_lead: true, state: 'aprovado', approver: 'Rita Silva', approved_at: '2026-04-26 10:14', notes: 'Concordância total.' },
      { company_id: 'mp', is_lead: false, state: 'aprovado', approver: 'Sofia Lima', approved_at: '2026-04-27 09:30', notes: 'Sugestão de revisão tipográfica no art.º 3.º (já incorporada).' },
      { company_id: 'mj', is_lead: false, state: 'pendente', approver: null, approved_at: null, notes: '' },
    ],
    // Versões
    versoes: [
      { numero: 'v0.1', tipo: 'interna', data: '2026-04-02', autor: 'Rita Silva', track_changes: 0, summary: 'Versão inicial gerada do template' },
      { numero: 'v0.2', tipo: 'interna', data: '2026-04-15', autor: 'Rita Silva', track_changes: 12, summary: 'Inclusão das definições do art.º 2.º' },
      { numero: 'v0.3', tipo: 'interna', data: '2026-04-22', autor: 'Ext: CNPD (Maria Mendes)', track_changes: 8, summary: 'Edição externa CNPD: ajustes art.º 5.º (RGPD)' },
      { numero: 'v0.4', tipo: 'interna', data: '2026-04-23', autor: 'Rita Silva', track_changes: 3, summary: 'Aceitação parcial de track changes do CNPD' },
      { numero: 'v1.0', tipo: 'aprovada', data: '2026-04-25', autor: 'Rita Silva', track_changes: 0, summary: 'Versão para aprovação' },
    ],
    // Edit invitations
    edit_invitations: [
      { partner: 'CNPD · Maria Mendes', permissao: 'edit', state: 'submetido', criado_em: '2026-04-18', submetido_em: '2026-04-22', result_versao: 'v0.3' },
      { partner: 'CEJURE · Dr. Bento', permissao: 'comment_only', state: 'aberto', criado_em: '2026-04-20', submetido_em: null, result_versao: null },
    ],
    // Documento (HTML simplificado)
    document_html: `<h1>Portaria n.º __/2026</h1><h2>Preâmbulo</h2><p>O Decreto-Lei n.º 18/2026 estabeleceu o regime jurídico da identificação eletrónica...</p><h2>Articulado</h2><h3>Artigo 1.º · Objeto</h3><p>A presente portaria regula os requisitos técnicos dos meios de identificação eletrónica.</p><h3>Artigo 2.º · Definições</h3><p>...</p>`,
    historico: [
      { data: '2026-04-01', evento: 'Plano criado · análise IA disparada', autor: 'Rita Silva (METD)' },
      { data: '2026-04-01', evento: '🤖 Análise IA concluída (confiança 82%)', autor: 'Sistema' },
      { data: '2026-04-01', evento: '✅ Análise IA validada · em redação', autor: 'Rita Silva (METD)' },
      { data: '2026-04-22', evento: '📥 Edição externa CNPD recebida (v0.3)', autor: 'Sistema' },
      { data: '2026-04-25', evento: '🗳️ Plano submetido a aprovação · 3 proponentes', autor: 'Rita Silva' },
      { data: '2026-04-26', evento: '✓ Aprovação METD', autor: 'Rita Silva' },
      { data: '2026-04-27', evento: '✓ Aprovação MP', autor: 'Sofia Lima' },
    ],
    risco: 'mid',
  },
  {
    id: 'REG-00002/XXIV/2026',
    titulo: 'Regulamentação da economia circular — certificação',
    tipo_origem: 'proponente_via_diploma',
    diploma_habilitante: 'DL00012/XXIV/2026',
    state: 'em_redacao',
    ai_status: 'validada', ai_provider: 'mock',
    ai_confianca: 0.71,
    ai_summary: 'Forma "Decreto Regulamentar" sugerida por densidade técnica do diploma habilitante; prazo 90 dias extraído. 2 normas detetadas. Entidades CES/ANMP/Ordem Engenheiros sugeridas.',
    ai_validated_by: 'Tomás Brito (MAAC)',
    ai_validated_at: '2026-04-08 11:00',
    objeto: 'Regulamentação dos critérios de certificação de produtos circulares (artigo 14.º) e regime de taxas aplicáveis (artigo 22.º).',
    objeto_origem_ia: true, forma_ato_origem_ia: true, prazo_origem_ia: true,
    forma_ato_prevista: 'decreto_regulamentar',
    prazo_legal_dias: 90, prazo_data: '2026-06-13',
    area_proponente: 'maac',
    co_proponentes: ['metd', 'mf'],
    adjunto_responsavel: 'Tomás Brito (MAAC)',
    entidades_externas: ['ces', 'anmp', 'ordem-engenheiros'],
    normas: [
      { ref: 'Artigo 14.º, n.º 2', desc: 'Critérios para certificação', estado: 'em_redacao', detetada_por_ia: true },
      { ref: 'Artigo 22.º, n.º 1', desc: 'Regime de taxas', estado: 'pendente', detetada_por_ia: true },
    ],
    approvals: [
      { company_id: 'maac', is_lead: true, state: 'pendente', approver: null, approved_at: null, notes: '' },
      { company_id: 'metd', is_lead: false, state: 'pendente', approver: null, approved_at: null, notes: '' },
      { company_id: 'mf', is_lead: false, state: 'pendente', approver: null, approved_at: null, notes: '' },
    ],
    versoes: [
      { numero: 'v0.1', tipo: 'interna', data: '2026-04-08', autor: 'Tomás Brito', track_changes: 0, summary: 'Versão inicial gerada do template' },
      { numero: 'v0.2', tipo: 'interna', data: '2026-04-15', autor: 'Tomás Brito', track_changes: 18, summary: 'Inclusão dos critérios técnicos no art.º 4.º' },
    ],
    edit_invitations: [],
    document_html: `<h1>Decreto Regulamentar n.º __/2026</h1><h2>Articulado</h2><h3>Artigo 1.º · Objeto</h3><p>O presente decreto regulamentar regula os critérios de certificação de produtos circulares...</p>`,
    historico: [
      { data: '2026-04-08', evento: 'Plano criado · análise IA disparada', autor: 'Tomás Brito (MAAC)' },
      { data: '2026-04-08', evento: '🤖 Análise IA concluída (confiança 71%)', autor: 'Sistema' },
      { data: '2026-04-08', evento: '✅ Análise IA validada · em redação', autor: 'Tomás Brito (MAAC)' },
      { data: '2026-04-15', evento: 'Versão v0.2 guardada (18 marcas de revisão)', autor: 'Tomás Brito' },
    ],
    risco: 'low',
  },
  {
    id: 'REG-00003/XXIV/2026',
    titulo: 'Regulamentação da pegada legislativa governamental',
    tipo_origem: 'dsaag_auto',
    diploma_habilitante: 'L00005-A/2026',
    state: 'proposto',
    ai_status: 'concluida', ai_provider: 'mock', // aguarda validação DSAAG
    ai_confianca: 0.65,
    ai_summary: 'Forma "Decreto-Lei" sugerida (matéria estrutural); prazo 120d extraído; 2 normas detetadas (art.º 5.º, art.º 11.º). Sem entidades externas obrigatórias detetadas. AGUARDA VALIDAÇÃO DSAAG.',
    ai_validated_by: null, ai_validated_at: null,
    objeto: 'Regulamentação dos requisitos do sistema de informação previstos no artigo 11.º da Lei n.º 5-A/2026.',
    objeto_origem_ia: true, forma_ato_origem_ia: true, prazo_origem_ia: true,
    forma_ato_prevista: 'decreto_lei',
    prazo_legal_dias: 120, prazo_data: '2026-08-06',
    area_proponente: null, co_proponentes: [],
    adjunto_responsavel: null,
    entidades_externas: [],
    normas: [
      { ref: 'Artigo 5.º, n.º 1', desc: 'Procedimento de registo da pegada', estado: 'pendente', detetada_por_ia: true },
      { ref: 'Artigo 11.º', desc: 'Requisitos do sistema de informação', estado: 'pendente', detetada_por_ia: true },
    ],
    approvals: [],
    versoes: [],
    edit_invitations: [],
    document_html: '',
    historico: [
      { data: '2026-04-09', evento: 'Plano criado pela DSAAG (varredura DR)', autor: 'DSAAG · sistema' },
      { data: '2026-04-09', evento: '🤖 Análise IA concluída (confiança 65%)', autor: 'Sistema' },
      { data: '2026-04-09', evento: 'Aguarda validação humana e atribuição de proponente', autor: 'Sistema' },
    ],
    risco: 'low',
    aguarda_proponente: true,
  },
];

// Alertas DSAAG
const ALERTAS = [
  {
    id: 'alert-001', tipo: 'analise_ia_pendente_validacao', gravidade: 'warning',
    plan_id: 'REG-00003/XXIV/2026',
    titulo: '🤖 Análise IA por validar há > 5 dias',
    descricao: 'REG-00003 aguarda validação humana desde 09-04-2026',
    dias_restantes: null, gerado_em: '2026-04-15 06:00',
  },
  {
    id: 'alert-002', tipo: 'plano_sem_proponente', gravidade: 'warning',
    plan_id: 'REG-00003/XXIV/2026',
    titulo: 'Plano sem proponente atribuído',
    descricao: 'REG-00003 aguarda atribuição há 19 dias',
    dias_restantes: null, gerado_em: '2026-04-09 10:30',
  },
  {
    id: 'alert-003', tipo: 'aprovacao_pendente', gravidade: 'info',
    plan_id: 'REG-00001/XXIV/2026',
    titulo: '🗳️ Aprovação pendente · MJ',
    descricao: 'REG-00001 aguarda aprovação do Ministério da Justiça (já aprovado por METD e MP)',
    dias_restantes: 30, gerado_em: '2026-04-25 09:00',
  },
  {
    id: 'alert-004', tipo: 'diploma_publicado_sem_plano', gravidade: 'warning',
    diploma_id: 'DL00012/XXIV/2026',
    titulo: 'Diploma publicado sem plano de regulamentação',
    descricao: 'DL00012 (Economia Circular) publicado · 2 normas detetadas',
    dias_restantes: 45, gerado_em: '2026-03-16 06:00',
    tratado_em: '2026-04-08 14:20', tratado_por: 'Utilizador DAPL (DSAAG)',
    acao_tomada: 'criar_plano',
  },
];

let DIPLOMAS_VARRIDOS = [];

// ============ Perfis de utilizador (mock auth) ============
// Reflete os 5 papéis institucionais previstos na especificação:
// - DAPL: QA/Admin · acesso integral · submete versões finais ao DRE
// - DSAAG: vigilância · trata fila de deteção · alertas · valida análise IA F2 · NÃO redige
// - Gabinete proponente: redige e aprova regulamentação na sua área
// - Co-proponente: edita e aprova nos planos onde é co-proponente
// - Ator externo: edita via magic link
const PERFIS = [
  {
    id: 'dapl-bv', nome: 'Bernardo Vidal', role: 'Chefe de Divisão',
    role_id: 'dapl', gabinete: 'DAPL', avatar: 'BV', cor: '#3A529C',
    missao: 'QA / Admin · acesso integral · submete versões finais ao DRE',
  },
  {
    id: 'dsaag-tp', nome: 'Tânia Parreira', role: 'Diretora de Serviços',
    role_id: 'dsaag', gabinete: 'DSAAG', avatar: 'TP', cor: '#F2784B',
    missao: 'Vigilância · trata fila de deteção · alertas · valida análise IA F2 · não redige',
  },
  {
    id: 'metd-rs', nome: 'Rita Silva', role: 'Adjunta · METD',
    role_id: 'gabinete', gabinete_id: 'metd', avatar: 'RS', cor: '#8B4513',
    missao: 'Gabinete proponente · redige e aprova regulamentação',
  },
  {
    id: 'mp-sl', nome: 'Sofia Lima', role: 'Adjunta · MP',
    role_id: 'co_proponente', gabinete_id: 'mp', avatar: 'SL', cor: '#5F9EA0',
    missao: 'Co-proponente · edita e aprova planos onde MP é co-proponente',
  },
  {
    id: 'cnpd-mm', nome: 'Maria Mendes', role: 'Técnica · CNPD',
    role_id: 'externo', gabinete_id: 'cnpd', avatar: 'MM', cor: '#9370DB',
    missao: 'Ator externo · edita via magic link em planos onde foi convidada',
  },
  {
    id: 'demo', nome: 'Demonstração', role: 'Sem restrições',
    role_id: 'demo', avatar: 'DM', cor: '#36D7B7',
    missao: 'Acesso integral sem restrições · útil para apresentações',
  },
];

// Estado de auth global
let currentUser = null;

// Permissões consolidadas
function userCan(action, plan) {
  if (!currentUser) return false;
  const r = currentUser.role_id;
  if (r === 'demo') return true;

  switch (action) {
    case 'view_all':
      return ['dapl', 'dsaag'].includes(r);
    case 'criar_plano_via_diploma':
      return ['dapl', 'gabinete'].includes(r);
    case 'gerir_dsaag':
      return ['dapl', 'dsaag'].includes(r);
    case 'validar_ia':
      if (!plan) return ['dapl', 'dsaag', 'gabinete'].includes(r);
      if (r === 'dapl') return true;
      if (r === 'dsaag') return plan.tipo_origem !== 'proponente_via_diploma';
      if (r === 'gabinete') return plan.tipo_origem === 'proponente_via_diploma'
        && plan.area_proponente === currentUser.gabinete_id;
      return false;
    case 'redigir_documento':
      if (!plan) return ['gabinete', 'co_proponente', 'externo'].includes(r);
      if (r === 'gabinete') return plan.area_proponente === currentUser.gabinete_id;
      if (r === 'co_proponente') return plan.co_proponentes?.includes(currentUser.gabinete_id);
      if (r === 'externo') return plan.edit_invitations?.some(i => i.partner.includes(currentUser.gabinete_id?.toUpperCase() || ''));
      return false;
    case 'convidar_externo':
    case 'submeter_aprovacao':
    case 'devolver':
      if (!plan) return ['gabinete', 'co_proponente'].includes(r);
      if (r === 'gabinete') return plan.area_proponente === currentUser.gabinete_id;
      if (r === 'co_proponente') return plan.co_proponentes?.includes(currentUser.gabinete_id);
      return false;
    case 'aprovar':
      if (!plan) return ['gabinete', 'co_proponente'].includes(r);
      if (r === 'gabinete') return plan.area_proponente === currentUser.gabinete_id;
      if (r === 'co_proponente') return plan.co_proponentes?.includes(currentUser.gabinete_id);
      return false;
    case 'submeter_dre':
      return r === 'dapl';
    case 'qa':
      return r === 'dapl';
    default:
      return false;
  }
}

// Filtra planos visíveis para o utilizador atual
function planosVisiveis() {
  if (!currentUser) return [];
  const r = currentUser.role_id;
  if (['dapl', 'dsaag', 'demo'].includes(r)) return PLANOS;
  if (r === 'gabinete') {
    return PLANOS.filter(p => p.area_proponente === currentUser.gabinete_id);
  }
  if (r === 'co_proponente') {
    return PLANOS.filter(p => p.co_proponentes?.includes(currentUser.gabinete_id));
  }
  if (r === 'externo') {
    return PLANOS.filter(p => p.edit_invitations?.length); // simplificação para o mock
  }
  return [];
}

// Helpers
function getPerfil(id) { return PERFIS.find(p => p.id === id) || null; }
function getArea(id) { return AREAS_GOVERNATIVAS.find(a => a.id === id) || null; }
function getEntidade(id) { return ENTIDADES_EXTERNAS.find(e => e.id === id) || null; }
function getDiploma(id) { return DIPLOMAS.find(d => d.id === id) || null; }
function getPlano(id) { return PLANOS.find(p => p.id === id) || null; }
function getFormaAtoLabel(id) {
  const f = FORMAS_ATO.find(x => x[0] === id);
  return f ? f[1] : id;
}

function diasAteData(dateStr) {
  if (!dateStr) return null;
  const today = new Date('2026-04-28');
  const target = new Date(dateStr);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

// Mock AI service (simula análise)
function mockAIAnalysis(diplomaId) {
  const d = getDiploma(diplomaId);
  if (!d) return null;
  // Heurísticas simples
  const sumario = (d.sumario || '').toLowerCase();
  let forma = 'portaria';
  if (sumario.includes('regime jurídico') || sumario.includes('estabelece')) forma = 'decreto_regulamentar';
  if (sumario.includes('lei') || sumario.includes('pegada')) forma = 'decreto_lei';
  return {
    objeto: `Regulamentação das normas habilitantes do ${d.id}, abrangendo: ${d.normas_habilitantes.map(n => n.ref).slice(0,3).join(', ')}.`,
    forma_ato_sugerida: forma,
    prazo_legal_dias: d.prazo_legal_dias,
    normas_habilitantes: d.normas_habilitantes.map(n => ({ ...n, detetada_por_ia: true, estado: 'pendente' })),
    entidades_externas_sugeridas: sumario.includes('proteção') || sumario.includes('identif') ? ['cnpd', 'cejure'] : [],
    confianca_global: 0.65 + Math.random() * 0.25,
    raciocinio: `Análise mock baseada em padrões textuais. Forma "${forma}" inferida do sumário; prazo extraído dos metadados; ${d.normas_habilitantes.length} normas habilitantes detetadas.`,
    provider: 'mock',
  };
}
