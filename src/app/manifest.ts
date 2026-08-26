import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Le Surplus — chantier partagé entre proches",
    short_name: "Le Surplus",
    description:
      "Partage de matériaux et outils de chantier en surplus entre proches : dons et prêts.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F2545",
    theme_color: "#0F2545",
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
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
