import lodash from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';

export function useDebouncedSearchParams(delay = 500) {
  const [searchParam, setSearchParams] = useSearchParams();

  const debouncedUpdate = useMemo(() => {
    return lodash.debounce((paramNameOrObject, value) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);

        if (
          typeof paramNameOrObject === 'object' &&
          paramNameOrObject !== null
        ) {
          for (const [key, val] of Object.entries(paramNameOrObject)) {
            if (val === null || val === '' || val === undefined) {
              params.delete(key);
            } else {
              params.set(key, String(val));
            }
          }
        } else if (typeof paramNameOrObject === 'string') {
          if (value === null || value === '' || value === undefined) {
            params.delete(paramNameOrObject);
          } else {
            params.set(paramNameOrObject, String(value));
          }
        }

        return params;
      });
    }, delay);
  }, [setSearchParams, delay]);

  const immediateUpdate = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const updateParam = (paramName, value) => {
    debouncedUpdate(paramName, value);
  };

  const clearAllParams = () => {
    debouncedUpdate.cancel();
    immediateUpdate();
  };

  return { searchParam, updateParam, clearAllParams };
}
