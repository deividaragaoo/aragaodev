"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Loader2, Smartphone } from "lucide-react";

/** iPhone 14 Pro Max viewport (CSS logical pixels) */
const DEVICE_WIDTH = 430;
const DEVICE_HEIGHT = 932;

interface MobileSitePreviewProps {
  url: string;
  title: string;
  open: boolean;
  onClose: () => void;
}

export function MobileSitePreview({ url, title, open, onClose }: MobileSitePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (open) setLoading(true);
  }, [open, url]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[140]"
          />

          {isMobile ? (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[141] flex flex-col bg-background"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Smartphone className="w-4 h-4 text-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{title}</p>
                    <p className="text-[10px] font-mono text-subtle truncate">{url}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] active:scale-95 transition-all"
                  aria-label="Fechar preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative flex-1 min-h-0 bg-white">
                {loading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
                    <Loader2 className="w-6 h-6 animate-spin text-muted" />
                    <p className="text-xs text-muted font-light">Carregando site...</p>
                  </div>
                )}
                <iframe
                  key={url}
                  src={url}
                  title={`Preview mobile — ${title}`}
                  className="absolute inset-0 w-full h-full border-0 bg-white"
                  onLoad={() => setLoading(false)}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div
                className="flex items-center justify-between gap-3 px-4 py-3 border-t border-white/[0.06] shrink-0"
                style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 min-h-[44px] rounded-full text-sm font-medium bg-foreground text-background active:scale-[0.98] transition-transform"
                >
                  Voltar
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-1.5 px-4 text-xs text-muted hover:text-foreground transition-colors"
                >
                  Nova aba
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[141] flex flex-col items-center justify-center px-4 py-6 pointer-events-none overflow-y-auto"
            >
              <div className="pointer-events-auto flex flex-col items-center w-full max-w-[460px]">
                <div className="flex items-center justify-between w-full mb-4 px-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Smartphone className="w-4 h-4 text-muted shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{title}</p>
                      <p className="text-[10px] font-mono text-subtle truncate">{url}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-background/80 hover:border-white/20 transition-colors shrink-0 ml-3"
                    aria-label="Fechar preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative w-full flex justify-center">
                  <div className="absolute -inset-4 rounded-[4rem] bg-gradient-to-b from-white/[0.08] to-transparent opacity-60 blur-md pointer-events-none" />

                  <div
                    className="relative rounded-[3.25rem] border-[3px] border-[#48484a] bg-[#1c1c1e] p-[11px] shadow-[0_40px_100px_rgba(0,0,0,0.65),inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                    style={{
                      height: "min(88vh, 932px)",
                      width: "min(430px, calc(min(88vh, 932px) * 430 / 932))",
                    }}
                  >
                    <div className="absolute -left-[5px] top-[22%] w-[3px] h-8 rounded-l-sm bg-[#3a3a3c]" />
                    <div className="absolute -left-[5px] top-[32%] w-[3px] h-14 rounded-l-sm bg-[#3a3a3c]" />
                    <div className="absolute -left-[5px] top-[44%] w-[3px] h-14 rounded-l-sm bg-[#3a3a3c]" />
                    <div className="absolute -right-[5px] top-[30%] w-[3px] h-20 rounded-r-sm bg-[#3a3a3c]" />

                    <div className="relative w-full h-full rounded-[2.65rem] overflow-hidden bg-black">
                      {loading && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background">
                          <Loader2 className="w-6 h-6 animate-spin text-muted" />
                          <p className="text-xs text-muted font-light">Carregando site...</p>
                        </div>
                      )}

                      <iframe
                        key={url}
                        src={url}
                        title={`Preview mobile — ${title}`}
                        className="w-full h-full border-0 bg-white"
                        onLoad={() => setLoading(false)}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                        referrerPolicy="no-referrer-when-downgrade"
                      />

                      <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 z-30 w-[36%] h-[5px] rounded-full bg-white/35 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[10px] font-mono text-subtle tracking-wider uppercase">
                  Preview · iPhone 14 Pro Max ({DEVICE_WIDTH}×{DEVICE_HEIGHT})
                </p>

                <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-full text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors min-h-[44px]"
                  >
                    Voltar ao portfólio
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors min-h-[44px]"
                  >
                    Abrir em nova aba
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
