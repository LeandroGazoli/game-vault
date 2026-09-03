import type { Metadata } from "next";
import CalendarView from "@/components/CalendarView";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const metadata: Metadata = {
  title: "Calendário de Lançamentos de Jogos 2026 | GameVault",
  description:
    "Confira o calendário completo de lançamentos de jogos para PC, PlayStation 5, Xbox Series e Nintendo Switch. Datas de lançamento, novidades e contagem regressiva.",
  alternates: {
    canonical: "/calendar",
  },
  openGraph: {
    title: "Calendário de Lançamentos de Jogos 2026 | GameVault",
    description:
      "Acompanhe as datas oficiais de lançamento dos jogos mais esperados para PC, consoles e portáteis.",
    url: `${SITE_URL}/calendar`,
    siteName: "GameVault",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Calendário de Lançamentos de Jogos • GameVault",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calendário de Lançamentos de Jogos 2026 | GameVault",
    description: "Fique por dentro das datas de lançamento dos jogos mais aguardados.",
    images: ["/og-image.jpg"],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Calendário de Lançamentos",
        item: `${SITE_URL}/calendar`,
      },
    ],
  },
];

export default function CalendarPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <div className="py-2">
        <CalendarView />
      </div>
    </>
  );
}
