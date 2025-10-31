import React from 'react'

const ApprovalTimeoutHandler = ({ 
  bridgeState, 
  approveHash, 
  onForceProceeed, 
  onRetry 
}) => {
  const [showForceOption, setShowForceOption] = React.useState(false)
  
  // Show force option after 30 seconds of waiting
  React.useEffect(() => {
    if (bridgeState.step === 'approving' && approveHash) {
      const timer = setTimeout(() => {
        setShowForceOption(true)
      }, 30000) // 30 seconds
      
      return () => clearTimeout(timer)
    } else {
      setShowForceOption(false)
    }
  }, [bridgeState.step, approveHash])

  if (!showForceOption || bridgeState.step !== 'approving' || !approveHash) {
    return null
  }

  return (
    <div className="timeout-handler">
      <div className="timeout-message">
        <div className="timeout-title">⏰ Transaction Taking Longer Than Expected</div>
        <div className="timeout-description">
          Your approval transaction has been submitted but confirmation is taking longer than usual.
        </div>
        <div className="timeout-hash">
          Hash: <code>{approveHash.slice(0, 10)}...{approveHash.slice(-6)}</code>
        </div>
        
        <div className="timeout-actions">
          <button 
            className="force-proceed-btn"
            onClick={onForceProceeed}
            title="Proceed assuming the transaction will confirm"
          >
            🚀 Force Proceed
          </button>
          
          <button 
            className="retry-btn"
            onClick={onRetry}
            title="Reset and try again"
          >
            🔄 Retry
          </button>
          
          <a 
            href={`https://zeroscan.org/tx/${approveHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="view-tx-btn"
          >
            🔍 View Transaction
          </a>
        </div>
        
        <div className="timeout-help">
          💡 <strong>Options:</strong>
          <ul>
            <li><strong>Force Proceed:</strong> Continue bridge assuming approval will confirm</li>
            <li><strong>Retry:</strong> Reset and start bridge process again</li>
            <li><strong>View Transaction:</strong> Check transaction status on explorer</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .timeout-handler {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 350px;
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 87, 34, 0.1));
          border: 2px solid rgba(255, 193, 7, 0.3);
          border-radius: 12px;
          padding: 16px;
          z-index: 1000;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .timeout-title {
          color: #ffc107;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .timeout-description {
          color: #fff;
          font-size: 12px;
          margin-bottom: 12px;
          opacity: 0.9;
        }

        .timeout-hash {
          color: #00ffff;
          font-size: 11px;
          margin-bottom: 16px;
          word-break: break-all;
        }

        .timeout-hash code {
          background: rgba(0, 255, 255, 0.1);
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }

        .timeout-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .force-proceed-btn {
          background: rgba(40, 167, 69, 0.2);
          border: 1px solid rgba(40, 167, 69, 0.4);
          color: #28a745;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          flex: 1;
        }

        .retry-btn {
          background: rgba(255, 193, 7, 0.2);
          border: 1px solid rgba(255, 193, 7, 0.4);
          color: #ffc107;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          flex: 1;
        }

        .view-tx-btn {
          background: rgba(0, 255, 255, 0.2);
          border: 1px solid rgba(0, 255, 255, 0.4);
          color: #00ffff;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .timeout-help {
          font-size: 10px;
          color: #aaa;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .timeout-help ul {
          margin: 8px 0 0 0;
          padding-left: 16px;
        }

        .timeout-help li {
          margin: 4px 0;
        }

        .force-proceed-btn:hover {
          background: rgba(40, 167, 69, 0.3);
        }

        .retry-btn:hover {
          background: rgba(255, 193, 7, 0.3);
        }

        .view-tx-btn:hover {
          background: rgba(0, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}

export default ApprovalTimeoutHandler