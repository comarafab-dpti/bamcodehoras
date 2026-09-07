import { findEmployeeForPublicLogin, hashPassword, verifyPasswordHash } from './authService';
import { Employee, EmployeeAuth } from '../types';

const employee = {
  id: '13887',
  matricula: '13887',
  nome: 'Colaborador 13887',
  funcao: 'Técnico de Manutenção',
  cargo: 'Técnico de Manutenção',
  sede: 'KO',
  status: 'Ativo',
} as Employee;

const password = 'consulta-13887';
const passwordHash = await hashPassword(password);
const credential: EmployeeAuth = {
  matricula: '13887',
  passwordHash,
  senhaDefinida: true,
};

const located = await findEmployeeForPublicLogin('13887', [employee]);
if (!located || located.matricula !== '13887') {
  throw new Error('[FAIL] cadastro 13887 não foi localizado para o autoatendimento');
}
if (!credential.passwordHash || !(await verifyPasswordHash(password, credential.passwordHash))) {
  throw new Error('[FAIL] senha da credencial 13887 não foi validada com SHA-256');
}
if (await verifyPasswordHash('senha-incorreta', credential.passwordHash)) {
  throw new Error('[FAIL] senha incorreta foi aceita');
}

console.log('3 testes de autoatendimento da matrícula 13887 passaram.');