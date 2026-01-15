# Testing the Matt Reader Application

This folder contains tests for the Matt Levine email parser functionality.

## Files

- `test_parser.js` - Main test script for validating the email parsing logic
- `test_email.html` - Sample email content for manual testing
- `README.md` - This documentation file

## Running Tests

### Automated Parser Logic Test

Run the parser logic validation test:

```bash
npm run test:parser
```

Or directly:

```bash
node tests/test_parser.js
```

This test validates:
- ✅ Regex patterns correctly identify Matt Levine footnotes
- ✅ All expected footnote IDs are found (6, 7, 8, 9)
- ✅ Footnote content is extracted properly

### Manual End-to-End Test

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open browser to http://localhost:5173

3. Copy and paste the test email content from `test_parser.js` into the input field

4. Click "Parse Email"

5. Verify:
   - ✅ Main content shows: "This is a test email with footnotes..."
   - ✅ Header shows "4 footnotes found"
   - ✅ Clicking footnote references [6], [7], [8], [9] displays their content in a popover
   - ✅ Main content does NOT contain footnote definitions

### Browser Console Test

For advanced testing, you can also run tests in the browser console:

1. Open the app in browser
2. Open developer tools (F12)
3. Copy the `runTestInBrowser` function from `test_parser.js`
4. Paste it into the console and call `runTestInBrowser()`

## Test Data

The test uses Matt Levine's typical footnote format:

```html
<div id="m_2112239859843597646footnote-6" style="font-style: italic;">
<p>[6] Footnote content here...</p>
</div>
```

This format includes:
- Gmail's unique message ID prefix
- Hyphen-separated footnote numbering
- Italic styling
- Paragraph tags within the div

## Expected Results

The parser should successfully:
1. Separate main email content from footnotes
2. Extract 4 footnotes (IDs: 6, 7, 8, 9)
3. Display footnotes in a popover when the reference is clicked
4. Remove footnote definitions from main content
5. Preserve footnote references [6], [7], etc. in main content
