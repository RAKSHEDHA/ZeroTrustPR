export type ThreatLevel = "Low" | "Medium" | "High" | "Critical";

export interface Vulnerability {
  file: string;
  line_number: number;
  threat_level: ThreatLevel;
  vulnerability_type: string;
  description: string;
  remediation_code: string;
}

export interface SecurityReport {
  is_secure: boolean;
  threat_summary: string;
  vulnerabilities: Vulnerability[];
}
