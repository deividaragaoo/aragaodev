import {
  Code2,
  Globe,
  Layers,
  LineChart,
  Palette,
  Smartphone,
} from "lucide-react";

export const navLinks = [
  { label: "Projetos", href: "#projetos" },
  { label: "Serviços", href: "#servicos" },
];

export const contact = {
  email: "contato@aragaodev.com",
  whatsapp: {
    url: "https://wa.me/5579981575179",
    display: "(79) 98157-5179",
  },
};

export const stats = [
  { value: 120, suffix: "+", label: "Projetos entregues", description: "Soluções digitais de alto impacto" },
  { value: 99, suffix: "%", label: "Performance", description: "Core Web Vitals otimizados" },
  { value: 100, suffix: "%", label: "Responsividade", description: "Experiência perfeita em qualquer tela" },
  { value: 24, suffix: "/7", label: "Suporte", description: "Acompanhamento contínuo e dedicado" },
];

export type ProjectGalleryItem = {
  src: string;
  alt: string;
  caption?: string;
  fit?: "cover" | "contain";
  bg?: string;
};

export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  gradient: string;
  image: string;
  url: string;
  metrics: Record<string, string>;
  imageFit?: "cover" | "contain";
  imageBg?: string;
  gallery: ProjectGalleryItem[];
};

export const projects: Project[] = [
  {
    id: "gl-emporio",
    title: "GL Empório",
    category: "E-commerce",
    description:
      "Distribuidora premium de bebidas com catálogo completo, ofertas da semana, integração WhatsApp e experiência de compra focada em conversão.",
    tags: ["Next.js", "WhatsApp", "E-commerce"],
    gradient: "from-red-500/40 via-orange-500/30 to-amber-500/20",
    image: "/projects/gl-emporio-logo.png",
    imageFit: "contain",
    imageBg: "#000000",
    url: "https://www.glemporio75.com/",
    metrics: { Pedidos: "20K+", Entrega: "Rápida", Desde: "2021" },
    gallery: [
      {
        src: "/projects/gl-emporio-logo.png",
        alt: "Logo GL Empório",
        caption: "Identidade visual",
        fit: "contain",
        bg: "#000000",
      },
      {
        src: "/projects/gl-emporio/02-admin.svg",
        alt: "Painel administrativo GL Empório",
        caption: "Painel administrativo",
        fit: "cover",
        bg: "#0a0a0a",
      },
      {
        src: "/projects/gl-emporio/03-mobile.svg",
        alt: "Versão mobile GL Empório",
        caption: "Experiência mobile",
        fit: "cover",
        bg: "#0a0a0a",
      },
    ],
  },
  {
    id: "partiu-pizza",
    title: "#PartiuPizza",
    category: "Delivery",
    description:
      "Plataforma de delivery de pizzas com cardápio digital, produtos em destaque, carrinho e pedidos — tudo otimizado para mobile.",
    tags: ["React", "Delivery", "PWA"],
    gradient: "from-orange-500/40 via-red-500/30 to-rose-500/20",
    image: "/projects/partiu-pizza-logo.png",
    imageFit: "contain",
    imageBg: "#E85D04",
    url: "https://partiu-pizza.vercel.app/",
    metrics: { Entrega: "45 min", Nota: "4.8", Tipo: "Delivery" },
    gallery: [
      {
        src: "/projects/partiu-pizza-logo.png",
        alt: "Logo Partiu Pizza",
        caption: "Identidade visual",
        fit: "contain",
        bg: "#E85D04",
      },
      {
        src: "/projects/partiu-pizza/02-admin.svg",
        alt: "Painel administrativo Partiu Pizza",
        caption: "Painel administrativo",
        fit: "cover",
        bg: "#0a0a0a",
      },
      {
        src: "/projects/partiu-pizza/03-mobile.svg",
        alt: "Versão mobile Partiu Pizza",
        caption: "Experiência mobile",
        fit: "cover",
        bg: "#E85D04",
      },
    ],
  },
  {
    id: "pizzaria-carioca",
    title: "Pizzaria Carioca",
    category: "Cardápio Digital",
    description:
      "Cardápio digital premium para pizzaria tradicional, com destaques, formas de pagamento, endereço integrado e experiência completa de pedido.",
    tags: ["Next.js", "Cardápio", "Mobile First"],
    gradient: "from-amber-500/40 via-orange-600/30 to-red-600/20",
    image: "/projects/pizzaria-carioca-logo.png",
    imageFit: "contain",
    imageBg: "#FFFFFF",
    url: "https://pizzariacarioca.vercel.app/",
    metrics: { Entrega: "60 min", Nota: "4.8", Desde: "2015" },
    gallery: [
      {
        src: "/projects/pizzaria-carioca-logo.png",
        alt: "Logo Pizzaria Carioca",
        caption: "Identidade visual",
        fit: "contain",
        bg: "#FFFFFF",
      },
      {
        src: "/projects/pizzaria-carioca/02-admin.svg",
        alt: "Painel administrativo Pizzaria Carioca",
        caption: "Painel administrativo",
        fit: "cover",
        bg: "#fafafa",
      },
      {
        src: "/projects/pizzaria-carioca/03-mobile.svg",
        alt: "Versão mobile Pizzaria Carioca",
        caption: "Experiência mobile",
        fit: "cover",
        bg: "#fafafa",
      },
    ],
  },
];

export const services = [
  {
    icon: Code2,
    title: "Desenvolvimento Web",
    description:
      "Aplicações web de alta performance com arquitetura escalável, código limpo e as melhores práticas do mercado.",
  },
  {
    icon: Smartphone,
    title: "Apps Mobile",
    description:
      "Experiências mobile nativas e híbridas com UX impecável, performance otimizada e integração completa.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description:
      "Interfaces premium que convertem. Design systems consistentes, prototipagem e testes de usabilidade.",
  },
  {
    icon: Layers,
    title: "Sistemas SaaS",
    description:
      "Plataformas completas do MVP ao scale-up, com multi-tenancy, billing e dashboards administrativos.",
  },
  {
    icon: Globe,
    title: "E-commerce",
    description:
      "Lojas virtuais otimizadas para conversão, com checkout fluido, SEO avançado e integrações de pagamento.",
  },
  {
    icon: LineChart,
    title: "Consultoria Tech",
    description:
      "Auditoria de código, otimização de performance, arquitetura de sistemas e estratégia digital.",
  },
];


export const footerLinks = {
  company: [
    { label: "Projetos", href: "#projetos" },
    { label: "Serviços", href: "#servicos" },
  ],
  services: [
    { label: "Desenvolvimento Web", href: "#servicos" },
    { label: "Apps Mobile", href: "#servicos" },
    { label: "UI/UX Design", href: "#servicos" },
    { label: "Consultoria", href: "#servicos" },
  ],
  contact: [
    { label: contact.email, href: `mailto:${contact.email}` },
    { label: contact.whatsapp.display, href: contact.whatsapp.url },
  ],
};
