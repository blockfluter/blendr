let gIndex = 1;
export default function installCutout(url, scale, fn) {
    loadImagePromise(url)
        .then(img => {
            return img;
        })
        .then(img => {
            const canvas = document.createElement("canvas");
            canvas.style.position = "absolute";
            canvas.id = `c${++gIndex}`;
            imageToCanvas(img, canvas, scale, 100);
            return canvas;
        })
        .then(canvas => {
            fn(canvas);
            return canvas;
        })
        .catch(error => {
            console.error(error);
        });
}

function loadImagePromise(url) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.addEventListener("load", e => resolve(img));
        img.addEventListener("error", () => {
            reject(new Error(`Failed to load image from ${url}`));
        });
        img.src = url;
    });
}

function imageToCanvas(img, canvas, scale, margin) {
    canvas.width = Math.round(img.width * scale + margin * 2);
    canvas.height = Math.round(img.height * scale + margin * 2);
    const context = canvas.getContext("2d");
    context.scale(scale, scale);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, margin, margin);
}
