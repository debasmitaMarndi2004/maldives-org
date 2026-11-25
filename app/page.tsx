import HomeSections from "@/components/home-sections";
import { getPublishedSite } from "@/lib/public-content";

export default async function HomePage() {
  const { hero, homeSections, serviceDescriptions } = await getPublishedSite();
  return <HomeSections hero={hero} homeSections={homeSections} serviceDescriptions={serviceDescriptions} />;
}
