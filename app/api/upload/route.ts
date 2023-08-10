import { writeFile } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"
import { Configuration, OpenAIApi } from "openai"

const openAIConfiguration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(openAIConfiguration)

const uploadDir = join(
  process.env.ROOT_DIR || process.cwd(),
  `/public/uploads/`
)

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get("file") as unknown as File

  if (!file) {
    return NextResponse.json({ success: false })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const path = join(uploadDir, file.name)
  await writeFile(path, buffer)

  // 문서 임베딩
  const vectordb_response = await fetch("http://127.0.0.1:8000/load", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: path,
    }),
  })

  const pdf_content = await vectordb_response.json()

  // 질문 및 요약 생성
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: "--- PDF Content ---\n" + pdf_content.text.slice(0, 4000),
      },
      {
        role: "user",
        content:
          "PDF Content의 내용을 한 문단으로 요약하세요. 한 줄을 띄운 뒤 관련된 질문을 세 개 생성하세요.",
      },
    ],
  })

  return NextResponse.json({
    success: true,
    filename: pdf_content.filename,
    total_page: pdf_content.total_page,
    // text: pdf_content.text,
    summary: completion?.data?.choices[0]?.message?.content,
  })
}
