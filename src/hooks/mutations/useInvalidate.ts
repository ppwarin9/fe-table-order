import { useQueryClient, type QueryKey } from '@tanstack/react-query';

/** Shared "invalidate these query keys on mutation success" factory — every domain's
 *  mutation file used to hand-roll its own near-identical useInvalidateX() for this. */
export function useInvalidate(...queryKeys: QueryKey[]) {
  const queryClient = useQueryClient();
  return () => {
    queryKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
  };
}
