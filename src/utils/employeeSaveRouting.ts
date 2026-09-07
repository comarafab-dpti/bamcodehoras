import { Employee } from '../types';

export function mergeSavedEmployee(employees: Employee[], savedEmployee: Employee): Employee[] {
  const exists = employees.some((employee) => employee.id === savedEmployee.id);
  return exists
    ? employees.map((employee) => employee.id === savedEmployee.id ? savedEmployee : employee)
    : [savedEmployee, ...employees];
}

export function getEmployeeSaveAudit(
  hasInitialPassword: boolean,
  isEditing: boolean,
  matricula: string,
  nome: string
): { tipo: 'ALTERACAO_SENHA' | 'ALTERACAO_PERMISSAO_RBAC'; descricao: string } {
  if (hasInitialPassword && isEditing) {
    return {
      tipo: 'ALTERACAO_SENHA',
      descricao: `Senha de consulta alterada para o colaborador #${matricula}`,
    };
  }

  return {
    tipo: 'ALTERACAO_PERMISSAO_RBAC',
    descricao: isEditing
      ? `Edição de perfil/cadastro do colaborador #${matricula} (${nome})`
      : `Cadastro de novo colaborador #${matricula} (${nome})`,
  };
}