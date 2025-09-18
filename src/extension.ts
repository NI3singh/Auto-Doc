import * as vscode from 'vscode';
import * as diff from 'diff';
import * as path from 'path';
import puppeteer from 'puppeteer';

const lastSavedFileState = new Map<string, string>();
let autoDocStatusBarItem: vscode.StatusBarItem;
let isLoggingEnabled = true; // <-- State variable to track logging status

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, the extension "Auto-Doc" is now active!');

    // --- COMMAND 1: Open Log File ---
    const openLogCommand = vscode.commands.registerCommand('auto-doc.openLogFile', () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            const logFileName = `${workspaceFolder.name}_Documentation.md`;
            const logFileUri = vscode.Uri.joinPath(workspaceFolder.uri, logFileName);
            vscode.window.showTextDocument(logFileUri).then(null, () => {
                vscode.window.showInformationMessage('Auto-Doc log file does not exist yet. Save a file to create it.');
            });
        }
    });

    // --- COMMAND 2: Toggle Logging ---
    const toggleLoggingCommand = vscode.commands.registerCommand('auto-doc.toggleLogging', () => {
        isLoggingEnabled = !isLoggingEnabled; // Flip the boolean
        updateStatusBar(); // Update the icon and text
        vscode.window.showInformationMessage(`Auto-Doc logging is now ${isLoggingEnabled ? 'ON' : 'OFF'}`);
    });

    // --- NEW COMMAND: Export to PDF ---
    const exportToPdfCommand = vscode.commands.registerCommand('auto-doc.exportToPdf', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('Auto-Doc: Please open a folder to export a PDF.');
            return;
        }

        const logFileName = `${workspaceFolder.name}_Documentation.md`;
        const logFileUri = vscode.Uri.joinPath(workspaceFolder.uri, logFileName);
        const pdfFileUri = vscode.Uri.joinPath(workspaceFolder.uri, `${workspaceFolder.name}_Documentation.pdf`);

        try {
            // Show a progress indicator
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Auto-Doc: Generating PDF...",
                cancellable: false
            }, async (progress) => {
                // Read the Markdown file
                const { marked } = await import('marked');
                const markdownContentBytes = await vscode.workspace.fs.readFile(logFileUri);
                const markdownContent = Buffer.from(markdownContentBytes).toString('utf-8');

                // Convert Markdown to HTML
                const htmlContent = marked.parse(markdownContent);
                
                // Add some basic styling to make it look good
                const styledHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: sans-serif; padding: 2em; }
                            h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                            pre { background-color: #f4f4f4; padding: 1em; border-radius: 5px; white-space: pre-wrap; }
                            code { font-family: monospace; }
                        </style>
                    </head>
                    <body>
                        ${htmlContent}
                    </body>
                    </html>
                `;

                // Use Puppeteer to create the PDF
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
                await page.pdf({ path: pdfFileUri.fsPath, format: 'A4' });
                await browser.close();

                vscode.window.showInformationMessage(`Successfully exported PDF to: ${path.basename(pdfFileUri.fsPath)}`);
            });
        } catch (error) {
            vscode.window.showErrorMessage('Auto-Doc: Could not generate PDF. Is the log file empty?');
            console.error(error);
        }
    });

    // --- STATUS BAR ---
    autoDocStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    autoDocStatusBarItem.command = 'auto-doc.toggleLogging'; // Make the status bar item clickable
    context.subscriptions.push(autoDocStatusBarItem);
    updateStatusBar(); // Set the initial state

    // --- EVENT LISTENERS ---
    const onDidOpen = vscode.workspace.onDidOpenTextDocument(document => {
        if (document.uri.scheme === 'file') {
            lastSavedFileState.set(document.uri.toString(), document.getText());
        }
    });

    const onDidSave = vscode.workspace.onDidSaveTextDocument(document => {
        if (!isLoggingEnabled) {
            return;
        } // <-- Check if logging is enabled

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }
        const logFileName = `${workspaceFolder.name}_Documentation.md`;

        if (document.fileName.endsWith(logFileName)) {
            return;
        }

        const documentUri = document.uri.toString();
        const contentAfter = document.getText();
        
        if (lastSavedFileState.has(documentUri)) {
            const contentBefore = lastSavedFileState.get(documentUri)!;
            
            if (contentBefore !== contentAfter) {
                const changes = diff.diffLines(contentBefore, contentAfter);
                let logEntry = '';
                let lineNumber = 1;

                changes.forEach(part => {
                    // if (part.added || part.removed) {
                    //     const prefix = part.added ? 'ADDED' : 'REMOVED';
                    //     const formattedValue = part.value.split('\n').map(line => `    ${line}`).join('\n');
                    //     logEntry += `**[${prefix}]**\n\`\`\`\n${formattedValue}\n\`\`\`\n`;
                    // }
                    const lineCount = (part.value.match(/\n/g) || []).length;
                
                    if (part.added) {
                        const lines = part.value.replace(/\n$/, '').split('\n');
                        // Prepend the line number to each added line
                        const formattedValue = lines.map(line => `${(lineNumber++).toString().padEnd(5)} ${line}`).join('\n');
                        logEntry += `**[ADDED]**\n\`\`\`\n${formattedValue}\n\`\`\`\n`;
                    } else if (part.removed) {
                        // For removed lines, just note where they were removed from
                        const formattedValue = `(from line ~${lineNumber})\n` + part.value;
                        logEntry += `**[REMOVED]**\n\`\`\`\n${formattedValue}\n\`\`\`\n`;
                    } else {
                        // For unchanged parts, just advance the line counter
                        lineNumber += lineCount;
                    }
                });

                if (logEntry) {
                    const fullPath = document.uri.fsPath;
                    const timestamp = new Date().toLocaleString();
                    const finalLog = `### 📄 ${fullPath}\n*Saved at: ${timestamp}*\n\n${logEntry}\n---\n\n`;
                    
                    writeToLogFile(finalLog, logFileName);
                }
            }
        }
        
        lastSavedFileState.set(documentUri, contentAfter);
    });

    const onDidClose = vscode.workspace.onDidCloseTextDocument(document => {
        lastSavedFileState.delete(document.uri.toString());
    });

    context.subscriptions.push(
        openLogCommand, 
        toggleLoggingCommand,
        exportToPdfCommand,
        onDidOpen, 
        onDidSave, 
        onDidClose
    );
}

function updateStatusBar(): void {
    if (isLoggingEnabled) {
        autoDocStatusBarItem.text = `$(file-text) Auto-Doc: ON`;
        autoDocStatusBarItem.tooltip = "Auto-Doc is active | Click to disable";
        autoDocStatusBarItem.color = '#32CD32'; // Green
    } else {
        autoDocStatusBarItem.text = `$(file-zip) Auto-Doc: OFF`;
        autoDocStatusBarItem.tooltip = "Auto-Doc is disabled | Click to enable";
        autoDocStatusBarItem.color = '#FF4500'; // Orange-Red
    }
    autoDocStatusBarItem.show();
}

async function writeToLogFile(logEntry: string, logFileName: string) {
    if (vscode.workspace.workspaceFolders) {
        const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
        const logFileUri = vscode.Uri.joinPath(workspaceFolder, logFileName);
        
        try {
            let existingContentBytes = await vscode.workspace.fs.readFile(logFileUri);
            let existingContent = Buffer.from(existingContentBytes).toString('utf-8');
            const newContent = logEntry + existingContent;
            await vscode.workspace.fs.writeFile(logFileUri, Buffer.from(newContent, 'utf-8'));
        } catch (error) {
            await vscode.workspace.fs.writeFile(logFileUri, Buffer.from(logEntry, 'utf-8'));
        }
    }
}

export function deactivate() {}