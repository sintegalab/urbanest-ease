import AppLayout from "@/components/AppLayout";
import { Construction } from "lucide-react";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="rounded-2xl bg-accent p-6 mb-4">
          <Construction className="h-10 w-10 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Este módulo está en desarrollo. Próximamente estará disponible con toda la funcionalidad necesaria.
        </p>
      </div>
    </AppLayout>
  );
}
