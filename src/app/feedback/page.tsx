import type { Metadata } from "next";
import FeedbackClient from "./FeedbackClient";

export const metadata: Metadata = {
  title: "Central de Ideias, Votação & Report de Bugs",
  description:
    "Participe do desenvolvimento do MyGameList! Envie sugestões de novos recursos, relate falhas e vote nas melhores propostas. Contribuições aceitas ganham VIP Vitalício e tags exclusivas!",
  openGraph: {
    title: "Central de Ideias, Votação & Report de Bugs • MyGameList",
    description:
      "Envie ideias, relate falhas e vote com a comunidade. Contribuidores premiados ganham VIP Vitalício e insígnias gamer!",
    url: "/feedback",
  },
};

export default function FeedbackPage() {
  return <FeedbackClient />;
}
