interface Session {
  id: number
  title: string
  messages: Message[]
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}