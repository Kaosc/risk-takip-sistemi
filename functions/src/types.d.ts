type RiskStatus = "new" | "inprogress" | "pending" | "completed" 

interface RiskDocument {
	status?: RiskStatus | string
	assignedTo?: string
	createdBy?: string
}
