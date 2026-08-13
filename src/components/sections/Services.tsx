"use client";

import { motion } from "framer-motion";
import { services } from "@/lib/data";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { usePreferences } from "@/components/providers/SitePreferences";

export function Services() {
  const { t } = usePreferences();

  return (
    <section id="servicos" className="section-padding relative scroll-mt-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          index="02"
          label={t.services.label}
          title={t.services.title}
          description={t.services.description}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {services.map((service, index) => {
            const copy = t.services.items[index];
            return (
              <motion.div
                key={copy.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-background p-5 sm:p-8 lg:p-10 group hover:bg-foreground/[0.03] active:bg-foreground/[0.04] transition-colors duration-300"
              >
                <service.icon
                  className="w-5 h-5 text-muted mb-6 group-hover:text-foreground transition-colors"
                  strokeWidth={1.5}
                />
                <h3 className="text-base font-medium mb-2 tracking-[-0.01em]">
                  {copy.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed font-light">
                  {copy.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
