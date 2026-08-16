type RiskStatus = "new" | "inprogress" | "pending" | "completed" 
type RiskSeverity = "low" | "medium" | "high" | "critical"

interface RiskDocument {
	status?: RiskStatus | string
	assignedToId?: string
	createdBy?: string
	severity: RiskSeverity
}
