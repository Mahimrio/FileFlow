import { Hero } from "@/components/marketing/hero";
import { FormatsGrid } from "@/components/marketing/formats-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <FormatsGrid />
      <HowItWorks />
    </div>
  );
}
