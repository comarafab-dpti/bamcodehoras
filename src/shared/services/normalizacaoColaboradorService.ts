import { Employee } from '../types';
import { UNIDADES_ORGANIZACIONAIS } from '../constants/unidadesOrganizacionais';

function normalizarTexto(valor: string): string {
  return valor
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function eNomeConhecidoDeUo(valor: string): boolean {
  const alvo = normalizarTexto(valor);
  return Object.values(UNIDADES_ORGANIZACIONAIS).some((uo) => [
    uo.codigo,
    uo.nome,
    uo.siglaExibicao,
  ].some((candidato) => normalizarTexto(candidato) === alvo));
}

/**
 * Preenche apenas os campos canônicos ausentes para uso em leitura.
 * Esta função não grava, não altera o objeto recebido e não executa migração.
 */
export function normalizarCamposCanonicos(employee: Employee): Employee {
  const departamentoOriginal = employee.departamentoOriginal
    || (!employee.lotacao && employee.departamento && !eNomeConhecidoDeUo(employee.departamento)
      ? employee.departamento
      : undefined);

  return {
    ...employee,
    sedeCodigo: employee.sedeCodigo || employee.sede_atual || employee.sede || employee.sede_origem,
    lotacaoUoCodigo: employee.lotacaoUoCodigo || employee.lotacao,
    uoExecucaoCodigo: employee.uoExecucaoCodigo || employee.uoExecucao || employee.lotacao,
    canteiroExecucaoId: employee.canteiroExecucaoId || employee.canteiroId,
    ...(departamentoOriginal ? { departamentoOriginal } : {}),
  };
}

/** Retorna somente os campos canônicos presentes, sem aplicar fallbacks de leitura. */
export function prepararCamposCanonicosParaFirestore(
  employee: Partial<Employee>
): Record<string, string> {
  const campos: Record<string, string | undefined> = {
    sedeCodigo: employee.sedeCodigo,
    lotacaoUoCodigo: employee.lotacaoUoCodigo,
    uoExecucaoCodigo: employee.uoExecucaoCodigo,
    canteiroExecucaoId: employee.canteiroExecucaoId,
    departamentoOriginal: employee.departamentoOriginal,
  };

  return Object.fromEntries(
    Object.entries(campos).filter(([, valor]) => valor !== undefined)
  ) as Record<string, string>;
}
