# Guia de Integração: Importação Canônica de Colaboradores

O pipeline oficial de colaboradores é composto por:

1. `importacaoColaboradores.ts`: parsing seguro do CSV, validação LGPD e normalização da organização.
2. `classificacaoInterativa.ts`: conciliação de departamentos não reconhecidos, cadastro de UOs e persistência em lote.
3. `ImportarColaboradoresModal.tsx`: interface de upload, revisão, classificação e confirmação.

Módulos históricos de sincronização permanecem no repositório apenas para compatibilidade temporária com consumidores externos e não participam do fluxo ativo.

## Campos canônicos

Os registros persistidos em `colaboradores` devem priorizar:

- `sedeCodigo`: código territorial, como `BE`, `KO` ou `MN`.
- `lotacaoUoCodigo`: código da OU administrativa.
- `uoExecucaoCodigo`: código da OU onde o trabalho é executado.
- `canteiroExecucaoId`: ID do documento em `canteiros_obras`, quando houver canteiro físico.
- `departamentoOriginal`: valor bruto recebido do arquivo de origem.

Os campos legados podem ser preservados temporariamente para compatibilidade, mas não devem alimentar filtros, telas ou regras de negócio novas.

## Importação CSV

O modal usa `importarColaboradoresCsv` para:

- reconhecer cabeçalhos e formatos CSV legados;
- validar matrícula, nome e CPF;
- preservar `departamentoOriginal`;
- reconhecer padrões `DECO-<bigrama>`, `DACO-<bigrama>` e `SEDE-<bigrama>`;
- localizar a OU correspondente no catálogo `unidades_organizacionais`;
- preencher os campos canônicos;
- encaminhar valores não reconhecidos para classificação interativa.

Depois da revisão, `persistirColaboradoresFirestore` grava os colaboradores em lotes de até 400 documentos. A classificação pode associar um departamento a qualquer OU ativa ou criar um setor filho com `pai` definido.

## Catálogo organizacional

O catálogo oficial é `unidades_organizacionais`. O catálogo local fornece valores iniciais e fallback, enquanto os documentos persistidos são mesclados em memória durante o carregamento.

Setores são unidades filhas identificadas por `pai`. Quando uma OU não possui setores cadastrados, a interface pode exibir virtualmente `<codigo-da-ou>/GERAL`; esse valor não deve ser gravado como documento ou como nova OU.

## Canteiros físicos

Use a coleção `canteiros_obras` para locais físicos. Não confunda:

- `sedeCodigo`, que é territorial;
- `canteiroExecucaoId`, que referencia um documento físico;
- `bigramasImportacao`, que são apenas aliases de reconhecimento da origem.

## LGPD e deduplicação

O pipeline calcula `cpfHash` para deduplicação e `cpfMascarado` para exibição. O CPF bruto não deve ser usado como chave de busca nem exposto em telas ou logs.

## Validação

```bash
npx tsx src/constants/unidadesOrganizacionais.test.ts
npx tsx src/services/importacaoColaboradores.test.ts
npx tsx src/services/importacaoUnificada.test.ts
npx tsx src/services/modeloCanonico.test.ts
npx tsx src/services/classificacaoInterativa.test.ts
```
