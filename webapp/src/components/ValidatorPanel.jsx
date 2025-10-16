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
      
      <div className="status-alert warning">
        <div>🔐 Validator Only</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
          Chỉ validators mới có thể approve mint
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Lock ID</label>
        <input 
          className="form-input"
          placeholder="0x..." 
          value={lockId} 
          onChange={e => setLockId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Địa chỉ nhận</label>
        <input 
          className="form-input"
          placeholder="0x..." 
          value={to} 
          onChange={e => setTo(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Số lượng wPZO</label>
        <input 
          className="form-input"
          placeholder="0.0" 
          value={amount} 
          onChange={e => setAmount(e.target.value)}
        />
      </div>

      <button 
        className="form-button" 
        onClick={handleApproveMint}
        disabled={isProcessing}
      >
        {isProcessing ? 'Đang xử lý...' : 'Approve Mint'}
      </button>

      <div className="form-info">
        Cần 3/5 validators approve để mint wPZO
      </div>
    </div>
  )
}
