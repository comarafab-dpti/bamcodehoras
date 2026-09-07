import { Employee, ConstructionSite, UnidadeOrganizacional } from '../types';
import { 
  UNIDADES_ORGANIZACIONAIS, 
  ALIASES_DEPARTAMENTO_CSV 
} from '../constants/unidadesOrganizacionais';

export interface EmployeeOrgDisplayInfo {
  // 1. De onde ele é (Lotação / Origem Administrativa)
  sedeCodigo: string;       // ex: 'BE', 'KO', 'MN', 'FB'
  sedeNome: string;         // ex: 'Belém', 'Coari', 'Manaus', 'Fonte Boa'
  lotacaoCodigo: string;    // ex: 'SEDE_BE', 'DECO_KO', 'DACO_MN'
  lotacaoNome: string;      // ex: 'Sede Belém', 'Destacamento Coari', 'Destacamento Manaus'
  lotacaoSigla: string;     // ex: 'SEDE-BE', 'DECO-KO', 'DACO-MN'
  origemFormatada: string;  // ex: 'Sede Belém (BE)' ou 'Destacamento Coari (KO)'

  // 2. Onde está trabalhando (Local de Trabalho / Exercício)
  localTrabalhoNome: string;     // ex: 'Sede Belém', 'Destacamento Coari', 'Canteiro Aeroporto Coari'
  localTrabalhoDetalhe?: string; // ex: 'Canteiro de Obras', 'Na Lotação'
  localTrabalhoBadge?: string;   // ex: 'KO-01', 'BE'
  isEmCanteiro: boolean;
  isDeslocado: boolean;          // Trabalhando fora da sua sede/unidade de lotação

  // 3. De qual setor se existir (Setor / Divisão)
  temSetor: boolean;
  setorCodigo?: string; // ex: 'SETOR_SAQ'
  setorSigla?: string;  // ex: 'SAQ', 'PMAC', 'DAPC', 'DL'
  setorNome?: string;   // ex: 'Seção de Aquisições', 'Pavimentação / Manutenção'
  setorFormatado: string; // ex: 'SAQ • Seção de Aquisições' ou '—'
}

const SEDE_NOMES: Record<string, string> = {
  BE: 'Belém',
  KO: 'Coari',
  MN: 'Manaus',
  FB: 'Fonte Boa',
  SP: 'São Gabriel da Cachoeira',
  SGC: 'São Gabriel da Cachoeira',
  BR: 'Brasília',
};

/**
 * Normaliza e simplifica o nome de uma UO institucional para exibição amigável.
 * Ex: 'Sede Belém (Quartel-General COMARA)' -> 'Sede Belém'
 *     'Destacamento de Engenharia de Coari' -> 'Destacamento Coari'
 */
function simplificarNomeUo(nome: string, fallback: string): string {
  if (!nome) return fallback;
  if (nome.includes('Sede Belém')) return 'Sede Belém';
  if (nome.includes('Coari')) return 'Destacamento Coari';
  if (nome.includes('Manaus')) return 'Destacamento Manaus';
  if (nome.includes('Fonte Boa')) return 'Destacamento Fonte Boa';
  if (nome.includes('São Gabriel')) return 'Destacamento São Gabriel';
  return nome.replace(/\s*\([^)]*\)/g, '').trim() || fallback;
}

/**
 * Resolve com precisão as três dimensões solicitadas pelo usuário:
 * 1. De onde ele é (Lotação / Origem)
 * 2. Onde está trabalhando (Local de Trabalho / Exercício)
 * 3. De qual setor se existir (Setor)
 */
export function resolveEmployeeOrgInfo(
  emp: Employee, 
  constructionSites: ConstructionSite[] = []
): EmployeeOrgDisplayInfo {
  const sedeCodigo = (emp.sedeCodigo || 'BE').toUpperCase().trim();
  const sedeNome = SEDE_NOMES[sedeCodigo] || sedeCodigo;

  // -------------------------------------------------------------
  // 1. Identificar se há setor explícito ou mapeado
  // -------------------------------------------------------------
  let setorEncontrado: UnidadeOrganizacional | null = null;

  // Procura se a lotação é diretamente um setor
  const uoLotacao = emp.lotacaoUoCodigo ? UNIDADES_ORGANIZACIONAIS[emp.lotacaoUoCodigo] : null;
  if (uoLotacao && (uoLotacao.tipo === 'SETOR' || uoLotacao.codigo.startsWith('SETOR_'))) {
    setorEncontrado = uoLotacao;
  }

  // Se não achou na lotação, procura na UO de execução
  if (!setorEncontrado && emp.uoExecucaoCodigo) {
    const uoExec = UNIDADES_ORGANIZACIONAIS[emp.uoExecucaoCodigo];
    if (uoExec && (uoExec.tipo === 'SETOR' || uoExec.codigo.startsWith('SETOR_'))) {
      setorEncontrado = uoExec;
    }
  }

  // Se ainda não achou, checa via departamentoOriginal
  if (!setorEncontrado && emp.departamentoOriginal) {
    const deptoNorm = emp.departamentoOriginal.toUpperCase().trim();
    const aliasCodigo = ALIASES_DEPARTAMENTO_CSV[deptoNorm];
    if (aliasCodigo && UNIDADES_ORGANIZACIONAIS[aliasCodigo]) {
      const uoAlias = UNIDADES_ORGANIZACIONAIS[aliasCodigo];
      if (uoAlias.tipo === 'SETOR' || uoAlias.codigo.startsWith('SETOR_')) {
        setorEncontrado = uoAlias;
      }
    }
  }

  const temSetor = Boolean(setorEncontrado);
  const setorCodigo = setorEncontrado?.codigo;
  const setorSigla = setorEncontrado?.siglaExibicao || (setorEncontrado ? setorEncontrado.codigo.replace('SETOR_', '') : undefined);
  const setorNome = setorEncontrado?.nome;
  const setorFormatado = temSetor 
    ? (setorSigla && setorNome && !setorNome.startsWith(setorSigla) 
        ? `${setorSigla} • ${setorNome}` 
        : setorNome || setorSigla || '—')
    : '—';

  // -------------------------------------------------------------
  // 2. De onde ele é (Lotação / Origem Administrativa)
  // -------------------------------------------------------------
  let lotacaoCodigo = emp.lotacaoUoCodigo || '';
  let lotacaoNome = '';
  let lotacaoSigla = '';

  // Se a UO de lotação for um setor, a lotação de origem é a UO PAI desse setor
  if (uoLotacao) {
    if (uoLotacao.tipo === 'SETOR' && uoLotacao.pai && UNIDADES_ORGANIZACIONAIS[uoLotacao.pai]) {
      const uoPai = UNIDADES_ORGANIZACIONAIS[uoLotacao.pai];
      lotacaoCodigo = uoPai.codigo;
      lotacaoNome = simplificarNomeUo(uoPai.nome, `Sede ${sedeNome}`);
      lotacaoSigla = uoPai.siglaExibicao || uoPai.codigo;
    } else {
      lotacaoNome = simplificarNomeUo(uoLotacao.nome, `Sede ${sedeNome}`);
      lotacaoSigla = uoLotacao.siglaExibicao || uoLotacao.codigo;
    }
  } else {
    // Fallback baseado na sede territorial
    if (sedeCodigo === 'BE') {
      lotacaoCodigo = 'SEDE_BE';
      lotacaoNome = 'Sede Belém';
      lotacaoSigla = 'SEDE-BE';
    } else if (sedeCodigo === 'KO') {
      lotacaoCodigo = 'DECO_KO';
      lotacaoNome = 'Destacamento Coari';
      lotacaoSigla = 'DECO-KO';
    } else if (sedeCodigo === 'MN') {
      lotacaoCodigo = 'DACO_MN';
      lotacaoNome = 'Destacamento Manaus';
      lotacaoSigla = 'DACO-MN';
    } else if (sedeCodigo === 'FB') {
      lotacaoCodigo = 'DECO_PFB';
      lotacaoNome = 'Destacamento Fonte Boa';
      lotacaoSigla = 'DECO-PFB';
    } else {
      lotacaoCodigo = `SEDE_${sedeCodigo}`;
      lotacaoNome = `Sede ${sedeNome}`;
      lotacaoSigla = sedeCodigo;
    }
  }

  const origemFormatada = `${lotacaoNome} (${sedeCodigo})`;

  // -------------------------------------------------------------
  // 3. Onde está trabalhando (Local de Trabalho / Exercício)
  // -------------------------------------------------------------
  let localTrabalhoNome = '';
  let localTrabalhoDetalhe: string | undefined = undefined;
  let localTrabalhoBadge: string | undefined = undefined;
  let isEmCanteiro = false;
  let isDeslocado = false;

  // Prioridade A: Canteiro de Obras ativo / atribuído
  if (emp.canteiroExecucaoId && emp.canteiroExecucaoId !== 'Não informado') {
    const site = constructionSites.find(
      (s) => s.id === emp.canteiroExecucaoId || s.codigo === emp.canteiroExecucaoId || s.code === emp.canteiroExecucaoId
    );
    if (site) {
      isEmCanteiro = true;
      localTrabalhoNome = site.nome || site.name || `Canteiro ${site.codigo || site.code}`;
      localTrabalhoBadge = site.codigo || site.code || site.sedeCodigo || site.branch;
      localTrabalhoDetalhe = 'Canteiro de Obras';
      isDeslocado = true;
    }
  }

  // Prioridade B: UO de Execução explícita
  if (!isEmCanteiro && emp.uoExecucaoCodigo) {
    const uoExec = UNIDADES_ORGANIZACIONAIS[emp.uoExecucaoCodigo];
    if (uoExec) {
      if (uoExec.tipo === 'SETOR' && uoExec.pai && UNIDADES_ORGANIZACIONAIS[uoExec.pai]) {
        const uoExecPai = UNIDADES_ORGANIZACIONAIS[uoExec.pai];
        localTrabalhoNome = simplificarNomeUo(uoExecPai.nome, `Sede ${sedeNome}`);
        localTrabalhoBadge = uoExecPai.sedeOuCanteiroPadrao || sedeCodigo;
      } else {
        localTrabalhoNome = simplificarNomeUo(uoExec.nome, `Sede ${sedeNome}`);
        localTrabalhoBadge = uoExec.sedeOuCanteiroPadrao || sedeCodigo;
      }
    } else {
      localTrabalhoNome = emp.uoExecucaoCodigo;
      localTrabalhoBadge = sedeCodigo;
    }

    // Verificar se difere da lotação de origem
    const execSede = uoExec?.sedeOuCanteiroPadrao;
    if (execSede && execSede !== sedeCodigo) {
      isDeslocado = true;
      localTrabalhoDetalhe = `Deslocado em ${SEDE_NOMES[execSede] || execSede}`;
    }
  }

  // Fallback: se não tiver canteiro nem UO de execução distinta, trabalha na mesma lotação
  if (!localTrabalhoNome) {
    localTrabalhoNome = lotacaoNome;
    localTrabalhoBadge = sedeCodigo;
    localTrabalhoDetalhe = 'Na Lotação';
  }

  return {
    sedeCodigo,
    sedeNome,
    lotacaoCodigo,
    lotacaoNome,
    lotacaoSigla,
    origemFormatada,

    localTrabalhoNome,
    localTrabalhoDetalhe,
    localTrabalhoBadge,
    isEmCanteiro,
    isDeslocado,

    temSetor,
    setorCodigo,
    setorSigla,
    setorNome,
    setorFormatado,
  };
}
