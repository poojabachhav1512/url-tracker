

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("urlInput");
    const message = document.getElementById("message");
    const tableBody = document.getElementById("tableBody");


// Validate URL format


    function isValidURL(url) {
        try {
            return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
        } catch {
            return false;
        }
    }



    //Mock server call (simulate API)

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

        return function (...args) {
            const now = Date.now();

            if (now - lastCall >= delay) {
                lastCall = now;
                func(...args);
            }
        };
    }

// Add result to table

    function addToTable(url, exists, type) {
        const row = document.createElement("tr");

        row.innerHTML = `
    <td>${url}</td>
    <td class="${exists ? 'success' : 'error'}">
      ${exists ? "Exists" : "Not Exists"}
    </td>
    <td>${exists ? type : "-"}</td>
  `;

        tableBody.prepend(row);
    }

  
     //Main function to check URL

    async function handleCheck(url) {
        if (!isValidURL(url)) {
            message.innerText = "\u274C Invalid URL";
            message.className = "error";
            return;
        }

        message.innerText = "\u{1F504} Checking...";
        message.className = "";

        const result = await mockServer(url);

        if (result.exists) {
            message.innerText = `\u2705 Exists (${result.type})`;
            message.className = "success";
        } else {
            message.innerText = "\u274C Not Exists";
            message.className = "error";
        }

        addToTable(url, result.exists, result.type);
    }


    // Apply throttle (1 call per 1 second)

    const throttledCheck = throttle(handleCheck, 1000);


    //Listen to user input

    input.addEventListener("input", (e) => {
        const url = e.target.value;
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
