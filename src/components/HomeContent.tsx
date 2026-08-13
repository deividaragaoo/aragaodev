"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { ContactNamePanel } from "@/components/ui/ContactNamePanel";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { VirtualAgent } from "@/components/ui/VirtualAgent";
import { SitePreferencesProvider } from "@/components/providers/SitePreferences";
import type { Project } from "@/lib/data";
import type { Locale, Theme } from "@/lib/i18n";

export function HomeContent({
  initialLocale,
  initialTheme,
}: {
  initialLocale: Locale;
  initialTheme: Theme;
}) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contactPanelOpen, setContactPanelOpen] = useState(false);

  return (
    <SitePreferencesProvider
      initialLocale={initialLocale}
      initialTheme={initialTheme}
    >
      <LoadingScreen />
      <Navbar onRequestContact={() => setContactPanelOpen(true)} />
      <main className="pb-fab-safe">
        <Hero
          onProjectSelect={setSelectedProject}
          onRequestContact={() => setContactPanelOpen(true)}
        />
        <Projects onProjectSelect={setSelectedProject} />
        <Services />
        <FinalCTA onRequestContact={() => setContactPanelOpen(true)} />
      </main>
      <Footer onRequestContact={() => setContactPanelOpen(true)} />
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onRequestContact={() => {
          setSelectedProject(null);
          setContactPanelOpen(true);
        }}
      />
      <ContactNamePanel
        open={contactPanelOpen}
        onClose={() => setContactPanelOpen(false)}
      />
      <VirtualAgent hidden={!!selectedProject || contactPanelOpen} />
    </SitePreferencesProvider>
  );
}
