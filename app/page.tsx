"use client"

import { useEffect, useRef, useState } from "react"

import ChatArea from "@/components/chatpdf/chatarea"
import InputArea from "@/components/chatpdf/inputarea"
import PDFViewer from "@/components/chatpdf/pdfviewer"
import UploadArea from "@/components/chatpdf/uploadarea"

const initialMessages = [
  {
    role: "assistant",
    content: "안녕하세요. PDF 도우미입니다. 어떤 문서의 내용이 궁금하신가요?",
  },
  // 아래는 메시지 구조 예시입니다.
  // {
  //   role: "user",
  //   content: "{사용자 입력}",
  // },
  // { // 답변 생성 대기 중 상태
  //   role: "assistant",
  //   status: "thinking",
  // },
  // {
  //   role: "assistant",
  //   content: "{답변 내용}",
  // }
]

export default function IndexPage() {
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState(initialMessages)
  const [summary, setSummary] = useState("")
  const [pageNumber, setPageNumber] = useState(0)
  const [fileName, setFileName] = useState<string>("")

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
    }
  }

  const scrollToPage = (pageNumber: number) => {
    setPageNumber(pageNumber)
  }

  useEffect(() => {
    if (summary === "") {
      return
    }

    let updatedMessages = [
      ...messages,
      {
        role: "assistant",
        content: summary,
      },
    ]

    setMessages(updatedMessages)
  }, [summary])

  const handleSend = async (message: string) => {
    let updatedMessages = [
      ...messages,
      {
        role: "user",
        content: message,
      },
      {
        role: "assistant",
        status: "thinking",
      },
    ]

    setMessages(updatedMessages)

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: fileName,
        messages: updatedMessages.slice(0, -1),
      }),
    })

    const data = response.body
    const reader = data.getReader()
    const decoder = new TextDecoder()

    let done = false
    let lastMessage = ""
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)
      lastMessage = lastMessage + chunkValue

      setMessages([
        ...updatedMessages.slice(0, -1),
        {
          role: "assistant",
          content: lastMessage,
        },
      ])
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [])

  return (
    <>
      <div className="absolute bottom-0 mx-auto h-screen w-2/3 p-5 pt-16">
        <div className="flex h-full justify-center overflow-auto">
          {fileName !== "" ? (
            <PDFViewer pageNumber={pageNumber} fileName={fileName} />
          ) : (
            <UploadArea setSummary={setSummary} setFileName={setFileName} />
          )}
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-1/3">
        <div
          ref={chatAreaRef}
          className="h-screen overflow-auto pl-2 pr-4 pt-40"
        >
          <ChatArea messages={messages} scrollToBottom={scrollToBottom} />
        </div>

        <div className="pb-5 pl-2 pr-4 pt-4">
          <InputArea handleSend={handleSend} scrollToBottom={scrollToBottom} />
        </div>
      </div>
    </>
  )
}
