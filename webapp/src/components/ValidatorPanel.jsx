import React, { useState } from 'react'
import { useBridge } from '../hooks/useBridge'

export default function ValidatorPanel() {
  const { approveMint, isProcessing } = useBridge()
  const [lockId, setLockId] = useState('')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  const handleApproveMint = async () => {
    if (!lockId || !to || !amount) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      await approveMint(lockId, to, amount)
      alert('Approve mint thành công!')
      setLockId('')
      setTo('')
      setAmount('')
    } catch (error) {
      alert('Approve mint thất bại: ' + error.message)
    }
  }

  return (
    <div className="panel" style={{ minWidth: 400 }}>
      <div style={{ fontWeight: 700, marginBottom: 20, fontSize: 20 }}>
        Validator Panel
      </div>
      
      <div style={{ 
        padding: '12px 16px', 
        background: '#F59E0B20',
        border: '1px solid #F59E0B',
        borderRadius: '8px',
        marginBottom: 20
      }}>
        <div style={{ fontWeight: 600, color: '#F59E0B' }}>🔐 Validator Only</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
          Chỉ validators mới có thể approve mint
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Lock ID</label>
        <input 
          placeholder="0x..." 
          value={lockId} 
          onChange={e => setLockId(e.target.value)}
          style={{ width: '100%', padding: '12px', fontSize: 16 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Địa chỉ nhận</label>
        <input 
          placeholder="0x..." 
          value={to} 
          onChange={e => setTo(e.target.value)}
          style={{ width: '100%', padding: '12px', fontSize: 16 }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Số lượng wPZO</label>
        <input 
          placeholder="0.0" 
          value={amount} 
          onChange={e => setAmount(e.target.value)}
          style={{ width: '100%', padding: '12px', fontSize: 16 }}
        />
      </div>

      <button 
        className="action" 
        onClick={handleApproveMint}
        disabled={isProcessing}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: 16,
          fontWeight: 600,
          opacity: isProcessing ? 0.5 : 1,
          cursor: isProcessing ? 'not-allowed' : 'pointer'
        }}
      >
        {isProcessing ? 'Đang xử lý...' : 'Approve Mint'}
      </button>

      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 12, textAlign: 'center' }}>
        Cần 3/5 validators approve để mint wPZO
      </div>
    </div>
  )
}
