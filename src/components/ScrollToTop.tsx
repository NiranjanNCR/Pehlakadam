import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop ensures that whenever a user navigates to any page or route,
 * the viewport instantly scrolls to the very top (starting details of landing),
 * rather than preserving the previous scroll offset or loading at the footer.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  // Set browser scroll restoration to manual
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    if (!hash) {
      // Instant reset to very top of page
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Secondary microtask execution to handle dynamic components loading or images
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 20);

      return () => clearTimeout(timer);
    } else {
      // If a specific section anchor hash is targeted (e.g., #pricing-section)
      const targetId = hash.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        const timer = setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, search, hash]);

  return null;
}
