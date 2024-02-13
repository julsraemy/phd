document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('pre code').forEach(function(codeBlock) {
        // Normalize line breaks to Unix style for consistent handling
        let codeText = codeBlock.textContent.replace(/\r\n?/g, '\n');
        let lines = codeText.split('\n');
        
        // Remove an empty line at the end if it exists
        if (lines[lines.length - 1] === '') {
            lines.pop();
        }

        let lineNumbersContainer = document.createElement('div');
        lineNumbersContainer.className = 'line-numbers-container';
        lineNumbersContainer.style.position = 'absolute';
        lineNumbersContainer.style.left = '0';
        lineNumbersContainer.style.top = '0';
        lineNumbersContainer.style.textAlign = 'right';
        lineNumbersContainer.style.paddingRight = '10px'; // Space between numbers and code
        lineNumbersContainer.style.userSelect = 'none'; // Prevent selection of line numbers
        // Ensure the container's height matches the code block's height for proper alignment
        lineNumbersContainer.style.height = '100%';

        // Create a span for each line number
        let lineNumbersHTML = '';
        for (let i = 1; i <= lines.length; i++) {
            let lineNumberSpan = document.createElement('span');
            lineNumberSpan.textContent = `${i}`;
            lineNumberSpan.style.display = 'block'; // Each number on its own line
            lineNumberSpan.style.lineHeight = 'inherit'; // Inherit line height from parent
            lineNumbersContainer.appendChild(lineNumberSpan);
        }

        // Insert the line numbers container before the code block within the <pre> element
        codeBlock.parentNode.insertBefore(lineNumbersContainer, codeBlock);
        
        // Adjust the code block's padding-left to ensure it doesn't overlap the line numbers
        codeBlock.style.paddingLeft = '40px';
    });
});