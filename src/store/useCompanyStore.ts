import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CompanyEntity {
  id: string;
  name: string;
  legalName?: string;
  code: string;
  currency: string;
  companyType: string;
  enabledModules?: string[];
  isHoldingCompany?: boolean;
}

export const DEFAULT_COMPANIES: CompanyEntity[] = [
  {
    id: "COMP-HST-01",
    name: "Hostel Pro Residential Campus",
    legalName: "Hostel Pro Enterprise Campus Housing Ltd.",
    code: "HST-01",
    currency: "USD",
    companyType: "hostel_campus",
    enabledModules: ["rooms", "mess", "security", "accounting", "hr", "maintenance", "advising", "wages"],
  },
  {
    id: "COMP-ENG-02",
    name: "Institute of Engineering & Tech",
    legalName: "Apex Institute of Engineering & Technology",
    code: "ENG-02",
    currency: "USD",
    companyType: "university",
    enabledModules: ["academics", "research", "accounting", "hr", "lms"],
  },
  {
    id: "COMP-SCM-03",
    name: "Central Campus Supply Chain Ltd.",
    legalName: "Apex Supply Chain & Logistics Services Ltd.",
    code: "SCM-03",
    currency: "USD",
    companyType: "supply_chain",
    enabledModules: ["procurement", "inventory", "transport", "accounting"],
  },
  {
    id: "COMP-FAC-04",
    name: "Hostel & Facility Services Ltd.",
    legalName: "Apex Campus Residential Life Services Ltd.",
    code: "FAC-04",
    currency: "USD",
    companyType: "facilities",
    enabledModules: ["rooms", "mess", "security", "maintenance", "laundry", "accounting"],
  },
  {
    id: "COMP-FND-05",
    name: "University Endowment Foundation",
    legalName: "Apex Higher Education Endowment Foundation Inc.",
    code: "FND-05",
    currency: "USD",
    companyType: "foundation",
    isHoldingCompany: true,
    enabledModules: ["accounting", "scholarships", "audit", "reports"],
  },
];

interface CompanyState {
  companies: CompanyEntity[];
  activeCompany: CompanyEntity | null;
  isConsolidated: boolean;
  setActiveCompany: (c: CompanyEntity) => void;
  setConsolidatedView: () => void;
  setCompanies: (list: CompanyEntity[]) => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      companies: DEFAULT_COMPANIES,
      activeCompany: DEFAULT_COMPANIES[0],
      isConsolidated: false,
      setActiveCompany: (c) => set({ activeCompany: c, isConsolidated: false }),
      setConsolidatedView: () => set({ isConsolidated: true }),
      setCompanies: (list) => set({ companies: list }),
    }),
    {
      name: "hostelpro-company-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
