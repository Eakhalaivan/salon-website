import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService, type BranchDto } from '../../api/services/branchService';

export const useBranchesQuery = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BranchDto) => branchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    }
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BranchDto }) => branchService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    }
  });
};
