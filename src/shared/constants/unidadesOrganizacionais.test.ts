/**
 * Testes Automatizados da Normalização de Unidades Organizacionais (UO)
 * Executável via tsx: npx tsx src/constants/unidadesOrganizacionais.test.ts
 */

import {
  extrairBigramaDepartamento,
  normalizarDepartamentoCSV,
  obterSetorDefault,
  registrarNovaUOEmMemoria,
  UNIDADES_ORGANIZACIONAIS,
} from './unidadesOrganizacionais';

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
console.log('🧪 TESTES: NORMALIZAÇÃO DE UNIDADES ORGANIZACIONAIS (UO)');
console.log('=============================================================\n');

// 1. Testes dos casos explicitamente solicitados
console.log('--- Casos Essenciais Solicitados ---');

const resDecoKo = normalizarDepartamentoCSV('deco-ko');
assert(
  resDecoKo.unidade.codigo === 'DECO_KO' && resDecoKo.unidade.tipo === 'DECO',
  "'deco-ko' normaliza para DECO_KO (tipo DECO)",
  `Recebido: ${resDecoKo.unidade.codigo} (${resDecoKo.unidade.tipo})`
);

const resDacoMn = normalizarDepartamentoCSV('daco-mn');
assert(
  resDacoMn.unidade.codigo === 'DACO_MN' && resDacoMn.unidade.tipo === 'DACO',
  "'daco-mn' normaliza para DACO_MN (tipo DACO)",
  `Recebido: ${resDacoMn.unidade.codigo} (${resDacoMn.unidade.tipo})`
);

const resSede = normalizarDepartamentoCSV('sede');
assert(
  resSede.unidade.codigo === 'SEDE_BE' && resSede.unidade.tipo === 'SEDE',
  "'sede' normaliza para SEDE_BE (tipo SEDE)",
  `Recebido: ${resSede.unidade.codigo} (${resSede.unidade.tipo})`
);

const resDl = normalizarDepartamentoCSV('DL');
assert(
  resDl.unidade.codigo === 'SETOR_DL' && resDl.unidade.tipo === 'SETOR',
  "'DL' normaliza para SETOR_DL (tipo SETOR da Sede)",
  `Recebido: ${resDl.unidade.codigo} (${resDl.unidade.tipo})`
);

const resPmac = normalizarDepartamentoCSV('pmac');
assert(
  resPmac.unidade.codigo === 'SETOR_PMAC' && resPmac.unidade.tipo === 'SETOR',
  "'pmac' normaliza para SETOR_PMAC (tipo SETOR da Sede)",
  `Recebido: ${resPmac.unidade.codigo} (${resPmac.unidade.tipo})`
);

const resDeptPadrao = normalizarDepartamentoCSV('Departamento padrão');
assert(
  resDeptPadrao.unidade.codigo === 'NAO_CLASSIFICADO' && resDeptPadrao.unidade.tipo === 'NAO_CLASSIFICADO',
  "'Departamento padrão' normaliza para NAO_CLASSIFICADO",
  `Recebido: ${resDeptPadrao.unidade.codigo} (${resDeptPadrao.unidade.tipo})`
);

const resVazio = normalizarDepartamentoCSV('');
assert(
  resVazio.unidade.codigo === 'NAO_CLASSIFICADO' && resVazio.confianca === 'NAO_CLASSIFICADO',
  "Valor vazio '' normaliza para NAO_CLASSIFICADO com confiança 'NAO_CLASSIFICADO'",
  `Recebido: ${resVazio.unidade.codigo} (${resVazio.confianca})`
);

const resEspacos = normalizarDepartamentoCSV('   ');
assert(
  resEspacos.unidade.codigo === 'NAO_CLASSIFICADO' && resEspacos.confianca === 'NAO_CLASSIFICADO',
  "Valor somente espaços '   ' normaliza para NAO_CLASSIFICADO",
  `Recebido: ${resEspacos.unidade.codigo}`
);

const resNulo = normalizarDepartamentoCSV(null as any);
assert(
  resNulo.unidade.codigo === 'NAO_CLASSIFICADO',
  'Valor null normaliza com segurança para NAO_CLASSIFICADO',
  `Recebido: ${resNulo.unidade.codigo}`
);

// 2. Testes de variações e outros setores da Sede
console.log('\n--- Variações de Formato e Novos Setores da Sede ---');

const resPvmac = normalizarDepartamentoCSV('PVMAC');
assert(
  resPvmac.unidade.codigo === 'SETOR_PMAC' && resPvmac.unidade.tipo === 'SETOR',
  "'PVMAC' normaliza para SETOR_PMAC (tipo SETOR)",
  `Recebido: ${resPvmac.unidade.codigo}`
);

const resDacd = normalizarDepartamentoCSV('dacd');
assert(
  resDacd.unidade.codigo === 'SETOR_DACD' && resDacd.unidade.tipo === 'SETOR',
  "'dacd' normaliza para SETOR_DACD (tipo SETOR)",
  `Recebido: ${resDacd.unidade.codigo}`
);

const resDacdUpper = normalizarDepartamentoCSV('DACD');
assert(
  resDacdUpper.unidade.codigo === 'SETOR_DACD' && resDacdUpper.unidade.tipo === 'SETOR',
  "'DACD' normaliza para SETOR_DACD (tipo SETOR)",
  `Recebido: ${resDacdUpper.unidade.codigo}`
);

const resDesg = normalizarDepartamentoCSV('Desg');
assert(
  resDesg.unidade.codigo === 'SETOR_DESG' && resDesg.unidade.tipo === 'SETOR',
  "'Desg' normaliza para SETOR_DESG (tipo SETOR)",
  `Recebido: ${resDesg.unidade.codigo}`
);

const resSuprimentos = normalizarDepartamentoCSV('DAPR-SUPRIMENTOS');
assert(
  resSuprimentos.unidade.codigo === 'SETOR_SUPRIMENTOS' && resSuprimentos.unidade.tipo === 'SETOR',
  "'DAPR-SUPRIMENTOS' normaliza para SETOR_SUPRIMENTOS",
  `Recebido: ${resSuprimentos.unidade.codigo}`
);

const resDapc = normalizarDepartamentoCSV('Dapc');
assert(
  resDapc.unidade.codigo === 'SETOR_DAPC' && resDapc.unidade.tipo === 'SETOR',
  "'Dapc' normaliza para SETOR_DAPC",
  `Recebido: ${resDapc.unidade.codigo}`
);

const resSdsg = normalizarDepartamentoCSV('SDSG');
assert(
  resSdsg.unidade.codigo === 'SETOR_SDSG' && resSdsg.unidade.tipo === 'SETOR',
  "'SDSG' normaliza para SETOR_SDSG",
  `Recebido: ${resSdsg.unidade.codigo}`
);

const resSaq = normalizarDepartamentoCSV('SAQ');
assert(
  resSaq.unidade.codigo === 'SETOR_SAQ' && resSaq.unidade.tipo === 'SETOR',
  "'SAQ' normaliza para SETOR_SAQ",
  `Recebido: ${resSaq.unidade.codigo}`
);

const resExp = normalizarDepartamentoCSV('exp.');
assert(
  resExp.unidade.codigo === 'SETOR_EXPEDIENTE' && resExp.unidade.tipo === 'SETOR',
  "'exp.' com ponto normaliza para SETOR_EXPEDIENTE",
  `Recebido: ${resExp.unidade.codigo}`
);

const resPfb = normalizarDepartamentoCSV('pfb');
assert(
  resPfb.unidade.codigo === 'DECO_PFB' && resPfb.unidade.tipo === 'DECO',
  "'pfb' normaliza para DECO_PFB (tipo DECO)",
  `Recebido: ${resPfb.unidade.codigo}`
);

const resDeptPadraoAbreviado = normalizarDepartamentoCSV('Dept. padrão');
assert(
  resDeptPadraoAbreviado.unidade.codigo === 'NAO_CLASSIFICADO',
  "'Dept. padrão' normaliza para NAO_CLASSIFICADO",
  `Recebido: ${resDeptPadraoAbreviado.unidade.codigo}`
);

const bigramaDaco = extrairBigramaDepartamento('DACO-XR');
assert(
  bigramaDaco?.prefixo === 'DACO' && bigramaDaco.bigrama === 'XR',
  'Extrai prefixo e bigrama de DACO-XR'
);

const uoCadastrada = {
  codigo: 'OU_XR',
  nome: 'Unidade Experimental XR',
  siglaExibicao: 'OU-XR',
  tipo: 'DACO' as const,
  sedeOuCanteiroPadrao: 'XR',
  ativa: true,
};
registrarNovaUOEmMemoria(uoCadastrada);
const resUoDinamica = normalizarDepartamentoCSV('DACO-XR');
assert(
  resUoDinamica.unidade.codigo === 'OU_XR',
  'Prefixo DACO localiza uma OU cadastrada pelo código territorial'
);

const setorDefault = obterSetorDefault(UNIDADES_ORGANIZACIONAIS.SEDE_BE);
assert(
  setorDefault.codigo === 'SEDE_BE/GERAL' && setorDefault.pai === 'SEDE_BE',
  'OU sem setores recebe setor default virtual sem alterar o catálogo'
);
assert(
  !UNIDADES_ORGANIZACIONAIS[setorDefault.codigo],
  'Setor default não é persistido no catálogo'
);

console.log('\n=============================================================');
console.log(`📊 RESULTADOS: ${passedTests}/${totalTests} testes passaram.`);
if (failedTests > 0) {
  console.error(`❌ ${failedTests} testes falharam.`);
  process.exit(1);
} else {
  console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
  console.log('=============================================================\n');
}
