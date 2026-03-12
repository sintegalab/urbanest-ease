import { createContext, useContext, useState, ReactNode } from "react";
import { developments } from "@/data/mockData";

interface DevelopmentContextType {
  selectedDevId: string;
  setSelectedDevId: (id: string) => void;
}

const DevelopmentContext = createContext<DevelopmentContextType>({
  selectedDevId: developments[0]?.id || "",
  setSelectedDevId: () => {},
});

export function DevelopmentProvider({ children }: { children: ReactNode }) {
  const [selectedDevId, setSelectedDevId] = useState(developments[0]?.id || "");
  return (
    <DevelopmentContext.Provider value={{ selectedDevId, setSelectedDevId }}>
      {children}
    </DevelopmentContext.Provider>
  );
}

export const useDevelopment = () => useContext(DevelopmentContext);
