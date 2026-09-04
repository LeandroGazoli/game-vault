import type { Metadata } from "next";
import SteamInventoryClient from "./SteamInventoryClient";

export const metadata: Metadata = {
  title: "Inventário Steam & Skins (CS2, TF2, Rust, Dota 2) | GameVault",
  description:
    "Explore e mostre seu inventário de skins e itens da Steam: armas e facas de Counter-Strike 2, chapéus de Team Fortress 2, itens de Rust, Dota 2 e cartas colecionáveis.",
  alternates: {
    canonical: "/inventario-steam",
  },
  openGraph: {
    title: "Inventário Steam & Skins • GameVault",
    description: "Visualize skins de CS2, cosméticos de TF2 e itens da Steam em alta definição com valores de mercado.",
    url: "https://mygameslist.com.br/inventario-steam",
    type: "website",
  },
};

export default function InventarioSteamPage() {
  return <SteamInventoryClient />;
}
