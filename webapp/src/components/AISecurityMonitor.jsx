import React, { useState, useEffect } from 'react'

export default function AISecurityMonitor({ transactions, isActive = true }) {
  const [aiAnalysis, setAiAnalysis] = useState({
    riskScore: 0,
    anomalies: [],
    recommendations: [],
    status: 'analyzing'
  })

  const [isExpanded, setIsExpanded] = useState(false)

  // AI Analysis Simulation
  useEffect(() => {
    if (!isActive || !transactions.length) return

    const analyzeTransactions = async () => {
      setAiAnalysis(prev => ({ ...prev, status: 'analyzing' }))
      
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI analysis results
      const mockAnalysis = {
        riskScore: Math.floor(Math.random() * 30) + 5, // 5-35
        anomalies: [
          ...(Math.random() > 0.7 ? ['Unusual transaction frequency detected'] : []),
          ...(Math.random() > 0.8 ? ['Large amount transfer pattern'] : []),
          ...(Math.random() > 0.9 ? ['Suspicious address interaction'] : [])
        ],
        recommendations: [
          'Consider implementing multi-sig for large amounts',
          'Monitor wallet activity for 24 hours',
          'Verify destination address authenticity'
        ],
        status: 'completed'
      }
      
      setAiAnalysis(mockAnalysis)
    }

    analyzeTransactions()
  }, [transactions, isActive])

  const getRiskLevel = (score) => {
    if (score < 15) return { level: 'Low', color: '#10B981', icon: '✅' }
    if (score < 25) return { level: 'Medium', color: '#F59E0B', icon: '⚠️' }
    return { level: 'High', color: '#EF4444', icon: '🚨' }
  }

  const riskLevel = getRiskLevel(aiAnalysis.riskScore)

  return (
    <div className="ai-security-monitor">
      <div 
        className="ai-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '12px 16px',
          background: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: isExpanded ? '16px' : '0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              fontSize: '20px',
              background: 'linear-gradient(135deg, #7C3AED, #22D3EE)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🤖
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>
                AI Security Monitor
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                {aiAnalysis.status === 'analyzing' ? 'Đang phân tích...' : 'Bảo vệ 24/7'}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              padding: '4px 8px',
              background: riskLevel.color + '20',
              border: `1px solid ${riskLevel.color}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: riskLevel.color
            }}>
              {riskLevel.icon} {riskLevel.level} Risk
            </div>
            <div style={{ 
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}>
              ▼
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="ai-details" style={{
          background: 'rgba(15, 21, 45, 0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '16px',
          animation: 'fadeIn 0.3s ease'
        }}>
          {/* Risk Score */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#fff' }}>
              Risk Score: {aiAnalysis.riskScore}/100
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${aiAnalysis.riskScore}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${riskLevel.color}, ${riskLevel.color}80)`,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Anomalies */}
          {aiAnalysis.anomalies.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#EF4444' }}>
                🚨 Phát hiện bất thường
              </div>
              {aiAnalysis.anomalies.map((anomaly, index) => (
                <div key={index} style={{
                  padding: '8px 12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#EF4444',
                  marginBottom: '4px'
                }}>
                  {anomaly}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#22D3EE' }}>
              💡 Khuyến nghị AI
            </div>
            {aiAnalysis.recommendations.map((rec, index) => (
              <div key={index} style={{
                padding: '8px 12px',
                background: 'rgba(34, 211, 238, 0.1)',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#22D3EE',
                marginBottom: '4px'
              }}>
                {rec}
              </div>
            ))}
          </div>

          {/* AI Status */}
          <div style={{
            marginTop: '16px',
            padding: '8px 12px',
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#A78BFA',
            textAlign: 'center'
          }}>
            🤖 AI đang học từ {transactions.length} giao dịch để cải thiện độ chính xác
          </div>
        </div>
      )}
    </div>
  )
}
