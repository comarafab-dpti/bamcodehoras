/**
 * Suíte de Testes da Classificação Interativa e Resolução de Pendências (Etapa 3b)
 * Executável via tsx: npx tsx src/services/classificacaoInterativa.test.ts
 */

import {
  aplicarClassificacaoExistente,
  aplicarNovoSetor,
  validarParametrosNovaUO,
  manterNaoClassificado,
  analisarConflitosMatricula,
  particionarEmLotes,
  LIMITE_LOTE_FIRESTORE,
} from './classificacaoInterativa';
import { ImportacaoColaborador } from './importacaoColaboradores';
import { UNIDADES_ORGANIZACIONAIS, normalizarDepartamentoCSV } from '../constants/unidadesOrganizacionais';
import { Employee } from '../types';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName} ${detail ? `-> ${detail}` : ''}`);
  }
}

console.log('\n================================================================');
console.log('🧪 TESTES: CLASSIFICAÇÃO INTERATIVA E RESOLUÇÃO DE UOS (ETAPA 3b)');
console.log('================================================================\n');

// Mock de colaboradores com pendências
const mockPendentes: ImportacaoColaborador[] = [
  {
    colaborador: {
      matricula: '1001',
      nome: 'CARLOS ALBERTO',
      funcao: 'OPERADOR',
      lotacao: 'NAO_CLASSIFICADO',
      uoExecucao: 'NAO_CLASSIFICADO',
      sede: 'BE',
      dataAdmissao: '2026-01-01',
      status: 'Ativo',
    },
    departamentoOriginal: 'Setor Desconhecido Alpha',
    classificacao: {
      unidade: UNIDADES_ORGANIZACIONAIS.NAO_CLASSIFICADO,
      confianca: 'NAO_CLASSIFICADO',
      codigoOriginal: 'Setor Desconhecido Alpha',
    },
    pendenteClassificacao: true,
    linhaOriginal: 2,
    valido: true,
    errosValidacao: [],
  },
  {
    colaborador: {
      matricula: '1002',
      nome: 'BEATRIZ SILVEIRA',
      funcao: 'TECNICA',
      lotacao: 'NAO_CLASSIFICADO',
      uoExecucao: 'NAO_CLASSIFICADO',
      sede: 'BE',
      dataAdmissao: '2026-01-01',
      status: 'Ativo',
    },
    departamentoOriginal: 'Setor Desconhecido Alpha',
    classificacao: {
      unidade: UNIDADES_ORGANIZACIONAIS.NAO_CLASSIFICADO,
      confianca: 'NAO_CLASSIFICADO',
      codigoOriginal: 'Setor Desconhecido Alpha',
    },
    pendenteClassificacao: true,
    linhaOriginal: 3,
    valido: true,
    errosValidacao: [],
  },
  {
    colaborador: {
      matricula: '1003',
      nome: 'DANIEL FERREIRA',
      funcao: 'MOTORISTA',
      lotacao: 'NAO_CLASSIFICADO',
      uoExecucao: 'NAO_CLASSIFICADO',
      sede: 'BE',
      dataAdmissao: '2026-01-01',
      status: 'Ativo',
    },
    departamentoOriginal: 'Outro Setor Misterioso',
    classificacao: {
      unidade: UNIDADES_ORGANIZACIONAIS.NAO_CLASSIFICADO,
      confianca: 'NAO_CLASSIFICADO',
      codigoOriginal: 'Outro Setor Misterioso',
    },
    pendenteClassificacao: true,
    linhaOriginal: 4,
    valido: true,
    errosValidacao: [],
  },
];

function runTests() {
  // -------------------------------------------------------------
  // TESTE 1: Limite de Lote do Firestore
  // -------------------------------------------------------------
  console.log('--- Teste 1: Limite de Lote e Particionamento ---');
  assert(LIMITE_LOTE_FIRESTORE === 400, 'Limite de lote do Firestore está fixado em exatamente 400 documentos');

  // Testa fatiamento de 950 itens em lotes de 400 (esperado: 400 + 400 + 150 = 3 lotes)
  const itensSimulados = Array.from({ length: 950 }, (_, i) => i);
  const lotes = particionarEmLotes(itensSimulados, 400);
  assert(lotes.length === 3, `950 itens fatiados em 400 resultam em 3 lotes (obteve ${lotes.length})`);
  assert(lotes[0].length === 400, 'Lote 1 possui 400 itens');
  assert(lotes[1].length === 400, 'Lote 2 possui 400 itens');
  assert(lotes[2].length === 150, 'Lote 3 possui 150 itens');

  // -------------------------------------------------------------
  // TESTE 2: Opção A - Associar a uma UO Existente
  // -------------------------------------------------------------
  console.log('\n--- Teste 2: Opção A - Associar a UO Existente ---');
  const uoDestino = UNIDADES_ORGANIZACIONAIS.DECO_KO;
  const resultadoA = aplicarClassificacaoExistente(
    mockPendentes,
    'Setor Desconhecido Alpha',
    uoDestino
  );

  assert(resultadoA.length === 3, 'Mantém a contagem de colaboradores');
  const item1 = resultadoA[0];
  assert(item1.colaborador.lotacao === 'DECO_KO', 'Colaborador 1001 atualizado com lotação DECO_KO');
  assert(item1.colaborador.uoExecucao === 'DECO_KO', 'Colaborador 1001 uoExecucao DECO_KO');
  assert(item1.colaborador.sede === 'KO', 'Colaborador 1001 sede atualizada para KO');
  assert(item1.colaborador.secaoLotacao === 'DECO-KO', 'Colaborador 1001 secaoLotacao DECO-KO');
  assert(item1.pendenteClassificacao === false, 'Colaborador 1001 não está mais pendente');
  assert(item1.valido === true, 'Colaborador 1001 é válido para importação');

  const item2 = resultadoA[1];
  assert(item2.colaborador.lotacao === 'DECO_KO', 'Colaborador 1002 atualizado com lotação DECO_KO');
  assert(item2.pendenteClassificacao === false, 'Colaborador 1002 não está mais pendente');

  const item3 = resultadoA[2];
  assert(
    item3.colaborador.lotacao === 'NAO_CLASSIFICADO',
    'Colaborador 1003 (Outro Setor) não foi afetado indevidamente'
  );
  assert(item3.pendenteClassificacao === true, 'Colaborador 1003 permanece pendente');

  // -------------------------------------------------------------
  // TESTE 3: Opção B - Criação de Novas UOs e Hierarquia de UO Pai (Etapa 3c)
  // -------------------------------------------------------------
  console.log('\n--- Teste 3: Opção B - Criação de Novas UOs e UO Pai ---');

  // Teste 3.1: Validação de obrigatoriedade do pai para SETOR (deve falhar se ausente)
  const validacaoSetorSemPai = validarParametrosNovaUO({
    nome: 'Setor Sem Pai',
    sigla: 'SSP',
    tipo: 'SETOR',
  });
  assert(validacaoSetorSemPai.valido === false, 'Validação rejeita criação de SETOR sem UO pai');
  assert(
    validacaoSetorSemPai.erro?.includes('UO pai') === true,
    'Mensagem de erro explicita a obrigatoriedade da UO pai'
  );

  let erroLancadoAoCriarSemPai = false;
  try {
    aplicarNovoSetor(mockPendentes, 'Outro Setor Misterioso', {
      nome: 'Setor Sem Pai',
      sigla: 'SSP',
      tipo: 'SETOR',
    });
  } catch (err: any) {
    erroLancadoAoCriarSemPai = true;
    assert(err.message.includes('UO pai'), 'aplicarNovoSetor lança exceção ao tentar criar SETOR sem UO pai');
  }
  assert(erroLancadoAoCriarSemPai === true, 'Tentativa de criar SETOR sem pai bloqueada com exceção');

  // Teste 3.2: Criação de SETOR com pai informado (sucesso)
  const { colaboradoresAtualizados: resultadoB, novaUo } = aplicarNovoSetor(
    mockPendentes,
    'Outro Setor Misterioso',
    {
      nome: 'Divisão de TI e Telecomunicações',
      sigla: 'DTI',
      tipo: 'SETOR',
      pai: 'SEDE_BE',
      sedeOuCanteiroPadrao: 'BE',
    }
  );

  assert(novaUo.codigo === 'SETOR_DTI', 'Gera código de UO normalizado: SETOR_DTI');
  assert(novaUo.siglaExibicao === 'DTI', 'Sigla de exibição DTI');
  assert(novaUo.tipo === 'SETOR', 'Tipo da UO é SETOR');
  assert(novaUo.pai === 'SEDE_BE', 'Campo pai preenchido corretamente com SEDE_BE');
  assert(novaUo.ativa === true, 'Nova UO nasce ativa');

  const itemB3 = resultadoB.find(c => c.colaborador.matricula === '1003');
  assert(itemB3?.colaborador.lotacao === 'SETOR_DTI', 'Colaborador 1003 atualizado para SETOR_DTI');
  assert(itemB3?.pendenteClassificacao === false, 'Colaborador 1003 deixou de ser pendente');
  assert(itemB3?.colaborador.departamento === 'Divisão de TI e Telecomunicações', 'Nome do departamento atualizado');

  // Teste 3.3: Criação de DECO sem exigir pai (assume COMARA)
  const validacaoDeco = validarParametrosNovaUO({
    nome: 'Destacamento de Engenharia de São Gabriel',
    sigla: 'DECO_SGC',
    tipo: 'DECO',
  });
  assert(validacaoDeco.valido === true, 'Validação aceita criação de DECO sem informar UO pai');

  const { novaUo: novaUoDeco } = aplicarNovoSetor([], 'DECO DEPOSITO SGC', {
    nome: 'Destacamento de Engenharia de São Gabriel',
    sigla: 'DECO_SGC',
    tipo: 'DECO',
    sedeOuCanteiroPadrao: 'KO',
  });
  assert(novaUoDeco.tipo === 'DECO', 'Tipo é DECO');
  assert(novaUoDeco.pai === 'COMARA', 'DECO assume COMARA como UO pai implicitamente');
  assert(novaUoDeco.codigo === 'DECO_SGC', 'Código DECO_SGC gerado corretamente');

  // Teste 3.4: Criação de DACO sem exigir pai (assume COMARA)
  const validacaoDaco = validarParametrosNovaUO({
    nome: 'Destacamento de Apoio de Porto Velho',
    sigla: 'DACO_PVH',
    tipo: 'DACO',
  });
  assert(validacaoDaco.valido === true, 'Validação aceita criação de DACO sem informar UO pai');

  const { novaUo: novaUoDaco } = aplicarNovoSetor([], 'DACO PORTO VELHO', {
    nome: 'Destacamento de Apoio de Porto Velho',
    sigla: 'DACO_PVH',
    tipo: 'DACO',
    sedeOuCanteiroPadrao: 'MN',
  });
  assert(novaUoDaco.tipo === 'DACO', 'Tipo é DACO');
  assert(novaUoDaco.pai === 'COMARA', 'DACO assume COMARA como UO pai implicitamente');
  assert(novaUoDaco.codigo === 'DACO_PVH', 'Código DACO_PVH gerado corretamente');

  // Teste 3.5: Registro em memória e resolução imediata via normalizarDepartamentoCSV
  const normalizacaoImediata = normalizarDepartamentoCSV('Outro Setor Misterioso');
  assert(
    normalizacaoImediata.unidade.codigo === 'SETOR_DTI',
    'Nova UO cadastrada passa a ser resolvida imediatamente em memória'
  );
  assert(
    normalizacaoImediata.confianca === 'ALTA',
    'Confiança da resolução da UO recém-registrada é ALTA'
  );

  // -------------------------------------------------------------
  // TESTE 4: Opção C - Manter Não Classificado
  // -------------------------------------------------------------
  console.log('\n--- Teste 4: Opção C - Manter Não Classificado ---');
  const resultadoC = manterNaoClassificado(mockPendentes, 'Setor Desconhecido Alpha');
  const itemC1 = resultadoC[0];
  assert(itemC1.colaborador.lotacao === 'NAO_CLASSIFICADO', 'Lotação mantida como NAO_CLASSIFICADO');
  assert(itemC1.pendenteClassificacao === false, 'Pendência marcada como resolvida (permitindo prosseguir)');
  assert(itemC1.classificacao.unidade.codigo === 'NAO_CLASSIFICADO', 'Classificação associada à UO Não Classificado');

  // -------------------------------------------------------------
  // TESTE 5: Análise Prévia de Conflitos de Matrícula (Novos vs Existentes)
  // -------------------------------------------------------------
  console.log('\n--- Teste 5: Análise de Conflitos de Matrícula ---');
  const mockExistentesNoBanco: Employee[] = [
    {
      id: '1001',
      matricula: '1001',
      nome: 'CARLOS ALBERTO ANTIGO',
      funcao: 'AJUDANTE',
      status: 'Ativo',
      saldoInicialHoras: 10,
      sede: 'BE',
      dataAdmissao: '2026-01-01',
    },
    {
      id: '9999',
      matricula: '9999',
      nome: 'SERVIDOR QUE NAO VEM NO CSV',
      funcao: 'ANALISTA',
      status: 'Ativo',
      saldoInicialHoras: 0,
      sede: 'BE',
      dataAdmissao: '2026-01-01',
    },
  ];

  const conflitos = analisarConflitosMatricula(mockPendentes, mockExistentesNoBanco);
  assert(conflitos.totalNovos === 2, `Total de novos deve ser 2 (obteve ${conflitos.totalNovos})`);
  assert(conflitos.totalAtualizacoes === 1, `Total de atualizações deve ser 1 (obteve ${conflitos.totalAtualizacoes})`);
  assert(
    conflitos.atualizacoes[0].existente.matricula === '1001',
    'Identificou corretamente matrícula 1001 como existente'
  );
  assert(
    conflitos.novos.some(n => n.colaborador.matricula === '1002'),
    'Matrícula 1002 identificada como novo registro'
  );
  assert(
    conflitos.novos.some(n => n.colaborador.matricula === '1003'),
    'Matrícula 1003 identificada como novo registro'
  );

  console.log('\n================================================================');
  console.log(`📊 RESULTADOS: ${passedTests}/${totalTests} testes passaram.`);
  if (failedTests > 0) {
    console.error(`❌ ${failedTests} testes falharam.`);
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES DA ETAPA 3b (SERVIÇOS PUROS) PASSARAM!');
    console.log('================================================================\n');
  }
}

runTests();
