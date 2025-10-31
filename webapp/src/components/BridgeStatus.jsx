import React from 'react'

const BridgeStatus = ({ bridgeState, isProcessing }) => {
  const getStepStatus = (currentStep, targetStep) => {
    const steps = ['idle', 'approving', 'locking', 'locked', 'minting', 'success', 'failed']
    const currentIndex = steps.indexOf(currentStep)
    const targetIndex = steps.indexOf(targetStep)
    
    if (currentStep === 'failed') return 'failed'
    if (currentIndex > targetIndex) return 'completed'
    if (currentIndex === targetIndex) return 'active'
    return 'pending'
  }

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed': return '✅'
      case 'active': return '🔄'
      case 'failed': return '❌'
      default: return '⏳'
    }
  }

  const steps = [
    { key: 'approving', label: 'Approving Tokens', description: '🟡 Approving token...' },
    { key: 'locking', label: 'Locking Tokens', description: '🔒 Locking token...' },
    { key: 'locked', label: 'Tokens Locked', description: '✅ Lock transaction sent' },
    { key: 'minting', label: 'Minting on Sepolia', description: '⏳ Waiting for validators...' },
    { key: 'success', label: 'Bridge Complete', description: '🚀 Minted token received' }
  ]

  if (bridgeState.step === 'idle') {
    return null
  }

  return (
    <div className="bridge-status-container">
      <div className="bridge-status">
        <h3>Bridge Transaction Status</h3>
        
        {/* Current Status */}
        <div className="current-status">
          <div className={`status-badge ${bridgeState.step === 'failed' ? 'error' : 'processing'}`}>
            {bridgeState.step === 'failed' ? '❌' : '🔄'} {bridgeState.status}
          </div>
        </div>

        {/* Step Progress */}
        <div className="step-progress">
          {steps.map((step, index) => {
            const status = getStepStatus(bridgeState.step, step.key)
            return (
              <div key={step.key} className={`step ${status}`}>
                <div className="step-icon">
                  {getStepIcon(status)}
                </div>
                <div className="step-content">
                  <div className="step-label">{step.label}</div>
                  {status === 'active' && (
                    <div className="step-description">{step.description}</div>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`step-connector ${status === 'completed' ? 'completed' : ''}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Transaction Hashes */}
        {(bridgeState.approveHash || bridgeState.lockHash || bridgeState.mintHash) && (
          <div className="transaction-hashes">
            <h4>Transaction Details</h4>
            {bridgeState.approveHash && (
              <div className="hash-item">
                <span className="hash-label">Approve:</span>
                <a 
                  href={`https://zeroscan.org/tx/${bridgeState.approveHash}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hash-link"
                >
                  {bridgeState.approveHash.slice(0, 8)}...{bridgeState.approveHash.slice(-6)}
                </a>
              </div>
            )}
            {bridgeState.lockHash && (
              <div className="hash-item">
                <span className="hash-label">Lock:</span>
                <a 
                  href={`https://zeroscan.org/tx/${bridgeState.lockHash}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hash-link"
                >
                  {bridgeState.lockHash.slice(0, 8)}...{bridgeState.lockHash.slice(-6)}
                </a>
              </div>
            )}
            {bridgeState.lockId && (
              <div className="hash-item">
                <span className="hash-label">Lock ID:</span>
                <code className="lock-id">{bridgeState.lockId.slice(0, 10)}...{bridgeState.lockId.slice(-8)}</code>
              </div>
            )}
            {bridgeState.mintHash && (
              <div className="hash-item">
                <span className="hash-label">Mint:</span>
                <a 
                  href={`https://sepolia.etherscan.io/tx/${bridgeState.mintHash}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hash-link"
                >
                  {bridgeState.mintHash.slice(0, 8)}...{bridgeState.mintHash.slice(-6)}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {bridgeState.error && (
          <div className="error-display">
            <div className="error-title">❌ Bridge Failed</div>
            <div className="error-message">{bridgeState.error}</div>
            {bridgeState.error.includes('timeout') && (
              <div className="error-actions">
                <p className="timeout-help">
                  💡 <strong>Timeout thường xảy ra vì:</strong>
                </p>
                <ul className="timeout-reasons">
                  <li>• Network congestion (mạng đang quá tải)</li>
                  <li>• Gas price thấp (giao dịch pending lâu)</li>
                  <li>• Wallet chưa confirm transaction</li>
                </ul>
                <p className="timeout-solution">
                  🔄 <strong>Giải pháp:</strong> Hãy check wallet của bạn xem có transaction pending không. 
                  Nếu có, hãy speed up hoặc đợi confirm. Nếu không có, hãy thử lại với gas price cao hơn.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {bridgeState.step === 'success' && (
          <div className="success-display">
            <div className="success-title">🎉 Bridge Completed Successfully!</div>
            <div className="success-message">
              Your tokens have been successfully bridged to Sepolia network.
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .bridge-status-container {
          margin: 20px 0;
          padding: 20px;
          background: linear-gradient(135deg, rgba(139, 69, 255, 0.1), rgba(0, 255, 255, 0.1));
          border: 1px solid rgba(139, 69, 255, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .bridge-status h3 {
          margin: 0 0 20px 0;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .current-status {
          margin-bottom: 24px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          font-size: 14px;
        }

        .status-badge.processing {
          background: rgba(255, 193, 7, 0.2);
          border: 1px solid rgba(255, 193, 7, 0.5);
          color: #ffc107;
        }

        .status-badge.error {
          background: rgba(220, 53, 69, 0.2);
          border: 1px solid rgba(220, 53, 69, 0.5);
          color: #dc3545;
        }

        .step-progress {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          position: relative;
        }

        .step-icon {
          font-size: 20px;
          min-width: 24px;
          text-align: center;
        }

        .step-content {
          flex: 1;
        }

        .step-label {
          font-weight: 500;
          color: #fff;
          margin-bottom: 2px;
        }

        .step-description {
          font-size: 12px;
          color: #8b45ff;
          font-style: italic;
        }

        .step.active .step-label {
          color: #00ffff;
        }

        .step.completed .step-label {
          color: #28a745;
        }

        .step.failed .step-label {
          color: #dc3545;
        }

        .step-connector {
          position: absolute;
          left: 12px;
          top: 32px;
          width: 2px;
          height: 20px;
          background: rgba(255, 255, 255, 0.2);
        }

        .step-connector.completed {
          background: #28a745;
        }

        .transaction-hashes {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .transaction-hashes h4 {
          margin: 0 0 12px 0;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
        }

        .hash-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .hash-label {
          color: #aaa;
          min-width: 60px;
        }

        .hash-link {
          color: #8b45ff;
          text-decoration: none;
          font-family: monospace;
        }

        .hash-link:hover {
          text-decoration: underline;
        }

        .lock-id {
          color: #00ffff;
          background: rgba(0, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 11px;
        }

        .error-display, .success-display {
          margin-top: 16px;
          padding: 12px;
          border-radius: 8px;
        }

        .error-display {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
        }

        .success-display {
          background: rgba(40, 167, 69, 0.1);
          border: 1px solid rgba(40, 167, 69, 0.3);
        }

        .error-title, .success-title {
          font-weight: 600;
          margin-bottom: 6px;
        }

        .error-title {
          color: #dc3545;
        }

        .success-title {
          color: #28a745;
        }

        .error-message, .success-message {
          font-size: 13px;
          color: #fff;
          opacity: 0.9;
        }

        .error-actions {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(220, 53, 69, 0.2);
        }

        .timeout-help {
          font-size: 12px;
          color: #ffc107;
          margin-bottom: 8px;
        }

        .timeout-reasons {
          font-size: 11px;
          color: #fff;
          opacity: 0.8;
          margin: 8px 0;
          padding-left: 16px;
        }

        .timeout-reasons li {
          margin: 4px 0;
        }

        .timeout-solution {
          font-size: 12px;
          color: #17a2b8;
          margin-top: 8px;
          padding: 8px;
          background: rgba(23, 162, 184, 0.1);
          border-radius: 4px;
          border-left: 3px solid #17a2b8;
        }
      `}</style>
    </div>
  )
}

export default BridgeStatus