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
  instagram: {
    url: "https://www.instagram.com/aragao_Dev/",
    display: "@aragao_Dev",
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
  aspect?: "3/2" | "16/10" | "16/9";
  padding?: boolean;
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
  heroImage?: string;
  heroImageAspect?: "square" | "wide";
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
    url: "https://glemporio.vercel.app/",
    metrics: { Pedidos: "20K+", Entrega: "Rápida", Desde: "2021" },
    gallery: [
      {
        src: "/projects/gl-emporio/02-admin.png",
        alt: "Painel administrativo GL Empório",
        caption: "Painel administrativo",
        fit: "cover",
        bg: "#0a0a0a",
        aspect: "3/2",
        padding: false,
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
    imageBg: "#FF8A16",
    url: "https://partiu-pizza.vercel.app/",
    metrics: { Entrega: "45 min", Nota: "4.8", Tipo: "Delivery" },
    gallery: [
      {
        src: "/projects/partiu-pizza/02-admin.png",
        alt: "Painel administrativo Partiu Pizza",
        caption: "Painel administrativo",
        fit: "cover",
        bg: "#0a0a0a",
        aspect: "3/2",
        padding: false,
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
    imageBg: "#F2F4F3",
    url: "https://pizzariacarioca.vercel.app/",
    metrics: { Entrega: "60 min", Nota: "4.8", Desde: "2015" },
    gallery: [
      {
        src: "/projects/pizzaria-carioca/02-admin.png",
        alt: "Painel administrativo Pizzaria Carioca",
        caption: "Painel administrativo",
        fit: "cover",
        bg: "#0a0a0a",
        aspect: "3/2",
        padding: false,
      },
    ],
  },
  {
    id: "pierre-onassis",
    title: "Pierre Onassis",
    category: "Landing Page",
    description:
      "Landing page premium de contato para produtor musical, com portfólio de produções, serviços, integração WhatsApp e identidade visual cinematográfica.",
    tags: ["Next.js", "Landing Page", "UI/UX"],
    gradient: "from-violet-500/40 via-purple-600/30 to-amber-500/20",
    image: "/projects/pierre-onassis-logo-hero.png",
    heroImage: "/projects/pierre-onassis-logo-hero.png",
    heroImageAspect: "wide",
    imageFit: "contain",
    imageBg: "#000000",
    url: "https://www.pierreonassis.com/",
    metrics: { Experiência: "10+ anos", Tipo: "Landing", Foco: "Contato" },
    gallery: [
      {
        src: "/projects/pierre-onassis/01-landing.png",
        alt: "Landing page Pierre Onassis",
        caption: "Landing page premium",
        fit: "cover",
        bg: "#0a0a0a",
        aspect: "3/2",
        padding: false,
      },
    ],
  },
  {
    id: "bruno-toquinho",
    title: "Bruno Toquinho",
    category: "Landing Page",
    description:
      "Landing page premium de contato para compositor e produtor musical, com sucessos, portfólio de artistas, estilos musicais e integração WhatsApp.",
    tags: ["Next.js", "Landing Page", "UI/UX"],
    gradient: "from-amber-500/40 via-orange-500/30 to-red-500/20",
    image: "/projects/bruno-toquinho-logo.svg",
    imageFit: "contain",
    imageBg: "#0a0a0a",
    url: "https://brunotoquinho.vercel.app/",
    metrics: { Músicas: "100+", Carreira: "20+ anos", Foco: "Contato" },
    gallery: [
      {
        src: "/projects/bruno-toquinho/01-landing.jpg",
        alt: "Landing page Bruno Toquinho",
        caption: "Landing page premium",
        fit: "cover",
        bg: "#0a0a0a",
        aspect: "3/2",
        padding: false,
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
    { label: contact.instagram.display, href: contact.instagram.url },
  ],
};
