import { useContext } from 'react';
import { CardPreviewContext } from './card-preview-state';

// Returns the current card preview image URL and setter from context.
export function useCardPreview() {
  return useContext(CardPreviewContext);
}
