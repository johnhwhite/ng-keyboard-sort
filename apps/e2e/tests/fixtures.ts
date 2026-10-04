import { AxeBuilder } from '@axe-core/playwright';
import { expect, test as base } from '@playwright/test';

type Violation = Awaited<
  ReturnType<AxeBuilder['analyze']>
>['violations'][number];

const BLOCKING_IMPACTS = ['serious', 'critical'];

function formatViolations(violations: Violation[]): string {
  return violations
    .map((violation) => {
      const header = `[${violation.impact}] ${violation.id}: ${violation.help}\n  ${violation.helpUrl}`;
      const nodes = violation.nodes.map((node) => {
        const target = node.target
          .map((selector) =>
            Array.isArray(selector) ? selector.join(' >>> ') : selector
          )
          .join(' >>> ');
        const summary = (node.failureSummary ?? '')
          .split('\n')
          .map((line) => `      ${line.trim()}`)
          .join('\n');
        return `  - Target: ${target}\n    HTML:   ${node.html}\n${summary}`;
      });
      return [header, ...nodes].join('\n');
    })
    .join('\n\n');
}

/**
 * Extends the Playwright `test` with an automatic accessibility check that
 * runs axe against the page's final state after every test and fails on
 * serious or critical violations.
 */
export const test = base.extend<{ axe: void }>({
  axe: [
    async ({ page }, use, testInfo) => {
      await use();
      if (
        testInfo.status !== testInfo.expectedStatus ||
        page.url() === 'about:blank'
      ) {
        return;
      }
      const { violations } = await new AxeBuilder({ page }).analyze();
      const blocking = violations.filter(
        (v) => !!v.impact && BLOCKING_IMPACTS.includes(v.impact)
      );
      const report = formatViolations(blocking);
      if (blocking.length) {
        console.error(report);
        await testInfo.attach('axe-violations', {
          body: report,
          contentType: 'text/plain',
        });
      }
      expect(
        blocking.map((v) => v.id),
        report
      ).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
