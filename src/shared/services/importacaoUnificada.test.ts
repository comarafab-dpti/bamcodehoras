import {
  prepararPayloadImportacao,
  preservarDepartamentoOriginal,
} from './importacaoColaboradores';
import { Employee } from '../types';

let total = 0;
let aprovados = 0;

function assert(condicao: boolean, nome: string): void {
  total++;
  if (condicao) {
    aprovados++;
    console.log(`  [PASS] ${nome}`);
  } else {
    console.error(`  [FAIL] ${nome}`);
  }
}

const base: Partial<Employee> = {
  matricula: '1001',
  nome: 'Colaborador',
  sede: 'BE',
  departamentoOriginal: 'SETOR-DL',
  sedeCodigo: 'BE',
  lotacaoUoCodigo: 'SETOR_DL',
  uoExecucaoCodigo: 'SETOR_DL',
};

console.log('\n=== TESTES: IMPORTACAO UNIFICADA - FASE C ===\n');

const payload = prepararPayloadImportacao({
  ...base,
  nome: 'Nome Atualizado',
  email: undefined,
});
assert(payload.nome === 'Nome Atualizado', 'Inclui campos presentes no CSV');
assert(payload.email === undefined, 'Nao envia campos ausentes');
assert(payload.sedeCodigo === 'BE', 'Mantem campos canonicos informados');

const pendente = prepararPayloadImportacao({
  matricula: '1001',
  nome: 'Nome Parcial',
  departamentoOriginal: 'Departamento padrão',
  departamento: 'Não Classificado / A Definir',
  sede: 'BE',
  lotacao: 'NAO_CLASSIFICADO',
}, true);
assert(pendente.nome === 'Nome Parcial', 'Upsert pendente ainda atualiza dados do colaborador');
assert(pendente.matricula === '1001', 'Upsert usa matrícula como identificador');
assert(pendente.lotacao === undefined, 'Classificação NAO_CLASSIFICADO não sobrescreve lotação');
assert(pendente.departamentoOriginal === undefined, 'Classificação NAO_CLASSIFICADO preserva departamentoOriginal anterior');
assert(pendente.sede === undefined, 'Classificação pendente preserva sede anterior');

const preservado = preservarDepartamentoOriginal(
  prepararPayloadImportacao({ ...base, departamentoOriginal: 'CSV NOVO' }),
  { departamentoOriginal: 'CSV ORIGINAL' }
);
assert(preservado.departamentoOriginal === 'CSV ORIGINAL', 'Upsert preserva departamentoOriginal existente');

console.log(`\nResultado: ${aprovados}/${total} testes passaram.`);
if (aprovados !== total) process.exitCode = 1;
