import {use, useEffect, useState} from 'react';
import {PortalContext} from '@/common/contexts/PortalContext';

function usePortalRef() {
  const portalRef = use(PortalContext);
  const [ref, setRef] = useState(portalRef);

  useEffect(() => {
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- syncing the portal ref from context
    setRef(portalRef);
  }, [portalRef]);

  return ref;
}

export default usePortalRef;
