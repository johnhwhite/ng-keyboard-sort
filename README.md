# ng-keyboard-sort

Library to add keyboard commands for elements that also use CDK drag and drop sorting. This library intends to provide parity for picking up an element with the keyboard, moving it up and down the list, and dropping it in place.

## Directives

### kbdSortList

#### Input: kbdSortListOrientation

Either `horizontal` or `vertical`.

#### Input: kbdSortListDisabled

Whether the list is disabled.

### kbdSortItem

### kbdSortHandle

Focusable element that is used to grab the item.

## Commands

This directive will listen for the following keyboard commands:

### Space / Enter

Select the item to begin moving it, or if already selected, move it to the new position.

### Escape

Deselect the item.

### Arrow Keys

Move the selected item up or down (vertical) or left or right (horizontal).
