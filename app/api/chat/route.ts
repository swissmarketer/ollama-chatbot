import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { messages } = await request.json()
  
  const apiKey = process.env.OLLAMA_API_KEY || '47e8f864937c4bc2821b341295ac8f87.qMJMktsjxasoPfBD4EG_I8y9'
  const model = process.env.OLLAMA_MODEL || 'llama3.2'
  
  try {
    const response = await fetch('https://api.ollama.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
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
        { error: `Error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json({ 
      response: data.choices?.[0]?.message?.content || 'Keine Antwort erhalten' 
    })
  } catch (error) {
    const err = error as Error
    return NextResponse.json(
      { error: `Verbindung fehlgeschlagen: ${err.message}` },
      { status: 500 }
    )
  }
}