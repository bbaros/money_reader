// Test script for the email parser
// This script tests the Matt Levine email parsing functionality

// Since this is a Vite project, we need to create a simple test
// that can be run using the development server's build system

// Test email content with Matt Levine footnote format
const testEmailHtml = `
<html>
<body>
<div>
<p>This is a test email with footnotes. Here is footnote reference [6] and another one [7].</p>
<p>More content with footnote [8] and [9].</p>
</div>

<div id="m_2112239859843597646footnote-6" style="font-style: italic;">
<p>[6] I mean, Elon Musk keeps taking new jobs, but that is a very special case.</p>
</div>
<div id="m_2112239859843597646footnote-7" style="font-style: italic;">
<p>[7] I am assuming that this is a small and simple software startup and there are no liabilities.</p>
</div>
<div id="m_2112239859843597646footnote-8" style="font-style: italic;">
<p>[8] "In a seven-figure deal," you could add, though I'm not sure that's even impressive these days.</p>
</div>
<div id="m_2112239859843597646footnote-9" style="font-style: italic;">
<p>[9] "It could not possibly be material to them financially" and "doing this would undermine the signal value of getting acquired by Google."</p>
</div>
</body>
</html>
`;

// Simple test functions that can be copy-pasted into browser console
function runTestInBrowser() {
    console.log('Testing Matt Levine Email Parser in Browser...\n');

    // This test should be run in the browser console when the app is loaded
    // Copy and paste this function into the browser dev tools console

    if (typeof window === 'undefined') {
        console.log('❌ This test should be run in the browser console');
        console.log('Instructions:');
        console.log('1. Open the app in browser (http://localhost:5173)');
        console.log('2. Open developer tools (F12)');
        console.log('3. Copy and paste the runTestInBrowser function into console');
        console.log('4. Call runTestInBrowser()');
        return;
    }

    // Test data
    const testContent = testEmailHtml;

    console.log('Test email content:');
    console.log(testContent);

    console.log('\nInstructions to test manually:');
    console.log('1. Paste the above test content into the email input field');
    console.log('2. Click "Parse Email"');
    console.log('3. Verify that:');
    console.log('   - Main content shows: "This is a test email with footnotes..."');
    console.log('   - Footnotes panel shows "4 footnotes found"');
    console.log('   - Footnotes [6], [7], [8], [9] are displayed in the bottom panel');
    console.log('   - Main content does NOT contain footnote definitions');
}

function validateParserLogic() {
    console.log('Parser Logic Validation\n');

    // Basic regex tests that can run in Node.js
    const footnoteRegex = /<div[^>]*id\s*=\s*["'][^"']*footnote-(\d+)["'][^>]*>(.*?)<\/div>/gis;

    let matches = [];
    let match;
    footnoteRegex.lastIndex = 0; // Reset regex

    while ((match = footnoteRegex.exec(testEmailHtml)) !== null) {
        const id = parseInt(match[1], 10);
        const content = match[2];
        matches.push({ id, content });
    }

    console.log(`✅ Regex found ${matches.length} footnotes`);

    matches.forEach(m => {
        // Strip HTML tags from content
        const cleanContent = m.content.replace(/<[^>]*>/g, '').trim();
        console.log(`[${m.id}] ${cleanContent}`);
    });

    // Validate expected results
    const expectedIds = [6, 7, 8, 9];
    const foundIds = matches.map(m => m.id).sort((a, b) => a - b);

    if (JSON.stringify(expectedIds) === JSON.stringify(foundIds)) {
        console.log('✅ All expected footnote IDs found');
    } else {
        console.log('❌ Footnote ID mismatch');
        console.log(`Expected: [${expectedIds.join(', ')}]`);
        console.log(`Found: [${foundIds.join(', ')}]`);
    }
}

// Export for potential use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testEmailHtml,
        runTestInBrowser,
        validateParserLogic
    };
}

// Run validation if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    validateParserLogic();
}

console.log('Matt Levine Email Parser Test Suite');
console.log('=====================================');
console.log('');
console.log('To test the parser:');
console.log('1. Run: npm run dev');
console.log('2. Open browser to http://localhost:5173');
console.log('3. Paste test content and verify parsing works');
console.log('');
console.log('For regex validation, run: node tests/test_parser.js');
console.log('');

// Run the regex validation
validateParserLogic();