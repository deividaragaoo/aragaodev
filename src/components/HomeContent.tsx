"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { VirtualAgent } from "@/components/ui/VirtualAgent";
import type { Project } from "@/lib/data";

export function HomeContent() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <LoadingScreen />
      <Navbar />
      <main className="pb-fab-safe">
        <Hero onProjectSelect={setSelectedProject} />
        <Stats />
        <Projects onProjectSelect={setSelectedProject} />
        <Services />
        <FinalCTA />
      </main>
      <Footer />
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <VirtualAgent hidden={!!selectedProject} />
    </>
  );
}
