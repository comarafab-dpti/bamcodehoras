import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Users, 
  TableProperties, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Smartphone, 
  Building2, 
  Scale, 
  ChevronRight, 
  ChevronLeft, 
  UserCheck, 
  Printer, 
  Lock, 
  History, 
  Award, 
  Info,
  Download,
  Share2,
  FileSpreadsheet
} from 'lucide-react';

interface GoogleArchitectureSpecProps {
  theme?: 'dark' | 'light';
}

type TabType = 
  | 'diretrizes_gerais' 
  | 'perfis_alçadas' 
  | 'colaboradores_lotacao' 
  | 'apuracao_regras' 
  | 'competencia_fechamento' 
  | 'insalubridade' 
  | 'portal_mobile' 
  | 'auditoria_lgpd';

interface ManualTabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string;
}

const MANUAL_TABS: ManualTabConfig[] = [
  { id: 'diretrizes_gerais', label: '1. Visão Geral & Diretrizes', icon: BookOpen, color: 'text-blue-500', badge: 'border-blue-500 text-blue-400 bg-blue-500/10' },
  { id: 'perfis_alçadas', label: '2. Perfis & Alçadas de Decisão', icon: Users, color: 'text-indigo-500', badge: 'border-indigo-500 text-indigo-400 bg-indigo-500/10' },
  { id: 'colaboradores_lotacao', label: '3. Pessoal, Lotação & Portaria', icon: Building2, color: 'text-emerald-500', badge: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
  { id: 'apuracao_regras', label: '4. Regras do Banco & Dispensas', icon: Clock, color: 'text-amber-500', badge: 'border-amber-500 text-amber-400 bg-amber-500/10' },
  { id: 'competencia_fechamento', label: '5. Fechamento Mensal & Validade', icon: Calendar, color: 'text-rose-500', badge: 'border-rose-500 text-rose-400 bg-rose-500/10' },
  { id: 'insalubridade', label: '6. Insalubridade & Laudos NR-15', icon: TableProperties, color: 'text-amber-500', badge: 'border-amber-500 text-amber-400 bg-amber-500/10' },
  { id: 'portal_mobile', label: '7. Portal do Colaborador & PWA', icon: Smartphone, color: 'text-cyan-500', badge: 'border-cyan-500 text-cyan-400 bg-cyan-500/10' },
  { id: 'auditoria_lgpd', label: '8. Auditoria, Prazos & LGPD', icon: ShieldCheck, color: 'text-purple-500', badge: 'border-purple-500 text-purple-400 bg-purple-500/10' },
];

export const GoogleArchitectureSpec: React.FC<GoogleArchitectureSpecProps> = ({
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<TabType>('diretrizes_gerais');

  // Carousel & Scroll State
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Drag-to-scroll State
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const updateScrollButtons = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = tabsContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  useEffect(() => {
    const activeEl = tabButtonRefs.current[activeTab];
    const container = tabsContainerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();

      if (tabRect.left < containerRect.left + 48 || tabRect.right > containerRect.right - 48) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeTab]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!tabsContainerRef.current) return;
    const amount = Math.max(200, tabsContainerRef.current.clientWidth * 0.55);
    tabsContainerRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabsContainerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - tabsContainerRef.current.offsetLeft;
    scrollLeftStart.current = tabsContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !tabsContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    tabsContainerRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handlePrintManual = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ============================================================= */}
      {/* 1. CABEÇALHO INSTITUCIONAL DO MANUAL ADMINISTRATIVO           */}
      {/* ============================================================= */}
      <div className={`p-6 rounded-2xl border shadow-md transition-colors ${
        isDark 
          ? 'bg-[#16243D] border-[#243756]' 
          : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 border text-[11px] font-bold rounded-full flex items-center gap-1.5 font-mono ${
                isDark 
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                <BookOpen className="w-3.5 h-3.5" />
                Manual Administrativo de Uso do Sistema • COMARA SPTF
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Edição Oficial 2026
              </span>
            </div>
            
            <h1 className={`text-xl sm:text-2xl font-bold font-sans tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Manual de Procedimentos, Gestão de Pessoal e Banco de Horas
            </h1>
            
            <p className={`text-xs max-w-4xl leading-relaxed ${
              isDark ? 'text-[#94A3B8]' : 'text-slate-600'
            }`}>
              Guia oficial de orientações administrativas para Comandantes, Chefes de Divisão, Encarregados de Canteiro, Analistas de Recursos Humanos e Apontadores. Contém as rotinas operacionais de controle de ponto, concessão de dispensas em duas vias, fechamento de competência, laudos de insalubridade e autoatendimento do colaborador.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-end lg:self-auto shrink-0">
            <button
              onClick={handlePrintManual}
              type="button"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center gap-1.5 border cursor-pointer ${
                isDark 
                  ? 'bg-[#1E3252] hover:bg-[#284168] border-[#335075] text-slate-200' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Imprimir página do manual ou salvar em PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Imprimir Manual</span>
            </button>

            <button
              onClick={() => setActiveTab('portal_mobile')}
              type="button"
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalação Mobile</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. NAVEGAÇÃO DE CAPÍTULOS / ABAS DO MANUAL                     */}
      {/* ============================================================= */}
      <div className={`rounded-2xl border shadow-md overflow-hidden transition-colors ${
        isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
      }`}>
        <div className={`relative border-b ${
          isDark ? 'border-[#243756] bg-[#0F1B33]' : 'border-slate-200 bg-slate-50/90'
        }`}>
          {/* Botão de Navegação Esquerda */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Rolar abas para a esquerda"
            className={`absolute left-1.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-xl border shadow-lg backdrop-blur-md transition-all cursor-pointer ${
              canScrollLeft 
                ? 'opacity-100 scale-100 pointer-events-auto' 
                : 'opacity-0 scale-95 pointer-events-none'
            } ${
              isDark 
                ? 'bg-[#16243D]/95 border-[#243756] text-slate-200 hover:text-white hover:bg-[#1E3252]' 
                : 'bg-white/95 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Gradiente Esquerda */}
          <div 
            className={`absolute left-0 top-0 bottom-0 w-12 pointer-events-none z-10 transition-opacity duration-300 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            } ${
              isDark 
                ? 'bg-gradient-to-r from-[#0F1B33] via-[#0F1B33]/80 to-transparent' 
                : 'bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent'
            }`}
          />

          {/* Contêiner de Abas com Scroll Suave */}
          <div
            ref={tabsContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="flex items-center space-x-1 p-2 overflow-x-auto no-scrollbar select-none cursor-grab active:cursor-grabbing scroll-smooth"
          >
            {MANUAL_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabButtonRefs.current[tab.id] = el;
                  }}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : isDark
                        ? 'text-[#94A3B8] hover:text-white hover:bg-[#1E3252]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Gradiente Direita */}
          <div 
            className={`absolute right-0 top-0 bottom-0 w-12 pointer-events-none z-10 transition-opacity duration-300 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            } ${
              isDark 
                ? 'bg-gradient-to-l from-[#0F1B33] via-[#0F1B33]/80 to-transparent' 
                : 'bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent'
            }`}
          />

          {/* Botão de Navegação Direita */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Rolar abas para a direita"
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-xl border shadow-lg backdrop-blur-md transition-all cursor-pointer ${
              canScrollRight 
                ? 'opacity-100 scale-100 pointer-events-auto' 
                : 'opacity-0 scale-95 pointer-events-none'
            } ${
              isDark 
                ? 'bg-[#16243D]/95 border-[#243756] text-slate-200 hover:text-white hover:bg-[#1E3252]' 
                : 'bg-white/95 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================== */}
        {/* CONTEÚDO DAS ABAS                                           */}
        {/* =========================================================== */}

        {/* ----------------------------------------------------------- */}
        {/* CAPÍTULO 1: VISÃO GERAL & DIRETRIZES ADMINISTRATIVAS         */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'diretrizes_gerais' && (
          <div className="p-6 space-y-6">
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#1A2942] border-[#2B4366]' : 'bg-blue-50/60 border-blue-100'
            }`}>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-500" />
                <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Finalidade do Sistema & Amparo Normativo
                </h2>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                O <strong>Sistema de Gestão de Banco de Horas SPTF da COMARA</strong> é a plataforma administrativa oficial destinada ao controle, apuração, homologação e rastreamento das jornadas de trabalho e ocorrências funcionais dos servidores e colaboradores civis vinculados à Comissão de Aeroportos da Região Amazônica (COMARA), no âmbito do Comando da Aeronáutica (COMAER).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border space-y-2 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Segurança Jurídica</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Elimina controles informais e planilhas paralelas de papel, garantindo memória de cálculo padronizada e imutável para subsidiar fiscalizações trabalhistas e auditorias militares.
                </p>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Award className="w-4 h-4" />
                  <span>Transparência ao Servidor</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Permite que cada colaborador consulte individualmente seu extrato de horas acumuladas, compensações efetuadas e comprovantes de contracheque através do Portal de Autoatendimento.
                </p>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Clock className="w-4 h-4" />
                  <span>Controle de Prescrição</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Monitoramento automático do prazo regulamentar de 6 meses para gozo das horas do banco, alertando gestores e colaboradores com antecedência de 60 e 30 dias para evitar perdas.
                </p>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#0F1B33] border-[#243756]' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Princípios Fundamentais de Governança
              </h3>
              <ul className={`text-xs space-y-2 leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Descentralização com Autoridade:</strong> Cada Canteiro de Obras ou Divisão é responsável por apurar e homologar suas próprias ocorrências diárias através de sua respectiva Chefia.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Sucessão Obrigatória de Fechamentos:</strong> Nenhum canteiro pode iniciar registros no mês corrente sem ter encerrado e auditado o mês anterior, mantendo a cadeia de saldos contábeis.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Formalidade em Duas Vias:</strong> Toda dispensa ou compensação deve gerar a Guia Oficial impressa e assinada tanto pelo colaborador quanto pela chefia imediata.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Conformidade com a LGPD:</strong> Dados pessoais e registros de folha são protegidos com perfis segregados e auditoria digital de acessos.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* CAPÍTULO 2: PERFIS DE ACESSO & ALÇADAS DE DECISÃO           */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'perfis_alçadas' && (
          <div className="p-6 space-y-6">
            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#1A2942] border-[#2B4366]' : 'bg-blue-50/60 border-blue-100'
            }`}>
              <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Matriz de Alçadas e Responsabilidades Administrativas
              </h2>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                Os acessos ao sistema são estritamente delimitados por nível de responsabilidade institucional, garantindo a separação de funções entre quem aponta as horas, quem homologa e quem fiscaliza.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Perfil 1: Super Admin */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Super Admin (Comandante / Direção Geral)
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-800'
                  }`}>DIREÇÃO</span>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Alçada máxima de deliberação. Responsável pela aprovação de parâmetros normativos gerais, liberação excepcional de competências bloqueadas com justificativa formal registrada e consulta à auditoria irrestrita da COMARA.
                </p>
                <div className={`p-3 rounded-xl text-[11px] space-y-1 border ${
                  isDark ? 'bg-[#0F1B33] border-[#243756] text-[#CBD5E1]' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <p>• Gestão de permissões e perfis de usuários</p>
                  <p>• Reabertura emergencial com rastreabilidade auditada</p>
                  <p>• Visão consolidada de todas as OUs e Canteiros</p>
                </div>
              </div>

              {/* Perfil 2: RH Admin */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      RH Admin (Divisão de Pessoal / RH Central)
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                  }`}>GESTÃO RH</span>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Gestão global dos colaboradores, parametrização de lotações e setores, importação oficial da folha de pagamento, consolidação do fechamento mensal geral e emissão do extrato oficial de liquidação/rescisão.
                </p>
                <div className={`p-3 rounded-xl text-[11px] space-y-1 border ${
                  isDark ? 'bg-[#0F1B33] border-[#243756] text-[#CBD5E1]' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <p>• Cadastro de colaboradores e conciliação de UOs</p>
                  <p>• Homologação final do fechamento mensal geral</p>
                  <p>• Controle de laudos de insalubridade e contracheques</p>
                </div>
              </div>

              {/* Perfil 3: Chefe de Canteiro / Chefe DA */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Chefia de Canteiro / Chefe de Divisão (DA)
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                  }`}>CANTEIRO</span>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Autoridade operacional da frente de obras. Responsável pela validação das horas trabalhadas, autorização prévia de horas extras e compensações, emissão da Guia de Dispensa e fechamento mensal da sua respectiva unidade.
                </p>
                <div className={`p-3 rounded-xl text-[11px] space-y-1 border ${
                  isDark ? 'bg-[#0F1B33] border-[#243756] text-[#CBD5E1]' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <p>• Validação das ocorrências do canteiro sob sua guarda</p>
                  <p>• Fechamento e bloqueio mensal do canteiro</p>
                  <p>• Assinatura das guias de dispensa de expediente</p>
                </div>
              </div>

              {/* Perfil 4: Apontador & Auditor */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Apontador (Operador) & Auditor (Fiscalização)
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-800'
                  }`}>OPERACIONAL</span>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  <strong>Apontador:</strong> Executa o registro diário de horas normais, extraordinárias, atestados e faltas. <br />
                  <strong>Auditor:</strong> Acesso estritamente em modo de visualização para conferência documental e inspeções de controle interno.
                </p>
                <div className={`p-3 rounded-xl text-[11px] space-y-1 border ${
                  isDark ? 'bg-[#0F1B33] border-[#243756] text-[#CBD5E1]' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <p>• Lançamentos rápidos e em lote de ocorrências</p>
                  <p>• Auditoria com relatórios de conformidade e espelho de ponto</p>
                  <p>• Emissão da Relação de Portaria para guarita</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* CAPÍTULO 3: GESTÃO DE PESSOAL, LOTAÇÃO & PORTARIA           */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'colaboradores_lotacao' && (
          <div className="p-6 space-y-6">
            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#1A2942] border-[#2B4366]' : 'bg-blue-50/60 border-blue-100'
            }`}>
              <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Estrutura Organizacional, Consulta de Pessoal e Relação de Portaria
              </h2>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                A COMARA adota um modelo organizacional descentralizado composto por Unidades Organizacionais (UOs), Setores funcionais e Canteiros operacionais na Região Amazônica.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <span>Diferenciação entre Lotação e Execução</span>
                </h3>
                <div className={`text-xs space-y-2.5 leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  <p>
                    <strong>• UO de Lotação (Administrativa):</strong> É a Unidade Organizacional à qual o colaborador pertence contratualmente perante a Folha de Pagamento da COMARA (ex: SEDE, DACO-MN, DECO-BE).
                  </p>
                  <p>
                    <strong>• UO de Execução (Operacional):</strong> É o local físico onde o servidor cumpre expediente efetivo no momento (ex: Frente de Obra em Oiapoque, Laboratório em Belém).
                  </p>
                  <p>
                    <strong>• Setor / Divisão:</strong> Subdivisão funcional da UO. Quando o setor não estiver subdividido, a indicação geral da UO é assumida automaticamente sem necessidade de cadastros fictícios.
                  </p>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Consulta de Contatos & Ações do Colaborador</span>
                </h3>
                <div className={`text-xs space-y-2.5 leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  <p>
                    <strong>• Expansão dos Dados de Contato:</strong> Para visualizar o e-mail institucional e os telefones (principal e celular/WhatsApp) de qualquer colaborador, basta clicar na seta de expansão (▼) ou sobre a matrícula e nome do funcionário.
                  </p>
                  <p>
                    <strong>• Comunicação Direta:</strong> Ao expandir o card, os links de e-mail e telefone permitem envio de mensagem ou ligação com um clique, além de botão para atualização cadastral imediata.
                  </p>
                  <p>
                    <strong>• Ações Sempre Visíveis:</strong> A coluna de ações (Lançar horas, Extrato, Dispensa e Edição) permanece fixada na lateral direita da tabela, acessível sem necessidade de aplicar filtros prévios.
                  </p>
                </div>
              </div>

            </div>

            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#0F1B33] border-[#243756]' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Instruções para Emissão da Relação de Portaria
              </h3>
              <ol className={`text-xs list-decimal list-inside space-y-2 leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                <li>Acesse o menu <strong>Colaboradores</strong> na barra superior.</li>
                <li>Utilize o filtro por <strong>Canteiro / Sede</strong> ou <strong>Setor</strong> correspondente à guarita de destino.</li>
                <li>Clique no botão <strong>"Relação de Portaria"</strong> localizado no canto superior direito da tabela.</li>
                <li>Confira a listagem com Nome Completo, Matrícula, Função e Setor, e clique em <strong>Imprimir</strong> para entrega formal à guarda do quartel ou canteiro.</li>
              </ol>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* CAPÍTULO 4: REGRAS DO BANCO DE HORAS & DISPENSAS            */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'apuracao_regras' && (
          <div className="p-6 space-y-6">
            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#1A2942] border-[#2B4366]' : 'bg-blue-50/60 border-blue-100'
            }`}>
              <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Jornada Padrão, Fatores de Cálculo e Concessão de Dispensas
              </h2>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                As horas trabalhadas e as compensações seguem rigorosamente a legislação do Serviço Público Temporário da FAB e as diretrizes do Comando da COMARA.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className={`p-5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-400">Dias Úteis</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'
                  }`}>+50%</span>
                </div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Hora Extra Seg a Sex
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Horas que excedem a jornada diária padrão de 8 horas são computadas no banco de horas com acréscimo de <strong>50% (Fator 1.5)</strong>.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-400">Sábados</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-800'
                  }`}>+50%</span>
                </div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Trabalho ao Sábado
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Trabalhos extraordinários realizados aos sábados (fora de escala contínua de canteiro) recebem bonificação de <strong>50% (Fator 1.5)</strong>.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-400">Domingos e Feriados</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-800'
                  }`}>+100%</span>
                </div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Trabalho em Feriado
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Horas cumpridas aos domingos e feriados oficiais da União ou estaduais do canteiro são contabilizadas <strong>em dobro (Fator 2.0)</strong>.
                </p>
              </div>

            </div>

            {/* Dispensas em 2 vias */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#0F1B33] border-[#243756]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Procedimento de Dispensa de Expediente (SPTF) em 2 Vias
                </h3>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                A compensação de horas acumuladas deve ser previamente solicitada pelo colaborador e autorizada pelo Chefe de Canteiro ou Chefe de Divisão. Ao registrar a dispensa:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className={`p-3 rounded-xl border text-xs ${
                  isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
                }`}>
                  <p className="font-bold text-blue-400">1ª Via — Colaborador</p>
                  <p className={`mt-1 text-[11px] ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                    Permanece em posse do servidor como comprovante legal de folga autorizada e quitação de horas do saldo.
                  </p>
                </div>
                <div className={`p-3 rounded-xl border text-xs ${
                  isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
                }`}>
                  <p className="font-bold text-emerald-400">2ª Via — Chefia / RH</p>
                  <p className={`mt-1 text-[11px] ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                    Assinada pelo colaborador e arquivada na pasta funcional do canteiro para conferência no fechamento mensal.
                  </p>
                </div>
              </div>
            </div>

            {/* Tipos de Ocorrência */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
            }`}>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Classificação das Ocorrências Funcionais
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-[#243756] text-[#94A3B8]' : 'border-slate-200 text-slate-500'}`}>
                      <th className="py-2 px-3 font-semibold">Tipo de Registro</th>
                      <th className="py-2 px-3 font-semibold">Impacto no Saldo</th>
                      <th className="py-2 px-3 font-semibold">Documentação Exigida</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#243756] text-[#CBD5E1]' : 'divide-slate-100 text-slate-700'}`}>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">Trabalho Extraordinário</td>
                      <td className="py-2.5 px-3">Crédito ponderado (+50% ou +100%)</td>
                      <td className="py-2.5 px-3">Ordem de serviço / Escala da Chefia</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-blue-400">Dispensa de Expediente (SPTF)</td>
                      <td className="py-2.5 px-3">Débito exato das horas fruídas (-4h ou -8h)</td>
                      <td className="py-2.5 px-3">Guia Oficial de Dispensa assinada em 2 vias</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-indigo-400">Atestado Médico (Licença)</td>
                      <td className="py-2.5 px-3">Dia abonado (saldo inalterado)</td>
                      <td className="py-2.5 px-3">Atestado com CRM apresentado em até 48h</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-amber-400">Falta Justificada</td>
                      <td className="py-2.5 px-3">Sem débito punitivo (conforme parecer chefia)</td>
                      <td className="py-2.5 px-3">Comprovante de força maior homologado</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-rose-400">Falta Injustificada</td>
                      <td className="py-2.5 px-3">Débito de 8 horas e/ou desconto em folha</td>
                      <td className="py-2.5 px-3">Comunicação formal à Divisão de Pessoal</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* CAPÍTULO 5: FECHAMENTO MENSAL, TRAVAS & VALIDADE            */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'competencia_fechamento' && (
          <div className="p-6 space-y-6">
            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#1A2942] border-[#2B4366]' : 'bg-blue-50/60 border-blue-100'
            }`}>
              <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Ciclo de Fechamento Mensal, Cores dos Cards e Validade de 6 Meses
              </h2>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                A consolidação de cada mês civil garante que nenhum lançamento retroativo seja adulterado após a apuração da folha de pagamento e estabelece a sucessão legal dos saldos de horas.
              </p>
            </div>

            {/* SEÇÃO: CORES DOS CARDS DE FECHAMENTO */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Significado Administrativo das Cores do Card de Competência
                </h3>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                No painel principal (Dashboard), o card de status do mês orienta a equipe de RH e as chefias de canteiro sobre a situação operacional da competência selecionada:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {/* Verde */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">Card Verde • Aberto em Dia</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Indica que o mês está <strong>aberto para lançamentos</strong> regulares e que <strong>todos os meses anteriores no histórico já se encontram devidamente fechados e homologados</strong>. Operação em fluxo normal.
                  </p>
                </div>

                {/* Vermelho */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-rose-500/10 border-rose-500/30' : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="font-bold text-xs text-rose-600 dark:text-rose-400">Card Vermelho • Fechado</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Indica que a competência foi <strong>encerrada e homologada contabilmente</strong>. Os saldos foram consolidados e novos lançamentos, edições ou exclusões estão estritamente bloqueados (blindagem jurídica).
                  </p>
                </div>

                {/* Amarelo */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="font-bold text-xs text-amber-600 dark:text-amber-400">Card Amarelo • Pendência Retroativa</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Indica que o mês selecionado está aberto, mas <strong>o mês anterior ou qualquer outro mês passado ainda não foi fechado</strong> (ex: estamos em setembro e agosto ainda está aberto). Exige fechamento do mês anterior para liberar o mês atual.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-rose-400" />
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    A Regra de Sucessão Obrigatória (C-1 Fechado)
                  </h3>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Para que um canteiro possa inserir ocorrências no mês corrente (M), a competência imediatamente anterior (M-1) <strong>precisa estar obrigatoriamente fechada e homologada</strong>.
                </p>
                <div className={`p-3 rounded-xl border text-[11px] space-y-1.5 ${
                  isDark ? 'bg-[#0F1B33] border-[#243756] text-[#CBD5E1]' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <p>• <strong>Sem lacunas contábeis:</strong> Garante que o saldo transportado para o mês seguinte seja matematicamente definitivo.</p>
                  <p>• <strong>Virada de Ano:</strong> A regra se aplica igualmente entre Dezembro e Janeiro, exigindo o encerramento formal do exercício anterior.</p>
                  <p>• <strong>Blindagem Imutável:</strong> Uma vez fechada a competência, novas edições ficam bloqueadas para todos os operadores.</p>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Validade do Banco de Horas (Prazo Legal: 6 Meses)
                  </h3>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Conforme a regulamentação do regime de Banco de Horas da Aeronáutica, as horas excedentes geradas devem ser compensadas em até <strong>6 meses</strong> contados do fechamento do mês de origem.
                </p>
                <div className={`p-3 rounded-xl border text-[11px] space-y-1.5 ${
                  isDark ? 'bg-[#0F1B33] border-[#243756] text-[#CBD5E1]' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <p>• <strong>Alerta Amarelo (60 dias):</strong> O sistema avisa o gestor que faltam dois meses para o vencimento de saldo do colaborador.</p>
                  <p>• <strong>Alerta Crítico (30 dias):</strong> Prioridade máxima para agendamento de dispensas e compensação imediata.</p>
                  <p>• <strong>Prescrição:</strong> As horas não gozadas no prazo são tratadas conforme diretriz da Divisão de Pessoal da COMARA.</p>
                </div>
              </div>

            </div>

            {/* Extrato de Liquidação / Rescisão */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#0F1B33] border-[#243756]' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Relatório Oficial de Liquidação e Rescisão Contratual
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                Em caso de término de contrato, demissão, exoneração ou aposentadoria de um colaborador, o RH Central deve emitir o <strong>Extrato de Liquidação de Banco de Horas</strong> através do módulo de Fechamento. O extrato discrimina o saldo residual acumulado para fins de pagamento indenizatório na rescisão ou compensação prévia.
              </p>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* CAPÍTULO 6: INSALUBRIDADE & LAUDOS NR-15                    */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'insalubridade' && (
          <div className="p-6 space-y-6">
            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#1A2942] border-[#2B4366]' : 'bg-blue-50/60 border-blue-100'
            }`}>
              <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Controle de Adicionais de Insalubridade e Laudos Técnicos (NR-15)
              </h2>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                O pagamento de adicional de insalubridade é estritamente vinculado à exposição comprovada do servidor a agentes nocivos à saúde nas frentes de obra aeroportuárias.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className={`p-5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-400">Grau Mínimo</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'
                  }`}>10%</span>
                </div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Atividades Leves
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Exposição moderada a poeiras minerais em britagem ou áreas de apoio administrativo em canteiro, conforme laudo pericial.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400">Grau Médio</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
                  }`}>20%</span>
                </div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Operação Padrão
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Operação contínua de maquinário pesado de terraplenagem, usinagem de asfalto quente e manuseio de óleos lubrificantes.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-400">Grau Máximo</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-800'
                  }`}>40%</span>
                </div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Risco Extremo
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Contato direto e permanente com agentes químicos agressivos, combustíveis de aviação ou ruído acima dos limites de tolerância sem neutralização eficaz.
                </p>
              </div>

            </div>

            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#0F1B33] border-[#243756]' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Regras Administrativas para Inclusão em Folha
              </h3>
              <ul className={`text-xs space-y-2 leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Não é vantagem pessoal:</strong> O adicional cessa automaticamente caso o colaborador seja transferido para setor salubre ou cesse a condição nociva.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Apuração pela Efetividade:</strong> O Chefe de Canteiro homologa a frequência real do colaborador nas frentes insalubres antes do envio para a folha mensal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Laudo Pericial Atualizado:</strong> Toda concessão deve estar referenciada ao Laudo Técnico das Condições Ambientais de Trabalho (LTCAT) vigente na COMARA.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* CAPÍTULO 7: PORTAL DO COLABORADOR & USO NO CELULAR (PWA)    */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'portal_mobile' && (
          <div className="p-6 space-y-6">
            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#1A2942] border-[#2B4366]' : 'bg-blue-50/60 border-blue-100'
            }`}>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-500" />
                <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Portal de Autoatendimento do Colaborador & Aplicativo no Celular
                </h2>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                O Portal do Colaborador permite a cada trabalhador da COMARA acompanhar seu saldo de horas, visualizar suas compensações e consultar seus contracheques diretamente no celular ou computador.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Passo a Passo Android */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Instalação no Android (Google Chrome)
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                  }`}>ANDROID</span>
                </div>
                <ol className={`text-xs list-decimal list-inside space-y-2 leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  <li>Abra o navegador <strong>Google Chrome</strong> no celular e acesse o endereço do Portal COMARA.</li>
                  <li>Se aparecer o banner <strong>"Instalar App COMARA"</strong> no topo da tela, toque em <strong>Instalar</strong>.</li>
                  <li>Caso o banner não apareça de imediato, toque no menu de <strong>3 pontinhos (⋮)</strong> no canto superior direito do Chrome.</li>
                  <li>Toque na opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                  <li>Confirme em <strong>Instalar</strong>. Um ícone oficial da COMARA será criado na tela inicial do seu celular.</li>
                </ol>
              </div>

              {/* Passo a Passo iOS */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Instalação no iPhone / iPad (Safari)
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-800'
                  }`}>APPLE IOS</span>
                </div>
                <ol className={`text-xs list-decimal list-inside space-y-2 leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  <li>Abra o navegador <strong>Safari</strong> no iPhone e acesse o Portal COMARA.</li>
                  <li>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com uma seta apontando para cima ⎋ na barra inferior do Safari).</li>
                  <li>Role a lista de opções para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> (ícone com sinal de +).</li>
                  <li>No canto superior direito da tela, toque em <strong>Adicionar</strong>.</li>
                  <li>Pronto! O aplicativo passará a abrir em tela cheia sem a barra de endereço do navegador.</li>
                </ol>
              </div>

            </div>

            {/* Acesso e Senha */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#0F1B33] border-[#243756]' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Instruções de Acesso e Alteração de Senha do Colaborador
              </h3>
              <div className={`text-xs space-y-2 leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                <p>
                  <strong>• Primeiro Acesso:</strong> O colaborador acessa informando sua <strong>Matrícula funcional</strong> e os dígitos do <strong>CPF</strong> cadastrados no RH. Em seguida, define uma senha pessoal segura.
                </p>
                <p>
                  <strong>• Alteração de Senha:</strong> A qualquer momento, após entrar no portal, o colaborador pode clicar em <strong>"Alterar Senha"</strong> para cadastrar um novo código de acesso.
                </p>
                <p>
                  <strong>• Extrato de Horas:</strong> O colaborador visualiza seu saldo em horas e dias (dividido por 8h), as datas das ocorrências e o canteiro em que foram prestadas.
                </p>
                <p>
                  <strong>• Contracheques Digitais:</strong> Consulta e download direto dos recibos de pagamento disponibilizados mensalmente pela Divisão de Pessoal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* CAPÍTULO 8: AUDITORIA, PRAZOS & LGPD                        */}
        {/* ----------------------------------------------------------- */}
        {activeTab === 'auditoria_lgpd' && (
          <div className="p-6 space-y-6">
            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#1A2942] border-[#2B4366]' : 'bg-blue-50/60 border-blue-100'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rastreabilidade, Trilha de Auditoria e Proteção de Dados (LGPD)
                </h2>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                O sistema adota padrões rigorosos de segurança e auditoria permanente em consonância com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Trilha de Auditoria Imutável
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Todas as operações críticas realizadas no sistema são gravadas em registro cronológico permanente e inviolável, incluindo:
                </p>
                <ul className={`text-[11px] space-y-1.5 list-disc list-inside ${isDark ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                  <li>Criação, edição ou cancelamento de qualquer lançamento de horas</li>
                  <li>Fechamento e reabertura de competências por canteiro</li>
                  <li>Emissão de guias de dispensa e relação de portaria</li>
                  <li>Alteração de senhas e tentativas de autenticação</li>
                  <li>Importação de folha com registro do usuário operador e horário</li>
                </ul>
              </div>

              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200'
              }`}>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Privacidade e Minimização de Dados (LGPD)
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  Em observância às diretrizes de privacidade da Administração Pública:
                </p>
                <ul className={`text-[11px] space-y-1.5 list-disc list-inside ${isDark ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                  <li>Colaboradores só visualizam seus próprios registros funcionais</li>
                  <li>Apontadores de canteiro têm acesso restrito aos funcionários da sua frente</li>
                  <li>Dados sensíveis de saúde em atestados são restritos à equipe de RH</li>
                  <li>Sessões são encerradas automaticamente por inatividade após 15 minutos</li>
                </ul>
              </div>

            </div>

            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#0F1B33] border-[#243756]' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Resumo dos Prazos Administrativos Mandatórios
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-[#243756] text-[#94A3B8]' : 'border-slate-200 text-slate-500'}`}>
                      <th className="py-2 px-3 font-semibold">Procedimento</th>
                      <th className="py-2 px-3 font-semibold">Prazo Limite</th>
                      <th className="py-2 px-3 font-semibold">Alçada Responsável</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#243756] text-[#CBD5E1]' : 'divide-slate-100 text-slate-700'}`}>
                    <tr>
                      <td className="py-2.5 px-3 font-bold">Apresentação de Atestado Médico</td>
                      <td className="py-2.5 px-3">Até 48 horas úteis após o início do afastamento</td>
                      <td className="py-2.5 px-3">Colaborador / Chefia Imediata</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold">Fechamento do Canteiro (M-1)</td>
                      <td className="py-2.5 px-3">Até o 3º dia útil do mês seguinte</td>
                      <td className="py-2.5 px-3">Chefe de Canteiro / Chefe DA</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold">Consolidação Geral da Folha</td>
                      <td className="py-2.5 px-3">Até o 5º dia útil do mês</td>
                      <td className="py-2.5 px-3">RH Admin / Divisão de Pessoal</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold">Compensação de Horas Acumuladas</td>
                      <td className="py-2.5 px-3">Máximo de 6 meses (Alertas aos 60 e 30 dias)</td>
                      <td className="py-2.5 px-3">Chefia Imediata / Colaborador</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
