"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Lock, Play, ShieldCheck, Fingerprint, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudit } from "@/lib/audit-context";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { startAudit, scanning } = useAudit();
  const { t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section className="grid items-center gap-10 pb-10 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:pb-16 lg:pt-12">
      <div className="max-w-xl">
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[4.25rem]"
        >
          {t("hero.title1")}
          <br />
          <span className="bg-[linear-gradient(100deg,var(--text-primary)_10%,var(--accent-cyan)_45%,var(--accent-purple)_90%)] bg-clip-text text-transparent">
            {t("hero.title2")}
          </span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-2"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Button variant="primary" size="lg" onClick={startAudit} disabled={scanning} className="w-full sm:w-auto">
            <Play className="h-[18px] w-[18px]" />
            {t("hero.start")}
          </Button>
          <p className="text-[13px] leading-snug text-ink-2 sm:max-w-[26ch] sm:pl-2">
            {t("hero.privacy")}
          </p>
        </motion.div>
      </div>

      <HeroVisual reduce={!!reduce} />
    </section>
  );
}

/** Concentric glass rings with orbiting nodes around a shield. Decorative. */
function HeroVisual({ reduce }: { reduce: boolean }) {
  const nodes = [
    { Icon: Fingerprint, deg: 20, ring: 1, tone: "var(--accent-cyan)" },
    { Icon: Wifi, deg: 150, ring: 2, tone: "var(--accent-purple)" },
    { Icon: Lock, deg: 255, ring: 1, tone: "var(--success)" },
  ];

  return (
    <motion.div
      aria-hidden
      initial={reduce ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto aspect-square w-full max-w-[420px] lg:max-w-[480px]"
    >
      {/* soft light behind the glass */}
      <div className="absolute inset-[12%] rounded-full bg-[color:var(--accent-blue)] opacity-30 blur-[70px]" />
      <div className="absolute inset-[30%] rounded-full bg-[color:var(--accent-cyan)] opacity-25 blur-[60px]" />

      {/* rings */}
      <div className="glass absolute inset-0 rounded-full !shadow-[inset_0_1px_0_var(--glass-highlight),0_30px_80px_-30px_var(--shadow-3)]" />
      <div className="glass absolute inset-[13%] rounded-full" />
      <div className="glass absolute inset-[27%] rounded-full" />

      {/* orbiting nodes: each ring spins, and each icon spins back so it stays upright */}
      {[1, 2].map((ring) => {
        const dur = ring === 1 ? "38s" : "26s";
        return (
          <div
            key={ring}
            className="absolute animate-sweep"
            style={{
              inset: ring === 1 ? "6.5%" : "20%",
              animationDuration: dur,
              animationDirection: ring === 1 ? "normal" : "reverse",
            }}
          >
            {nodes
              .filter((n) => n.ring === ring)
              .map(({ Icon, deg, tone }, i) => (
                <div key={i} className="absolute inset-0" style={{ transform: `rotate(${deg}deg)` }}>
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                    <div style={{ transform: `rotate(${-deg}deg)` }}>
                      <div
                        className="animate-sweep"
                        style={{
                          animationDuration: dur,
                          animationDirection: ring === 1 ? "reverse" : "normal",
                        }}
                      >
                        <div
                          className="glass-inset grid h-11 w-11 place-items-center rounded-full"
                          style={{
                            color: tone,
                            boxShadow: `inset 0 1px 0 var(--glass-highlight), 0 0 24px -4px ${tone}`,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        );
      })}

      {/* core */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative grid h-[26%] w-[26%] place-items-center rounded-[28%] border border-white/30 bg-[linear-gradient(135deg,rgba(79,107,240,0.92),rgba(124,92,232,0.9))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_16px_50px_-8px_rgba(120,149,255,0.85)]">
          {!reduce && (
            <span className="absolute inset-0 animate-pulse-ring rounded-[28%] border border-[color:var(--accent-cyan)]" />
          )}
          <ShieldCheck className="h-1/2 w-1/2" strokeWidth={1.8} />
        </div>
      </div>
    </motion.div>
  );
}
