import { describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { KeyboardSortListFixtureComponent } from './fixtures/keyboard-sort-list-fixture.component';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import {
  KEYBOARD_SORT_A11Y_MESSAGES,
  KeyboardSortA11yMessages,
} from './keyboard-sort-a11y-messages';

describe('ListDirective a11y', () => {
  const getItem = (
    fixture: ComponentFixture<KeyboardSortListFixtureComponent>,
    index: number
  ): KeyboardSortItemDirective => fixture.componentInstance.items()[index];

  function setupTest(announceMessages?: Partial<KeyboardSortA11yMessages>): {
    fixture: ComponentFixture<KeyboardSortListFixtureComponent>;
    announce: string[];
  } {
    const announce: string[] = [];
    TestBed.configureTestingModule({
      imports: [KeyboardSortListFixtureComponent],
      providers: [
        {
          provide: LiveAnnouncer,
          useValue: {
            announce: (message: string) => {
              announce.push(message);
              return Promise.resolve();
            },
          },
        },
        ...(announceMessages
          ? [
              {
                provide: KEYBOARD_SORT_A11Y_MESSAGES,
                useValue: {
                  grabbed: () => 'custom grabbed',
                  moved: () => 'custom moved',
                  dropped: () => 'custom dropped',
                  ...announceMessages,
                },
              },
            ]
          : []),
      ],
    });
    const fixture = TestBed.createComponent(KeyboardSortListFixtureComponent);
    fixture.detectChanges();
    return { fixture, announce };
  }

  it('announces grab, move, and drop with the default messages', async () => {
    const { fixture, announce } = setupTest();
    getItem(fixture, 0).activate();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(announce).toEqual(['Item 1. Grabbed. Position 1 of 3.']);

    fixture.componentInstance.list()?.moveItemDown(getItem(fixture, 0));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(announce).toEqual([
      'Item 1. Grabbed. Position 1 of 3.',
      'Item 1. Position 2 of 3.',
    ]);

    fixture.componentInstance.list()?.deactivateAll();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(announce).toEqual([
      'Item 1. Grabbed. Position 1 of 3.',
      'Item 1. Position 2 of 3.',
      'Item 1. Dropped. Final position 2 of 3.',
    ]);
  });

  it('uses a custom KEYBOARD_SORT_A11Y_MESSAGES provider', async () => {
    const { fixture, announce } = setupTest({
      grabbed: () => 'custom grabbed',
    });
    getItem(fixture, 0).activate();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(announce).toEqual(['custom grabbed']);
  });

  it('reflects aria-disabled from item-level and list-level disabling', async () => {
    const { fixture } = setupTest();
    const item = getItem(fixture, 0);
    expect(
      item.elementRef.nativeElement.getAttribute('aria-disabled')
    ).toBeNull();

    item.kbdSortItemDisabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(item.elementRef.nativeElement.getAttribute('aria-disabled')).toBe(
      'true'
    );

    item.kbdSortItemDisabled.set(false);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(item.elementRef.nativeElement.getAttribute('aria-disabled')).toBe(
      'true'
    );
  });

  it('keeps exactly one item as the roving tab stop', async () => {
    const { fixture } = setupTest();
    const tabbable = () =>
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'li[tabindex="0"]'
      );
    expect(tabbable().length).toBe(1);
    expect(tabbable()[0].textContent?.trim()).toBe('Item 1');

    fixture.componentInstance.list()?.focusNextItem(getItem(fixture, 0));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(tabbable().length).toBe(1);
    expect(tabbable()[0].textContent?.trim()).toContain('Item 2');
  });

  it('removes the roving tab stop entirely while the list is disabled', async () => {
    const { fixture } = setupTest();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'li[tabindex="0"]'
      ).length
    ).toBe(0);
  });

  it('restores focus after data arrives on a later tick, with no forced change detection', async () => {
    const { fixture } = setupTest();
    getItem(fixture, 0).activate();
    fixture.detectChanges();
    await fixture.whenStable();

    await new Promise((resolve) => setTimeout(resolve));
    fixture.componentInstance.list()?.moveItemDown(getItem(fixture, 0));
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.data()).toEqual([
      'Item 2',
      'Item 1',
      'Item 3',
    ]);
    expect(getItem(fixture, 1).activated()).toBe(true);
  });
});
