import assert from 'node:assert';
import { calcularCorCompetencia } from './competenciaEngine';

console.log('🧪 TESTES: COR VISUAL DA COMPETÊNCIA (VERMELHO / AMARELO / VERDE)');

// Teste 1: Mês atual fechado deve ser SEMPRE VERMELHO
const r1 = calcularCorCompetencia({
  competenciaAtual: '2026-09',
  statusCompetenciaAtual: 'FECHADO',
  statusCompetenciaAnterior: 'FECHADO',
});
assert.strictEqual(r1.cor, 'VERMELHO', 'Mês fechado deve ser VERMELHO');
assert.strictEqual(r1.isFechado, true);
console.log('  ✅ [PASS] Mês fechado retorna cor VERMELHO');

// Teste 2: Mês atual fechado mesmo se anterior estivesse aberto permanece VERMELHO
const r2 = calcularCorCompetencia({
  competenciaAtual: '2026-09',
  statusCompetenciaAtual: 'FECHADO',
  statusCompetenciaAnterior: 'ABERTO',
});
assert.strictEqual(r2.cor, 'VERMELHO', 'Mês fechado tem prevalência da cor VERMELHO');
console.log('  ✅ [PASS] Mês fechado tem prevalência da cor VERMELHO');

// Teste 3: Mês atual aberto e mês anterior aberto deve ser AMARELO (exemplo do usuário: setembro com agosto aberto)
const r3 = calcularCorCompetencia({
  competenciaAtual: '2026-09',
  statusCompetenciaAtual: 'ABERTO',
  statusCompetenciaAnterior: 'ABERTO',
});
assert.strictEqual(r3.cor, 'AMARELO', 'Setembro com agosto aberto deve ser AMARELO');
assert.strictEqual(r3.temPendenciaAnterior, true);
assert.deepStrictEqual(r3.mesesAnterioresAbertos, ['2026-08']);
console.log('  ✅ [PASS] Setembro com agosto aberto retorna cor AMARELO e alerta de pendência');

// Teste 4: Mês atual aberto e mês anterior FECHADO deve ser VERDE
const r4 = calcularCorCompetencia({
  competenciaAtual: '2026-09',
  statusCompetenciaAtual: 'ABERTO',
  statusCompetenciaAnterior: 'FECHADO',
  mesesControle: [{ id: '2026-08', status: 'FECHADO' }],
});
assert.strictEqual(r4.cor, 'VERDE', 'Setembro com agosto fechado deve ser VERDE');
assert.strictEqual(r4.temPendenciaAnterior, false);
assert.strictEqual(r4.mesesAnterioresAbertos.length, 0);
console.log('  ✅ [PASS] Setembro com agosto fechado retorna cor VERDE');

// Teste 5: Mês anterior imediato fechado, mas um mês mais antigo (julho) aberto deve ser AMARELO
const r5 = calcularCorCompetencia({
  competenciaAtual: '2026-09',
  statusCompetenciaAtual: 'ABERTO',
  statusCompetenciaAnterior: 'FECHADO',
  mesesControle: [
    { id: '2026-07', status: 'ABERTO' },
    { id: '2026-08', status: 'FECHADO' },
  ],
});
assert.strictEqual(r5.cor, 'AMARELO', 'Setembro com julho aberto deve ser AMARELO');
assert.strictEqual(r5.temPendenciaAnterior, true);
assert.deepStrictEqual(r5.mesesAnterioresAbertos, ['2026-07']);
console.log('  ✅ [PASS] Mês anterior mais antigo em aberto torna o card AMARELO');

// Teste 6: Mês com lançamentos no passado sem controle fechado deve ser AMARELO
const r6 = calcularCorCompetencia({
  competenciaAtual: '2026-09',
  statusCompetenciaAtual: 'ABERTO',
  statusCompetenciaAnterior: 'FECHADO',
  mesesControle: [{ id: '2026-08', status: 'FECHADO' }],
  mesesComLancamentos: ['2026-06', '2026-08', '2026-09'],
});
assert.strictEqual(r6.cor, 'AMARELO', 'Lançamento em junho sem fechamento torna setembro AMARELO');
assert.deepStrictEqual(r6.mesesAnterioresAbertos, ['2026-06']);
console.log('  ✅ [PASS] Lançamento em mês passado sem fechamento retorna AMARELO');

// Teste 7: Mês atual REABERTO deve ser AMARELO
const r7 = calcularCorCompetencia({
  competenciaAtual: '2026-09',
  statusCompetenciaAtual: 'REABERTO',
  statusCompetenciaAnterior: 'FECHADO',
  mesesControle: [{ id: '2026-08', status: 'FECHADO' }],
});
assert.strictEqual(r7.cor, 'AMARELO', 'Mês reaberto deve ser AMARELO');
console.log('  ✅ [PASS] Mês reaberto em retificação retorna AMARELO');

console.log('🎉 TODOS OS 7 TESTES DE COR E STATUS DA COMPETÊNCIA PASSARAM COM SUCESSO!');
