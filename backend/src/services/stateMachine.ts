export type ComplaintStatus = 'Submitted' | 'Assigned' | 'In Progress' | 'Completed' | 'Closed';

export class StateMachineError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'StateMachineError';
  }
}

export function validateTransition(currentStatus: ComplaintStatus, targetStatus: ComplaintStatus): void {
  const allowedTransitions: Record<ComplaintStatus, ComplaintStatus[]> = {
    'Submitted': ['Assigned'],
    'Assigned': ['In Progress'],
    'In Progress': ['Completed'],
    'Completed': ['Closed'],
    'Closed': []
  };

  const nextValid = allowedTransitions[currentStatus] || [];
  if (!nextValid.includes(targetStatus)) {
    throw new StateMachineError(
      `Invalid status transition: Cannot transition from '${currentStatus}' to '${targetStatus}'. Allowed: [${nextValid.join(', ')}]`
    );
  }
}
