import { create } from 'zustand';

interface BranchState {
  selectedBranchId: number | null;
  setSelectedBranchId: (id: number | null) => void;
}

export const useBranchStore = create<BranchState>((set) => ({
  selectedBranchId: null,
  setSelectedBranchId: (id) => set({ selectedBranchId: id }),
}));
