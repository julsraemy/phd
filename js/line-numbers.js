document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('pre > code').forEach(function(codeBlock) {
        var lines = codeBlock.innerHTML.split('\n');
        if(lines[lines.length-1] === '') lines.pop(); // Remove last empty line
        var numberedHTML = lines.map(function(line) {
            return '<span>' + line + '</span>';
        }).join('\n');
        codeBlock.innerHTML = numberedHTML;
        codeBlock.parentNode.classList.add('line-numbers');
    });
});
