/**
 * Suíte de Testes da Importação e Normalização de Colaboradores (Etapa 3a)
 * Executável via tsx: npx tsx src/services/importacaoColaboradores.test.ts
 */

import {
  parseCsvColaboradores,
  mapearColaboradorCsv,
  importarColaboradoresCsv,
  normalizarDataIso,
  normalizarNomeColuna,
} from './importacaoColaboradores';

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

console.log('\n=============================================================');
console.log('🧪 TESTES: SERVIÇO DE IMPORTAÇÃO DE COLABORADORES (ETAPA 3a)');
console.log('=============================================================\n');

// CSV de teste conforme o layout oficial de 22 colunas
const CSV_EXEMPLO = `nome_completo,estagiario,interno,pis,email,telefone,celular,empresa_documento,departamento_nome,cargo_nome,cargo_cbo,horario_nome,horista,cpf,data_admissao,data_nascimento,data_demissao,matricula,codigo_externo,endereco_cep,endereco_numero,endereco_complemento
"SILVA, JOAO",Nao,Sim,12345678901,joao@comara.gov.br,9130000000,91988888888,,deco-ko,OPERADOR DE MOTONIVEL,7151-15,PADRAO,Nao,123.456.789-01,10/02/2020,15/05/1985,,13974,EXT123,66000000,100,SALA 2
MARIA SANTOS,Nao,Sim,23456789012,maria@comara.gov.br,9230000000,92988888888,,daco-mn,ENCARREGADA,1234-56,PADRAO,Nao,987.654.321-09,01/03/2019,20/11/1988,,13975,,,,
CARLOS EDUARDO,Nao,Sim,,carlos@comara.gov.br,,,,SEDE,ANALISTA ADMINISTRATIVO,,,Nao,11144477735,05/01/2021,12/08/1990,,13976,,,,
ANA PAULA,Nao,Sim,,ana@comara.gov.br,,,,DL,MOTORISTA,,,Nao,22233344455,15/06/2022,30/03/1992,,13977,,,,
ROBERTO LIMA,Nao,Sim,,roberto@comara.gov.br,,,,pmac,TECNICO PAVIMENTACAO,,,Nao,33344455566,20/07/2021,10/10/1986,,13978,,,,
MARCOS SOUZA,Nao,Sim,,marcos@comara.gov.br,,,,Departamento padrão,AUXILIAR,,,Nao,44455566677,10/10/2023,01/01/1995,,13979,,,,
JOSE INVALIDO,Nao,Sim,,jose@comara.gov.br,,,,SEDE,SERVENTE,,,Nao,12345,01/01/2024,01/01/2000,,13980,,,,
SEM MATRICULA,Nao,Sim,,,,,,,SEDE,SERVENTE,,,Nao,55566677788,01/01/2024,01/01/2000,,,,,,`;

async function runTests() {
  // -------------------------------------------------------------
  // TESTE 1: Helpers de Data e Normalização de Colunas
  // -------------------------------------------------------------
  console.log('--- Teste 1: Helpers de Normalização ---');
  assert(normalizarDataIso('10/02/2020') === '2020-02-10', 'Converte DD/MM/YYYY para YYYY-MM-DD');
  assert(normalizarDataIso('2021-05-15') === '2021-05-15', 'Preserva YYYY-MM-DD');
  assert(normalizarNomeColuna(' Nome Completo ') === 'nome_completo', 'Normaliza " Nome Completo " para "nome_completo"');
  assert(normalizarNomeColuna('Departamento / Setor') === 'departamento_setor', 'Normaliza caracteres especiais em cabeçalho');

  // -------------------------------------------------------------
  // TESTE 2: Parsing Seguro de CSV
  // -------------------------------------------------------------
  console.log('\n--- Teste 2: Parsing Seguro do CSV ---');
  const linhasParseadas = parseCsvColaboradores(CSV_EXEMPLO);
  assert(linhasParseadas.length === 8, `Parseou exatamente 8 registros de dados (obteve ${linhasParseadas.length})`);
  assert(
    linhasParseadas[0].nome_completo === 'SILVA, JOAO',
    'Trata vírgula interna com aspas duplas ("SILVA, JOAO") com segurança'
  );
  assert(linhasParseadas[0].matricula === '13974', 'Extrai matrícula da coluna correta');
  assert(linhasParseadas[0].departamento_nome === 'deco-ko', 'Extrai departamento_nome correto');

  // -------------------------------------------------------------
  // TESTE 3: Mapeamento de Campos e LGPD (CPF Hash e Máscara)
  // -------------------------------------------------------------
  console.log('\n--- Teste 3: Mapeamento de Colaborador e LGPD ---');
  const mapped0 = await mapearColaboradorCsv(linhasParseadas[0], 1);
  assert(mapped0.valido === true, 'Linha 1 é válida');
  assert(mapped0.colaborador.nome === 'SILVA, JOAO', 'Mapeia nome_completo para colaborador.nome');
  assert(mapped0.colaborador.matricula === '13974', 'Mapeia matrícula corretamente');
  assert(mapped0.colaborador.funcao === 'OPERADOR DE MOTONIVEL', 'Mapeia cargo_nome para funcao');
  assert(mapped0.colaborador.cpfMascarado === '123.***.***-01', 'Gera CPF mascarado no formato LGPD (123.***.***-01)');
  assert(
    typeof mapped0.colaborador.cpfHash === 'string' && mapped0.colaborador.cpfHash.length === 64,
    'Gera hash SHA-256 válido com 64 caracteres hexadecimais'
  );
  assert(mapped0.colaborador.dataAdmissao === '2020-02-10', 'Data de admissão convertida para ISO 2020-02-10');
  assert(mapped0.colaborador.dataNascimento === '1985-05-15', 'Data de nascimento convertida para ISO');
  assert(mapped0.colaborador.email === 'joao@comara.gov.br', 'Mapeia email');
  assert(mapped0.colaborador.telefone === '9130000000', 'Mapeia telefone');
  assert(mapped0.colaborador.celular === '91988888888', 'Mapeia celular');
  assert(mapped0.colaborador.pis === '12345678901', 'Mapeia PIS');
  assert(mapped0.colaborador.codigoExterno === 'EXT123', 'Mapeia código externo');

  // -------------------------------------------------------------
  // TESTE 4: Normalização de UO (Lotação e uoExecucao)
  // -------------------------------------------------------------
  console.log('\n--- Teste 4: Normalização de UO e Compatibilidade de Sede ---');
  assert(mapped0.colaborador.lotacao === 'DECO_KO', 'Lotação normalizada para DECO_KO');
  assert(mapped0.colaborador.uoExecucao === 'DECO_KO', 'uoExecucao espelha a lotação por padrão');
  assert(mapped0.colaborador.departamentoOriginal === 'deco-ko', 'Preserva departamentoOriginal bruto do CSV');
  assert(mapped0.colaborador.lotacaoUoCodigo === 'DECO_KO', 'Preenche lotacaoUoCodigo canônico');
  assert(mapped0.colaborador.uoExecucaoCodigo === 'DECO_KO', 'Preenche uoExecucaoCodigo canônico');
  assert(mapped0.colaborador.sedeCodigo === 'KO', 'Preenche sedeCodigo a partir da UO');
  assert(mapped0.colaborador.sede === 'KO', 'Compatibilidade de sede definida para KO');
  assert(mapped0.pendenteClassificacao === false, 'DECO_KO não é pendente de classificação');

  // Linha 4: DL (Setor da Sede Belém)
  const mappedDl = await mapearColaboradorCsv(linhasParseadas[3], 4);
  assert(mappedDl.colaborador.lotacao === 'SETOR_DL', 'DL normaliza para SETOR_DL');
  assert(mappedDl.colaborador.lotacaoUoCodigo === 'SETOR_DL', 'DL preenche UO canônica');
  assert(mappedDl.colaborador.sedeCodigo === 'BE', 'DL deriva sedeCodigo BE');
  assert(mappedDl.colaborador.sede === 'BE', 'SETOR_DL tem sede BE por compatibilidade');

  // Linha 5: PMAC (Setor da Sede Belém)
  const mappedPmac = await mapearColaboradorCsv(linhasParseadas[4], 5);
  assert(mappedPmac.colaborador.lotacao === 'SETOR_PMAC', 'pmac normaliza para SETOR_PMAC');

  // -------------------------------------------------------------
  // TESTE 5: Detecção de Pendentes de Classificação
  // -------------------------------------------------------------
  console.log('\n--- Teste 5: Detecção de Pendentes de Classificação ---');
  const mappedPend = await mapearColaboradorCsv(linhasParseadas[5], 6);
  assert(mappedPend.pendenteClassificacao === true, 'Detecta "Departamento padrão" como pendente de classificação');
  assert(mappedPend.classificacao.unidade.codigo === 'NAO_CLASSIFICADO', 'Código de UO atribuído é NAO_CLASSIFICADO');
  assert(mappedPend.valido === true, 'Registro com depto não classificado ainda é funcionalmente válido');

  // -------------------------------------------------------------
  // TESTE 6: Detecção de Erros de Integridade (CPF e Matrícula)
  // -------------------------------------------------------------
  console.log('\n--- Teste 6: Detecção de Erros de Integridade ---');
  const mappedInvalido = await mapearColaboradorCsv(linhasParseadas[6], 7);
  assert(mappedInvalido.valido === false, 'Linha com CPF "12345" é marcada como inválida');
  assert(
    mappedInvalido.errosValidacao.some(e => e.includes('CPF inválido')),
    'Contém erro específico de CPF inválido'
  );

  const mappedSemMatricula = await mapearColaboradorCsv(linhasParseadas[7], 8);
  assert(mappedSemMatricula.valido === false, 'Linha sem matrícula é marcada como inválida');
  assert(
    mappedSemMatricula.errosValidacao.some(e => e.includes('Matrícula')),
    'Contém erro específico de matrícula ausente'
  );

  // -------------------------------------------------------------
  // TESTE 7: Fluxo Completo importarColaboradoresCsv
  // -------------------------------------------------------------
  console.log('\n--- Teste 7: Resumo Geral de Importação ---');
  const resultado = await importarColaboradoresCsv(CSV_EXEMPLO);
  assert(resultado.totalLinhas === 8, 'Total de linhas igual a 8');
  assert(resultado.totalValidos === 5, `Total de válidos igual a 5 (obteve ${resultado.totalValidos})`);
  assert(resultado.totalPendentes === 1, `Total de pendentes igual a 1 (obteve ${resultado.totalPendentes})`);
  assert(resultado.totalErros === 2, `Total de erros igual a 2 (obteve ${resultado.totalErros})`);
  assert(
    resultado.departamentosNaoClassificados.some(d => d.departamento === 'Departamento padrão' && d.ocorrencias === 1),
    'Relatório de departamentos não classificados contém "Departamento padrão" com 1 ocorrência'
  );
  assert(resultado.erros.length === 2, 'Array de erros contém exatamente os 2 registros inválidos');

  console.log('\n=============================================================');
  console.log(`📊 RESULTADOS: ${passedTests}/${totalTests} testes passaram.`);
  if (failedTests > 0) {
    console.error(`❌ ${failedTests} testes falharam.`);
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES DA ETAPA 3a PASSARAM COM SUCESSO!');
    console.log('=============================================================\n');
  }
}

runTests();
