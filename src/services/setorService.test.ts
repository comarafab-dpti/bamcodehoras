import { gerarSugestaoCodigoSetor, setorService } from './setorService';
import { UnidadeOrganizacional } from '../types';

console.log('=== TESTES: GESTÃO DE SETORES (setorService) ===\n');

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ [PASS] ${message}`);
}

// 1. Geração de sugestão de código
console.log('--- 1. Sugestão de Códigos de Setores ---');
assert(gerarSugestaoCodigoSetor('SAQ') === 'SETOR_SAQ', 'Sigla SAQ gera SETOR_SAQ');
assert(gerarSugestaoCodigoSetor('DAPC') === 'SETOR_DAPC', 'Sigla DAPC gera SETOR_DAPC');
assert(gerarSugestaoCodigoSetor('SETOR_PMAC') === 'SETOR_PMAC', 'Código já com prefixo é mantido');
assert(gerarSugestaoCodigoSetor('Almoxarifado Geral') === 'SETOR_ALMOXARIFADO_GERAL', 'Nome com espaço e acento é normalizado');

// 2. Consulta de setores e UOs em memória
console.log('\n--- 2. Consulta de Setores e UOs Principais ---');
const { setores, uosPrincipais } = setorService.getSetoresAtuais();

assert(setores.length > 0, 'Existem setores pré-cadastrados');
assert(uosPrincipais.length > 0, 'Existem UOs principais');
assert(setores.every(s => s.tipo === 'SETOR'), 'Todos os itens de setores possuem tipo SETOR');
assert(uosPrincipais.every(u => u.tipo !== 'SETOR'), 'UOs principais não possuem tipo SETOR');

// 3. Cadastrar e salvar novo setor em memória
console.log('\n--- 3. Salvamento e Atualização de Setor ---');
async function runAsyncTests() {
  const novoSetor: UnidadeOrganizacional = {
    codigo: 'SETOR_TESTE_AUTOMATIZADO',
    nome: 'Seção de Teste Automatizado',
    siglaExibicao: 'TESTE-AUTO',
    tipo: 'SETOR',
    pai: 'SEDE_BE',
    sedeOuCanteiroPadrao: 'BE',
    ativa: true,
    descricao: 'Criado durante execução de testes'
  };

  await setorService.salvarSetor(novoSetor);
  const aposSalvar = setorService.getSetoresAtuais().setores;
  const encontrado = aposSalvar.find(s => s.codigo === 'SETOR_TESTE_AUTOMATIZADO');
  assert(!!encontrado, 'Setor novo foi salvo com sucesso');
  assert(encontrado?.siglaExibicao === 'TESTE-AUTO', 'Sigla de exibição salva corretamente');
  assert(encontrado?.pai === 'SEDE_BE', 'Vínculo com UO pai SEDE_BE salvo');

  // 4. Renomear e vincular a outra UO
  console.log('\n--- 4. Renomeação e Re-vinculação ---');
  const setorEditado: UnidadeOrganizacional = {
    ...novoSetor,
    nome: 'Seção de Teste Renomeada',
    siglaExibicao: 'TESTE-RENOM',
    pai: 'DACO_MN',
    sedeOuCanteiroPadrao: 'MN'
  };

  await setorService.salvarSetor(setorEditado, 'SETOR_TESTE_AUTOMATIZADO');
  const aposEdicao = setorService.getSetoresAtuais().setores.find(s => s.codigo === 'SETOR_TESTE_AUTOMATIZADO');
  assert(aposEdicao?.nome === 'Seção de Teste Renomeada', 'Nome renomeado com sucesso');
  assert(aposEdicao?.siglaExibicao === 'TESTE-RENOM', 'Sigla renomeada com sucesso');
  assert(aposEdicao?.pai === 'DACO_MN', 'Re-vinculado para DACO_MN com sucesso');

  // 5. Exclusão de setor
  console.log('\n--- 5. Exclusão de Setor ---');
  await setorService.excluirSetor('SETOR_TESTE_AUTOMATIZADO');
  const aposExclusao = setorService.getSetoresAtuais().setores.find(s => s.codigo === 'SETOR_TESTE_AUTOMATIZADO');
  assert(!aposExclusao, 'Setor excluído com sucesso');

  console.log('\n🎉 Todos os testes de setorService passaram com êxito!');
}

runAsyncTests().catch((e) => {
  console.error('Erro na execução dos testes:', e);
  process.exit(1);
});
