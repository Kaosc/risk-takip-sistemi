type RiskStatus = "new" | "inprogress" | "pending" | "completed" 
type RiskSeverity = "low" | "medium" | "high" | "critical"

interface RiskDocument {
	status?: RiskStatus | string
	assignedTo?: string
	createdBy?: string
	severity: RiskSeverity
}
