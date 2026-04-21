import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { messages } = await request.json()
  
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
  
  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'llama3',
        messages,
        stream: false
      })
    })
    
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json({ response: data.message.content })
  } catch (error) {
    return NextResponse.json(
      { error: 'Verbindung zu Ollama fehlgeschlagen' },
      { status: 500 }
    )
  }
}