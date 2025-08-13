let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    canvas = document.getElementById("pdf-render"),
    ctx = canvas.getContext("2d"),
    pdfBytes = null;

const fileInput = document.getElementById("file-input");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageNumSpan = document.getElementById("page-num");
const pageCountSpan = document.getElementById("page-count");
const addTextBtn = document.getElementById("add-text");
const downloadBtn = document.getElementById("download");

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file.type !== "application/pdf") return alert("Please upload a PDF");

  const fileReader = new FileReader();
  fileReader.onload = async function() {
    const typedarray = new Uint8Array(this.result);
    pdfDoc = await pdfjsLib.getDocument(typedarray).promise;
    pdfBytes = typedarray;
    pageCountSpan.textContent = pdfDoc.numPages;
    renderPage(pageNum);
  };
  fileReader.readAsArrayBuffer(file);
});

function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    page.render(renderContext).promise.then(() => {
      pageRendering = false;
      pageNumSpan.textContent = pageNum;
    });
  });
}

prevPageBtn.onclick = () => {
  if (pageNum <= 1) return;
  pageNum--;
  renderPage(pageNum);
};

nextPageBtn.onclick = () => {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  renderPage(pageNum);
};

addTextBtn.onclick = () => {
  const text = prompt("Enter text to add:");
  if (!text) return;
  ctx.font = "16px Arial";
  ctx.fillStyle = "red";
  ctx.fillText(text, 100, 100);
};

downloadBtn.onclick = async () => {
  const pdfDocLib = await PDFLib.PDFDocument.load(pdfBytes);
  const pages = pdfDocLib.getPages();
  const firstPage = pages[pageNum - 1];
  firstPage.drawText("Annotated Text", {
    x: 100,
    y: 700,
    size: 16,
    color: PDFLib.rgb(1, 0, 0),
  });

  const pdfDataUri = await pdfDocLib.saveAsBase64({ dataUri: true });
  const link = document.createElement("a");
  link.href = pdfDataUri;
  link.download = "annotated.pdf";
  link.click();
};
