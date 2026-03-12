import { useDevelopment } from "@/contexts/DevelopmentContext";
import { developments } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

export default function DevelopmentSelector() {
  const { selectedDevId, setSelectedDevId } = useDevelopment();

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select value={selectedDevId} onValueChange={setSelectedDevId}>
        <SelectTrigger className="w-[220px] h-9 text-sm">
          <SelectValue placeholder="Seleccionar desarrollo" />
        </SelectTrigger>
        <SelectContent>
          {developments.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
