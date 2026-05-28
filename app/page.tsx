import type { Metadata } from "next";
import JingxinApp from "./JingxinApp";
import { createPageMetadata, seoPages } from "./seo";

export const metadata: Metadata = createPageMetadata(seoPages.home);

export default function Page() {
  return <JingxinApp />;
}
