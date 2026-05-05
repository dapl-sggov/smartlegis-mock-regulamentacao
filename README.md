# SmartLegis · Módulo de Regulamentação · Mock

Protótipo navegável do **Módulo de Regulamentação** proposto para o SmartLegis (sistema de gestão do processo legislativo do Governo de Portugal), no âmbito da iniciativa estratégica **DAPL.2026.01**.

→ **[Abrir o protótipo online](https://dapl-sggov.github.io/smartlegis-mock-regulamentacao/)**

---

## Sobre o protótipo

HTML+CSS+JavaScript vanilla, sem dependências, alinhado pixel-a-pixel com o SmartLegis real.

Cobre 4 frentes funcionais:

| Frente | Iniciador | Função |
|---|---|---|
| **F1** | Gabinete proponente | Cria plano a partir da vista do procedimento |
| **F2** | DSAAG (deteção automática) | Cron diário varre DR e identifica diplomas que carecem regulamentação |
| **F3** | Sistema (alertas) | Notificações de prazos, planos sem proponente, IA por validar |
| **F4** | IA Claude | Pré-preenchimento automático do plano a partir do diploma habilitante |

---

## Como abrir

### Online
Diretamente no browser: <https://dapl-sggov.github.io/smartlegis-mock-regulamentacao/>

### Offline · multi-ficheiro
Duplo-clique em `index.html`.

### Offline · single-file
Duplo-clique em `standalone.html`. Ficheiro único de ≈ 115 KB que pode ser enviado por email.

---

## Roteiro de demonstração (≈ 7 minutos)

1. Clicar no logótipo SmartLegis (canto superior esquerdo) → menu → **Vista DSAAG**
2. **Varrer DR Agora** para simular deteção automática de diplomas que carecem regulamentação
3. Para cada item da fila: **Criar plano** / **Atribuir** / **Dispensar**
4. Voltar ao Dashboard, abrir **REG-00003** (Pegada Legislativa) → tab **Análise IA** → validar
5. Abrir **REG-00001** (Identificação Eletrónica) → ver fase de aprovação multi-proponente
6. Sino no canto superior direito → fila de alertas centralizada DSAAG

---

## Limitações conscientes

- Sem persistência (recarregar = volta ao estado inicial)
- Varredura DR é simulada (sem regex/NLP real)
- IA é simulada (`mockAIAnalysis`); produção usará Anthropic Claude
- Sem autenticação nem permissões reais

A implementação produtiva será feita pelo parceiro tecnológico no quadro do contrato de evolução tecnológica em vigor.

---

## Contexto institucional

Este protótipo serve como **referência funcional e visual** para validação institucional (DSAAG, GSEPCM, gabinetes ministeriais) e posterior anexo ao Caderno de Encargos do desenvolvimento funcional.

A especificação técnica completa, modelo de dados, requisitos `REQ.RG.*` e o módulo Odoo correspondente encontram-se em repositório institucional separado da SGGov · DAPL.

---

**Iniciativa:** DAPL.2026.01 — Evolução do SmartLegis
**Divisão:** DAPL · Secretaria-Geral do Governo
**Licença:** AGPL-3.0
