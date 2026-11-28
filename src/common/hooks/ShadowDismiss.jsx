import {useDismiss, useFloating, useInteractions} from '@floating-ui/react';
import {useCallback} from 'react';
import isPressOn from '@/utils/press';

// a menu's dismiss inside the closed shadow root, which hides a press's path from the document, so it's placed by position
function useShadowDismiss(open, onOpenChange) {
  const {refs, context} = useFloating({open, onOpenChange});
  const isOutsidePress = useCallback(
    (event) => !isPressOn(refs.floating.current, event) && !isPressOn(refs.reference.current, event),
    [refs]
  );
  const dismiss = useDismiss(context, {outsidePress: isOutsidePress});
  const {getReferenceProps, getFloatingProps} = useInteractions([dismiss]);
  return {refs, getReferenceProps, getFloatingProps};
}

export default useShadowDismiss;
