import { useSearchParams } from "react-router";

export function useGlobalTerm() {
  const [searchParams] = useSearchParams();
  
  // Get the global term filter from URL
  const globalTermId = searchParams.get("globalTerm");
  
  return {
    globalTermId,
    isFilteringByTerm: globalTermId !== null,
    isShowingAllTerms: globalTermId === null
  };
}

