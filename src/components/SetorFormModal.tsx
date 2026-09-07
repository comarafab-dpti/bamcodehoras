import React, { useState, useEffect } from 'react';
import { UnidadeOrganizacional } from '../types';
import { gerarSugestaoCodigoSetor } from '../services/setorService';
import { X, Layers, AlertCircle, CheckCircle2, Building, Tag, Info } from 'lucide-react';
import { Button } from './ui/Button';

interface SetorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (setor: UnidadeOrganizacional, codigoOriginal?: string) => Promise<void>;
  editingSetor: UnidadeOrganizacional | null;
  uosPrincipais: UnidadeOrganizacional[];
  setoresExistentes: UnidadeOrganizacional[];
  theme?: 'dark' | 'light';
}

export const SetorFormModal: React.FC<SetorFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSetor,
  uosPrincipais,
  setoresExistentes,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  const [nome, setNome] = useState('');
  const [siglaExibicao, setSiglaExibicao] = useState('');
  const [codigo, setCodigo] = useState('');
  const [pai, setPai] = useState('SEDE_BE');
  const [sedeOuCanteiroPadrao, setSedeOuCanteiroPadrao] = useState('BE');
  const [descricao, setDescricao] = useState('');
  const [ativa, setAtiva] = useState(true);

  const [isCodigoManual, setIsCodigoManual] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicializa o formulário com dados do setor em edição ou valores padrão
  useEffect(() => {
    if (editingSetor) {
      setNome(editingSetor.nome || '');
      setSiglaExibicao(editingSetor.siglaExibicao || '');
      setCodigo(editingSetor.codigo || '');
      setPai(editingSetor.pai || 'SEDE_BE');
      setSedeOuCanteiroPadrao(editingSetor.sedeOuCanteiroPadrao || 'BE');
      setDescricao(editingSetor.descricao || '');
      setAtiva(typeof editingSetor.ativa === 'boolean' ? editingSetor.ativa : true);
      setIsCodigoManual(true);
    } else {
      setNome('');
      setSiglaExibicao('');
      setCodigo('');
      setPai(uosPrincipais[0]?.codigo || 'SEDE_BE');
      setSedeOuCanteiroPadrao(uosPrincipais[0]?.sedeOuCanteiroPadrao || 'BE');
      setDescricao('');
      setAtiva(true);
      setIsCodigoManual(false);
    }
    setErrorMessage(null);
  }, [editingSetor, isOpen, uosPrincipais]);

  if (!isOpen) return null;

  // Atualiza sede padrão automaticamente quando o usuário altera a UO pai
  const handlePaiChange = (novoPai: string) => {
    setPai(novoPai);
    const uoPai = uosPrincipais.find((u) => u.codigo === novoPai);
    if (uoPai?.sedeOuCanteiroPadrao) {
      setSedeOuCanteiroPadrao(uoPai.sedeOuCanteiroPadrao);
    }
  };

  // Sugestão automática de código quando nome ou sigla mudam (apenas em criação sem código manual)
  const handleSiglaChange = (val: string) => {
    const uppercase = val.toUpperCase();
    setSiglaExibicao(uppercase);
    if (!isCodigoManual && !editingSetor) {
      setCodigo(gerarSugestaoCodigoSetor(uppercase, nome));
    }
  };

  const handleNomeChange = (val: string) => {
    setNome(val);
    if (!isCodigoManual && !editingSetor && !siglaExibicao) {
      setCodigo(gerarSugestaoCodigoSetor('', val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nomeTrim = nome.trim();
    const siglaTrim = siglaExibicao.trim().toUpperCase();
    const codigoTrim = (codigo.trim() || gerarSugestaoCodigoSetor(siglaTrim, nomeTrim)).toUpperCase();

    if (!nomeTrim) {
      setErrorMessage('Por favor, informe o nome do setor.');
      return;
    }

    if (!siglaTrim) {
      setErrorMessage('Por favor, informe a sigla de exibição do setor.');
      return;
    }

    if (!codigoTrim) {
      setErrorMessage('Por favor, informe um código único para o setor.');
      return;
    }

    // Verificar colisão de código com outros setores
    const conflito = setoresExistentes.find(
      (s) => s.codigo === codigoTrim && (!editingSetor || editingSetor.codigo !== codigoTrim)
    );
    if (conflito) {
      setErrorMessage(`O código "${codigoTrim}" já está em uso pelo setor "${conflito.nome}". Escolha outro código.`);
      return;
    }

    const setorAtualizado: UnidadeOrganizacional = {
      codigo: codigoTrim,
      nome: nomeTrim,
      siglaExibicao: siglaTrim,
      tipo: 'SETOR',
      pai,
      sedeOuCanteiroPadrao,
      ativa,
      descricao: descricao.trim()
    };

    setIsSubmitting(true);
    try {
      await onSave(setorAtualizado, editingSetor?.codigo);
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar setor:', err);
      setErrorMessage(err?.message || 'Falha ao salvar o setor. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200 my-8 ${
          isDark ? 'bg-[#16243D] border-[#243756] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Cabeçalho do Modal */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#243756] bg-[#0E1A2E]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {editingSetor ? 'Editar Setor / Divisão' : 'Cadastrar Novo Setor'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {editingSetor 
                  ? `Renomeie, edite ou altere o vínculo de ${editingSetor.siglaExibicao}` 
                  : 'Vincule uma nova seção ou divisão à Unidade Organizacional correspondente'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isDark 
                ? 'border-[#243756] hover:bg-[#243756] text-slate-400 hover:text-white' 
                : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Nome do Setor */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Nome do Setor / Divisão <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => handleNomeChange(e.target.value)}
                placeholder="Ex: Seção de Aquisições, Divisão de Logística"
                className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isDark ? 'bg-[#0E1A2E] border-[#243756] text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                required
              />
            </div>

            {/* Sigla de Exibição */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Sigla <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={siglaExibicao}
                onChange={(e) => handleSiglaChange(e.target.value)}
                placeholder="Ex: SAQ, PMAC"
                maxLength={15}
                className={`w-full px-3.5 py-2 rounded-xl text-sm font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors uppercase ${
                  isDark ? 'bg-[#0E1A2E] border-[#243756] text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unidade Organizacional Pai (Vínculo) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Vincular à Unidade (Pai) <span className="text-red-400">*</span></span>
              </label>
              <select
                value={pai}
                onChange={(e) => handlePaiChange(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isDark ? 'bg-[#0E1A2E] border-[#243756] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {uosPrincipais.map((uo) => (
                  <option key={uo.codigo} value={uo.codigo}>
                    {uo.siglaExibicao} • {uo.nome}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 block">
                Define a qual quartel ou destacamento este setor pertence hierarquicamente.
              </span>
            </div>

            {/* Sede Territorial Padrão */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Sede Territorial Padrão
              </label>
              <input
                type="text"
                value={sedeOuCanteiroPadrao}
                onChange={(e) => setSedeOuCanteiroPadrao(e.target.value.toUpperCase())}
                placeholder="Ex: BE, MN, KO, FB"
                maxLength={6}
                className={`w-full px-3.5 py-2 rounded-xl text-sm font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors uppercase ${
                  isDark ? 'bg-[#0E1A2E] border-[#243756] text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <span className="text-[11px] text-slate-500 block">
                Bigrama territorial onde este setor opera fisicamente (ex: BE, MN, KO).
              </span>
            </div>
          </div>

          {/* Código de Identificação Técnico */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Código Único de Identificação (Técnico) <span className="text-red-400">*</span>
              </label>
              {!isCodigoManual && !editingSetor && (
                <button
                  type="button"
                  onClick={() => setIsCodigoManual(true)}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Personalizar código
                </button>
              )}
            </div>
            <input
              type="text"
              value={codigo}
              onChange={(e) => {
                setIsCodigoManual(true);
                setCodigo(e.target.value.toUpperCase());
              }}
              placeholder="Ex: SETOR_SAQ"
              className={`w-full px-3.5 py-2 rounded-xl text-sm font-mono border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors uppercase ${
                isDark ? 'bg-[#0E1A2E] border-[#243756] text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
              required
            />
            <span className="text-[11px] text-slate-500 block">
              Usado para cruzamento com lotações nos relatórios e importações de dados.
            </span>
          </div>

          {/* Descrição / Atribuições */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Descrição / Atribuições (Opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              placeholder="Ex: Responsável pelas aquisições, almoxarifado, contratos e suprimentos da Sede Belém."
              className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDark ? 'bg-[#0E1A2E] border-[#243756] text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Status Ativo / Inativo */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isDark ? 'bg-[#0E1A2E] border-[#243756]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <div className="font-semibold text-sm">Status do Setor</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {ativa ? 'Setor ativo e disponível para vinculação de colaboradores' : 'Setor inativo (mantém histórico contábil)'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAtiva(!ativa)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                ativa
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
              }`}
            >
              {ativa ? 'ATIVO' : 'INATIVO'}
            </button>
          </div>

          {/* Rodapé e Botões */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {editingSetor ? 'Salvar Alterações' : 'Cadastrar Setor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
