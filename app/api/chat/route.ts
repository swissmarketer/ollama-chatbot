import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { messages } = await request.json()
  
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL || 'llama3'
  
  try {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(`${ollamaUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              messages,
              stream: true
            })
          })
          
          if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`)
          }
          
          const reader = response.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n').filter(line => line.trim())
            
            for (const line of lines) {
              try {
                const data = JSON.parse(line)
                if (data.message?.content) {
                  controller.enqueue(encoder.encode(data.message.content))
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        } catch (error) {
          controller.enqueue(encoder.encode('Fehler: ' + (error as Error).message))
        }
        controller.close()
      }
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Verbindung zu Ollama fehlgeschlagen' },
      { status: 500 }
    )
  }
}