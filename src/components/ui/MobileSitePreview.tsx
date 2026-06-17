"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Loader2, Smartphone } from "lucide-react";

/** iPhone 14 Pro Max viewport (CSS logical pixels) */
const DEVICE_WIDTH = 430;
const DEVICE_HEIGHT = 932;
const LOAD_TIMEOUT_MS = 8000;

interface MobileSitePreviewProps {
  url: string;
  title: string;
  open: boolean;
  onClose: () => void;
}

interface PreviewFrameProps {
  url: string;
  title: string;
  className?: string;
}

function PreviewFrame({ url, title, className }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFailed(false);

    const iframe = iframeRef.current;
    if (!iframe) return;

    let loaded = false;

    const finishLoading = () => {
      if (loaded) return;
      loaded = true;
      setLoading(false);
    };

    iframe.addEventListener("load", finishLoading);

    const timeout = window.setTimeout(() => {
      if (!loaded) {
        setLoading(false);
        setFailed(true);
      }
    }, LOAD_TIMEOUT_MS);

    return () => {
      iframe.removeEventListener("load", finishLoading);
      window.clearTimeout(timeout);
    };
  }, [url]);

  return (
    <div className={className}>
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
          <Loader2 className="w-6 h-6 animate-spin text-muted" />
          <p className="text-xs text-muted font-light">Carregando site...</p>
        </div>
      )}

      {!loading && failed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background px-6 text-center">
          <p className="text-sm text-muted font-light">
            Não foi possível exibir o preview aqui.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-foreground hover:text-foreground/80 transition-colors"
          >
            Abrir site em nova aba
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={url}
        title={`Preview mobile — ${title}`}
        className="absolute inset-0 w-full h-full border-0 bg-white"
        referrerPolicy="no-referrer-when-downgrade"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}

export function MobileSitePreview({ url, title, open, onClose }: MobileSitePreviewProps) {
  const [session, setSession] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (open) setSession((current) => current + 1);
  }, [open, url]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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

              <PreviewFrame
                key={`${url}-${session}`}
                url={url}
                title={title}
                className="relative flex-1 min-h-0 bg-white"
              />

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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[141] flex flex-col pointer-events-none"
              style={{
                paddingTop: "max(1rem, env(safe-area-inset-top, 1rem))",
                paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
              }}
            >
              <div className="pointer-events-auto flex flex-col h-full w-full max-w-[460px] mx-auto px-4 min-h-0">
                <div className="flex items-center justify-between gap-3 shrink-0 pb-3">
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
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-background/90 hover:border-white/20 transition-colors shrink-0"
                    aria-label="Fechar preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative flex-1 min-h-0 flex items-center justify-center w-full">
                  <div className="absolute -inset-4 rounded-[4rem] bg-gradient-to-b from-white/[0.08] to-transparent opacity-60 blur-md pointer-events-none" />

                  <div
                    className="relative rounded-[3.25rem] border-[3px] border-[#48484a] bg-[#1c1c1e] p-[11px] shadow-[0_40px_100px_rgba(0,0,0,0.65),inset_0_0_0_1px_rgba(255,255,255,0.06)] max-h-full"
                    style={{
                      height: "min(100%, 932px)",
                      aspectRatio: `${DEVICE_WIDTH} / ${DEVICE_HEIGHT}`,
                      width: "auto",
                      maxWidth: "100%",
                    }}
                  >
                    <div className="absolute -left-[5px] top-[22%] w-[3px] h-8 rounded-l-sm bg-[#3a3a3c]" />
                    <div className="absolute -left-[5px] top-[32%] w-[3px] h-14 rounded-l-sm bg-[#3a3a3c]" />
                    <div className="absolute -left-[5px] top-[44%] w-[3px] h-14 rounded-l-sm bg-[#3a3a3c]" />
                    <div className="absolute -right-[5px] top-[30%] w-[3px] h-20 rounded-r-sm bg-[#3a3a3c]" />

                    <div className="relative w-full h-full rounded-[2.65rem] overflow-hidden bg-black">
                      <PreviewFrame
                        key={`${url}-${session}`}
                        url={url}
                        title={title}
                        className="relative w-full h-full"
                      />

                      <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 z-30 w-[36%] h-[5px] rounded-full bg-white/35 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pt-3 space-y-3">
                  <p className="text-center text-[10px] font-mono text-subtle tracking-wider uppercase">
                    Preview · iPhone 14 Pro Max ({DEVICE_WIDTH}×{DEVICE_HEIGHT})
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3">
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
                      className="inline-flex items-center justify-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors min-h-[44px] px-2"
                    >
                      Abrir em nova aba
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
