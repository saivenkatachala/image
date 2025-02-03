const imageUpload = document.getElementById('imageUpload');
const removeBackgroundBtn = document.getElementById('removeBackgroundBtn');
const loader = document.getElementById('loader');
const outputCanvas = document.getElementById('outputCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const fileInput = document.querySelector("input");
const downloadBtn1 = document.querySelector("button");

const API_KEY = 'YrKz9ujNC3sVMLUGSGvbeYMK';

imageUpload.addEventListener('change', () => {
    if (imageUpload.files.length > 0) {
        removeBackgroundBtn.removeAttribute('disabled');
    } else {
        removeBackgroundBtn.setAttribute('disabled', 'true');
    }
});

removeBackgroundBtn.addEventListener('click', () => {
    const file = imageUpload.files[0];
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');

    loader.style.display = 'block';
    downloadBtn.style.display = 'none';
    copyBtn.style.display = 'none';

    fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
            'X-Api-Key': API_KEY
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        return response.blob();
    })
    .then(blob => {
        const imageUrl = URL.createObjectURL(blob);
        const image = new Image();
        image.src = imageUrl;
        image.onload = () => {
            outputCanvas.width = image.width;
            outputCanvas.height = image.height;
            const ctx = outputCanvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            loader.style.display = 'none';
            outputCanvas.style.display = 'block';

            // Enable Download and Copy Buttons
            downloadBtn.style.display = 'inline-block';
            copyBtn.style.display = 'inline-block';

            // Set download link
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = outputCanvas.toDataURL();
                link.download = 'background_removed.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            // Copy to Clipboard
            copyBtn.onclick = async () => {
                try {
                    outputCanvas.toBlob(blob => {
                        const item = new ClipboardItem({ 'image/png': blob });
                        navigator.clipboard.write([item]);
                    });
                    alert('Image copied to clipboard!');
                } catch (err) {
                    alert('Failed to copy image.');
                }
            };
        };
    })
    .catch(error => {
        console.error(error);
        alert('An issue has occurred. Please try again later.');
        loader.style.display = 'none';
    });
});

downloadBtn1.addEventListener("click", e => {
    e.preventDefault();
    downloadBtn1.innerText = "Downloading file...";
    fetchFile(fileInput.value);
});

function fetchFile(url) {
    fetch(url)
        .then(res => res.blob())
        .then(file => {
            let tempUrl = URL.createObjectURL(file);
            const aTag = document.createElement("a");
            aTag.href = tempUrl;
            aTag.download = url.substring(url.lastIndexOf('/') + 1);
            document.body.appendChild(aTag);
            aTag.click();
            document.body.removeChild(aTag);
            URL.revokeObjectURL(tempUrl);
            downloadBtn1.innerText = "Download File";
        })
        .catch(() => {
            alert("File not downloaded.");
            downloadBtn1.innerText = "Download File";
        });
}
