"use client";

import { motion } from "framer-motion";
import { stats } from "@/lib/data";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function Stats() {
  return (
    <section className="relative border-y border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-xl overflow-hidden border border-white/[0.06] lg:border-0 lg:rounded-none lg:bg-transparent lg:gap-0">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="bg-background py-8 sm:py-10 lg:py-14 px-3 sm:px-4 lg:px-8 text-center lg:text-left lg:border-r lg:last:border-r-0 lg:border-white/[0.06]"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.03em] mb-1">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs sm:text-sm font-medium mb-1 leading-snug">{stat.label}</p>
              <p className="text-[11px] sm:text-xs text-muted font-light leading-relaxed">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
