"use client";

import { useEffect } from "react";
import { useTenant } from "../../hooks/useTenant";

const DEFAULT_FAVICON = "/favicon.png";
const DEFAULT_APPLE_ICON = "/apple-touch-icon.png";

export default function DynamicFavicon() {
  const { tenant } = useTenant();

  useEffect(() => {
    const faviconUrl = tenant?.icone_url || tenant?.logo_url || DEFAULT_FAVICON;
    const appleIconUrl =
      tenant?.icone_url || tenant?.logo_url || DEFAULT_APPLE_ICON;

    // Favicon PNG
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl + "?v=" + Date.now();
    link.type = "image/png";

    // Apple touch icon
    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      document.head.appendChild(appleLink);
    }
    appleLink.href = appleIconUrl;
  }, [tenant]);

  return null;
}
