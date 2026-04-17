

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("urlInput");
    const message = document.getElementById("message");
    const tableBody = document.getElementById("tableBody");
    let currentRequestId = 0; // Track latest request




    // Validate URL format 
    function isValidURL(url) {
        try {
            return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
        } catch {
            return false;
        }
    }


    //Mock server call
    async function mockServer(url) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const exists = Math.random() > 0.3;
                const type = Math.random() > 0.5 ? "file" : "folder";
                resolve({ exists, type });
            }, 600);
        });
    }


    // Throttle function to limit API calls
    function throttle(func, delay) {
        let lastCall = 0;
        let timeout = null;
        let lastArgs = null;

        return function (...args) {
            const now = Date.now();
            lastArgs = args;

            const remaining = delay - (now - lastCall);

            if (remaining <= 0) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }

                lastCall = now;
                func(...args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    lastCall = Date.now();
                    timeout = null;
                    func(...lastArgs);
                }, remaining);
            }
        };
    }


    // Add result to table
    function addToTable(url, exists, type) {
        const row = document.createElement("tr");

        // URL cell
        const urlCell = document.createElement("td");
        urlCell.textContent = url;

        // Exists cell
        const existsCell = document.createElement("td");
        existsCell.textContent = exists ? "Exists" : "Not Exists";
        existsCell.className = exists ? "success" : "error";

        // Type cell
        const typeCell = document.createElement("td");
        typeCell.textContent = exists ? type : "-";

        // Append cells
        row.appendChild(urlCell);
        row.appendChild(existsCell);
        row.appendChild(typeCell);

        tableBody.prepend(row);
    }


    //Main function to check URL
    async function handleCheck(url, requestId) {
        try {
            message.innerText = "\u{1F504} Checking...";
            message.className = "loading";

            const result = await mockServer(url);

            if (requestId !== currentRequestId) return;

            if (result.exists) {
                message.innerText = `\u2705 Exists (${result.type})`;
                message.className = "success";
            } else {
                message.innerText = "\u274C Not Exists";
                message.className = "error";
            }

            addToTable(url, result.exists, result.type);
        } catch (error) {
            message.innerText = "\u26A0\uFE0F Server error";
            message.className = "error";
        }
    }


    //throttledCheck version
    const throttledCheck = throttle((url) => {
        currentRequestId++;
        const requestId = currentRequestId;

        handleCheck(url, requestId);
    }, 500);


    //Listen user input
    input.addEventListener("input", (e) => {
        const url = e.target.value.trim();

        if (!url) {
            message.innerText = "";
            return;
        }

        if (!isValidURL(url)) {
            message.innerText = "\u274C Invalid URL";
            message.className = "error";
            return;
        }

        throttledCheck(url); 
    });
});
