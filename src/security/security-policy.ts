export type SecurityDecision = 'allow' | 'flag' | 'block' | 'ban' | 'report';
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  eventId: string;
  timestamp: string;
  subjectId: string;
  nodeId?: string;
  source: 'vscodium' | 'sdk' | 'node-hook' | 'cloud107';
  action: string;
  severity: SecuritySeverity;
  reason: string;
  evidence?: Record<string, unknown>;
}

export interface SecurityDecisionResult {
  decision: SecurityDecision;
  severity: SecuritySeverity;
  reasons: string[];
  reportRequired: boolean;
}

export interface SecurityPolicy {
  enabled: boolean;
  failClosed: boolean;
  autoBanSeverities: SecuritySeverity[];
  autoReportSeverities: SecuritySeverity[];
  flagSeverities: SecuritySeverity[];
}

export const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  enabled: true,
  failClosed: true,
  autoBanSeverities: ['critical'],
  autoReportSeverities: ['high', 'critical'],
  flagSeverities: ['medium', 'high', 'critical'],
};

export function evaluateSecurityEvent(
  event: SecurityEvent,
  policy: SecurityPolicy = DEFAULT_SECURITY_POLICY,
): SecurityDecisionResult {
  if (!policy.enabled) {
    return { decision: 'allow', severity: event.severity, reasons: [], reportRequired: false };
  }

  const reasons = [event.reason];

  if (policy.autoBanSeverities.includes(event.severity)) {
    return { decision: 'ban', severity: event.severity, reasons, reportRequired: true };
  }
  if (policy.autoReportSeverities.includes(event.severity)) {
    return { decision: 'report', severity: event.severity, reasons, reportRequired: true };
  }
  if (policy.flagSeverities.includes(event.severity)) {
    return { decision: 'flag', severity: event.severity, reasons, reportRequired: false };
  }
  return { decision: 'allow', severity: event.severity, reasons: [], reportRequired: false };
}
