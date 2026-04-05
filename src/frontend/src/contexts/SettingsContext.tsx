import { createContext, useContext, useState } from "react";

type WeightUnit = "kg" | "lbs";
type DistanceUnit = "km" | "miles";

interface SettingsContextValue {
  language: string;
  setLanguage: (lang: string) => void;
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>(
    () => localStorage.getItem("vitaflow-language") || "en",
  );
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>(
    () => (localStorage.getItem("vitaflow-weight-unit") as WeightUnit) || "kg",
  );
  const [distanceUnit, setDistanceUnitState] = useState<DistanceUnit>(
    () =>
      (localStorage.getItem("vitaflow-distance-unit") as DistanceUnit) || "km",
  );

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("vitaflow-language", lang);
  };

  const setWeightUnit = (unit: WeightUnit) => {
    setWeightUnitState(unit);
    localStorage.setItem("vitaflow-weight-unit", unit);
  };

  const setDistanceUnit = (unit: DistanceUnit) => {
    setDistanceUnitState(unit);
    localStorage.setItem("vitaflow-distance-unit", unit);
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        weightUnit,
        setWeightUnit,
        distanceUnit,
        setDistanceUnit,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
