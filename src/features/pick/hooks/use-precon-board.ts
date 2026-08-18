import { useOutletContext } from 'react-router-dom';
import type { PreconBoardContext } from '../types';

/**
 * Reads the deck layout's outlet context from inside a CUT or ADD board.
 *
 * Exists so the cast to `PreconBoardContext` lives in one place rather than at
 * every consumer — `useOutletContext` is unchecked, and a board that guessed
 * the shape wrong would fail at runtime rather than in the type-checker.
 */
export function usePreconBoard(): PreconBoardContext {
  return useOutletContext<PreconBoardContext>();
}
