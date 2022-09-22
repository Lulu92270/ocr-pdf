import { useState } from "react"
import { createWorker } from "tesseract.js"
import TextOCR from "./textOcr"

const OcrReader = () => {

  // OCR Statuses
  const STATUSES = {
    IDLE: "",
    FAILED: "Failed to perform OCR",
    PENDING: "Processing...",
    SUCCEEDED: "Completed",
  }

  const [selectedImage, setSelectedImage] = useState(null)
  const [imgList, setImgList] = useState(null)
  const [ocrData, setOcrData] = useState("")
  const [ocrState, setOcrState] = useState(STATUSES.IDLE)

  const worker = createWorker()
  
  const PDFJS = require("pdfjs-dist/webpack");

  // Process image with OCR
  const readImageText = async(img) => {
    setOcrState(STATUSES.PENDING)
    try {
      await worker.load()
      // Set the language to recognize
      await worker.loadLanguage("eng")
      await worker.initialize("eng")
      const { data: { text } } = await worker.recognize(img) 
      await worker.terminate()

      setOcrData(text)
      setOcrState(STATUSES.SUCCEEDED)
    } catch (err) {
      setOcrState(STATUSES.FAILED)
    }
  }

  // Executed when "Use another image" is selected
  const handleRemoveClicked = () => {
    setSelectedImage(null)
    setOcrData()
    setOcrState(STATUSES.IDLE)
  }

  const readFileData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const convertPdfToImages = async (file) => {
    const images = [];
    const data = await readFileData(file);
    const pdf = await PDFJS.getDocument(data).promise;
    const canvas = document.createElement("canvas");

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const viewport = page.getViewport({ scale: 1 });
      const context = canvas.getContext("2d", { alpha: false });

      canvas.height = viewport.height || viewport.viewBox[3]; /* viewport.height is NaN */
      canvas.width = viewport.width || viewport.viewBox[2];
      
      await page.render({ canvasContext: context, viewport: viewport }).promise;

      images.push(canvas.toDataURL());
    }
    canvas.remove();
    setImgList(images)
    setSelectedImage(images[0])
    readImageText(images[0])
  }

  return (
    <div>
      <div>
        {selectedImage?
          <div className="button-container">
            {/* <button onClick={readImageText}>Process the image with OCR</button> */}
            <button
              className="remove-button"
              disabled={ocrState === STATUSES.PENDING}
              onClick={handleRemoveClicked}
            >
                Use another pdf
            </button>
          </div>
          :
          <>
            <p>Upload a pdf file to process</p>
            <input
              type="file"
              accept="application/pdf"
              name="pdf"
              onChange={(e) => convertPdfToImages(e.target.files[0])}
            />
          </>
        }
      </div>
      <div className="status">
        {imgList && ocrData && <img alt="previewImg" src={imgList[0]} />}
        {ocrData && <TextOCR readText={ocrData}/>}
        {ocrState && ocrState !== "Completed" && <p>{ocrState}</p>}
      </div>
      <br />
    </div>
  )
}

export default OcrReader