import { useEffect } from "react";

/**
 * Custom hook to dynamically load the Tawk.to live chat widget on the page.
 * Automatically handles widget initialization, show/hide behavior, and
 * completely removes script tags and DOM elements when the component unmounts.
 */
export function useTawkTo() {
  useEffect(() => {
    const propertyId = import.meta.env.VITE_TAWKTO_PROPERTY_ID;
    const widgetId = import.meta.env.VITE_TAWKTO_WIDGET_ID;

    // Use environment variables if configured, otherwise fallback to the user's property
    const finalPropertyId = propertyId || "6a4be324fe8fa31d49980398";
    const finalWidgetId = widgetId || "1jss6uifq";

    if (!finalPropertyId || !finalWidgetId) return;

    // Initialize Tawk.to global variables
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = `https://embed.tawk.to/${finalPropertyId}/${finalWidgetId}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    s1.id = "tawk-script";

    const s0 = document.getElementsByTagName("script")[0];
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }

    // Completely clean up script and DOM elements on unmount
    return () => {
      // Remove injected script tag
      const script = document.getElementById("tawk-script");
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }

      // Hide and shut down the widget via the API
      try {
        if ((window as any).Tawk_API) {
          if (typeof (window as any).Tawk_API.hideWidget === "function") {
            (window as any).Tawk_API.hideWidget();
          }
          if (typeof (window as any).Tawk_API.shutdown === "function") {
            (window as any).Tawk_API.shutdown();
          }
        }
      } catch (err) {
        console.warn("Failed to shut down Tawk.to widget:", err);
      }

      // Remove leftover iframe containers or chat buttons from Tawk.to
      const tawkElements = document.querySelectorAll('[id^="tawk"], [class^="tawk"]');
      tawkElements.forEach((el) => {
        el.parentNode?.removeChild(el);
      });

      // Clear globals
      delete (window as any).Tawk_API;
      delete (window as any).Tawk_LoadStart;
    };
  }, []);
}
