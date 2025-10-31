import React, { useState } from 'react'

const TransactionHistory = ({ 
  transactionHistory, 
  clearTransactionHistory, 
  getTransactionStats 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const stats = getTransactionStats()

  const getStatusColor = (status) => {
    switch (status) {
      case 'hoàn thành': return '#4CAF50'
      case 'thất bại': return '#f44336'
      case 'đang phê duyệt': return '#ff9800'
      case 'đang khóa token': return '#2196F3'
      case 'đang mint token': return '#9C27B0'
      default: return '#757575'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'hoàn thành': return '✅'
      case 'thất bại': return '❌'
      case 'đang phê duyệt': return '⏳'
      case 'đang khóa token': return '🔒'
      case 'đang mint token': return '⚡'
      default: return '🔄'
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })
  }

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '-'
    const duration = Math.floor((endTime - startTime) / 1000)
    if (duration < 60) return `${duration}s`
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}m ${seconds}s`
  }

  return (
    <div style={{ 
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: isOpen ? '400px' : '60px',
      height: isOpen ? 'auto' : '60px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderRadius: '15px',
      padding: isOpen ? '20px' : '15px',
      color: 'white',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      border: '2px solid #00BCD4',
      boxShadow: '0 8px 32px rgba(0, 188, 212, 0.3)',
      backdropFilter: 'blur(10px)',
      maxHeight: isOpen ? '70vh' : 'auto',
      overflow: isOpen ? 'auto' : 'hidden'
    }}>
      {/* Toggle Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          fontSize: isOpen ? '16px' : '24px',
          textAlign: isOpen ? 'left' : 'center',
          fontWeight: 'bold',
          marginBottom: isOpen ? '15px' : '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center'
        }}
      >
        {isOpen ? (
          <>
            <span>📚 Lịch Sử Giao Dịch</span>
            <span style={{ fontSize: '20px' }}>✖️</span>
          </>
        ) : (
          <span>📚</span>
        )}
      </div>

      {isOpen && (
        <>
          {/* Statistics */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            fontSize: '14px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>{stats.completed}</div>
              <div>Thành Công</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#f44336', fontWeight: 'bold' }}>{stats.failed}</div>
              <div>Thất Bại</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#ff9800', fontWeight: 'bold' }}>{stats.processing}</div>
              <div>Đang Xử Lý</div>
            </div>
          </div>

          {/* Transaction List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {transactionHistory.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#888',
                fontSize: '14px'
              }}>
                🚀 Chưa có giao dịch nào<br/>
                <small>Các giao dịch bridge sẽ hiển thị ở đây</small>
              </div>
            ) : (
              transactionHistory.map((tx, index) => (
                <div 
                  key={tx.id} 
                  style={{ 
                    marginBottom: '15px',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    borderLeft: `4px solid ${getStatusColor(tx.status)}`,
                    fontSize: '13px'
                  }}
                >
                  {/* Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      fontWeight: 'bold'
                    }}>
                      <span style={{ marginRight: '8px', fontSize: '16px' }}>
                        {getStatusIcon(tx.status)}
                      </span>
                      <span>{tx.amount} PZO</span>
                    </div>
                    <div style={{ 
                      color: getStatusColor(tx.status),
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {tx.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ color: '#ccc', fontSize: '11px', lineHeight: '1.4' }}>
                    <div style={{ marginBottom: '4px' }}>
                      🎯 Đến: {tx.destination?.slice(0, 6)}...{tx.destination?.slice(-4)}
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      ⏰ {formatTime(tx.timestamp)}
                    </div>
                    {tx.completedTime && (
                      <div style={{ color: '#4CAF50' }}>
                        ⚡ Hoàn thành trong: {formatDuration(tx.timestamp, tx.completedTime)}
                      </div>
                    )}
                    {tx.error && (
                      <div style={{ color: '#f44336', marginTop: '4px' }}>
                        ⚠️ {tx.error}
                      </div>
                    )}
                  </div>

                  {/* Progress Steps */}
                  {(tx.step === 'approve' || tx.step === 'locking' || tx.step === 'minting' || tx.step === 'success') && (
                    <div style={{ 
                      marginTop: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '10px'
                    }}>
                      <span style={{ color: tx.approveStartTime ? '#4CAF50' : '#666' }}>
                        {tx.approveStartTime ? '✅' : '⚪'} Phê duyệt
                      </span>
                      <span style={{ color: tx.lockStartTime ? '#4CAF50' : '#666' }}>
                        {tx.lockStartTime ? '✅' : '⚪'} Khóa
                      </span>
                      <span style={{ color: tx.mintStartTime ? '#4CAF50' : '#666' }}>
                        {tx.mintStartTime ? '✅' : '⚪'} Mint
                      </span>
                      <span style={{ color: tx.completedTime ? '#4CAF50' : '#666' }}>
                        {tx.completedTime ? '✅' : '⚪'} Hoàn thành
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Clear History Button */}
          {transactionHistory.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử giao dịch?')) {
                  clearTransactionHistory()
                }
              }}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '15px',
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                color: '#f44336',
                border: '1px solid #f44336',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(244, 67, 54, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(244, 67, 54, 0.2)'
              }}
            >
              🗑️ Xóa Lịch Sử
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default TransactionHistory