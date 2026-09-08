import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, ArrowUpRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobilePWAInstallBannerProps {
  theme?: 'dark' | 'light';
}

export const MobilePWAInstallBanner: React.FC<MobilePWAInstallBannerProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const { isInstallable, isInstalled, isStandalone, isIOS, isAndroid, isMobile, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(true);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showAndroidHelpModal, setShowAndroidHelpModal] = useState(false);

  useEffect(() => {
    // Verificar se já foi dispensado nesta sessão
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem('comara_pwa_mobile_banner_dismissed');
      if (!dismissed && isMobile && !isStandalone && !isInstalled) {
        // Pequeno atraso para não sobrecarregar a primeira pintura
        const timer = setTimeout(() => setIsDismissed(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isMobile, isStandalone, isInstalled]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('comara_pwa_mobile_banner_dismissed', 'true');
    }
  };

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setIsDismissed(true);
      }
    } else {
      // Se o prompt nativo ainda não disparou ou está em navegador alternativo
      setShowAndroidHelpModal(true);
    }
  };

  if (isDismissed || isStandalone || isInstalled || !isMobile) {
    return null;
  }

  return (
    <>
      {/* Banner Flutuante Inferior para Celular */}
      <div 
        id="banner-pwa-mobile-install"
        role="region"
        aria-label="Instalação do Aplicativo COMARA no Celular"
        className="fixed bottom-3 inset-x-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      >
        <div className={`p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 ${
          isDark 
            ? 'bg-[#16243D]/95 border-[#2B4366] text-white shadow-black/60' 
            : 'bg-white/95 border-blue-200 text-slate-900 shadow-blue-900/15'
        }`}>
          {/* Ícone e Textos */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-600/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold truncate flex items-center gap-1.5">
                <span>Instalar App COMARA</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/20">
                  Mobile
                </span>
              </h4>
              <p className={`text-[11px] truncate leading-tight mt-0.5 ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                Acesso rápido na tela inicial do celular
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-pwa-mobile-install-action"
              onClick={handleInstall}
              type="button"
              className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
            <button
              id="btn-pwa-mobile-install-dismiss"
              onClick={handleDismiss}
              type="button"
              title="Dispensar aviso"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark 
                  ? 'border-[#243756] text-[#94A3B8] hover:text-white hover:bg-[#1E3252]' 
                  : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Guia iOS (Safari) */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowIOSModal(false)}
        >
          <div 
            className={`w-full max-w-md rounded-2xl border p-5 space-y-4 shadow-2xl ${
              isDark ? 'bg-[#16243D] border-[#243756] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Instalar no iPhone / iPad</h3>
              </div>
              <button 
                onClick={() => setShowIOSModal(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Share className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-blue-400">1. Toque em Compartilhar</strong>
                  No Safari, toque no botão Compartilhar (ícone de quadrado com seta) na barra inferior.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <PlusSquare className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-blue-400">2. Adicionar à Tela de Início</strong>
                  Role a lista para baixo e selecione a opção "Adicionar à Tela de Início".
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <ArrowUpRight className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-blue-400">3. Confirmar</strong>
                  Toque em "Adicionar" no canto superior direito. O ícone da COMARA aparecerá no seu celular.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal Guia Android / Outros navegadores */}
      {showAndroidHelpModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAndroidHelpModal(false)}
        >
          <div 
            className={`w-full max-w-md rounded-2xl border p-5 space-y-4 shadow-2xl ${
              isDark ? 'bg-[#16243D] border-[#243756] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Instalar no Android (Chrome)</h3>
              </div>
              <button 
                onClick={() => setShowAndroidHelpModal(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs leading-relaxed">
              <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                Para adicionar o Sistema COMARA à tela inicial do seu celular:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                <li>Toque no menu de <strong>3 pontinhos (⋮)</strong> no canto superior do Chrome.</li>
                <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                <li>Toque em <strong>Instalar</strong> para confirmar.</li>
              </ol>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Após instalado, o app abrirá em tela cheia com alta velocidade e sem barra de navegação do navegador.
              </p>
            </div>

            <button
              onClick={() => setShowAndroidHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
