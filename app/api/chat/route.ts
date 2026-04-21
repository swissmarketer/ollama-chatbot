import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { messages } = await request.json()
  
  const ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434'
  const model = process.env.OLLAMA_MODEL || 'llama3'
  
  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false
      }),
      signal: AbortSignal.timeout(120000)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Ollama Error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json({ response: data.message?.content || 'Keine Antwort erhalten' })
  } catch (error) {
    const err = error as Error
    return NextResponse.json(
      { error: `Verbindung fehlgeschlagen: ${err.message}` },
      { status: 500 }
    )
  }
}