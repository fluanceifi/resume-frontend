import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TabNav from './components/TabNav'
import ResumePage from './pages/ResumePage'
import HybridRagPage from './pages/HybridRagPage'
import SmuClubPage from './pages/SmuClubPage'
import ChatBar from './components/ChatBar'
import ChatModal from './components/ChatModal'
import { useChat } from './hooks/useChat'

export default function App() {
  const { messages, isLoading, sendMessage } = useChat()
  const [modalOpen, setModalOpen] = useState(false)

  function handleSend(query: string) {
    setModalOpen(true)
    sendMessage(query)
  }

  return (
    <BrowserRouter>
      <TabNav />
      <Routes>
        <Route path="/" element={<ResumePage />} />
        <Route path="/hybrid-rag" element={<HybridRagPage />} />
        <Route path="/smu-club" element={<SmuClubPage />} />
      </Routes>
      <ChatBar
        onSend={handleSend}
        onToggleModal={() => setModalOpen(v => !v)}
        isLoading={isLoading}
        modalOpen={modalOpen}
      />
      <ChatModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        messages={messages}
        isLoading={isLoading}
      />
    </BrowserRouter>
  )
}
