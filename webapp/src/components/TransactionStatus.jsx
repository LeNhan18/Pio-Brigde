import React from 'react'

export default function TransactionStatus({ transaction, onViewExplorer }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B'
      case 'confirmed': return '#10B981'
      case 'minted': return '#3B82F6'
      case 'failed': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Đang chờ xác nhận (User ký)'
      case 'confirmed': return 'Đã khóa PZO (Chờ Validator)'
      case 'minted': return 'Đã mint wPZO (Tự động)'
      case 'failed': return 'Thất bại'
      case 'timeout': return 'Hết thời gian chờ'
      default: return 'Không xác định'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '👤' // User action
      case 'confirmed': return '🔒' // Locked, waiting for validator
      case 'minted': return '🤖' // Auto-minted by backend
      case 'failed': return '❌'
      case 'timeout': return '⏰'
      default: return '❓'
    }
  }

  return (
    <div style={{
      padding: '16px',
      border: '1px solid #374151',
      borderRadius: '12px',
      marginBottom: '12px',
      background: '#1F2937',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '16px' }}>{getStatusIcon(transaction.status)}</span>
            <span style={{ fontWeight: 600, fontSize: '16px' }}>{transaction.amount} PZO</span>
            <span style={{
              padding: '2px 8px',
              background: getStatusColor(transaction.status) + '20',
              color: getStatusColor(transaction.status),
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {getStatusText(transaction.status)}
            </span>
          </div>
          
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
            To: {transaction.destination?.slice(0, 6)}...{transaction.destination?.slice(-4)}
          </div>
          
          <div style={{ fontSize: '11px', opacity: 0.6 }}>
            TX: {transaction.hash?.slice(0, 10)}...{transaction.hash?.slice(-8)}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onViewExplorer(transaction.hash)}
            style={{
              padding: '4px 8px',
              background: '#374151',
              border: '1px solid #4B5563',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#4B5563'
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#374151'
            }}
          >
            View
          </button>
          
          {(transaction.status === 'failed' || transaction.status === 'timeout') && (
            <button
              onClick={() => onRetry && onRetry(transaction)}
              style={{
                padding: '4px 8px',
                background: '#10B981',
                border: '1px solid #059669',
                borderRadius: '4px',
                color: 'white',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#059669'
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#10B981'
              }}
            >
              Retry
            </button>
          )}
        </div>
      </div>
      
      <div style={{ fontSize: '11px', opacity: 0.5 }}>
        {new Date(transaction.timestamp).toLocaleString('vi-VN')}
      </div>
    </div>
  )
}
