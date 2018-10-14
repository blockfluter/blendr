export default function saveCanvas(canvas, filename) {
    try {
        canvas.toBlob(blob => {
            const a = document.createElement("a");
            a.href = window.URL.createObjectURL(blob);
            a.download = filename;
            a.click();
        }, "image/png");
    } catch (err) {
        alert(err);
    }
}
