import { useEffect, useRef } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { useNavigate } from "react-router-dom";
import { getCustomerRoutePathFromDeepLink } from "@/lib/deepLinks";

const DeepLinkHandler = () => {
  const navigate = useNavigate();
  const listenerRef = useRef<{ remove: () => Promise<void> } | undefined>(
    undefined,
  );

  useEffect(() => {
    let isMounted = true;

    const openCustomerRoute = (url: string | null | undefined) => {
      const path = getCustomerRoutePathFromDeepLink(url);

      if (path) {
        navigate(path);
      }
    };

    void CapacitorApp.getLaunchUrl()
      .then((launchUrl) => {
        if (isMounted) {
          openCustomerRoute(launchUrl?.url);
        }
      })
      .catch(() => undefined);

    void CapacitorApp.addListener("appUrlOpen", (event) => {
      if (isMounted) {
        openCustomerRoute(event.url);
      }
    })
      .then((handle) => {
        listenerRef.current = handle;
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
      void listenerRef.current?.remove();
      listenerRef.current = undefined;
    };
  }, [navigate]);

  return null;
};

export default DeepLinkHandler;
