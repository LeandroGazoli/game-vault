import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GameVault • MyGameList",
    short_name: "GameVault",
    description:
      "Seu perfil gamer definitivo: organize jogos zerados, acompanhe lançamentos, notas do Metacritic e HowLongToBeat.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e0f12",
    theme_color: "#0e0f12",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["games", "entertainment", "lifestyle"],
  };
}
