export const LOCALES = ["pt", "en"] as const;
export const THEMES = ["dark", "light"] as const;

export type Locale = (typeof LOCALES)[number];
export type Theme = (typeof THEMES)[number];

export const LOCALE_COOKIE = "aragao-lang";
export const THEME_COOKIE = "aragao-theme";

export function isLocale(value: unknown): value is Locale {
  return value === "pt" || value === "en";
}

export function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

export function parseLocale(value: unknown): Locale {
  return isLocale(value) ? value : "pt";
}

export function parseTheme(value: unknown): Theme {
  return isTheme(value) ? value : "dark";
}

export function htmlLang(locale: Locale) {
  return locale === "en" ? "en" : "pt-BR";
}

const metricLabels = {
  pt: {
    Pedidos: "Pedidos",
    Entrega: "Entrega",
    Desde: "Desde",
    Nota: "Nota",
    Tipo: "Tipo",
    Experiência: "Experiência",
    Foco: "Foco",
    Músicas: "Músicas",
    Carreira: "Carreira",
    Módulos: "Módulos",
    Segmento: "Segmento",
    Local: "Local",
  },
  en: {
    Pedidos: "Orders",
    Entrega: "Delivery",
    Desde: "Since",
    Nota: "Rating",
    Tipo: "Type",
    Experiência: "Experience",
    Foco: "Focus",
    Músicas: "Songs",
    Carreira: "Career",
    Módulos: "Modules",
    Segmento: "Segment",
    Local: "Location",
  },
} as const;

const projectCopy = {
  "gl-emporio": {
    pt: {
      category: "E-commerce",
      description:
        "Distribuidora premium de bebidas com catálogo completo, ofertas da semana, integração WhatsApp e experiência de compra focada em conversão.",
      caption: "Painel administrativo",
    },
    en: {
      category: "E-commerce",
      description:
        "Premium beverage distributor with a full catalog, weekly deals, WhatsApp integration, and a conversion-focused shopping experience.",
      caption: "Admin dashboard",
    },
  },
  "partiu-pizza": {
    pt: {
      category: "Delivery",
      description:
        "Plataforma de delivery de pizzas com cardápio digital, produtos em destaque, carrinho e pedidos — tudo otimizado para mobile.",
      caption: "Painel administrativo",
    },
    en: {
      category: "Delivery",
      description:
        "Pizza delivery platform with a digital menu, featured products, cart, and orders — fully optimized for mobile.",
      caption: "Admin dashboard",
    },
  },
  "pizzaria-carioca": {
    pt: {
      category: "Cardápio Digital",
      description:
        "Cardápio digital premium para pizzaria tradicional, com destaques, formas de pagamento, endereço integrado e experiência completa de pedido.",
      caption: "Painel administrativo",
    },
    en: {
      category: "Digital Menu",
      description:
        "Premium digital menu for a traditional pizzeria, with highlights, payment methods, integrated address, and a complete ordering experience.",
      caption: "Admin dashboard",
    },
  },
  "pierre-onassis": {
    pt: {
      category: "Landing Page",
      description:
        "Landing page premium de contato para produtor musical, com portfólio de produções, serviços, integração WhatsApp e identidade visual cinematográfica.",
      caption: "Landing page premium",
    },
    en: {
      category: "Landing Page",
      description:
        "Premium contact landing page for a music producer, with a production portfolio, services, WhatsApp integration, and a cinematic visual identity.",
      caption: "Premium landing page",
    },
  },
  "bruno-toquinho": {
    pt: {
      category: "Landing Page",
      description:
        "Landing page premium de contato para compositor e produtor musical, com sucessos, portfólio de artistas, estilos musicais e integração WhatsApp.",
      caption: "Landing page premium",
    },
    en: {
      category: "Landing Page",
      description:
        "Premium contact landing page for a composer and music producer, with hits, artist portfolio, music styles, and WhatsApp integration.",
      caption: "Premium landing page",
    },
  },
  "mana-pizzaria": {
    pt: {
      category: "Sistema Administrativo",
      description:
        "Painel administrativo interno para gestão de pedidos, produtos, estoque, financeiro e relatórios — com dashboard em tempo real e operação centralizada.",
      caption: "Painel administrativo",
    },
    en: {
      category: "Admin System",
      description:
        "Internal admin panel for orders, products, inventory, finance, and reports — with a real-time dashboard and centralized operations.",
      caption: "Admin dashboard",
    },
  },
  "emporio-motors": {
    pt: {
      category: "Concessionária",
      description:
        "Site institucional premium para concessionária de veículos de luxo, com catálogo de destaques, fluxo de venda de veículos, integração Instagram e atendimento via consultores especializados.",
      caption: "Concessionária premium",
    },
    en: {
      category: "Dealership",
      description:
        "Premium institutional site for a luxury car dealership, with featured inventory, a vehicle sales flow, Instagram integration, and specialist consultants.",
      caption: "Premium dealership",
    },
  },
} as const;

export const dictionary = {
  pt: {
    nav: {
      projects: "Projetos",
      services: "Serviços",
      contact: "Contato",
      openMenu: "Abrir menu",
      closeMenu: "Fechar menu",
      primary: "Principal",
    },
    controls: {
      language: "Idioma",
      portuguese: "Português",
      english: "Inglês",
      theme: "Aparência",
      dark: "Modo escuro",
      light: "Modo claro",
    },
    hero: {
      badge: "Software House • Atendimento em todo o Brasil",
      titleLead: "Produtos digitais",
      titleMid: "com padrão ",
      titleAccent: "premium",
      subtitle:
        "Desenvolvemos sites, sistemas e plataformas digitais para empresas — com design refinado e performance de elite.",
      startProject: "Iniciar projeto",
      seeWork: "Ver trabalhos",
      benefits: [
        "UX/UI de Alto Nível",
        "Performance Otimizada",
        "Suporte Próximo",
        "Entregas Ágeis",
      ],
    },
    dashboard: {
      nav: ["Projetos", "Serviços", "Sobre", "Contato"],
      contact: "Contato",
      title: "Desempenho ",
      titleAccent: "em cada detalhe",
      body: "Design refinado, engenharia sólida e resultados mensuráveis em cada entrega.",
      cta: "Iniciar projeto",
      tech: "Tecnologias modernas",
      cards: [
        {
          label: "Performance",
          description: "Core Web Vitals otimizados",
        },
        {
          label: "Segurança",
          description: "Proteção em cada camada",
        },
        {
          label: "Escalabilidade",
          description: "Arquitetura preparada",
        },
      ],
    },
    clients: {
      label: "Experiência que gera resultados",
      prev: "Cliente anterior",
      next: "Próximo cliente",
      viewProject: "Ver detalhes do projeto",
    },
    projects: {
      label: "Trabalhos",
      title: "Alguns dos meus projetos selecionados",
      description:
        "Experiências digitais reais entregues para marcas que exigem excelência.",
      viewDetails: "Ver galeria e detalhes →",
    },
    services: {
      label: "Serviços",
      title: "O que fazemos",
      description: "Soluções digitais completas, do design ao deploy.",
      items: [
        {
          title: "Desenvolvimento Web",
          description:
            "Aplicações web de alta performance com arquitetura escalável, código limpo e as melhores práticas do mercado.",
        },
        {
          title: "Apps Mobile",
          description:
            "Experiências mobile nativas e híbridas com UX impecável, performance otimizada e integração completa.",
        },
        {
          title: "UI/UX Design",
          description:
            "Interfaces premium que convertem. Design systems consistentes, prototipagem e testes de usabilidade.",
        },
        {
          title: "Sistemas SaaS",
          description:
            "Plataformas completas do MVP ao scale-up, com multi-tenancy, billing e dashboards administrativos.",
        },
        {
          title: "E-commerce",
          description:
            "Lojas virtuais otimizadas para conversão, com checkout fluido, SEO avançado e integrações de pagamento.",
        },
        {
          title: "Consultoria Tech",
          description:
            "Auditoria de código, otimização de performance, arquitetura de sistemas e estratégia digital.",
        },
      ],
    },
    cta: {
      label: "03 — Contato",
      title: "Vamos construir algo",
      titleAccent: "extraordinário",
      body: "Conte sua ideia. Respondemos em até 24 horas com um plano claro e orçamento sem compromisso.",
      schedule: "Agendar conversa",
      portfolio: "Ver portfólio",
    },
    footer: {
      blurb: "Software house premium. Design refinado, código de excelência.",
      links: "Links",
      services: "Serviços",
      contact: "Contato",
      email: "E-mail",
      nationwide: "Atendimento em todo o Brasil",
      serviceItems: [
        "Desenvolvimento Web",
        "Apps Mobile",
        "UI/UX Design",
        "Consultoria",
      ],
    },
    contactPanel: {
      kicker: "Contato",
      title: "Como podemos te chamar?",
      body: "Informe seu nome para iniciarmos a conversa no WhatsApp com sua mensagem personalizada.",
      name: "Nome",
      placeholder: "Seu nome",
      submit: "Entrar em contato",
      close: "Fechar",
      closePanel: "Fechar painel de contato",
    },
    modal: {
      close: "Fechar modal",
      viewMobile: "Ver site no celular",
      contact: "Entrar em contato",
    },
    preview: {
      loading: "Carregando site...",
      failed: "Não foi possível exibir o preview aqui.",
      openTab: "Abrir site em nova aba",
      close: "Fechar preview",
      back: "Voltar",
      newTab: "Nova aba",
      backPortfolio: "Voltar ao portfólio",
      openNewTab: "Abrir em nova aba",
    },
    agent: {
      title: "Assistente virtual",
      minimize: "Minimizar assistente",
      open: "Abrir assistente virtual",
      close: "Minimizar assistente virtual",
      whatsapp: "Chamar no WhatsApp",
      messages: [
        "Vamos fechar um projeto?",
        "Posso te ajudar a tirar sua ideia do papel.",
        "Respondo rápido no WhatsApp.",
      ],
      whatsappMessage:
        "Olá! Vi o site da Aragão Dev e gostaria de fechar um projeto.",
    },
  },
  en: {
    nav: {
      projects: "Work",
      services: "Services",
      contact: "Contact",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      primary: "Primary",
    },
    controls: {
      language: "Language",
      portuguese: "Portuguese",
      english: "English",
      theme: "Appearance",
      dark: "Dark mode",
      light: "Light mode",
    },
    hero: {
      badge: "Software House • Serving companies across Brazil",
      titleLead: "Digital products",
      titleMid: "with a ",
      titleAccent: "premium",
      subtitle:
        "We build websites, systems, and digital platforms for companies — with refined design and elite performance.",
      startProject: "Start a project",
      seeWork: "See our work",
      benefits: [
        "High-end UX/UI",
        "Optimized performance",
        "Close support",
        "Agile delivery",
      ],
    },
    dashboard: {
      nav: ["Work", "Services", "About", "Contact"],
      contact: "Contact",
      title: "Performance ",
      titleAccent: "in every detail",
      body: "Refined design, solid engineering, and measurable results in every delivery.",
      cta: "Start a project",
      tech: "Modern stack",
      cards: [
        {
          label: "Performance",
          description: "Optimized Core Web Vitals",
        },
        {
          label: "Security",
          description: "Protection at every layer",
        },
        {
          label: "Scale",
          description: "Architecture built to grow",
        },
      ],
    },
    clients: {
      label: "Experience that drives results",
      prev: "Previous client",
      next: "Next client",
      viewProject: "View project details",
    },
    projects: {
      label: "Work",
      title: "A selection of my projects",
      description:
        "Real digital experiences delivered for brands that demand excellence.",
      viewDetails: "View gallery and details →",
    },
    services: {
      label: "Services",
      title: "What we do",
      description: "End-to-end digital solutions, from design to deploy.",
      items: [
        {
          title: "Web Development",
          description:
            "High-performance web applications with scalable architecture, clean code, and industry best practices.",
        },
        {
          title: "Mobile Apps",
          description:
            "Native and hybrid mobile experiences with polished UX, optimized performance, and full integration.",
        },
        {
          title: "UI/UX Design",
          description:
            "Premium interfaces that convert. Consistent design systems, prototyping, and usability testing.",
        },
        {
          title: "SaaS Platforms",
          description:
            "Complete platforms from MVP to scale-up, with multi-tenancy, billing, and admin dashboards.",
        },
        {
          title: "E-commerce",
          description:
            "Conversion-optimized stores with a fluid checkout, advanced SEO, and payment integrations.",
        },
        {
          title: "Tech Consulting",
          description:
            "Code audits, performance optimization, systems architecture, and digital strategy.",
        },
      ],
    },
    cta: {
      label: "03 — Contact",
      title: "Let's build something",
      titleAccent: "extraordinary",
      body: "Tell us your idea. We reply within 24 hours with a clear plan and a no-obligation quote.",
      schedule: "Book a call",
      portfolio: "View portfolio",
    },
    footer: {
      blurb: "Premium software house. Refined design, excellent code.",
      links: "Links",
      services: "Services",
      contact: "Contact",
      email: "Email",
      nationwide: "Serving companies across Brazil",
      serviceItems: [
        "Web Development",
        "Mobile Apps",
        "UI/UX Design",
        "Consulting",
      ],
    },
    contactPanel: {
      kicker: "Contact",
      title: "What should we call you?",
      body: "Enter your name so we can start the WhatsApp conversation with a personalized message.",
      name: "Name",
      placeholder: "Your name",
      submit: "Get in touch",
      close: "Close",
      closePanel: "Close contact panel",
    },
    modal: {
      close: "Close modal",
      viewMobile: "View site on mobile",
      contact: "Get in touch",
    },
    preview: {
      loading: "Loading site...",
      failed: "Couldn't display the preview here.",
      openTab: "Open site in a new tab",
      close: "Close preview",
      back: "Back",
      newTab: "New tab",
      backPortfolio: "Back to portfolio",
      openNewTab: "Open in a new tab",
    },
    agent: {
      title: "Virtual assistant",
      minimize: "Minimize assistant",
      open: "Open virtual assistant",
      close: "Minimize virtual assistant",
      whatsapp: "Chat on WhatsApp",
      messages: [
        "Shall we start a project?",
        "I can help you take your idea off the page.",
        "I reply quickly on WhatsApp.",
      ],
      whatsappMessage:
        "Hi! I saw the Aragão Dev website and I'd like to start a project.",
    },
  },
} as const;

export type Dictionary = (typeof dictionary)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionary[locale];
}

export function translateMetric(locale: Locale, label: string) {
  const table = metricLabels[locale];
  return table[label as keyof typeof table] ?? label;
}

export function getProjectCopy(id: string, locale: Locale) {
  const entry = projectCopy[id as keyof typeof projectCopy];
  if (!entry) return null;
  return entry[locale];
}
