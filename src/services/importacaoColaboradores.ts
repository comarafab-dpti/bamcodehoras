/**
 * Serviço de Importação e Normalização de Colaboradores a partir de CSVs legados.
 * Responsável por parsing seguro, higienização, mascaramento de CPF e classificação de UOs.
 */

import Papa from 'papaparse';
import { Employee, Branch, EmployeeStatus, ResultadoNormalizacaoUO } from '../types';
import { normalizarDepartamentoCSV, UNIDADES_ORGANIZACIONAIS } from '../constants/unidadesOrganizacionais';
import { cleanCPF, isValidCPF, maskCPF, generateCPFHash } from '../utils/lgpdUtils';
import { sanitizeCsvCell } from '../utils/csvHandler';

/**
 * Representa os campos brutos esperados de uma linha do CSV legado.
 */
export interface CsvColaborador {
  nome_completo: string;
  estagiario?: string;
  interno?: string;
  pis?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  empresa_documento?: string;
  departamento_nome: string;
  cargo_nome: string;
  cargo_cbo?: string;
  horario_nome?: string;
  horista?: string;
  cpf: string;
  data_admissao?: string;
  data_nascimento?: string;
  data_demissao?: string;
  matricula: string;
  codigo_externo?: string;
  endereco_cep?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  [key: string]: any;
}

/**
 * Colaborador preparado e enriquecido no processo de importação.
 */
export interface ImportacaoColaborador {
  colaborador: Partial<Employee>;
  departamentoOriginal: string;
  classificacao: ResultadoNormalizacaoUO;
  pendenteClassificacao: boolean;
  linhaOriginal: number;
  valido: boolean;
  errosValidacao: string[];
}

/**
 * Erro específico de validação de registro no CSV.
 */
export interface ImportacaoErroItem {
  linha: number;
  matricula?: string;
  nome?: string;
  motivo: string;
}

/**
 * Contagem de ocorrências de departamento não reconhecido.
 */
export interface DepartamentoPendenteContagem {
  departamento: string;
  ocorrencias: number;
}

/**
 * Resultado completo do processamento de um CSV de colaboradores.
 */
export interface ImportacaoResultado {
  totalLinhas: number;
  totalValidos: number;
  totalPendentes: number;
  totalErros: number;
  erros: ImportacaoErroItem[];
  departamentosNaoClassificados: DepartamentoPendenteContagem[];
  colaboradoresValidos: ImportacaoColaborador[];
  colaboradoresPendentes: ImportacaoColaborador[];
  todosColaboradores: ImportacaoColaborador[];
}

/**
 * Monta um payload esparso para o upsert periódico. Campos ausentes não são
 * enviados, permitindo que o merge preserve dados que não vieram no CSV.
 */
export function prepararPayloadImportacao(
  colaborador: Partial<Employee>,
  preservarOrganizacao = false
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const matricula = (colaborador.matricula || colaborador.id || '').trim().toUpperCase();
  if (matricula) {
    payload.id = matricula;
    payload.matricula = matricula;
  }
  const campos = [
    'nome', 'funcao', 'cargo', 'email', 'telefone', 'celular', 'pis',
    'codigoExterno', 'cpf', 'cpfHash', 'cpfMascarado', 'dataAdmissao',
    'dataNascimento', 'dataDemissao', 'status', 'sede', 'sede_origem',
    'sede_atual', 'lotacao', 'uoExecucao', 'secaoLotacao', 'canteiroId',
    'sedeCodigo', 'lotacaoUoCodigo', 'uoExecucaoCodigo',
    'canteiroExecucaoId', 'departamentoOriginal', 'departamento',
  ] as const;

  for (const campo of campos) {
    const valor = colaborador[campo];
    if (valor !== undefined && valor !== null && valor !== '') {
      payload[campo] = valor;
    }
  }

  if (preservarOrganizacao) {
    for (const campo of [
      'sede', 'sede_origem', 'sede_atual', 'lotacao', 'uoExecucao',
      'secaoLotacao', 'canteiroId', 'sedeCodigo', 'lotacaoUoCodigo',
      'uoExecucaoCodigo', 'canteiroExecucaoId', 'departamentoOriginal',
      'departamento',
    ]) {
      delete payload[campo];
    }
  }

  return payload;
}

/** Preserva o departamento original já registrado durante atualizações periódicas. */
export function preservarDepartamentoOriginal(
  payload: Record<string, unknown>,
  existente?: Pick<Employee, 'departamentoOriginal'>
): Record<string, unknown> {
  if (existente?.departamentoOriginal) {
    return { ...payload, departamentoOriginal: existente.departamentoOriginal };
  }
  return payload;
}

/**
 * Ordem padrão das 22 colunas conforme layout oficial fornecido.
 */
export const ORDEM_COLUNAS_CSV_PADRAO: (keyof CsvColaborador)[] = [
  'nome_completo',
  'estagiario',
  'interno',
  'pis',
  'email',
  'telefone',
  'celular',
  'empresa_documento',
  'departamento_nome',
  'cargo_nome',
  'cargo_cbo',
  'horario_nome',
  'horista',
  'cpf',
  'data_admissao',
  'data_nascimento',
  'data_demissao',
  'matricula',
  'codigo_externo',
  'endereco_cep',
  'endereco_numero',
  'endereco_complemento',
];

/**
 * Normaliza o cabeçalho de uma coluna para compatibilização (snake_case sem acento).
 */
export function normalizarNomeColuna(nome: string): string {
  return sanitizeCsvCell(nome)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Converte datas em múltiplos formatos (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD) para ISO (YYYY-MM-DD).
 */
export function normalizarDataIso(dataStr?: string | null): string {
  if (!dataStr) return '';
  const limpo = sanitizeCsvCell(dataStr).trim();
  if (!limpo) return '';

  // Formato DD/MM/YYYY ou DD-MM-YYYY
  const brMatch = limpo.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
  if (brMatch) {
    const dia = brMatch[1].padStart(2, '0');
    const mes = brMatch[2].padStart(2, '0');
    const ano = brMatch[3];
    return `${ano}-${mes}-${dia}`;
  }

  // Formato YYYY-MM-DD ou YYYY/MM/DD
  const isoMatch = limpo.match(/^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})$/);
  if (isoMatch) {
    const ano = isoMatch[1];
    const mes = isoMatch[2].padStart(2, '0');
    const dia = isoMatch[3].padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  return limpo;
}

/**
 * Realiza o parsing seguro do CSV considerando aspas duplas, vírgulas internas e diferentes quebras de linha.
 */
export function parseCsvColaboradores(texto: string): CsvColaborador[] {
  if (!texto || !texto.trim()) return [];

  const parseResult = Papa.parse<string[]>(texto, {
    skipEmptyLines: 'greedy',
  });

  const rows = parseResult.data;
  if (!rows || rows.length === 0) return [];

  const primeiraLinha = rows[0].map(c => normalizarNomeColuna(c));

  // Verifica se a primeira linha contém cabeçalhos identificáveis
  const contemCabecalho = primeiraLinha.some(c =>
    c.includes('nome') ||
    c.includes('matricula') ||
    c.includes('cpf') ||
    c.includes('departamento') ||
    c.includes('cargo')
  );

  let headerIndices: Record<string, number> = {};
  let dataRows: string[][] = [];

  if (contemCabecalho) {
    primeiraLinha.forEach((header, index) => {
      headerIndices[header] = index;
    });
    dataRows = rows.slice(1);
  } else {
    // Sem cabeçalho: usa o layout fixo de 22 colunas na ordem
    ORDEM_COLUNAS_CSV_PADRAO.forEach((col, index) => {
      headerIndices[col] = index;
    });
    dataRows = rows;
  }

  const getVal = (row: string[], key: string, fallbackIdx?: number): string => {
    // 1. Busca por nome normalizado direto
    if (headerIndices[key] !== undefined && row[headerIndices[key]] !== undefined) {
      return sanitizeCsvCell(row[headerIndices[key]]);
    }
    // 2. Busca aproximada por palavra-chave se não achar exato
    const foundKey = Object.keys(headerIndices).find(h => h.includes(key) || key.includes(h));
    if (foundKey && row[headerIndices[foundKey]] !== undefined) {
      return sanitizeCsvCell(row[headerIndices[foundKey]]);
    }
    // 3. Fallback de índice
    if (fallbackIdx !== undefined && row[fallbackIdx] !== undefined) {
      return sanitizeCsvCell(row[fallbackIdx]);
    }
    return '';
  };

  return dataRows.map((row, idx) => {
    // Mapeamento tolerante a variações comuns
    const nome = getVal(row, 'nome_completo', 0) || getVal(row, 'nome', 0);
    const estagiario = getVal(row, 'estagiario', 1);
    const interno = getVal(row, 'interno', 2);
    const pis = getVal(row, 'pis', 3);
    const email = getVal(row, 'email', 4);
    const telefone = getVal(row, 'telefone', 5);
    const celular = getVal(row, 'celular', 6);
    const empresaDoc = getVal(row, 'empresa_documento', 7);
    const depto = getVal(row, 'departamento_nome', 8) || getVal(row, 'departamento', 8);
    const cargo = getVal(row, 'cargo_nome', 9) || getVal(row, 'cargo', 9);
    const cargoCbo = getVal(row, 'cargo_cbo', 10);
    const horario = getVal(row, 'horario_nome', 11);
    const horista = getVal(row, 'horista', 12);
    const cpf = getVal(row, 'cpf', 13);
    const dtAdmissao = getVal(row, 'data_admissao', 14) || getVal(row, 'admissao', 14);
    const dtNasc = getVal(row, 'data_nascimento', 15) || getVal(row, 'nascimento', 15);
    const dtDemissao = getVal(row, 'data_demissao', 16) || getVal(row, 'demissao', 16);
    const matricula = getVal(row, 'matricula', 17);
    const codExterno = getVal(row, 'codigo_externo', 18);
    const cep = getVal(row, 'endereco_cep', 19);
    const num = getVal(row, 'endereco_numero', 20);
    const compl = getVal(row, 'endereco_complemento', 21);

    return {
      nome_completo: nome,
      estagiario,
      interno,
      pis,
      email,
      telefone,
      celular,
      empresa_documento: empresaDoc,
      departamento_nome: depto,
      cargo_nome: cargo,
      cargo_cbo: cargoCbo,
      horario_nome: horario,
      horista,
      cpf,
      data_admissao: dtAdmissao,
      data_nascimento: dtNasc,
      data_demissao: dtDemissao,
      matricula,
      codigo_externo: codExterno,
      endereco_cep: cep,
      endereco_numero: num,
      endereco_complemento: compl,
    };
  });
}

/**
 * Mapeia um registro bruto do CSV para a entidade Employee e dados de validação.
 */
export async function mapearColaboradorCsv(
  item: CsvColaborador,
  linhaOriginal: number = 0
): Promise<ImportacaoColaborador> {
  const errosValidacao: string[] = [];

  // 1. Matrícula (obrigatória e normalizada)
  const matriculaLimpa = (item.matricula || '').toString().trim();
  if (!matriculaLimpa) {
    errosValidacao.push('Matrícula ausente ou em branco');
  }

  // 2. Nome completo (obrigatório)
  const nomeLimpo = (item.nome_completo || '').toString().trim();
  if (!nomeLimpo) {
    errosValidacao.push('Nome completo ausente ou em branco');
  }

  // 3. CPF (obrigatório e validado conforme LGPD)
  const cpfBruto = (item.cpf || '').toString().trim();
  const cpfLimpo = cleanCPF(cpfBruto);
  let cpfHash = '';
  let cpfMascarado = '';

  if (!cpfBruto) {
    errosValidacao.push('CPF ausente');
  } else if (!isValidCPF(cpfLimpo)) {
    errosValidacao.push(`CPF inválido ou mal formatado: "${cpfBruto}"`);
  } else {
    cpfHash = await generateCPFHash(cpfLimpo);
    cpfMascarado = maskCPF(cpfLimpo);
  }

  // 4. Departamento e UO de Lotação / Execução
  const departamentoOriginal = (item.departamento_nome || '').toString().trim();
  const classificacao = normalizarDepartamentoCSV(departamentoOriginal);
  const pendenteClassificacao = classificacao.confianca === 'NAO_CLASSIFICADO';

  const codigoUo = classificacao.unidade.codigo;

  // Determina a sede de compatibilidade (Branch)
  let branchCompativel: Branch = 'BE';
  const canteiroPadrao = classificacao.unidade.sedeOuCanteiroPadrao;
  if (canteiroPadrao) {
    branchCompativel = canteiroPadrao as Branch;
  }

  // Datas
  const dataAdmissao = normalizarDataIso(item.data_admissao);
  const dataNascimento = normalizarDataIso(item.data_nascimento);
  const dataDemissao = normalizarDataIso(item.data_demissao);

  // Status funcional: inativo se houver data de demissão preenchida
  let status: EmployeeStatus = 'Ativo';
  if (dataDemissao) {
    status = 'Inativo';
  }

  // Montagem do objeto colaborador mapeado
  const colaborador: Partial<Employee> = {
    matricula: matriculaLimpa,
    nome: nomeLimpo,
    funcao: (item.cargo_nome || '').toString().trim() || 'Colaborador',
    cargo: (item.cargo_nome || '').toString().trim(),
    email: (item.email || '').toString().trim() || undefined,
    telefone: (item.telefone || '').toString().trim() || undefined,
    celular: (item.celular || '').toString().trim() || undefined,
    pis: (item.pis || '').toString().trim() || undefined,
    codigoExterno: (item.codigo_externo || '').toString().trim() || undefined,
    cpf: cpfLimpo || undefined,
    cpfHash: cpfHash || undefined,
    cpfMascarado: cpfMascarado || undefined,
    dataAdmissao: dataAdmissao || new Date().toISOString().split('T')[0],
    dataNascimento: dataNascimento || undefined,
    dataDemissao: dataDemissao || undefined,
    status,
    lotacao: codigoUo,
    uoExecucao: codigoUo,
    departamentoOriginal: departamentoOriginal || undefined,
    lotacaoUoCodigo: codigoUo,
    uoExecucaoCodigo: codigoUo,
    sedeCodigo: canteiroPadrao || undefined,
    canteiroExecucaoId: undefined,
    sede: branchCompativel,
    sede_origem: branchCompativel,
    sede_atual: branchCompativel,
    secaoLotacao: classificacao.unidade.siglaExibicao,
    departamento: classificacao.unidade.nome,
  };

  const valido = errosValidacao.length === 0;

  return {
    colaborador,
    departamentoOriginal,
    classificacao,
    pendenteClassificacao,
    linhaOriginal,
    valido,
    errosValidacao,
  };
}

/**
 * Processa um conteúdo CSV completo e gera o resultado discriminado com contadores,
 * registros válidos, registros pendentes de classificação de UO e erros de integridade.
 * NÃO grava no Firestore (apenas retorna os dados processados para a interface/fluxo).
 */
export async function importarColaboradoresCsv(texto: string): Promise<ImportacaoResultado> {
  const itensBrutos = parseCsvColaboradores(texto);
  const todosColaboradores: ImportacaoColaborador[] = [];
  const erros: ImportacaoErroItem[] = [];
  const departamentosNaoClassificadosMap = new Map<string, number>();

  for (let i = 0; i < itensBrutos.length; i++) {
    const linhaNum = i + 1; // 1-based index (contando linha de dados)
    const itemBruto = itensBrutos[i];
    const importado = await mapearColaboradorCsv(itemBruto, linhaNum);

    todosColaboradores.push(importado);

    if (!importado.valido) {
      erros.push({
        linha: linhaNum,
        matricula: itemBruto.matricula || undefined,
        nome: itemBruto.nome_completo || undefined,
        motivo: importado.errosValidacao.join('; '),
      });
    }

    if (importado.pendenteClassificacao) {
      const depto = importado.departamentoOriginal || '(vazio)';
      departamentosNaoClassificadosMap.set(
        depto,
        (departamentosNaoClassificadosMap.get(depto) || 0) + 1
      );
    }
  }

  // Colaboradores válidos (sem erros de validação) separados por status de classificação
  const colaboradoresValidos = todosColaboradores.filter(
    c => c.valido && !c.pendenteClassificacao
  );
  const colaboradoresPendentes = todosColaboradores.filter(
    c => c.valido && c.pendenteClassificacao
  );

  const departamentosNaoClassificados: DepartamentoPendenteContagem[] = Array.from(
    departamentosNaoClassificadosMap.entries()
  ).map(([departamento, ocorrencias]) => ({
    departamento,
    ocorrencias,
  }));

  return {
    totalLinhas: itensBrutos.length,
    totalValidos: colaboradoresValidos.length,
    totalPendentes: colaboradoresPendentes.length,
    totalErros: erros.length,
    erros,
    departamentosNaoClassificados,
    colaboradoresValidos,
    colaboradoresPendentes,
    todosColaboradores,
  };
}
