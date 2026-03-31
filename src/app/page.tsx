import { API_BASE } from "@/app/lib/api";
import { HomePageClient } from "@/app/home-page-client";

export default function Page() {
  return <HomePageClient apiBaseLabel={API_BASE} />;
}
