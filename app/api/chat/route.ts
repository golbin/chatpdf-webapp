import { NextRequest } from "next/server"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { Configuration, OpenAIApi } from "openai-edge"

const openAIConfiguration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(openAIConfiguration)

export const runtime = "edge"

const systemPrompt =
  "당신은 PDF 문서 학습을 도와주는 AI Assistant 입니다. 사용자의 질문에 대해 문서의 내용을 참고하여 답변하세요."

export async function POST(req: NextRequest) {
  const { filename, messages } = await req.json()

  // 질문과 관련된 내용 검색
  const vectordb_response = await fetch("http://127.0.0.1:8000/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: messages[messages.length - 1].content,
      top_k: 5,
      filename: filename,
    }),
  })

  const search_result = await vectordb_response.json()

  // 검색한 결과를 컨텍스트 텍스트로 재구성
  let result_text = "--- PDF Content ---\n"
  for (let i = 0; i < search_result.length; i++) {
    result_text +=
      "page: " +
      search_result[i].metadata.page +
      "\n" +
      "snippet: " +
      search_result[i].text +
      "\n\n"
  }

  console.log([
    { role: "system", content: systemPrompt },
    ...messages.slice(0, -1),
    { role: "user", content: result_text },
    messages[messages.length - 1],
  ])

  // 검색한 결과를 바탕으로 답변 생성
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    stream: true,
    temperature: 0.7,
    max_tokens: 512,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.slice(0, -1),
      { role: "user", content: result_text },
      messages[messages.length - 1],
    ],
  })

  const stream = OpenAIStream(response)

  return new StreamingTextResponse(stream)
}
