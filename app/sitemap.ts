import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import type { MetadataRoute } from "next";
import { absoluteUrl, primarySeoPages } from "./seo";

const appDirectory = join(process.cwd(), "app");
const pageFileName = "page.tsx";
const ignoredDirectories = new Set(["api", "data"]);

function isRouteGroup(segment: string): boolean {
  return segment.startsWith("(") && segment.endsWith(")");
}

function shouldSkipSegment(segment: string): boolean {
  return (
    segment.startsWith(".") ||
    segment.startsWith("_") ||
    segment.startsWith("@") ||
    segment.startsWith("[") ||
    segment.startsWith("(.)") ||
    segment.startsWith("(..)") ||
    segment.startsWith("(...)")
  );
}

function pageFileToRoute(filePath: string): string | null {
  const routeDirectory = dirname(filePath);
  const relativeDirectory = relative(appDirectory, routeDirectory);

  if (!relativeDirectory) {
    return "/";
  }

  const routeSegments = relativeDirectory
    .split(sep)
    .filter((segment) => !isRouteGroup(segment));

  if (routeSegments.some(shouldSkipSegment)) {
    return null;
  }

  return `/${routeSegments.join("/")}`;
}

function collectPageRoutes(directory: string, routes = new Set<string>()) {
  if (!existsSync(directory)) {
    return routes;
  }

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name) && !shouldSkipSegment(entry.name)) {
        collectPageRoutes(entryPath, routes);
      }
      continue;
    }

    if (entry.isFile() && entry.name === pageFileName) {
      const route = pageFileToRoute(entryPath);
      if (route) {
        routes.add(route);
      }
    }
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const discoveredRoutes = collectPageRoutes(appDirectory);
  const pageByPath = new Map(primarySeoPages.map((page) => [page.path, page]));
  const orderedRoutes = [
    ...primarySeoPages.map((page) => page.path),
    ...Array.from(discoveredRoutes)
      .filter((route) => !pageByPath.has(route))
      .sort(),
  ];
  const now = new Date();

  return orderedRoutes.map((route) => {
    const page = pageByPath.get(route);
    const routeDirectory = join(appDirectory, route === "/" ? "" : route);
    const lastModified = existsSync(routeDirectory)
      ? statSync(routeDirectory).mtime
      : now;

    return {
      url: absoluteUrl(route),
      lastModified,
      changeFrequency: page?.changeFrequency ?? "monthly",
      priority: page?.priority ?? 0.5,
    };
  });
}
