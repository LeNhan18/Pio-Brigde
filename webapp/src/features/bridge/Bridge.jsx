import React, { useState } from 'react'

export default function Bridge(){
  const [amount, setAmount] = useState('')

  const onBridge = () => {
    if(!amount || Number(amount) <= 0) return
    alert(`Bridge ${amount} PIO (demo)`)
  }

  return (
    <div className="panel" style={{minWidth:320, maxWidth:460}}>
      <div style={{fontWeight:700, marginBottom:10}}>PIO → wPIO Bridge</div>
      <div style={{opacity:.8, fontSize:13, marginBottom:16}}>Chế độ demo UI (chưa kết nối ví)</div>
      <div className="row" style={{marginBottom:12}}>
        <input placeholder="Số lượng PIO" value={amount} onChange={e=>setAmount(e.target.value)} />
        <button className="action" onClick={onBridge}>Bridge</button>
      </div>
      <div style={{fontSize:12, opacity:.7}}>Chain: Pione Zero → Goerli | Multisig 3/5</div>
    </div>
  )
}


