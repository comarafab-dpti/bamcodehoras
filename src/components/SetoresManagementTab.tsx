import React, { useState, useMemo, useEffect } from 'react';
import { UnidadeOrganizacional, Employee } from '../types';
import { setorService } from '../services/setorService';
import { SetorFormModal } from './SetorFormModal';
import { InfoTooltip } from './InfoTooltip';
import { Button } from './ui/Button';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Building, 
  Users, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface SetoresManagementTabProps {
  employees?: Employee[];
  theme?: 'dark' | 'light';
}

export const SetoresManagementTab: React.FC<SetoresManagementTabProps> = ({
  employees = [],
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  // Estados de dados
  const [setores, setSetores] = useState<UnidadeOrganizacional[]>([]);
  const [todasUOs, setTodasUOs] = useState<UnidadeOrganizacional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUoPai, setSelectedUoPai] = useState<string>('TODAS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');

  // Modais e edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetor, setEditingSetor] = useState<UnidadeOrganizacional | null>(null);
  const [sectorToDelete, setSectorToDelete] = useState<UnidadeOrganizacional | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carrega e assina atualizações em tempo real
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = setorService.subscribeSetores(
      (novosSetores, uos) => {
        setSetores(novosSetores);
        setTodasUOs(uos);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Erro na assinatura de setores:', err);
        const { setores: st, todasUOs: tu } = setorService.getSetoresAtuais();
        setSetores(st);
        setTodasUOs(tu);
        setIsLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Lista de UOs principais (pais elegíveis para setores)
  const uosPrincipais = useMemo(() => {
    return todasUOs.filter((u) => u.tipo !== 'SETOR' && u.codigo !== 'NAO_CLASSIFICADO');
  }, [todasUOs]);

  // Mapa rápido de nome da UO Pai
  const uosMap = useMemo(() => {
    const map = new Map<string, UnidadeOrganizacional>();
    todasUOs.forEach((u) => map.set(u.codigo, u));
    return map;
  }, [todasUOs]);

  // Contagem de colaboradores alocados por setor
  const employeeCountBySetor = useMemo(() => {
    return setorService.contarColaboradoresPorSetor(employees);
  }, [employees]);

  // Filtros combinados
  const filteredSetores = useMemo(() => {
    return setores.filter((setor) => {
      // 1. Filtro por UO Pai
      if (selectedUoPai !== 'TODAS' && setor.pai !== selectedUoPai) {
        return false;
      }

      // 2. Filtro por Status
      if (selectedStatus === 'ATIVO' && !setor.ativa) return false;
      if (selectedStatus === 'INATIVO' && setor.ativa) return false;

      // 3. Busca textual
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const matchNome = (setor.nome || '').toLowerCase().includes(q);
      const matchSigla = (setor.siglaExibicao || '').toLowerCase().includes(q);
      const matchCodigo = (setor.codigo || '').toLowerCase().includes(q);
      const matchDesc = (setor.descricao || '').toLowerCase().includes(q);
      const uoPaiNome = (uosMap.get(setor.pai || '')?.nome || '').toLowerCase();
      const matchPai = uoPaiNome.includes(q);

      return matchNome || matchSigla || matchCodigo || matchDesc || matchPai;
    });
  }, [setores, selectedUoPai, selectedStatus, searchQuery, uosMap]);

  // Contadores
  const totalSetores = setores.length;
  const setoresAtivos = setores.filter((s) => s.ativa).length;
  const setoresInativos = setores.filter((s) => !s.ativa).length;
  const uosComSetor = useMemo(() => {
    const setUos = new Set<string>();
    setores.forEach((s) => {
      if (s.pai) setUos.add(s.pai);
    });
    return setUos.size;
  }, [setores]);

  // Handlers de Ações
  const handleOpenCreate = () => {
    setEditingSetor(null);
    setFeedbackMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (setor: UnidadeOrganizacional) => {
    setEditingSetor(setor);
    setFeedbackMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveSetor = async (setorAtualizado: UnidadeOrganizacional, codigoOriginal?: string) => {
    try {
      await setorService.salvarSetor(setorAtualizado, codigoOriginal);
      setFeedbackMsg({
        type: 'success',
        text: `Setor "${setorAtualizado.siglaExibicao}" salvo com sucesso.`
      });
      // Atualiza estado local
      const { setores: novos } = setorService.getSetoresAtuais();
      setSetores(novos);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      console.error('Erro ao salvar setor:', err);
      setFeedbackMsg({
        type: 'error',
        text: err?.message || 'Erro ao salvar o setor.'
      });
      throw err;
    }
  };

  const handleToggleStatus = async (setor: UnidadeOrganizacional) => {
    try {
      const novoStatus = !setor.ativa;
      await setorService.alternarStatusSetor(setor.codigo, novoStatus);
      setFeedbackMsg({
        type: 'success',
        text: `Setor "${setor.siglaExibicao}" alterado para ${novoStatus ? 'ATIVO' : 'INATIVO'}.`
      });
      const { setores: novos } = setorService.getSetoresAtuais();
      setSetores(novos);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Erro ao alternar status:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!sectorToDelete) return;
    setIsDeleting(true);
    try {
      await setorService.excluirSetor(sectorToDelete.codigo);
      setFeedbackMsg({
        type: 'success',
        text: `Setor "${sectorToDelete.siglaExibicao}" removido com sucesso.`
      });
      const { setores: novos } = setorService.getSetoresAtuais();
      setSetores(novos);
      setSectorToDelete(null);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      console.error('Erro ao excluir setor:', err);
      setFeedbackMsg({
        type: 'error',
        text: 'Não foi possível excluir o setor.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Exportar dados em CSV
  const handleExportCSV = () => {
    if (filteredSetores.length === 0) {
      alert('Não há setores filtrados para exportar.');
      return;
    }

    const headers = [
      'Código do Setor',
      'Sigla',
      'Nome do Setor',
      'Código UO Pai',
      'Nome UO Pai',
      'Sede Padrão',
      'Status',
      'Colaboradores Alocados',
      'Descrição'
    ];

    const rows = filteredSetores.map((s) => {
      const uoPai = uosMap.get(s.pai || '');
      const count = employeeCountBySetor[s.codigo] || employeeCountBySetor[s.siglaExibicao] || 0;
      return [
        `"${s.codigo}"`,
        `"${s.siglaExibicao}"`,
        `"${(s.nome || '').replace(/"/g, '""')}"`,
        `"${s.pai || ''}"`,
        `"${(uoPai?.nome || s.pai || '').replace(/"/g, '""')}"`,
        `"${s.sedeOuCanteiroPadrao || ''}"`,
        `"${s.ativa ? 'Ativo' : 'Inativo'}"`,
        `"${count}"`,
        `"${(s.descricao || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `setores_comara_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Banner de Feedback */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-xl border text-sm flex items-center justify-between transition-all animate-fadeIn ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMsg(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Cartões de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Setores</div>
          <div className="text-2xl font-black mt-1 flex items-baseline gap-2">
            <span>{totalSetores}</span>
            <span className="text-xs font-normal text-slate-400">cadastrados</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Setores Ativos</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 flex items-baseline gap-2">
            <span>{setoresAtivos}</span>
            <span className="text-xs font-normal text-slate-400">em operação</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Setores Inativos</div>
          <div className="text-2xl font-black text-slate-400 mt-1 flex items-baseline gap-2">
            <span>{setoresInativos}</span>
            <span className="text-xs font-normal text-slate-400">arquivados</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">UOs com Setores</div>
          <div className="text-2xl font-black text-blue-400 mt-1 flex items-baseline gap-2">
            <span>{uosComSetor}</span>
            <span className="text-xs font-normal text-slate-400">unidades pai</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Ações */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
        isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Busca textual */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, sigla, código ou descrição..."
              className={`w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDark ? 'bg-[#0E1A2E] border-[#243756] text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Filtro UO Pai */}
          <div className="sm:w-56">
            <select
              value={selectedUoPai}
              onChange={(e) => setSelectedUoPai(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDark ? 'bg-[#0E1A2E] border-[#243756] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="TODAS">Todas as Unidades (Pai)</option>
              {uosPrincipais.map((uo) => (
                <option key={uo.codigo} value={uo.codigo}>
                  {uo.siglaExibicao} • {uo.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Status */}
          <div className="sm:w-36">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDark ? 'bg-[#0E1A2E] border-[#243756] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">Apenas Ativos</option>
              <option value="INATIVO">Apenas Inativos</option>
            </select>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Exportar CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Novo Setor
          </Button>
        </div>
      </div>

      {/* Tabela de Setores */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-[#16243D] border-[#243756]' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">Carregando catálogo de setores e divisões...</p>
          </div>
        ) : filteredSetores.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-500/10 text-slate-400 border border-slate-500/20 w-fit mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-base">Nenhum setor encontrado</h4>
            <p className={`text-xs sm:text-sm max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {searchQuery || selectedUoPai !== 'TODAS' || selectedStatus !== 'TODOS'
                ? 'Nenhum setor corresponde aos filtros aplicados. Tente ajustar a busca ou os filtros de unidade.'
                : 'Não há setores cadastrados. Cadastre o primeiro setor para organizar seções e divisões da COMARA.'}
            </p>
            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={handleOpenCreate} icon={<Plus className="w-3.5 h-3.5" />}>
                Cadastrar Primeiro Setor
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'border-[#243756] bg-[#0E1A2E]/60 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'
                }`}>
                  <th className="py-3 px-4">Setor / Sigla</th>
                  <th className="py-3 px-4">Nome do Setor</th>
                  <th className="py-3 px-4">Vínculo (Unidade Pai)</th>
                  <th className="py-3 px-4">Sede Padrão</th>
                  <th className="py-3 px-4">Colaboradores</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#243756]' : 'divide-slate-100'}`}>
                {filteredSetores.map((setor) => {
                  const uoPai = uosMap.get(setor.pai || '');
                  const empCount = employeeCountBySetor[setor.codigo] || employeeCountBySetor[setor.siglaExibicao] || 0;

                  return (
                    <tr 
                      key={setor.codigo}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-[#1B2D4A]/50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Sigla e Código Técnico */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            {setor.siglaExibicao}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 hidden lg:inline">
                            {setor.codigo}
                          </span>
                        </div>
                      </td>

                      {/* Nome e Descrição */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900">
                          {setor.nome}
                        </div>
                        {setor.descricao && (
                          <div className={`text-[11px] line-clamp-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {setor.descricao}
                          </div>
                        )}
                      </td>

                      {/* Vínculo UO Pai */}
                      <td className="py-3.5 px-4 align-middle">
                        {uoPai ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              {uoPai.siglaExibicao}
                            </span>
                            <span className={`text-xs truncate max-w-[180px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {uoPai.nome}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">
                            {setor.pai || '—'}
                          </span>
                        )}
                      </td>

                      {/* Sede Territorial Padrão */}
                      <td className="py-3.5 px-4 align-middle">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30">
                          {setor.sedeOuCanteiroPadrao || 'BE'}
                        </span>
                      </td>

                      {/* Colaboradores Alocados */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{empCount} {empCount === 1 ? 'colaborador' : 'colaboradores'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-middle">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(setor)}
                          title="Clique para alternar o status do setor"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            setor.ativa
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-slate-500/15 text-slate-400 border-slate-500/30 hover:bg-slate-500/25'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${setor.ativa ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                          {setor.ativa ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(setor)}
                            title="Editar ou renomear setor"
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isDark 
                                ? 'border-[#243756] hover:bg-[#243756] text-blue-400 hover:text-white' 
                                : 'border-slate-200 hover:bg-slate-100 text-blue-600 hover:text-blue-800'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSectorToDelete(setor)}
                            title="Excluir setor"
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isDark 
                                ? 'border-[#243756] hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                                : 'border-slate-200 hover:bg-red-50 text-red-600 hover:text-red-700'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Formulário (Criar / Editar / Renomear / Vincular) */}
      <SetorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSetor}
        editingSetor={editingSetor}
        uosPrincipais={uosPrincipais}
        setoresExistentes={setores}
        theme={theme}
      />

      {/* Modal de Confirmação de Exclusão */}
      {sectorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
            isDark ? 'bg-[#16243D] border-[#243756] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base">Excluir Setor / Divisão?</h4>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Esta ação removerá o setor do catálogo de unidades organizacionais.
                </p>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              isDark ? 'bg-[#0E1A2E] border-[#243756]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="font-bold text-sm text-red-400">{sectorToDelete.siglaExibicao} • {sectorToDelete.nome}</div>
              <div className="text-slate-400 font-mono text-[11px]">{sectorToDelete.codigo}</div>
              {(() => {
                const count = employeeCountBySetor[sectorToDelete.codigo] || employeeCountBySetor[sectorToDelete.siglaExibicao] || 0;
                if (count > 0) {
                  return (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-2 font-medium">
                      ⚠️ Atenção: Há aproximadamente {count} colaborador(es) associados a este setor. Ao excluir, eles passarão a ser exibidos diretamente na unidade pai sem divisão secundária.
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSectorToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                isLoading={isDeleting}
              >
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
