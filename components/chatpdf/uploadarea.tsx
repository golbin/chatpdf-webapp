import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

export default function UploadArea({
  setSummary,
  setFileName,
}: {
  setSummary: Function
  setFileName: Function
}) {
  const [isLoading, setIsLoading] = useState(false)

  const onDrop = useCallback((acceptedFiles: any) => {
    uploadFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  })

  const uploadFile = async (file: File) => {
    setIsLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) throw new Error(await res.text())

    const result = await res.json()

    setIsLoading(false)
    setFileName(result.filename)
    setSummary(result.summary)
  }

  return (
    <div className="relative mt-5 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
      <div
        {...getRootProps({
          className:
            "flex items-center justify-center w-full h-full cursor-pointer text-bold",
        })}
      >
        <input {...getInputProps()} />
        {isLoading === false ? (
          <p>PDF 파일을 끌어다 놓거나 클릭해서 업로드하세요</p>
        ) : (
          <>
            <svg
              className="-ml-1 mr-3 h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            파일을 처리중입니다. 잠시만 기다려주세요.
          </>
        )}
      </div>
    </div>
  )
}
