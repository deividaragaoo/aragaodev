export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Aragão Dev",
    url: "https://aragaodev.com",
    description:
      "Software house premium especializada em desenvolvimento web, apps mobile e design UI/UX.",
    email: "contato@aragaodev.com",
    telephone: "+55-79-98157-5179",
    address: {
      "@type": "PostalAddress",
      addressCountry: "BR",
    },
    areaServed: {
      "@type": "Country",
      name: "Brasil",
    },
    sameAs: [
      "https://github.com",
      "https://linkedin.com",
      "https://instagram.com",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
