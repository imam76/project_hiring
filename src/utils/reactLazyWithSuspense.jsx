import Loader from '@/blocs/Loader';
import { Suspense, lazy } from 'react';

const ReactLazyWithSuspense = (importFunc) => {
  const LazyComponent = lazy(importFunc);

  return (
    <Suspense fallback={<Loader />}>
      <LazyComponent />
    </Suspense>
  );
};

export default ReactLazyWithSuspense;
