import React, { useState, useMemo, useEffect } from 'react';
import { Employee, TimeRecord, Branch } from '../types';
import { formatHoursDecimal } from '../utils/calculations';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Building, 
  Eye, 
  Plus, 
  Clock, 
  Sparkles, 
  Users, 
  Layers,
  CheckCircle2,
  AlertCircle,
  Zap,
  CalendarCheck,
  X
} from 'lucide-react';

interface DashboardCalendarViewProps {
  employees: Employee[];
  records: TimeRecord[];
  onOpenNewEntryModal: (matricula?: string, date?: string) => void;
  onOpenEditEntryModal?: (record: TimeRecord) => void;
  onViewEmployeeStatement: (matricula: string) => void;
  onOpenQuickBatchModal?: () => void;
  onDeleteRecord?: (id: string) => void | Promise<void>;
  theme?: 'dark' | 'light';
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAY_FULL = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

// Helper to get start of week (Segunda-feira)
const getStartOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const start = new Date(date.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
};

// Format Date YYYY-MM-DD
const toDateIso = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DashboardCalendarView: React.FC<DashboardCalendarViewProps> = ({
  employees,
  records,
  onOpenNewEntryModal,
  onOpenEditEntryModal,
  onViewEmployeeStatement,
  onOpenQuickBatchModal,
  onDeleteRecord,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Mode: 7 Days (Week) | 14 Days (Biweekly)
  const [viewMode, setViewMode] = useState<'7_DAYS' | '14_DAYS'>('7_DAYS');

  // Active Start Date of visible window
  const [startDate, setStartDate] = useState<Date>(() => getStartOfWeek(new Date()));

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSede, setFilterSede] = useState<string>('TODAS');
  const [filterFuncao, setFilterFuncao] = useState<string>('TODAS');
  // Filtro por data/dia selecionado ao clicar no cabeçalho do calendário
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);

  const daysCount = viewMode === '7_DAYS' ? 7 : 14;

  // Generate period days
  const daysInPeriod = useMemo(() => {
    const days = [];
    const todayIso = toDateIso(new Date());

    for (let i = 0; i < daysCount; i++) {
      const cur = new Date(startDate);
      cur.setDate(startDate.getDate() + i);
      const dateIso = toDateIso(cur);
      const dayOfWeek = cur.getDay();

      days.push({
        dateObj: cur,
        dateIso,
        dayNumber: cur.getDate(),
        monthNumber: cur.getMonth() + 1,
        monthName: MONTH_NAMES[cur.getMonth()],
        monthNameShort: MONTH_NAMES_SHORT[cur.getMonth()],
        year: cur.getFullYear(),
        dayOfWeek,
        dayName: WEEKDAY_SHORT[dayOfWeek],
        dayNameFull: WEEKDAY_FULL[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isSunday: dayOfWeek === 0,
        isSaturday: dayOfWeek === 6,
        isToday: dateIso === todayIso,
      });
    }
    return days;
  }, [startDate, daysCount]);

  // Se o dia filtrado não está mais no período visível (ex: navegação de período), limpa o filtro
  useEffect(() => {
    if (selectedDayFilter) {
      const isVisible = daysInPeriod.some(d => d.dateIso === selectedDayFilter);
      if (!isVisible) {
        setSelectedDayFilter(null);
      }
    }
  }, [daysInPeriod, selectedDayFilter]);

  // End date of period
  const endDate = useMemo(() => {
    if (daysInPeriod.length === 0) return startDate;
    return daysInPeriod[daysInPeriod.length - 1].dateObj;
  }, [daysInPeriod, startDate]);

  // Navigation handlers
  const handlePrevPeriod = () => {
    const next = new Date(startDate);
    next.setDate(startDate.getDate() - daysCount);
    setStartDate(next);
  };

  const handleNextPeriod = () => {
    const next = new Date(startDate);
    next.setDate(startDate.getDate() + daysCount);
    setStartDate(next);
  };

  const handleSetCurrentPeriod = () => {
    setStartDate(getStartOfWeek(new Date()));
  };

  // Unique sedes & funcoes
  const availableSedes = useMemo(() => {
    const s = new Set<string>();
    employees.forEach((e) => {
      const sCod = e.sedeCodigo || e.sede_atual || e.sede;
      if (sCod) s.add(sCod);
    });
    return Array.from(s).sort();
  }, [employees]);

  const availableFuncoes = useMemo(() => {
    const f = new Set<string>();
    employees.forEach((e) => {
      if (e.funcao) f.add(e.funcao);
    });
    return Array.from(f).sort();
  }, [employees]);

  // Normalization helper for record dates
  const normalizeRecDate = (r: TimeRecord): string => {
    const raw = r.dataRegistro || r.data_ocorrencia || (r as any).data || (r as any).date || r.criadoEm || '';
    if (!raw) return '';
    const clean = raw.trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
      const [d, m, y] = clean.split('/');
      return `${y}-${m}-${d}`;
    }
    return clean.split('T')[0];
  };

  // Map of records by `matricula_dateIso`
  const recordsMap = useMemo(() => {
    const map = new Map<string, TimeRecord[]>();
    const startIso = daysInPeriod[0]?.dateIso || '';
    const endIso = daysInPeriod[daysInPeriod.length - 1]?.dateIso || '';

    records.forEach((rec) => {
      const recDate = normalizeRecDate(rec);
      if (recDate >= startIso && recDate <= endIso) {
        const mat = (rec.matricula || '').trim().toUpperCase();
        const key = `${mat}_${recDate}`;
        const current = map.get(key) || [];
        current.push(rec);
        map.set(key, current);
      }
    });

    return map;
  }, [records, daysInPeriod]);

  // Contagem de colaboradores com lançamentos em cada dia do período visível
  const dayEmployeeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    daysInPeriod.forEach((d) => {
      let count = 0;
      employees.forEach((emp) => {
        const mat = (emp.matricula || '').trim().toUpperCase();
        const key = `${mat}_${d.dateIso}`;
        const recs = recordsMap.get(key);
        if (recs && recs.length > 0) count++;
      });
      counts.set(d.dateIso, count);
    });
    return counts;
  }, [daysInPeriod, employees, recordsMap]);

  // Filtered employees (respeita busca, sede, função e dia selecionado no cabeçalho)
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (filterSede !== 'TODAS' && (emp.sedeCodigo || emp.sede_atual || emp.sede) !== filterSede) return false;
      if (filterFuncao !== 'TODAS' && emp.funcao !== filterFuncao) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mMat = (emp.matricula || '').toLowerCase().includes(q);
        const mNom = (emp.nome || '').toLowerCase().includes(q);
        const mFun = (emp.funcao || '').toLowerCase().includes(q);
        if (!mMat && !mNom && !mFun) return false;
      }
      // Filtro por Data/Dia específico selecionado no cabeçalho
      if (selectedDayFilter) {
        const cleanMat = (emp.matricula || '').trim().toUpperCase();
        const dayKey = `${cleanMat}_${selectedDayFilter}`;
        const dayRecords = recordsMap.get(dayKey);
        if (!dayRecords || dayRecords.length === 0) return false;
      }
      return true;
    });
  }, [employees, filterSede, filterFuncao, searchQuery, selectedDayFilter, recordsMap]);

  // Period Statistics
  const periodStats = useMemo(() => {
    const startIso = daysInPeriod[0]?.dateIso || '';
    const endIso = daysInPeriod[daysInPeriod.length - 1]?.dateIso || '';

    const periodRecords = records.filter((r) => {
      const d = normalizeRecDate(r);
      return d >= startIso && d <= endIso;
    });

    let totalHoras = 0;
    let totalAtestados = 0;
    let totalFaltas = 0;
    let totalTrabalho = 0;
    let totalCompensacao = 0;

    periodRecords.forEach((r) => {
      const saldo = Number(r.saldoCalculado);
      const horas = Number(r.horasBrutas) || 0;
      const mult = Number(r.multiplicador) || 1;

      if (!isNaN(saldo) && saldo !== 0) {
        totalHoras += saldo;
      } else if (r.tipoOcorrencia === 'TRABALHO' && horas > 0) {
        totalHoras += horas * mult;
      } else if (r.tipoOcorrencia === 'COMPENSACAO' || r.tipoOcorrencia === 'DISPENSA_OPERACIONAL') {
        totalHoras -= (horas > 0 ? horas : 8.0);
      }

      if (r.tipoOcorrencia === 'ATESTADO_MEDICO') totalAtestados++;
      else if (r.tipoOcorrencia === 'FALTA_INJUSTIFICADA') totalFaltas++;
      else if (r.tipoOcorrencia === 'TRABALHO') totalTrabalho++;
      else if (r.tipoOcorrencia === 'COMPENSACAO' || r.tipoOcorrencia === 'DISPENSA_OPERACIONAL') totalCompensacao++;
    });

    return {
      totalHoras,
      totalAtestados,
      totalFaltas,
      totalTrabalho,
      totalCompensacao,
      totalRegistros: periodRecords.length,
    };
  }, [records, daysInPeriod]);

  // Render Pill for an individual record
  const renderOccurrencePill = (rec: TimeRecord, index: number = 0) => {
    let saldo = Number(rec.saldoCalculado);
    const horasBrutas = Number(rec.horasBrutas) || 0;
    const mult = Number(rec.multiplicador) || 1;
    const itemKey = rec.id ? `rec_${rec.id}` : `rec_${rec.matricula}_${rec.dataRegistro}_${rec.tipoOcorrencia}_${index}`;

    if (isNaN(saldo) || (saldo === 0 && horasBrutas !== 0)) {
      if (rec.tipoOcorrencia === 'TRABALHO') {
        saldo = horasBrutas * mult;
      } else if (
        rec.tipoOcorrencia === 'COMPENSACAO' ||
        rec.tipoOcorrencia === 'DISPENSA_OPERACIONAL' ||
        (rec.tipoOcorrencia as string) === 'DISPENSA_SPTF'
      ) {
        saldo = -(Math.abs(horasBrutas) > 0 ? Math.abs(horasBrutas) : 8.0);
      }
    }

    const handleClickPill = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onOpenEditEntryModal) {
        onOpenEditEntryModal(rec);
      } else {
        const d = normalizeRecDate(rec);
        onOpenNewEntryModal(rec.matricula, d);
      }
    };

    switch (rec.tipoOcorrencia) {
      case 'TRABALHO': {
        const isPositive = saldo > 0;
        const isNegative = saldo < 0 || horasBrutas < 0;
        const val = saldo !== 0 ? saldo : horasBrutas;
        const displayHours = isPositive
          ? `+${saldo.toFixed(1)}h`
          : isNegative
          ? Number.isInteger(val) ? `${val}h` : `${val.toFixed(1)}h`
          : `${horasBrutas}h`;

        return (
          <button
            key={itemKey}
            type="button"
            onClick={handleClickPill}
            title={`Clique para editar: Trabalho / HE ${horasBrutas}h brutas (${mult}x = ${saldo > 0 ? '+' : ''}${saldo.toFixed(1)}h)${rec.observacao ? ` • ${rec.observacao}` : ''}`}
            className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold leading-tight shadow-2xs whitespace-nowrap cursor-pointer transition-all active:scale-[0.98] hover:scale-105 ${
              isPositive
                ? isDark
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-800 hover:text-white'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                : isNegative
                ? isDark
                  ? 'bg-orange-950/80 text-orange-300 border border-orange-600/60 hover:bg-orange-800 hover:text-white'
                  : 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200'
                : isDark
                ? 'bg-blue-950/80 text-blue-300 border border-blue-700/60 hover:bg-blue-800 hover:text-white'
                : 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200'
            }`}
          >
            {displayHours}
          </button>
        );
      }
      case 'ATESTADO_MEDICO':
        return (
          <button
            key={itemKey}
            type="button"
            onClick={handleClickPill}
            title={`Clique para editar: Atestado Médico (Neutro 0h)${rec.observacao ? ` • ${rec.observacao}` : ''}`}
            className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold leading-tight cursor-pointer transition-all active:scale-[0.98] hover:scale-105 ${
              isDark ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60 hover:bg-amber-800 hover:text-white' : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
            }`}
          >
            AT (0h)
          </button>
        );
      case 'FALTA_INJUSTIFICADA':
        return (
          <button
            key={itemKey}
            type="button"
            onClick={handleClickPill}
            title={`Clique para editar: Falta Injustificada (-8.0h / Desconto)${rec.observacao ? ` • ${rec.observacao}` : ''}`}
            className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold leading-tight cursor-pointer transition-all active:scale-[0.98] hover:scale-105 ${
              isDark ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60 hover:bg-rose-800 hover:text-white' : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
            }`}
          >
            -8.0h
          </button>
        );
      case 'FERIAS':
        return (
          <button
            key={itemKey}
            type="button"
            onClick={handleClickPill}
            title="Clique para editar: Férias Regulamentares"
            className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold leading-tight cursor-pointer transition-all active:scale-[0.98] hover:scale-105 ${
              isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 hover:bg-cyan-800 hover:text-white' : 'bg-cyan-100 text-cyan-800 border border-cyan-300 hover:bg-cyan-200'
            }`}
          >
            FÉRIAS
          </button>
        );
      case 'COMPENSACAO':
      case 'DISPENSA_OPERACIONAL':
      case 'DISPENSA_SPTF': {
        const val = saldo < 0 ? saldo : (horasBrutas > 0 ? -horasBrutas : -8.0);
        const text = Number.isInteger(val) ? `${val}h` : `${val.toFixed(1)}h`;
        return (
          <button
            key={itemKey}
            type="button"
            onClick={handleClickPill}
            title={`Clique para editar: Folga / Compensação (${val.toFixed(1)}h)${rec.observacao ? ` • ${rec.observacao}` : ''}`}
            className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold leading-tight cursor-pointer transition-all active:scale-[0.98] hover:scale-105 ${
              isDark
                ? 'bg-orange-950/80 text-orange-300 border border-orange-600/60 hover:bg-orange-800 hover:text-white'
                : 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200'
            }`}
          >
            {text}
          </button>
        );
      }
      default: {
        const isNegative = saldo < 0 || horasBrutas < 0;
        const val = saldo !== 0 ? saldo : horasBrutas;
        const text = isNegative
          ? (Number.isInteger(val) ? `${val}h` : `${val.toFixed(1)}h`)
          : `${horasBrutas}h`;
        return (
          <button
            key={itemKey}
            type="button"
            onClick={handleClickPill}
            title={`Clique para editar: ${horasBrutas}h`}
            className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold leading-tight cursor-pointer transition-all active:scale-[0.98] hover:scale-105 ${
              isNegative
                ? isDark
                  ? 'bg-orange-950/80 text-orange-300 border border-orange-600/60 hover:bg-orange-800 hover:text-white'
                  : 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200'
                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/40'
            }`}
          >
            {text}
          </button>
        );
      }
    }
  };

  // Header period title formatted
  const periodLabel = useMemo(() => {
    if (daysInPeriod.length === 0) return '';
    const first = daysInPeriod[0];
    const last = daysInPeriod[daysInPeriod.length - 1];

    if (first.year === last.year && first.monthNumber === last.monthNumber) {
      return `${String(first.dayNumber).padStart(2, '0')} a ${String(last.dayNumber).padStart(2, '0')} de ${first.monthName} de ${first.year}`;
    }
    return `${String(first.dayNumber).padStart(2, '0')}/${String(first.monthNumber).padStart(2, '0')} a ${String(last.dayNumber).padStart(2, '0')}/${String(last.monthNumber).padStart(2, '0')}/${last.year}`;
  }, [daysInPeriod]);

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------- */}
      {/* BARRA SUPERIOR: SELETOR DE MODO, NAVEGADOR E FILTROS          */}
      {/* ------------------------------------------------------------- */}
      <div className={`p-4 rounded-2xl border flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${
        isDark ? 'bg-[#0F1B33] border-[#243756]' : 'bg-white border-gray-200 shadow-xs'
      }`}>
        
        {/* Lado Esquerdo: Seletor de Modo (7d / 14d) + Navegador de Período */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Seletor de Alternância [ 7 Dias | 14 Dias ] */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${
            isDark ? 'bg-[#16243D] border-[#335075]' : 'bg-gray-100 border-gray-300'
          }`}>
            <button
              onClick={() => setViewMode('7_DAYS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
                viewMode === '7_DAYS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>7 Dias (Semanal)</span>
            </button>
            <button
              onClick={() => setViewMode('14_DAYS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
                viewMode === '14_DAYS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>14 Dias (Quinzenal)</span>
            </button>
          </div>

          {/* Navegador de Período com Setas */}
          <div className="flex items-center rounded-xl border overflow-hidden p-0.5 bg-black/20">
            <button
              onClick={handlePrevPeriod}
              className={`p-2 rounded-lg transition-colors active:scale-[0.98] cursor-pointer ${
                isDark ? 'hover:bg-[#243756] text-gray-300' : 'hover:bg-white text-gray-700'
              }`}
              title={`Voltar ${daysCount} dias`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 flex items-center gap-2">
              <span className={`font-bold text-xs sm:text-sm tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {periodLabel}
              </span>
            </div>

            <button
              onClick={handleNextPeriod}
              className={`p-2 rounded-lg transition-colors active:scale-[0.98] cursor-pointer ${
                isDark ? 'hover:bg-[#243756] text-gray-300' : 'hover:bg-white text-gray-700'
              }`}
              title={`Avançar ${daysCount} dias`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Botão Semana/Período Atual */}
          <button
            onClick={handleSetCurrentPeriod}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors active:scale-[0.98] cursor-pointer ${
              isDark ? 'border-[#335075] hover:bg-[#243756] text-blue-400' : 'border-gray-300 hover:bg-gray-100 text-blue-700'
            }`}
          >
            Semana Atual
          </button>

          {onOpenQuickBatchModal && (
            <button
              onClick={onOpenQuickBatchModal}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 border-blue-500/30 transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Apontar horas para múltiplos colaboradores"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Lançamento em Lote</span>
            </button>
          )}
        </div>

        {/* Lado Direito: Filtros Rápidos */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Buscar colaborador ou matrícula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full sm:w-56 rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none border transition-colors ${
                isDark ? 'bg-[#16243D] border-[#243756] text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
            <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>

          <select
            value={filterSede}
            onChange={(e) => setFilterSede(e.target.value)}
            className={`rounded-xl px-3 py-1.5 text-xs outline-none border font-medium ${
              isDark ? 'bg-[#16243D] border-[#243756] text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="TODAS">Todas as Sedes</option>
            {availableSedes.map((s) => (
              <option key={s} value={s}>Sede: {s}</option>
            ))}
          </select>

          <select
            value={filterFuncao}
            onChange={(e) => setFilterFuncao(e.target.value)}
            className={`rounded-xl px-3 py-1.5 text-xs outline-none border font-medium ${
              isDark ? 'bg-[#16243D] border-[#243756] text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="TODAS">Todas as Funções</option>
            {availableFuncoes.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LEGENDA E RESUMO RÁPIDO DO PERÍODO                            */}
      {/* ------------------------------------------------------------- */}
      <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
        isDark ? 'bg-[#101217] border-[#243756] text-[#94A3B8]' : 'bg-gray-50 border-gray-200 text-gray-600'
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-white dark:text-white font-sans text-xs">Legenda:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Trabalho / HE (+Horas)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>Débito / Folga / Compensação (-Horas)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Atestado Médico (AT)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Falta Injustificada (-8h)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span>Férias</span>
          </span>
        </div>

        <div className="font-mono text-xs flex items-center gap-3">
          <div>
            <span className="opacity-75">Saldo do Período ({daysCount}d): </span>
            <strong className={periodStats.totalHoras >= 0 ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
              {formatHoursDecimal(periodStats.totalHoras)}
            </strong>
          </div>
          <span className="opacity-50">|</span>
          <div>
            <span className="opacity-75">Apontamentos: </span>
            <strong className="text-white font-bold">{periodStats.totalRegistros}</strong>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BANNER DE FILTRO ATIVO POR DIA                                */}
      {/* ------------------------------------------------------------- */}
      {selectedDayFilter && (
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs flex-wrap transition-all shadow-xs animate-in fade-in-50 ${
          isDark ? 'bg-blue-950/40 border-blue-500/40 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-2.5 font-bold">
            <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-600 text-white'}`}>
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <span>
                Filtrando colaboradores com lançamentos no <strong>Dia {selectedDayFilter.split('-')[2]}/{selectedDayFilter.split('-')[1]}/{selectedDayFilter.split('-')[0]}</strong> ({filteredEmployees.length} {filteredEmployees.length === 1 ? 'colaborador encontrado' : 'colaboradores encontrados'})
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedDayFilter(null)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
            title="Limpar filtro de dia"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar Filtro de Dia</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GRADE DA TABELA COM NAVEGAÇÃO NAS EXTREMIDADES                */}
      {/* ------------------------------------------------------------- */}
      <div className={`rounded-2xl border overflow-x-auto shadow-inner ${
        isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-gray-200'
      }`}>
        <table className={`w-full text-left border-collapse ${viewMode === '7_DAYS' ? 'min-w-[920px]' : 'min-w-[1180px]'}`}>
          <thead>
            <tr className={`text-xs uppercase font-mono font-bold border-b ${
              isDark ? 'bg-[#0F1B33] text-[#94A3B8] border-[#243756]' : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              
              {/* Coluna Fixa: Colaborador com botão retroceder integrado */}
              <th className={`py-3 px-3 sticky left-0 z-20 w-60 sm:w-64 min-w-[220px] max-w-[260px] shadow-sm backdrop-blur-xs border-r ${
                isDark ? 'bg-[#0F1B33] border-[#243756]' : 'bg-gray-100 border-gray-200'
              }`}>
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">COLABORADOR ({filteredEmployees.length})</span>
                  </div>
                  {/* Botão de Retroceder Período na extremidade esquerda da grade */}
                  <button
                    onClick={handlePrevPeriod}
                    className={`p-1 rounded-lg border transition-colors active:scale-[0.98] cursor-pointer flex items-center gap-0.5 text-[10px] font-bold shrink-0 ${
                      isDark ? 'bg-[#1E3252] border-[#335075] hover:bg-[#2E4566] text-blue-400' : 'bg-white border-gray-300 hover:bg-gray-100 text-blue-600'
                    }`}
                    title={`Retroceder ${daysCount} dias`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">-{daysCount}d</span>
                  </button>
                </div>
              </th>

              {/* Colunas de Datas Proporcionais - Clicáveis para filtrar */}
              {daysInPeriod.map((day) => {
                const isDaySelected = selectedDayFilter === day.dateIso;
                const empsWithRecordsOnDay = dayEmployeeCounts.get(day.dateIso) || 0;

                return (
                  <th
                    key={day.dateIso}
                    onClick={() => {
                      setSelectedDayFilter((prev) => (prev === day.dateIso ? null : day.dateIso));
                    }}
                    className={`py-2 px-1 text-center font-mono border-l transition-all select-none cursor-pointer group ${
                      viewMode === '7_DAYS' ? 'min-w-[85px] sm:min-w-[95px]' : 'min-w-[62px] sm:min-w-[70px]'
                    } ${
                      isDaySelected
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 z-30 scale-[1.02]'
                        : day.isToday
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 font-bold hover:bg-blue-500/30'
                        : day.isSunday
                        ? isDark ? 'bg-rose-950/20 text-rose-300 border-[#243756] hover:bg-blue-500/10' : 'bg-rose-50 text-rose-700 border-gray-200 hover:bg-blue-50'
                        : day.isSaturday
                        ? isDark ? 'bg-amber-950/20 text-amber-300 border-[#243756] hover:bg-blue-500/10' : 'bg-amber-50 text-amber-700 border-gray-200 hover:bg-blue-50'
                        : isDark ? 'border-[#243756] hover:bg-blue-500/10 text-gray-300' : 'border-gray-200 hover:bg-blue-50 text-gray-700'
                    }`}
                    title={`Clique para ${isDaySelected ? 'desativar o filtro deste dia' : `filtrar colaboradores com lançamentos em ${day.dayNumber}/${day.monthNameShort}`}${empsWithRecordsOnDay > 0 ? ` (${empsWithRecordsOnDay} com lançamento)` : ' (sem lançamentos)'}`}
                  >
                    <div className="flex flex-col items-center justify-center relative">
                      <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase ${
                        isDaySelected ? 'text-white' : day.isSunday ? 'text-rose-400' : day.isSaturday ? 'text-amber-400' : 'opacity-70'
                      }`}>
                        {day.dayName}
                      </span>
                      <span className={`text-xs sm:text-sm font-black tracking-tight ${
                        isDaySelected ? 'text-white underline decoration-2' : day.isToday ? 'text-blue-400' : ''
                      }`}>
                        {String(day.dayNumber).padStart(2, '0')}/{day.monthNameShort}
                      </span>

                      {/* Contador ou Indicador de Filtro Ativo */}
                      {isDaySelected ? (
                        <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.2 rounded-full bg-white/20 text-[8px] sm:text-[9px] font-black uppercase text-white tracking-wider">
                          <Filter className="w-2.5 h-2.5" />
                          <span>{filteredEmployees.length}</span>
                        </span>
                      ) : empsWithRecordsOnDay > 0 ? (
                        <span className={`inline-flex items-center gap-0.5 mt-0.5 px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-mono transition-opacity ${
                          isDark ? 'bg-blue-900/40 text-blue-300 group-hover:bg-blue-800' : 'bg-blue-100 text-blue-700 group-hover:bg-blue-200'
                        }`}>
                          {empsWithRecordsOnDay} {empsWithRecordsOnDay === 1 ? 'colab' : 'colabs'}
                        </span>
                      ) : (
                        <span className="text-[8px] opacity-0 group-hover:opacity-40 transition-opacity mt-0.5 font-mono">
                          0
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}

              {/* Botão de Avançar Período na extremidade direita do cabeçalho */}
              <th className={`py-3 px-2 text-center w-28 min-w-[95px] max-w-[115px] border-l ${
                isDark ? 'bg-[#0F1B33] border-[#243756]' : 'bg-gray-100 border-gray-200'
              }`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-bold font-sans truncate">SALDO</span>
                  <button
                    onClick={handleNextPeriod}
                    className={`p-1 rounded-lg border transition-colors active:scale-[0.98] cursor-pointer flex items-center gap-0.5 text-[10px] font-bold shrink-0 ${
                      isDark ? 'bg-[#1E3252] border-[#335075] hover:bg-[#2E4566] text-blue-400' : 'bg-white border-gray-300 hover:bg-gray-100 text-blue-600'
                    }`}
                    title={`Avançar ${daysCount} dias`}
                  >
                    <span className="hidden md:inline">+{daysCount}d</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className={`text-xs divide-y ${
            isDark ? 'divide-[#243756] text-[#E2E8F0]' : 'divide-gray-200 text-gray-800'
          }`}>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={daysInPeriod.length + 2} className="py-14 text-center font-mono">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto px-4">
                    <Users className="w-8 h-8 opacity-40 text-blue-400" />
                    <p className={`text-xs sm:text-sm font-sans ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedDayFilter
                        ? `Nenhum colaborador possui lançamento registrado no dia ${selectedDayFilter.split('-')[2]}/${selectedDayFilter.split('-')[1]}/${selectedDayFilter.split('-')[0]}.`
                        : 'Nenhum colaborador encontrado para os filtros selecionados.'}
                    </p>
                    {selectedDayFilter && (
                      <button
                        onClick={() => setSelectedDayFilter(null)}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-xs flex items-center gap-1.5 font-sans"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Limpar Filtro de Dia</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const cleanMat = (emp.matricula || '').trim().toUpperCase();

                // Computar Saldo do Período para o Colaborador
                let empPeriodBalance = 0;
                daysInPeriod.forEach((day) => {
                  const key = `${cleanMat}_${day.dateIso}`;
                  const dayRecords = recordsMap.get(key) || [];
                  dayRecords.forEach((r) => {
                    let s = Number(r.saldoCalculado);
                    const h = Number(r.horasBrutas) || 0;
                    const m = Number(r.multiplicador) || 1;
                    if (isNaN(s) || (s === 0 && h > 0)) {
                      if (r.tipoOcorrencia === 'TRABALHO') s = h * m;
                      else if (r.tipoOcorrencia === 'COMPENSACAO' || r.tipoOcorrencia === 'DISPENSA_OPERACIONAL') s = -(h > 0 ? h : 8.0);
                    }
                    if (!isNaN(s)) empPeriodBalance += s;
                  });
                });

                return (
                  <tr
                    key={emp.id || emp.matricula}
                    className={`transition-colors ${isDark ? 'hover:bg-[#1E3252]' : 'hover:bg-blue-50/40'}`}
                  >
                    {/* Coluna Fixa: Colaborador Compacta (Linha 1: Nome, Linha 2: #Mat • Sede • Função) */}
                    <td className={`py-2 px-3 sticky left-0 z-10 font-sans border-r w-60 sm:w-64 min-w-[220px] max-w-[260px] backdrop-blur-xs ${
                      isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
                          {emp.url_foto_perfil || emp.avatarUrl ? (
                            <img
                              src={emp.url_foto_perfil || emp.avatarUrl}
                              alt={emp.nome}
                              className="w-6 h-6 rounded-full object-cover shrink-0 border"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-[9px] shrink-0">
                              {(emp.nome || 'C')[0]}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() => onViewEmployeeStatement(emp.matricula)}
                              className={`font-bold hover:text-blue-500 truncate block text-left transition-colors active:scale-[0.98] cursor-pointer text-xs leading-tight ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}
                              title={emp.nome}
                            >
                              {emp.nome}
                            </button>
                            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 block truncate leading-tight mt-0.5">
                              #{emp.matricula} • {emp.sedeCodigo || 'Não informado'} • {emp.funcao || emp.cargo || 'Serviço Geral'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onViewEmployeeStatement(emp.matricula)}
                          className="p-1 rounded-md text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 shrink-0 cursor-pointer"
                          title="Ver Extrato do Colaborador"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Células dos Dias */}
                    {daysInPeriod.map((day) => {
                      const key = `${cleanMat}_${day.dateIso}`;
                      const dayRecords = recordsMap.get(key) || [];
                      const isColSelected = selectedDayFilter === day.dateIso;

                      return (
                        <td
                          key={`cell_${cleanMat}_${day.dateIso}`}
                          onClick={() => {
                            if (dayRecords.length > 0 && onOpenEditEntryModal) {
                              onOpenEditEntryModal(dayRecords[0]);
                            } else {
                              onOpenNewEntryModal(emp.matricula, day.dateIso);
                            }
                          }}
                          className={`p-1.5 text-center border-l transition-all active:scale-[0.98] cursor-pointer group align-middle ${
                            isColSelected
                              ? isDark
                                ? 'bg-blue-600/15 border-blue-500/30 ring-1 ring-blue-500/20'
                                : 'bg-blue-50/80 border-blue-200 ring-1 ring-blue-500/20'
                              : day.isToday
                              ? 'bg-blue-500/5'
                              : day.isSunday
                              ? isDark ? 'bg-rose-950/5' : 'bg-rose-50/40'
                              : day.isSaturday
                              ? isDark ? 'bg-amber-950/5' : 'bg-amber-50/40'
                              : ''
                          } ${isDark ? 'border-[#243756] hover:bg-blue-500/10' : 'border-gray-200 hover:bg-blue-50'}`}
                          title={
                            dayRecords.length > 0
                              ? `Clique para editar o lançamento de ${emp.nome} em ${day.dateIso}`
                              : `Clique para lançar horas em ${day.dateIso} para ${emp.nome}`
                          }
                        >
                          {dayRecords.length > 0 ? (
                            <div className="flex flex-col items-center justify-center gap-0.5">
                              {dayRecords.map((r, rIdx) => renderOccurrencePill(r, rIdx))}
                            </div>
                          ) : (
                            <div className="h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="px-1.5 py-0.5 rounded-md bg-blue-600/20 text-blue-400 text-[9px] font-bold flex items-center gap-0.5">
                                <Plus className="w-2.5 h-2.5" />
                                <span>Lançar</span>
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Saldo Acumulado no Período (7d ou 14d) */}
                    <td className={`py-2 px-2 text-center font-mono font-black border-l whitespace-nowrap w-28 min-w-[95px] max-w-[115px] ${
                      isDark ? 'border-[#243756]' : 'border-gray-200'
                    }`}>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] inline-block font-mono ${
                        empPeriodBalance > 0
                          ? isDark ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/50' : 'text-emerald-700 bg-emerald-100 border border-emerald-300'
                          : empPeriodBalance < 0
                          ? isDark ? 'text-rose-400 bg-rose-950/50 border border-rose-800/50' : 'text-rose-700 bg-rose-100 border border-rose-300'
                          : 'text-gray-500 bg-gray-500/10'
                      }`}>
                        {formatHoursDecimal(empPeriodBalance)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

