import { create } from "zustand"

type OrderFilter = {
  status: string
  dateRange: [Date | null, Date | null]
  search: string
}

type OrderState = {
  filters: OrderFilter
  setFilters: (filters: Partial<OrderFilter>) => void
  resetFilters: () => void
}

export const useOrderStore = create<OrderState>((set) => ({
  filters: {
    status: "",
    dateRange: [null, null],
    search: "",
  },
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: { status: "", dateRange: [null, null], search: "" } }),
})) 