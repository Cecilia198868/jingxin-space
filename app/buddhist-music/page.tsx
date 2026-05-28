import type { Metadata } from "next";
import JingxinApp from "../JingxinApp";
import { createPageMetadata, seoPages } from "../seo";

export const metadata: Metadata = createPageMetadata(seoPages.buddhistMusic);

export default function BuddhistMusicPage() {
  return <JingxinApp />;
}
