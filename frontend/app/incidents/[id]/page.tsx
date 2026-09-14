import AppShell from "@/components/app-shell";

interface IncidentPageProps {
  params: Promise<{ id: string }>;
}

export default async function IncidentPage({ params }: IncidentPageProps) {
  const { id } = await params;
  return <AppShell initialSection="incidents" initialIncidentId={id} />;
}