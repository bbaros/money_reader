# Notes for Future Agents

This document contains important notes for any agent working on this codebase.

## Development Process

1.  **Compilation and Build**: Before submitting any changes, please ensure that the code compiles and builds successfully. Use the following commands:
    *   `npx tsc`
    *   `npx vite build`

2.  **Testing with Playwright**: To visually inspect changes and ensure they are working as expected, please use Playwright.
    *   Run the tests with `npx playwright test`.
    *   If you need to debug, you can run the tests in headed mode with `npx playwright test --headed`. Note that this may not work in all environments.
    *   To get a better view of the application, you can use a wider viewport in your tests: `test.use({ viewport: { width: 1920, height: 1080 } });`
