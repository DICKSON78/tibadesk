import { useEffect, useState } from 'react';

const EMPTY = {
  editions: [],
  sharedModules: [],
  modules: [],
  allModules: null,
  licenceTerms: [],
  deployment: [],
  nonFunctional: [],
  loading: true,
  error: null,
};

/**
 * Fetches the published package catalogue from the server so the modules,
 * licence terms and deployment commitments are never hard-coded in the
 * marketing site. The catalogue carries no monetary figures: prices are
 * quoted by the team.
 */
export function useCatalogue() {
  const [state, setState] = useState(EMPTY);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/packages', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Catalogue request failed with ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        setState({
          editions: data.editions ?? [],
          sharedModules: data.shared_modules ?? [],
          modules: data.modules ?? [],
          allModules: data.all_modules ?? null,
          licenceTerms: data.licence_terms ?? [],
          deployment: data.deployment ?? [],
          nonFunctional: data.non_functional ?? [],
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return;
        }

        setState({ ...EMPTY, loading: false, error });
      });

    return () => controller.abort();
  }, []);

  return state;
}
