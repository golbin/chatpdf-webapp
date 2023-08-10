"use client"

import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

export default function PDFViewer({
  pageNumber,
  fileName,
}: {
  pageNumber: number
  fileName: string
}) {
  console.log(fileName)
  const [numPages, setNumPages] = useState(0)

  const pageRefs = useRef<any>([])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  useEffect(() => {
    if (pageNumber !== 0) {
      const ref = pageRefs.current[pageNumber - 1]
      ref.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [pageNumber])

  return (
    <div>
      <Document
        file={`/uploads/${fileName}`}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <>
            <Page
              key={`page_${index + 1}`}
              inputRef={(el: any) => pageRefs.current.push(el)}
              pageNumber={index + 1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="m-5 border shadow-md"
            />

            <p className="text-center text-xs">
              {index + 1} of {numPages}
            </p>
          </>
        ))}
      </Document>
    </div>
  )
}
