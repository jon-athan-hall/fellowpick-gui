import { useContext } from 'react';
import { CardPreviewContext } from './card-preview-state';

export function useCardPreview() {
  return useContext(CardPreviewContext);
}
