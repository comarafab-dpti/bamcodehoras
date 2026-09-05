import { CodigoTerritorial } from '../types';

/**
 * Códigos territoriais permanecem abertos no modelo. A lista de códigos
 * cadastrados poderá ser expandida por serviço próprio em fases futuras.
 */
const CODIGO_TERRITORIAL_PATTERN = /^[A-Z0-9]{2,4}$/;

/** Normaliza o código para comparação e persistência futura. */
export function normalizarCodigoTerritorial(codigo: string): CodigoTerritorial {
  return (codigo || '').trim().toUpperCase();
}

/**
 * Valida o formato canônico atual: 2 a 4 caracteres alfanuméricos,
 * sem espaços e já normalizados em uppercase.
 */
export function validarCodigoTerritorial(codigo: string): boolean {
  return typeof codigo === 'string'
    && codigo === normalizarCodigoTerritorial(codigo)
    && CODIGO_TERRITORIAL_PATTERN.test(codigo);
}
