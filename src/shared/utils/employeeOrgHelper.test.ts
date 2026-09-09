import { resolveEmployeeOrgInfo } from './employeeOrgHelper';
import { Employee, ConstructionSite } from '../types';

console.log('=== TESTES: RESOLUÇÃO ORGANIZACIONAL SIMPLIFICADA DE COLABORADORES ===\n');

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`  [PASS] ${message}`);
}

// 1. Cenário: Acity Sousa (Row 1 do Screenshot)
// SEDE: BE, LOTAÇÃO: SETOR_SAQ, UO EXECUÇÃO: SETOR_SAQ, CANTEIRO: Não informado, DEPTO ORIGINAL: SAQ
console.log('--- 1. Colaborador em Setor da Sede (Acity Sousa) ---');
const empAcity: Employee = {
  id: '1',
  matricula: '190614',
  nome: 'ACITY SOUSA',
  funcao: 'Assistente Administrativo',
  sede: 'BE',
  sedeCodigo: 'BE',
  lotacaoUoCodigo: 'SETOR_SAQ',
  uoExecucaoCodigo: 'SETOR_SAQ',
  departamentoOriginal: 'SAQ',
  status: 'Ativo',
  dataAdmissao: '1985-05-08',
  email: 'acity@comara.gov.br'
};

const resAcity = resolveEmployeeOrgInfo(empAcity);
assert(resAcity.sedeCodigo === 'BE', 'Sede resolvida é BE');
assert(resAcity.lotacaoNome === 'Sede Belém', 'De onde ele é: Sede Belém');
assert(resAcity.localTrabalhoNome === 'Sede Belém', 'Onde está trabalhando: Sede Belém');
assert(resAcity.temSetor === true, 'Possui setor identificado');
assert(resAcity.setorSigla === 'SAQ', 'Sigla do setor é SAQ');
assert(resAcity.setorNome === 'Seção de Aquisições', 'Nome do setor é Seção de Aquisições');
assert(resAcity.setorFormatado === 'SAQ • Seção de Aquisições', 'Setor formatado: SAQ • Seção de Aquisições');

// 2. Cenário: Adelson Oliveira (Row 2 do Screenshot)
// SEDE: BE, LOTAÇÃO: SETOR_PMAC, UO EXECUÇÃO: SETOR_PMAC, DEPTO ORIGINAL: pmac
console.log('\n--- 2. Colaborador em Setor PMAC (Adelson Oliveira) ---');
const empAdelson: Employee = {
  id: '2',
  matricula: '190742',
  nome: 'ADELSON OLIVEIRA DA SILVA',
  funcao: 'Operador de Máquinas',
  sede: 'BE',
  sedeCodigo: 'BE',
  lotacaoUoCodigo: 'SETOR_PMAC',
  uoExecucaoCodigo: 'SETOR_PMAC',
  departamentoOriginal: 'pmac',
  status: 'Ativo',
  dataAdmissao: '1985-01-01'
};

const resAdelson = resolveEmployeeOrgInfo(empAdelson);
assert(resAdelson.lotacaoNome === 'Sede Belém', 'De onde ele é: Sede Belém');
assert(resAdelson.localTrabalhoNome === 'Sede Belém', 'Onde está trabalhando: Sede Belém');
assert(resAdelson.temSetor === true, 'Possui setor identificado');
assert(resAcity.setorSigla === 'SAQ', 'Acity continua SAQ');
assert(resAdelson.setorSigla === 'PMAC', 'Sigla do setor é PMAC');
assert(resAdelson.setorNome === 'Pavimentação / Manutenção', 'Nome do setor é Pavimentação / Manutenção');

// 3. Cenário: Ademar Gomes (Row 3 do Screenshot - Destacamento sem setor)
// SEDE: KO, LOTAÇÃO: DECO_KO, UO EXECUÇÃO: DECO_KO, DEPTO ORIGINAL: deco-ko
console.log('\n--- 3. Colaborador em Destacamento Operacional (Ademar Gomes) ---');
const empAdemar: Employee = {
  id: '3',
  matricula: '13769',
  nome: 'ADEMAR GOMES DE CASTRO',
  funcao: 'Auxiliar Operacional',
  sede: 'MN',
  sedeCodigo: 'KO',
  lotacaoUoCodigo: 'DECO_KO',
  uoExecucaoCodigo: 'DECO_KO',
  departamentoOriginal: 'deco-ko',
  status: 'Ativo',
  dataAdmissao: '2023-07-03'
};

const resAdemar = resolveEmployeeOrgInfo(empAdemar);
assert(resAdemar.sedeCodigo === 'KO', 'Sede resolvida é KO');
assert(resAdemar.lotacaoNome === 'Destacamento Coari', 'De onde ele é: Destacamento Coari');
assert(resAdemar.localTrabalhoNome === 'Destacamento Coari', 'Onde está trabalhando: Destacamento Coari');
assert(resAdemar.temSetor === false, 'Não possui setor (destacamento direto)');
assert(resAdemar.setorFormatado === '—', 'Setor formatado exibe travessão');

// 4. Cenário: Colaborador da Sede BE deslocado em Canteiro de Obras
console.log('\n--- 4. Colaborador alocado em Canteiro de Obras ---');
const canteirosMock: ConstructionSite[] = [
  {
    id: 'site-ko-01',
    codigo: 'KO-01',
    nome: 'Canteiro Aeroporto Coari',
    sedeCodigo: 'KO',
    status: 'Ativo'
  }
];

const empDeslocado: Employee = {
  id: '4',
  matricula: '554433',
  nome: 'CARLOS ENGENHEIRO',
  funcao: 'Engenheiro Civil',
  sede: 'BE',
  sedeCodigo: 'BE',
  lotacaoUoCodigo: 'SEDE_BE',
  canteiroExecucaoId: 'site-ko-01',
  status: 'Ativo',
  dataAdmissao: '2020-01-15'
};

const resDeslocado = resolveEmployeeOrgInfo(empDeslocado, canteirosMock);
assert(resDeslocado.lotacaoNome === 'Sede Belém', 'De onde ele é: Sede Belém');
assert(resDeslocado.localTrabalhoNome === 'Canteiro Aeroporto Coari', 'Onde está trabalhando: Canteiro Aeroporto Coari');
assert(resDeslocado.isEmCanteiro === true, 'Identificado como em Canteiro');
assert(resDeslocado.isDeslocado === true, 'Identificado como Deslocado');

console.log('\nTodos os testes passaram com sucesso!');
