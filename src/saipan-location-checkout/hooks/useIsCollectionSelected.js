import { useEffect, useState } from "@wordpress/element";

/**
 * useIsCollectionSelected
 *
 * WHY THIS EXISTS (PLEASE READ BEFORE REFACTORING 🙃):
 *
 * WooCommerce Blocks (in certain versions/builds) does NOT expose any reliable
 * public state or data store selector to determine whether the user has selected
 * the "Ship" vs "Collection (Local Pickup)" tab in the Checkout UI.
 *
 * In this environment:
 * - The cart store does NOT update when switching tabs
 * - The checkout store does NOT expose delivery method state
 * - The DOM does NOT mutate when toggling Ship/Collection
 * - aria-checked / class names on the radio buttons do NOT change
 *
 * This means there is literally no observable state change we can subscribe to.
 *
 * The ONLY reliable signal available is the user's click on the tab itself.
 * So this hook listens for click events on the shipping method toggle and infers
 * the active mode from which option was clicked.
 *
 * This is intentionally implemented as a UI-level listener rather than a data
 * store selector because Woo Blocks currently provides no supported API for this.
 *
 * If WooCommerce Blocks exposes a stable selector in the future (e.g.
 * wc/store/checkout.getDeliveryMethod()), this hook should be replaced.
 */
export function useIsCollectionSelected() {
  const [isCollection, setIsCollection] = useState(false);

  useEffect(() => {
    const container = document.getElementById("shipping-method");
    if (!container) return;

    const handler = (e) => {
      const option = e.target.closest('[role="radio"]');
      if (!option) return;

      const options = Array.from(
        container.querySelectorAll('[role="radio"]')
      );

      const index = options.indexOf(option);

      // In current Woo Blocks markup:
      // index 0 = Ship
      // index 1 = Collection (Local Pickup)
      if (index === 1) {
        setIsCollection(true);
      }

      if (index === 0) {
        setIsCollection(false);
      }
    };

    container.addEventListener("click", handler);

    // Initialize state from current UI on mount (if possible)
    const selected = container.querySelector('[role="radio"][aria-checked="true"]');
    if (selected) {
      const options = Array.from(
        container.querySelectorAll('[role="radio"]')
      );
      const index = options.indexOf(selected);

      if (index === 1) {
        setIsCollection(true);
      }
    }

    return () => container.removeEventListener("click", handler);
  }, []);

  return isCollection;
}