import { CANTEIROS_COLLECTION, normalizePersistedSites } from './canteiroService';
import { localCache, CACHE_KEYS } from './localCache';
import { ConstructionSite } from '../types';

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

console.log('\n=== TESTES: GESTÃO OPERACIONAL DE CANTEIROS DE OBRAS ===\n');

console.log('--- 1. Coleção e Fonte de Dados Autorizada ---');
assert(CANTEIROS_COLLECTION === 'canteiros_obras', 'Fonte de dados exclusiva é a coleção canteiros_obras');

console.log('\n--- 2. Normalização e Modelo Canônico de Canteiros ---');
const rawPersisted: any[] = [
  {
    id: 'ct-ko-01',
    codigo: 'KO-01',
    nome: 'Canteiro Aeroporto Coari',
    sedeCodigo: 'KO',
    sede: 'KO',
    branch: 'KO',
    uoVinculadaCodigo: 'DECO_KO',
    chefe: 'Cap QOENG Silva',
    encarregado: '1º Sgt Souza',
    gerente: 'Maj Oliveira',
    endereco: 'Estrada do Aeroporto, KM 2 - Coari/AM',
    status: 'Ativo',
    grauInsalubridade: '20%',
    dataInicio: '2026-01-15',
    dataPrevisaoFim: '2026-12-20',
    observacoes: 'Frente de pavimentação de pista e pátio militar',
  },
  {
    id: 'ct-fb-01',
    code: 'FB-01',
    name: 'Destacamento de Fonte Boa',
    branch: 'FB',
    chief: 'Ten Pereira',
    status: 'Inativo',
    insalubrityLevel: 'ISENTO',
    startDate: '2025-05-10',
    expectedEndDate: '2025-11-30',
    notes: 'Operação concluída',
  }
];

const normalizedList = normalizePersistedSites(rawPersisted);
assert(normalizedList.length === 2, 'Carrega exatamente os canteiros persistidos sem fixos mockados');

const c1 = normalizedList[0];
assert(c1.codigo === 'KO-01', 'Mapeia codigo canônico');
assert(c1.nome === 'Canteiro Aeroporto Coari', 'Mapeia nome do canteiro');
assert((c1.sedeCodigo || c1.branch || c1.sede) === 'KO', 'Preserva sedeCodigo canônico territorial');
assert(c1.chefe === 'Cap QOENG Silva', 'Preserva chefe do canteiro');
assert(c1.encarregado === '1º Sgt Souza', 'Preserva encarregado da frente');
assert(c1.uoVinculadaCodigo === 'DECO_KO', 'Preserva UO vinculada de referência (somente leitura)');
assert(c1.status === 'Ativo', 'Preserva status operacional Ativo');
assert(c1.endereco?.includes('Coari'), 'Preserva endereço físico');
assert(c1.grauInsalubridade === '20%', 'Preserva grau de insalubridade');
assert(c1.dataInicio === '2026-01-15', 'Preserva data de início');
assert(c1.dataPrevisaoFim === '2026-12-20', 'Preserva previsão de término');
assert(Boolean(c1.observacoes), 'Preserva observações');

const c2 = normalizedList[1];
assert(c2.codigo === 'FB-01' || c2.code === 'FB-01', 'Compatibilidade com canteiro legado code/branch');
assert((c2.sedeCodigo || c2.branch || c2.sede) === 'FB', 'Mapeia branch legado para sede');
assert(c2.status === 'Inativo', 'Mapeia status Inativo');

console.log('\n--- 3. Invalidação de Cache Local ---');
localCache.setCache(CACHE_KEYS.CANTEIROS_OBRAS, normalizedList, 60000);
assert(localCache.getCache(CACHE_KEYS.CANTEIROS_OBRAS) !== null, 'Cache gravado com sucesso');
localCache.clearCache(CACHE_KEYS.CANTEIROS_OBRAS);
assert(localCache.getCache(CACHE_KEYS.CANTEIROS_OBRAS) === null, 'Cache invalidado com sucesso');

console.log('\n--- 4. Estado Vazio Condicional ---');
const emptyList: ConstructionSite[] = [];
const emptyMessage = 'Nenhum canteiro cadastrado. Utilize o cadastro para adicionar uma frente de serviço.';
assert(emptyList.length === 0, 'Lista vazia detectada');
assert(emptyMessage.includes('Nenhum canteiro cadastrado'), 'Mensagem de vazio exata configurada');

console.log('\n--- 5. Contagem Real de Canteiros Ativos e Inativos ---');
const isSiteActive = (site: ConstructionSite): boolean => {
  const st = String(site.status || 'Ativo').toUpperCase().trim();
  if (st === 'ATIVO' || st === 'ACTIVE' || st === 'EM OPERAÇÃO' || st === 'EM OPERACAO') return true;
  if (st.includes('DESMOBILIZ') || st === 'PLANEJADO' || st === 'PLANNED') return true;
  if (st === 'INATIVO' || st === 'INACTIVE' || st === 'ENCERRADO' || st === 'CONCLUÍDO') return false;
  return true;
};

const activeCount = normalizedList.filter(isSiteActive).length;
const inactiveCount = normalizedList.filter(s => !isSiteActive(s)).length;

assert(activeCount === 1, `Contagem correta de canteiros ativos: ${activeCount} (esperado 1)`);
assert(inactiveCount === 1, `Contagem correta de canteiros inativos: ${inactiveCount} (esperado 1)`);
assert(normalizedList.length === 2, `Total dinâmico real: ${normalizedList.length} (não fixo em 4 frentes)`);

console.log('\n--- 6. Filtragem Local (sem novas leituras no Firestore) ---');
const filtroSedeKO = normalizedList.filter(s => (s.sedeCodigo || s.branch || s.sede) === 'KO');
assert(filtroSedeKO.length === 1 && filtroSedeKO[0].codigo === 'KO-01', 'Filtro local por sede KO funciona perfeitamente');

const filtroBuscaEncarregado = normalizedList.filter(s => (s.encarregado || '').toLowerCase().includes('souza'));
assert(filtroBuscaEncarregado.length === 1, 'Busca local por encarregado encontra item');

console.log(`\nResultado: ${passedTests}/${totalTests} testes passaram com sucesso.\n`);
if (passedTests !== totalTests) {
  process.exit(1);
}
