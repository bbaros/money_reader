# Matt Levine Email Reader

A React application that helps users read Matt Levine's "Money Stuff" emails by providing a two-pane layout with main content on top and footnotes on the bottom, both scrollable independently.

## How to Use

1.  **Paste Email HTML**: Open the application. You will see a text area where you can paste the raw HTML content of a Matt Levine "Money Stuff" email.
2.  **Parse Email**: Click the "Parse Email" button. The application will process the HTML.
3.  **Read with Two-Pane View**: The application will display the email in a two-pane layout:
    *   The main content of the email appears in the top pane.
    *   Footnotes appear in the bottom pane.
    *   Both panes are independently scrollable.
4.  **Interactive Footnotes**: Click on a footnote reference (e.g., `[1]`) in the main content. The corresponding footnote will be automatically scrolled into view and highlighted in the bottom pane.

## Features

*   **Two-Pane Layout**: Displays email content and footnotes in separate, independently scrollable panes for easy reading.
*   **Interactive Footnote System**: Clickable footnote references in the main text navigate directly to the corresponding footnote, which is then highlighted.
*   **HTML Parsing**: Parses raw HTML from Matt Levine's "Money Stuff" emails to extract main content and footnotes.
*   **Responsive Design**: Adapts to different screen sizes, stacking panes vertically on mobile devices for optimal viewing.
*   **MUI Components**: Utilizes Material-UI for a clean and modern user interface.

## Technology Stack

*   **Frontend**: Vite + React 18 + TypeScript
*   **UI Library**: Material-UI (MUI) v5
*   **Build Tool**: Vite
*   **Package Manager**: npm

## Project Structure

The project follows a standard Vite + React application structure:

```
mattreader/
├── public/             # Static assets
├── src/                # Application source code
│   ├── components/     # React components
│   ├── utils/          # Utility functions (e.g., emailParser.ts)
│   ├── hooks/          # Custom React hooks
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Entry point of the application
│   └── index.css       # Global styles
├── tests/              # Test files
├── .gitignore          # Files ignored by Git
├── ARCHITECTURE_PLAN.md # Detailed architecture document
├── index.html          # Main HTML file
├── package.json        # Project metadata and dependencies
├── tsconfig.json       # TypeScript compiler options
└── vite.config.ts      # Vite configuration
```
For a more detailed component architecture, see the `ARCHITECTURE_PLAN.md` file.

## Getting Started / Development

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js and npm (Node Package Manager) must be installed on your system.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/mattreader.git 
    ```
    (Replace `your-username` with the actual username or organization if this is a remote repository. If it's local, you might skip this or adjust.)

2.  **Navigate to the project directory:**
    ```sh
    cd mattreader
    ```

3.  **Install NPM packages:**
    ```sh
    npm install
    ```

### Running the Development Server

To start the development server and view the application in your browser:

```sh
npm run dev
```

This will typically open the application at `http://localhost:5173` (Vite's default) or another port if specified. Check your terminal output for the exact address.

## Testing

This project includes tests for the email parsing functionality.

### Automated Parser Test

The primary automated test validates the email parsing logic. It checks if footnotes are correctly identified and extracted.

To run this test:
```sh
npm run test:parser
```
This command executes the `tests/test_parser.js` script.

### Manual End-to-End Testing

For manual testing of the user interface and overall application flow:

1.  Start the development server:
    ```sh
    npm run dev
    ```
2.  Open the application in your browser.
3.  Use sample email HTML (e.g., from `tests/test_email.html` or the examples in `tests/test_parser.js`) to paste into the input field.
4.  Verify that the email parses correctly, the two-pane layout works as expected, and footnote interactions (clicking, scrolling, highlighting) are functional.

For more detailed testing information, including specific checks and how to use the browser console for tests, please refer to the `tests/README.md` file.
