import { InjectionToken } from '@angular/core';

/**
 * Announcements read out by a screen reader as an item is picked up, moved,
 * and dropped. Provide `KEYBOARD_SORT_A11Y_MESSAGES` to localize them or to
 * change their wording.
 */
export interface KeyboardSortA11yMessages {
  grabbed(label: string, index: number, size: number): string;
  moved(label: string, index: number, size: number): string;
  dropped(label: string, index: number, size: number): string;
}

const DEFAULT_KEYBOARD_SORT_A11Y_MESSAGES: KeyboardSortA11yMessages = {
  grabbed: (label, index, size) =>
    `${label}. Grabbed. Position ${index + 1} of ${size}.`,
  moved: (label, index, size) => `${label}. Position ${index + 1} of ${size}.`,
  dropped: (label, index, size) =>
    `${label}. Dropped. Final position ${index + 1} of ${size}.`,
};

export const KEYBOARD_SORT_A11Y_MESSAGES =
  new InjectionToken<KeyboardSortA11yMessages>('KeyboardSortA11yMessages', {
    providedIn: 'root',
    factory: () => DEFAULT_KEYBOARD_SORT_A11Y_MESSAGES,
  });
