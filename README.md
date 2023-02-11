# ng-keyboard-sort

[![CI](https://github.com/johnhwhite/ng-keyboard-sort/actions/workflows/ci.yml/badge.svg)](https://github.com/johnhwhite/ng-keyboard-sort/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/ng-keyboard-sort/latest?label=ng-keyboard-sort)](https://www.npmjs.com/package/ng-keyboard-sort)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/fork/github/johnhwhite/ng-keyboard-sort?file=apps%2Fe2e%2Fsrc%2Fapp%2Fexample%2Fexample.component.html)

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
