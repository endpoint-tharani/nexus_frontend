import { useCallback, useMemo } from "react";
import type { ModuleMenuItem, ModuleNavSection } from "../../modules/types";
import { hasAccess } from "../../constants/navigation";
import { coreModule } from "../../modules/core/module";
import { useCurrentRole } from "../../hooks/user";

export interface SidebarModel {
  sections: ModuleNavSection[];
  accountItems: ModuleMenuItem[];
}

const normalizePath = (path: string) =>
  path.split("?")[0].split("#")[0].replace(/\/$/, "").toLowerCase() || "/";

export const useSidebar = (): SidebarModel => {
  const role = useCurrentRole();

  return useMemo(
    () => {
      const sections = (coreModule.nav ?? [])
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => hasAccess(item.roles, role)),
        }))
        .filter((section) => section.items.length > 0);
      const accountItems = (coreModule.accountNav ?? []).filter((item) =>
        hasAccess(item.roles, role),
      );
      return { sections, accountItems };
    },
    [role],
  );
};

export const useRouteAllowed = (): ((path: string) => boolean) => {
  const role = useCurrentRole();
  const allowedPaths = useMemo(
    () => [
      ...(coreModule.nav ?? [])
        .flatMap((section) => section.items)
        .filter((item) => hasAccess(item.roles, role))
        .map((item) => normalizePath(item.path)),
      ...(coreModule.accountNav ?? [])
        .filter((item) => hasAccess(item.roles, role))
        .map((item) => normalizePath(item.path)),
    ],
    [role],
  );

  return useCallback(
    (path: string) => {
      const target = normalizePath(path);
      return allowedPaths.some(
        (allowed) => target === allowed || target.startsWith(`${allowed}/`),
      );
    },
    [allowedPaths],
  );
};

export const usePageTitle = (pathname: string): string => {
  const sidebar = useSidebar();

  return useMemo(() => {
    const items = [
      ...sidebar.sections.flatMap((section) => section.items),
      ...sidebar.accountItems,
    ];
    let best: ModuleMenuItem | undefined;
    for (const item of items) {
      const matches =
        item.path === "/dashboard"
          ? pathname === "/dashboard"
          : pathname === item.path || pathname.startsWith(`${item.path}/`);
      if (matches && (!best || item.path.length > best.path.length)) best = item;
    }
    return best?.label ?? "Overview";
  }, [pathname, sidebar]);
};
