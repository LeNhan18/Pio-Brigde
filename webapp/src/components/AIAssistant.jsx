import React, { useState, useRef, useEffect } from 'react'

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Xin chào! Tôi là AI Assistant của PIO Bridge. Tôi có thể giúp bạn:',
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'ai',
      content: '• Hướng dẫn sử dụng bridge\n• Giải thích về bảo mật\n• Kiểm tra trạng thái giao dịch\n• Tư vấn về DeFi',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue)
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase()
    
    if (input.includes('bridge') || input.includes('chuyển')) {
      return 'Để bridge PZO sang wPZO:\n1. Kết nối ví\n2. Nhập số lượng PZO\n3. Nhập địa chỉ đích trên Goerli\n4. Click "Bridge PZO"\n\nGiao dịch sẽ được xử lý trong 24h với multisig 3/5.'
    }
    
    if (input.includes('bảo mật') || input.includes('security')) {
      return 'PIO Bridge sử dụng:\n• Multisig 3/5 validators\n• Timelock 24h\n• AI monitoring 24/7\n• Smart contract audit\n\nTất cả giao dịch đều được kiểm tra bởi AI trước khi thực hiện.'
    }
    
    if (input.includes('giao dịch') || input.includes('transaction')) {
      return 'Bạn có thể kiểm tra trạng thái giao dịch:\n• Trong panel "Lịch sử giao dịch"\n• Trên blockchain explorer\n• Thông qua AI monitoring\n\nMỗi giao dịch có ID riêng để tracking.'
    }
    
    if (input.includes('phí') || input.includes('fee') || input.includes('gas')) {
      return 'Phí giao dịch:\n• Gas fee trên Pione Zero\n• Gas fee trên Goerli\n• Bridge fee: 0.1% (tối thiểu 1 PZO)\n\nPhí sẽ được tính tự động khi bạn nhập số lượng.'
    }
    
    if (input.includes('validator') || input.includes('xác thực')) {
      return 'Validators:\n• Cần 3/5 validators approve\n• Timelock 24h để review\n• AI kiểm tra trước khi approve\n• Có thể bị reject nếu phát hiện bất thường'
    }
    
    return 'Tôi hiểu bạn đang hỏi về "' + userInput + '". Tuy nhiên, tôi cần thêm thông tin để trả lời chính xác. Bạn có thể hỏi về:\n• Cách sử dụng bridge\n• Bảo mật và rủi ro\n• Phí giao dịch\n• Trạng thái giao dịch'
  }

  const quickQuestions = [
    'Cách bridge PZO?',
    'Phí giao dịch bao nhiêu?',
    'Bảo mật như thế nào?',
    'Kiểm tra giao dịch ở đâu?'
  ]

  return (
    <>
      {/* Floating AI Button */}
      <div
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #7C3AED, #22D3EE)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(124, 58, 237, 0.4)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          animation: 'pulse 2s infinite'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)'
        }}
      >
        <span style={{ fontSize: '24px' }}>🤖</span>
      </div>

      {/* AI Chat Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '350px',
          height: '500px',
          background: 'rgba(15, 21, 45, 0.95)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🤖</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  background: message.type === 'user' 
                    ? 'linear-gradient(135deg, #7C3AED, #22D3EE)'
                    : 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-line'
                }}>
                  {message.content}
                </div>
                <div style={{
                  fontSize: '10px',
                  opacity: 0.5,
                  marginTop: '4px',
                  textAlign: message.type === 'user' ? 'right' : 'left'
                }}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ alignSelf: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '14px'
                }}>
                  AI đang trả lời...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div style={{ padding: '0 16px 8px' }}>
            <div style={{ fontSize: '12px', color: '#A78BFA', marginBottom: '8px' }}>
              Câu hỏi nhanh:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(question)}
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(124, 58, 237, 0.2)',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '12px',
                    color: '#A78BFA',
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Hỏi AI Assistant..."
              style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #7C3AED, #22D3EE)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                opacity: inputValue.trim() ? 1 : 0.5
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
