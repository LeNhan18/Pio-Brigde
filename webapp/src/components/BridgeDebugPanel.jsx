import React from 'react'

const BridgeDebugPanel = ({ 
  bridgeState, 
  approveHash, 
  isApproveSuccess, 
  isApproveReceiptSuccess, 
  approveError,
  lockHash,
  isLockSuccess,
  lockError,
  resetBridgeState,
  checkTransactionStatus
}) => {
  const [debugInfo, setDebugInfo] = React.useState(null)
  const [showDebug, setShowDebug] = React.useState(false)

  const handleCheckTxStatus = async (txHash) => {
    if (!txHash) return
    
    try {
      const status = await checkTransactionStatus(txHash)
      setDebugInfo({ txHash, status, timestamp: new Date().toLocaleTimeString() })
    } catch (error) {
      setDebugInfo({ txHash, error: error.message, timestamp: new Date().toLocaleTimeString() })
    }
  }

  return (
    <div className="bridge-debug-panel">
      <div className="debug-header">
        <button 
          className="debug-toggle"
          onClick={() => setShowDebug(!showDebug)}
        >
          🔧 Debug Panel {showDebug ? '▼' : '▶'}
        </button>
        
        {bridgeState.error && (
          <button 
            className="retry-button"
            onClick={resetBridgeState}
          >
            🔄 Reset & Retry
          </button>
        )}
      </div>

      {showDebug && (
        <div className="debug-content">
          <div className="debug-section">
            <h4>Bridge State</h4>
            <div className="debug-item">
              <span className="debug-label">Step:</span>
              <span className={`debug-value step-${bridgeState.step}`}>
                {bridgeState.step}
              </span>
            </div>
            <div className="debug-item">
              <span className="debug-label">Status:</span>
              <span className="debug-value">{bridgeState.status}</span>
            </div>
            {bridgeState.error && (
              <div className="debug-item">
                <span className="debug-label">Error:</span>
                <span className="debug-value error">{bridgeState.error}</span>
              </div>
            )}
          </div>

          <div className="debug-section">
            <h4>Approval Transaction</h4>
            <div className="debug-item">
              <span className="debug-label">Hash:</span>
              <span className="debug-value">
                {approveHash ? (
                  <>
                    {approveHash.slice(0, 10)}...{approveHash.slice(-6)}
                    <button 
                      className="check-tx-btn"
                      onClick={() => handleCheckTxStatus(approveHash)}
                    >
                      Check
                    </button>
                  </>
                ) : 'None'}
              </span>
            </div>
            <div className="debug-item">
              <span className="debug-label">Success:</span>
              <span className={`debug-value ${isApproveSuccess ? 'success' : 'pending'}`}>
                {isApproveSuccess ? '✅' : '⏳'}
              </span>
            </div>
            <div className="debug-item">
              <span className="debug-label">Receipt:</span>
              <span className={`debug-value ${isApproveReceiptSuccess ? 'success' : 'pending'}`}>
                {isApproveReceiptSuccess ? '✅' : '⏳'}
              </span>
            </div>
            {approveError && (
              <div className="debug-item">
                <span className="debug-label">Error:</span>
                <span className="debug-value error">{approveError.message}</span>
              </div>
            )}
          </div>

          {lockHash && (
            <div className="debug-section">
              <h4>Lock Transaction</h4>
              <div className="debug-item">
                <span className="debug-label">Hash:</span>
                <span className="debug-value">
                  {lockHash.slice(0, 10)}...{lockHash.slice(-6)}
                  <button 
                    className="check-tx-btn"
                    onClick={() => handleCheckTxStatus(lockHash)}
                  >
                    Check
                  </button>
                </span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Success:</span>
                <span className={`debug-value ${isLockSuccess ? 'success' : 'pending'}`}>
                  {isLockSuccess ? '✅' : '⏳'}
                </span>
              </div>
              {lockError && (
                <div className="debug-item">
                  <span className="debug-label">Error:</span>
                  <span className="debug-value error">{lockError.message}</span>
                </div>
              )}
            </div>
          )}

          {debugInfo && (
            <div className="debug-section">
              <h4>Transaction Status Check</h4>
              <div className="debug-item">
                <span className="debug-label">Hash:</span>
                <span className="debug-value">{debugInfo.txHash.slice(0, 10)}...{debugInfo.txHash.slice(-6)}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Time:</span>
                <span className="debug-value">{debugInfo.timestamp}</span>
              </div>
              {debugInfo.status ? (
                <>
                  <div className="debug-item">
                    <span className="debug-label">Status:</span>
                    <span className={`debug-value ${debugInfo.status.confirmed ? 'success' : 'pending'}`}>
                      {debugInfo.status.confirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                  {debugInfo.status.blockNumber && (
                    <div className="debug-item">
                      <span className="debug-label">Block:</span>
                      <span className="debug-value">{debugInfo.status.blockNumber.toString()}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="debug-item">
                  <span className="debug-label">Error:</span>
                  <span className="debug-value error">{debugInfo.error}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .bridge-debug-panel {
          margin-top: 16px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-size: 12px;
        }

        .debug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .debug-toggle {
          background: rgba(139, 69, 255, 0.2);
          border: 1px solid rgba(139, 69, 255, 0.4);
          color: #8b45ff;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
        }

        .debug-toggle:hover {
          background: rgba(139, 69, 255, 0.3);
        }

        .retry-button {
          background: rgba(255, 193, 7, 0.2);
          border: 1px solid rgba(255, 193, 7, 0.4);
          color: #ffc107;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
        }

        .retry-button:hover {
          background: rgba(255, 193, 7, 0.3);
        }

        .debug-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .debug-section {
          background: rgba(255, 255, 255, 0.02);
          padding: 8px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .debug-section h4 {
          color: #fff;
          margin: 0 0 8px 0;
          font-size: 12px;
          font-weight: 600;
        }

        .debug-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 4px 0;
          padding: 2px 0;
        }

        .debug-label {
          color: #aaa;
          min-width: 60px;
        }

        .debug-value {
          color: #fff;
          font-family: monospace;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .debug-value.success {
          color: #28a745;
        }

        .debug-value.pending {
          color: #ffc107;
        }

        .debug-value.error {
          color: #dc3545;
          word-break: break-word;
        }

        .debug-value.step-idle { color: #6c757d; }
        .debug-value.step-approving { color: #ffc107; }
        .debug-value.step-locking { color: #17a2b8; }
        .debug-value.step-locked { color: #20c997; }
        .debug-value.step-minting { color: #6f42c1; }
        .debug-value.step-success { color: #28a745; }
        .debug-value.step-failed { color: #dc3545; }

        .check-tx-btn {
          background: rgba(0, 255, 255, 0.2);
          border: 1px solid rgba(0, 255, 255, 0.4);
          color: #00ffff;
          padding: 2px 6px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 10px;
        }

        .check-tx-btn:hover {
          background: rgba(0, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}

export default BridgeDebugPanel