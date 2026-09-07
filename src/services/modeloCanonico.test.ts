import {
  normalizarCodigoTerritorial,
  validarCodigoTerritorial,
} from './codigoTerritorialService';
import {
  normalizarCamposCanonicos,
  prepararCamposCanonicosParaFirestore,
} from './normalizacaoColaboradorService';
import { Employee } from '../types';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string): void {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
  }
}

function employee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 'MAT-001',
    matricula: 'MAT-001',
    nome: 'Colaborador Teste',
    funcao: 'Tecnico',
    sede: 'BE',
    dataAdmissao: '2026-01-01',
    status: 'Ativo',
    ...overrides,
  };
}

console.log('\n=== TESTES: MODELO CANONICO - FASE B ===\n');

console.log('--- Codigos territoriais ---');
for (const codigo of ['BE', 'KO', 'MN', 'FB', 'SP']) {
  assert(validarCodigoTerritorial(codigo), `Aceita ${codigo}`);
}
for (const codigo of ['', 'B', 'ABCDE', 'B E', 'be', 'B-e', '1 2']) {
  assert(!validarCodigoTerritorial(codigo), `Rejeita codigo invalido ${JSON.stringify(codigo)}`);
}
assert(normalizarCodigoTerritorial(' fb ') === 'FB', 'Normaliza espacos e lowercase para FB');

console.log('\n--- Normalizacao de leitura ---');
const legado = employee({
  sede: 'BE',
  sede_origem: 'MN',
  sede_atual: 'KO',
  lotacao: 'SETOR_DL',
  uoExecucao: '',
  canteiroId: 'canteiro-ko',
});
const normalizado = normalizarCamposCanonicos(legado);
assert(normalizado.sedeCodigo === 'KO', 'sedeCodigo usa sede_atual como primeiro fallback');
assert(normalizado.lotacaoUoCodigo === 'SETOR_DL', 'lotacaoUoCodigo usa lotacao');
assert(normalizado.uoExecucaoCodigo === 'SETOR_DL', 'uoExecucaoCodigo usa lotacao quando uoExecucao esta vazio');
assert(normalizado.canteiroExecucaoId === 'canteiro-ko', 'canteiroExecucaoId usa canteiroId');
assert(legado.sedeCodigo === undefined, 'Normalizacao nao altera o objeto original');

const departamentoLegado = normalizarCamposCanonicos(employee({ departamento: 'Departamento legado' }));
assert(departamentoLegado.departamentoOriginal === 'Departamento legado', 'departamentoOriginal usa departamento legado');

const preenchido = employee({
  sedeCodigo: 'FB',
  lotacaoUoCodigo: 'SETOR_DL',
  uoExecucaoCodigo: 'DECO_PFB',
  canteiroExecucaoId: 'canteiro-existente',
  departamentoOriginal: 'Valor original preservado',
  sede: 'BE',
  sede_atual: 'KO',
  lotacao: 'SETOR_DAPC',
  uoExecucao: 'SETOR_SAQ',
  canteiroId: 'canteiro-legado',
  departamento: 'Nome novo da UO',
});
const preservado = normalizarCamposCanonicos(preenchido);
assert(preservado.sedeCodigo === 'FB', 'Nao sobrescreve sedeCodigo preenchido');
assert(preservado.lotacaoUoCodigo === 'SETOR_DL', 'Nao sobrescreve lotacaoUoCodigo preenchido');
assert(preservado.uoExecucaoCodigo === 'DECO_PFB', 'Nao sobrescreve uoExecucaoCodigo preenchido');
assert(preservado.canteiroExecucaoId === 'canteiro-existente', 'Nao sobrescreve canteiroExecucaoId preenchido');
assert(preservado.departamentoOriginal === 'Valor original preservado', 'Nao sobrescreve departamentoOriginal preenchido');

const nomeDeUo = normalizarCamposCanonicos(employee({
  lotacao: 'SETOR_DL',
  departamento: 'Divisão de Logística',
}));
assert(nomeDeUo.departamentoOriginal === undefined, 'Nao infere departamento original de nome conhecido de UO');

console.log('\n--- Sanitizacao Firestore ---');
const payload = prepararCamposCanonicosParaFirestore(employee({
  sedeCodigo: 'FB',
  lotacaoUoCodigo: 'DECO_PFB',
  uoExecucaoCodigo: 'DECO_PFB',
  canteiroExecucaoId: 'canteiro-pfb',
  departamentoOriginal: 'PFB',
}));
assert(payload.sedeCodigo === 'FB', 'Sanitizador grava sedeCodigo');
assert(payload.lotacaoUoCodigo === 'DECO_PFB', 'Sanitizador grava lotacaoUoCodigo');
assert(payload.uoExecucaoCodigo === 'DECO_PFB', 'Sanitizador grava uoExecucaoCodigo');
assert(payload.canteiroExecucaoId === 'canteiro-pfb', 'Sanitizador grava canteiroExecucaoId');
assert(payload.departamentoOriginal === 'PFB', 'Sanitizador grava departamentoOriginal');
assert(!('sede' in payload), 'Preparacao canonica nao remove nem altera campos legados');

console.log(`\nResultado: ${passedTests}/${totalTests} testes passaram.`);
if (passedTests !== totalTests) {
  process.exitCode = 1;
}
