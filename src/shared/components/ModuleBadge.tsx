import React from 'react';
import { Shield, User } from 'lucide-react';

export interface ModuleBadgeProps {
  tipo: 'admin' | 'portal';
  className?: string;
  size?: 'sm' | 'md';
}

export const ModuleBadge: React.FC<ModuleBadgeProps> = ({ 
  tipo, 
  className = '', 
  size = 'md' 
}) => {
  const isSm = size === 'sm';

  if (tipo === 'admin') {
    return (
      <span
        id="badge-module-admin"
        className={`inline-flex items-center gap-1.5 font-black uppercase tracking-wider rounded-md border shadow-xs select-none transition-colors ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
        } bg-amber-500/15 text-amber-300 border-amber-500/30 ${className}`}
        title="Ambiente Administrativo e de Gestão SPTF"
      >
        <Shield className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-400 shrink-0`} />
        <span>ADMINISTRATIVO</span>
      </span>
    );
  }

  return (
    <span
      id="badge-module-portal"
      className={`inline-flex items-center gap-1.5 font-black uppercase tracking-wider rounded-md border shadow-xs select-none transition-colors ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      } bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25 ${className}`}
      title="Ambiente de Autoatendimento e Consulta do Colaborador"
    >
      <User className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-blue-600 dark:text-blue-400 shrink-0`} />
      <span>CONSULTA DO COLABORADOR</span>
    </span>
  );
};
