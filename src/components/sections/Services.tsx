"use client";

import { motion } from "framer-motion";
import { services } from "@/lib/data";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Services() {
  return (
    <section id="servicos" className="section-padding relative scroll-mt-20 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          index="02"
          label="Serviços"
          title="O que fazemos"
          description="Soluções digitais completas, do design ao deploy."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-background p-5 sm:p-8 lg:p-10 group hover:bg-white/[0.02] active:bg-white/[0.03] transition-colors duration-300"
            >
              <service.icon
                className="w-5 h-5 text-muted mb-6 group-hover:text-foreground transition-colors"
                strokeWidth={1.5}
              />
              <h3 className="text-base font-medium mb-2 tracking-[-0.01em]">
                {service.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed font-light">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
