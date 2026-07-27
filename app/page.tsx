import { Dashboard } from "@/components/dashboard";
import { COUNTRY_GROUPS, COUNTRY_OPTIONS } from "@/lib/countries";

export default function Home() {
  return <Dashboard countryOptions={COUNTRY_OPTIONS} countryGroups={COUNTRY_GROUPS} />;
}
