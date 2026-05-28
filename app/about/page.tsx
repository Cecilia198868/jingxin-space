import type { Metadata } from "next";
import JingxinApp from "../JingxinApp";
import { createPageMetadata, seoPages } from "../seo";

export const metadata: Metadata = createPageMetadata(seoPages.about);

export default function AboutPage() {
  return <JingxinApp />;
}
