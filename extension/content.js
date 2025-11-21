function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

async function init() {
    console.log("YouTube Summarizer: Script started.");

    const actionsContainer = await waitForElement('div#actions.ytd-watch-metadata');
    if (!actionsContainer) {
        console.error("YouTube Summarizer: Could not find elements");
        return;
    }
    console.log("YouTube Summarizer: Found elements");

    const summarizeButton = document.createElement('button');
    summarizeButton.innerText = 'Summarize';
    summarizeButton.id = 'summarize-button';
    summarizeButton.className = 'style-scope ytd-subscribe-button-renderer';

    actionsContainer.appendChild(summarizeButton);
    console.log("YouTube Summarizer: Button added to the page.");

    const resultContainer = document.createElement('div');
    resultContainer.id = 'summarizer-result-container';
    resultContainer.innerHTML = '<div class="placeholder">Nhấn "Summarize" để bắt đầu.</div>';

    const secondary = await waitForElement('#secondary');
    if (secondary) {
        secondary.prepend(resultContainer);
        console.log("YouTube Summarizer: Result container added.");
    } else {
        console.error("YouTube Summarizer: Could not find the secondary column.");
    }

    summarizeButton.addEventListener('click', async () => {
        const currentUrl = window.location.href;

        resultContainer.innerHTML = '<div class="loading">Đang xử lý...</div>';

        try {
            const response = await fetch('http://localhost:3000/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'url',
                    url: currentUrl
                })
            });

            if (!response.ok) {
                throw new Error(`Lỗi server: ${response.statusText}`);
            }

            const data = await response.json();

            resultContainer.innerHTML = `
                <h3>Tóm tắt</h3>
                <p>${data.summary || 'Không có nội dung tóm tắt.'}</p>
            `;

        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            resultContainer.innerHTML = `
                <div class="error">Đã có lỗi xảy ra. Vui lòng thử lại sau.</div>
                <p><i>Chi tiết: ${error.message}</i></p>
            `;
        }
    });
}

init();