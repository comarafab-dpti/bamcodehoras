import { getEmployeeSaveAudit, mergeSavedEmployee } from './employeeSaveRouting';
import { Employee } from '../types';

const employee = (id: string, matricula: string): Employee => ({
  id,
  matricula,
  nome: `Colaborador ${matricula}`,
  funcao: 'Técnico de Manutenção',
  cargo: 'Técnico de Manutenção',
  sede: 'KO',
  status: 'Ativo',
} as Employee);

const originalEmployees = [employee('1', '001'), employee('2', '002')];
const savedEmployee = { ...originalEmployees[0], nome: 'Colaborador atualizado' };
const mergedEmployees = mergeSavedEmployee(originalEmployees, savedEmployee);

if (mergedEmployees.length !== 2) throw new Error('[FAIL] edição individual não deve alterar a quantidade de colaboradores');
if (mergedEmployees[0].nome !== 'Colaborador atualizado') throw new Error('[FAIL] colaborador editado não foi atualizado localmente');
if (mergedEmployees[1] !== originalEmployees[1]) throw new Error('[FAIL] colaborador não editado foi regravado no estado');

const passwordAudit = getEmployeeSaveAudit(true, true, '001', 'Colaborador atualizado');
if (passwordAudit.tipo !== 'ALTERACAO_SENHA') throw new Error('[FAIL] alteração de senha recebeu tipo de auditoria incorreto');
if (passwordAudit.descricao.includes('lote') || passwordAudit.descricao.includes('191')) {
  throw new Error('[FAIL] auditoria de senha não deve mencionar operação em lote');
}

const profileAudit = getEmployeeSaveAudit(false, true, '001', 'Colaborador atualizado');
if (profileAudit.tipo !== 'ALTERACAO_PERMISSAO_RBAC') throw new Error('[FAIL] edição cadastral recebeu tipo de auditoria incorreto');

console.log('3 testes de roteamento de salvamento individual passaram.');