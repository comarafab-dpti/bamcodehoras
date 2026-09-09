import React from 'react';
import {
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { CompetenciaControle } from '@/src/shared/services/competenciaService';
import { 
  MONTH_NAMES_FULL, 
  getCompetenciaAnterior, 
  getProximaCompetencia,
  calcularCorCompetencia 
} from '@/src/shared/services/competenciaEngine';
import { Badge, Button } from '@/src/shared/components/ui';

interface CompetenciaStatusBarProps {
  competencia: string; // "YYYY-MM"
  controle: CompetenciaControle | null;
  controleAnterior?: CompetenciaControle | null;
  todasCompetencias?: CompetenciaControle[];
  onSelectCompetencia: (comp: string) => void;
  onOpenManagementModal: () => void;
  isGlobalAdmin: boolean;
  theme?: 'dark' | 'light';
}

export const CompetenciaStatusBar: React.FC<CompetenciaStatusBarProps> = ({
  competencia,
  controle,
  controleAnterior,
  todasCompetencias = [],
  onSelectCompetencia,
  onOpenManagementModal,
  isGlobalAdmin,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const status = controle?.status || 'ABERTO';

  const estadoCor = calcularCorCompetencia({
    competenciaAtual: competencia,
    statusCompetenciaAtual: status,
    statusCompetenciaAnterior: controleAnterior?.status,
    mesesControle: todasCompetencias,
  });

  const [anoStr, mesStr] = competencia.split('-');
  const mesIndex = parseInt(mesStr, 10) - 1;
  const mesNome = MONTH_NAMES_FULL[mesIndex] || mesStr;

  const compAnterior = getCompetenciaAnterior(competencia);
  const compProxima = getProximaCompetencia(competencia);

  return (
    <div
      id="competencia-status-bar"
      className={`rounded-xl border transition-all ${
        estadoCor.cor === 'VERMELHO'
          ? isDark
            ? 'bg-[#16243D]/90 border-rose-900/40 shadow-sm'
            : 'bg-rose-50/70 border-rose-200 shadow-sm'
          : estadoCor.cor === 'AMARELO'
          ? isDark
            ? 'bg-[#16243D]/90 border-amber-900/40 shadow-sm'
            : 'bg-amber-50/70 border-amber-200 shadow-sm'
          : isDark
          ? 'bg-[#16243D]/90 border-[#243756] shadow-sm'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Navegação de Competência */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center rounded-lg border border-slate-700/40 p-0.5 bg-[#0B1426]/40">
            <button
              id="btn-prev-competencia"
              onClick={() => onSelectCompetencia(compAnterior)}
              title={`Ir para mês anterior (${compAnterior})`}
              className="p-1.5 rounded-md hover:bg-slate-700/50 text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 flex items-center space-x-2 font-mono text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-100 font-sans">{mesNome} / {anoStr}</span>
              <span className="text-[11px] text-slate-400 font-mono">({competencia})</span>
            </div>
            <button
              id="btn-next-competencia"
              onClick={() => onSelectCompetencia(compProxima)}
              title={`Ir para próximo mês (${compProxima})`}
              className="p-1.5 rounded-md hover:bg-slate-700/50 text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Badge de Status da Competência */}
          <Badge
            variant={
              estadoCor.cor === 'VERMELHO'
                ? 'danger'
                : estadoCor.cor === 'AMARELO'
                ? 'warning'
                : 'success'
            }
          >
            {estadoCor.cor === 'VERMELHO' ? (
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> MÊS HOMOLOGADO / FECHADO
              </span>
            ) : estadoCor.cor === 'AMARELO' ? (
              <span className="flex items-center gap-1">
                <Unlock className="w-3 h-3" /> {status === 'REABERTO' ? 'REABERTO EM RETIFICAÇÃO' : 'PENDÊNCIA EM MÊS ANTERIOR'}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ABERTO P/ APONTAMENTOS
              </span>
            )}
          </Badge>
        </div>

        {/* Mensagem descritiva e Botão de Ação */}
        <div className="flex items-center space-x-3">
          {estadoCor.cor === 'VERMELHO' ? (
            <div className="hidden md:flex items-center text-xs text-rose-400 gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Apontamentos travados para resguardar a folha homologada.</span>
            </div>
          ) : estadoCor.cor === 'AMARELO' && estadoCor.temPendenciaAnterior ? (
            <div className="hidden md:flex items-center text-xs text-amber-400 gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Homologue o mês anterior ({estadoCor.mesesAnterioresAbertos.join(', ')}) antes de fechar este mês.</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center text-xs text-slate-400 gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Controle contábil com transporte automático de saldos.</span>
            </div>
          )}

          <Button
            id="btn-gerenciar-competencia"
            variant="secondary"
            size="sm"
            onClick={onOpenManagementModal}
            className={`font-semibold text-xs ${
              estadoCor.cor === 'VERMELHO'
                ? 'border-rose-700/40 text-rose-300 hover:bg-rose-500/10'
                : estadoCor.cor === 'AMARELO'
                ? 'border-amber-700/40 text-amber-300 hover:bg-amber-500/10'
                : 'border-blue-700/40 text-blue-400 hover:bg-blue-500/10'
            }`}
          >
            {estadoCor.cor === 'VERMELHO' ? 'Ver Homologação' : 'Homologar / Fechar Mês'}
          </Button>
        </div>
      </div>
    </div>
  );
};
