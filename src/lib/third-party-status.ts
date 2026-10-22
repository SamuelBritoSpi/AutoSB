import type { ThirdPartyStatus } from './types';

/**
 * Status permitidos para funcionários terceirizados.
 * Use sempre esta constante para listas, filtros e formulários.
 */
export const THIRD_PARTY_STATUSES = ['Ativo', 'Inativo'] as const satisfies readonly ThirdPartyStatus[];

export const DEFAULT_THIRD_PARTY_STATUS: ThirdPartyStatus = 'Ativo';

const INACTIVE_PATTERNS = [
  'inativ',
  'inactive',
  'deslig',
  'demit',
  'encerr',
  'cancel',
  'aposent',
  'nao ativ',
];

const stripAccents = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

/**
 * Converte qualquer valor legado para um dos dois status oficiais.
 *
 * - Variantes de "inativo", "desligado", "demitido", "encerrado",
 *   "cancelado" ou "aposentado" viram "Inativo".
 * - Qualquer outro valor (incluindo vazio, "Ativo", "Afastado", "Férias")
 *   vira "Ativo", mantendo o colaborador como vínculo ativo.
 */
export function normalizeThirdPartyStatus(value: unknown): ThirdPartyStatus {
  const text = stripAccents(String(value ?? ''));

  if (!text) return DEFAULT_THIRD_PARTY_STATUS;

  const isInactive = INACTIVE_PATTERNS.some(pattern => text.includes(pattern));
  return isInactive ? 'Inativo' : 'Ativo';
}

export function isThirdPartyActive(value: unknown): boolean {
  return normalizeThirdPartyStatus(value) === 'Ativo';
}
