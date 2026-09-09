import { rbacService } from './rbacService';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(rbacService.canValidateInsalubrity('AUX_DA'), 'AUX_DA deve validar insalubridade como DA');
assert(rbacService.canManagePaystubs('AUX_DA'), 'AUX_DA deve gerir contracheques como DA');
assert(rbacService.canManagePaystubs('CHEFE_DA'), 'CHEFE_DA deve gerir contracheques como DA');

console.log('rbacService test ok');
