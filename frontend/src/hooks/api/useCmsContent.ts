import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

export interface CmsContentBlock {
  id: number;
  pageKey: string;
  blockKey: string;
  contentType: 'TEXT' | 'RICH_TEXT' | 'IMAGE_URL';
  contentValue: string;
  updatedBy: number;
  updatedAt: string;
}

const fetchPageContent = async (pageKey: string): Promise<Record<string, CmsContentBlock>> => {
  const { data } = await axiosClient.get(`/cms/${pageKey}`);
  const blocks: Record<string, CmsContentBlock> = {};
  data.forEach((block: CmsContentBlock) => {
    blocks[block.blockKey] = block;
  });
  return blocks;
};

export const useCmsContent = (pageKey: string) => {
  return useQuery({
    queryKey: ['cms', pageKey],
    queryFn: () => fetchPageContent(pageKey),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateCmsContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pageKey, blockKey, contentValue }: { pageKey: string, blockKey: string, contentValue: string }) => {
      const { data } = await axiosClient.put(`/cms/${pageKey}/${blockKey}`, { contentValue });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cms', data.pageKey] });
    },
  });
};
