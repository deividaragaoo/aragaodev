import type { Project } from "@/lib/data";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProjectImageProps {
  project: Project;
  className?: string;
  sizes?: string;
  priority?: boolean;
  variant?: "default" | "hero";
}

export function ProjectImage({
  project,
  className,
  sizes,
  priority,
  variant = "default",
}: ProjectImageProps) {
  const isLogo = project.imageFit === "contain";

  return (
    <Image
      src={project.image}
      alt={project.title}
      fill
      priority={priority}
      quality={100}
      unoptimized
      sizes={sizes}
      className={cn(
        isLogo
          ? cn(
              "object-contain",
              variant === "hero" ? "p-4 sm:p-6" : "p-6 sm:p-10"
            )
          : "object-cover",
        className
      )}
    />
  );
}
