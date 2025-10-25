import React, { useState, useEffect } from 'react'

export default function SecurityDashboard({ transactions, validators }) {
  const [securityMetrics, setSecurityMetrics] = useState({
    totalTransactions: 0,
    suspiciousTransactions: 0,
    averageApprovalTime: 0,
    validatorActivity: {},
    riskScore: 0
  })

  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    calculateSecurityMetrics()
    loadSecurityAlerts()
  }, [transactions, validators])

  const calculateSecurityMetrics = () => {
    const total = transactions.length
    const suspicious = transactions.filter(tx => 
      tx.amount > 50000 || tx.status === 'failed'
    ).length
    
    const avgTime = transactions
      .filter(tx => tx.status === 'confirmed')
      .reduce((acc, tx) => acc + (tx.confirmationTime || 0), 0) / total || 0

    const validatorActivity = validators.reduce((acc, validator) => {
      acc[validator.address] = validator.approvalCount || 0
      return acc
    }, {})

    const riskScore = calculateRiskScore(total, suspicious, avgTime)

    setSecurityMetrics({
      totalTransactions: total,
      suspiciousTransactions: suspicious,
      averageApprovalTime: avgTime,
      validatorActivity,
      riskScore
    })
  }

  const calculateRiskScore = (total, suspicious, avgTime) => {
    let score = 0
    
    // Suspicious transaction ratio
    if (total > 0) {
      score += (suspicious / total) * 40
    }
    
    // Average approval time (longer = higher risk)
    if (avgTime > 300) { // 5 minutes
      score += 30
    }
    
    // Validator activity distribution
    const validatorCount = Object.keys(securityMetrics.validatorActivity).length
    if (validatorCount > 0) {
      const activityValues = Object.values(securityMetrics.validatorActivity)
      const maxActivity = Math.max(...activityValues)
      const minActivity = Math.min(...activityValues)
      
      if (maxActivity - minActivity > 10) {
        score += 20 // Uneven validator activity
      }
    }
    
    return Math.min(score, 100)
  }

  const loadSecurityAlerts = async () => {
    try {
      // In production, this would fetch from API
      const mockAlerts = [
        {
          id: 1,
          type: 'HIGH_GAS_USAGE',
          severity: 'MEDIUM',
          message: 'Transaction used 95% of gas limit',
          timestamp: new Date().toISOString(),
          txHash: '0x123...abc'
        },
        {
          id: 2,
          type: 'LARGE_VALUE',
          severity: 'MEDIUM',
          message: 'Unusually large transaction detected',
          timestamp: new Date().toISOString(),
          txHash: '0x456...def'
        }
      ]
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Failed to load security alerts:', error)
    }
  }

  const getRiskColor = (score) => {
    if (score < 30) return '#10B981' // Green
    if (score < 70) return '#F59E0B' // Yellow
    return '#EF4444' // Red
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'LOW': return '#6B7280'
      case 'MEDIUM': return '#F59E0B'
      case 'HIGH': return '#EF4444'
      default: return '#6B7280'
    }
  }

  return (
    <div style={{
      background: 'rgba(17, 24, 39, 0.8)',
      border: '1px solid rgba(75, 85, 99, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <h3 style={{ 
        color: '#F3F4F6', 
        marginBottom: '20px',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        🛡️ Security Dashboard
      </h3>

      {/* Security Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'rgba(31, 41, 55, 0.6)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid rgba(75, 85, 99, 0.2)'
        }}>
          <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
            Total Transactions
          </div>
          <div style={{ color: '#F3F4F6', fontSize: '24px', fontWeight: '600' }}>
            {securityMetrics.totalTransactions}
          </div>
        </div>

        <div style={{
          background: 'rgba(31, 41, 55, 0.6)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid rgba(75, 85, 99, 0.2)'
        }}>
          <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
            Suspicious Transactions
          </div>
          <div style={{ color: '#EF4444', fontSize: '24px', fontWeight: '600' }}>
            {securityMetrics.suspiciousTransactions}
          </div>
        </div>

        <div style={{
          background: 'rgba(31, 41, 55, 0.6)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid rgba(75, 85, 99, 0.2)'
        }}>
          <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
            Risk Score
          </div>
          <div style={{ 
            color: getRiskColor(securityMetrics.riskScore), 
            fontSize: '24px', 
            fontWeight: '600' 
          }}>
            {securityMetrics.riskScore.toFixed(1)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(31, 41, 55, 0.6)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid rgba(75, 85, 99, 0.2)'
        }}>
          <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
            Avg Approval Time
          </div>
          <div style={{ color: '#F3F4F6', fontSize: '24px', fontWeight: '600' }}>
            {securityMetrics.averageApprovalTime.toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      <div>
        <h4 style={{ 
          color: '#F3F4F6', 
          marginBottom: '12px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          🚨 Recent Security Alerts
        </h4>
        
        {alerts.length === 0 ? (
          <div style={{ 
            color: '#9CA3AF', 
            fontSize: '12px',
            textAlign: 'center',
            padding: '20px'
          }}>
            No security alerts
          </div>
        ) : (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {alerts.map(alert => (
              <div key={alert.id} style={{
                background: 'rgba(31, 41, 55, 0.4)',
                border: `1px solid ${getSeverityColor(alert.severity)}40`,
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '8px',
                fontSize: '12px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <span style={{ 
                    color: getSeverityColor(alert.severity),
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {alert.severity}
                  </span>
                  <span style={{ color: '#9CA3AF' }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ color: '#F3F4F6', marginBottom: '4px' }}>
                  {alert.message}
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '11px' }}>
                  TX: {alert.txHash}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validator Activity */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ 
          color: '#F3F4F6', 
          marginBottom: '12px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          👥 Validator Activity
        </h4>
        
        <div style={{ display: 'grid', gap: '8px' }}>
          {Object.entries(securityMetrics.validatorActivity).map(([address, count]) => (
            <div key={address} style={{
              background: 'rgba(31, 41, 55, 0.4)',
              border: '1px solid rgba(75, 85, 99, 0.2)',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '12px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#F3F4F6' }}>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <span style={{ 
                  color: count > 0 ? '#10B981' : '#9CA3AF',
                  fontWeight: '600'
                }}>
                  {count} approvals
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
