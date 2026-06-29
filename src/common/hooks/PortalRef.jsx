import {use, useEffect, useState} from 'react';
import {PortalContext} from '@/common/contexts/PortalContext';

function usePortalRef() {
  const portalRef = use(PortalContext);
  const [ref, setRef] = useState(portalRef);

  useEffect(() => {
    setRef(portalRef);
  }, [portalRef]);

  return ref;
}

export default usePortalRef;
