# ng-keyboard-sort

[![CI](https://github.com/johnhwhite/ng-keyboard-sort/actions/workflows/ci.yml/badge.svg)](https://github.com/johnhwhite/ng-keyboard-sort/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/ng-keyboard-sort/latest?label=ng-keyboard-sort)](https://www.npmjs.com/package/ng-keyboard-sort)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/fork/github/johnhwhite/ng-keyboard-sort?file=apps%2Fe2e%2Fsrc%2Fapp%2Fexample%2Fexample.component.html)

Library to add keyboard commands for elements that also use CDK drag and drop sorting. This library intends to provide parity for picking up an element with the keyboard, moving it up and down the list, and dropping it in place.

## Install

```bash
npm install ng-keyboard-sort
```

## Demo

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/fork/github/johnhwhite/ng-keyboard-sort?file=apps%2Fe2e%2Fsrc%2Fapp%2Fexample%2Fexample.component.html)

## Accessibility

`kbdSortList` items are announced to screen readers as they're grabbed, moved,
and dropped, via `LiveAnnouncer`. Provide `KEYBOARD_SORT_A11Y_MESSAGES` to
localize or reword the announcements:

```ts
providers: [
  {
    provide: KEYBOARD_SORT_A11Y_MESSAGES,
    useValue: {
      grabbed: (label, index, size) => `${label}, position ${index + 1} of ${size}, grabbed`,
      moved: (label, index, size) => `${label}, position ${index + 1} of ${size}`,
      dropped: (label, index, size) => `${label}, dropped, position ${index + 1} of ${size}`,
    },
  },
],
```

Point `[kbdSortListDescribedBy]` at an element (that you render) describing the
keyboard controls; it's reflected as `aria-describedby` on every item:

```html
<p id="sort-instructions">Press space to pick up an item, arrow keys to move it, and space again to drop it.</p>
<ul kbdSortList [kbdSortListDescribedBy]="'sort-instructions'" ...>
```

Items must be direct children of the `kbdSortList` element — `kbdSortItem`
uses `contentChildren` with `descendants: false`.

## Upgrading to v11

- **`kdbSortDrop` → `kbdSortDrop`.** The output was misspelled; update your
  template binding.
- **Roving tabindex.** The `<ul kbdSortList>` host no longer carries a
  `tabindex` in the natural tab order; the currently active `kbdSortItem`
  carries `tabindex="0"` instead (every other item is `-1`). Update any CSS
  selecting on the list's own `[tabindex]`.
- **`rxjs` is no longer a peer dependency.**
- **`KeyboardSortModule` is deprecated.** Import the standalone directives
  directly; the module will be removed in the next major version.

## GitHub

[johnhwhite/ng-keyboard-sort](https://github.com/johnhwhite/ng-keyboard-sort)
