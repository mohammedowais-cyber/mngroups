export interface NotificationPayload {
  recipientRole: 'tenant' | 'vendor' | 'manager' | 'admin';
  recipientId?: string;
  title: string;
  body: string;
  complaintId: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private hasFirebaseConfig = false;

  constructor() {
    this.hasFirebaseConfig = Boolean(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    );
  }

  async send(payload: NotificationPayload): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`[PUSH NOTIFICATION ${timestamp}] To [${payload.recipientRole.toUpperCase()}${payload.recipientId ? `:${payload.recipientId}` : ''}] -> "${payload.title}": ${payload.body} (Complaint: ${payload.complaintId})`);

    if (this.hasFirebaseConfig) {
      // Plug in firebase-admin send if credentials provided
      try {
        // e.g. admin.messaging().send(...)
      } catch (err) {
        console.error('Firebase messaging error:', err);
      }
    }
  }

  async onComplaintAssigned(complaintId: string, vendorId: string, categoryName: string, propertyName: string, unit: string) {
    await this.send({
      recipientRole: 'vendor',
      recipientId: vendorId,
      title: 'New Maintenance Job Assigned',
      body: `New ${categoryName} request at ${propertyName} (${unit}). Please accept and schedule visit.`,
      complaintId
    });
  }

  async onJobStarted(complaintId: string, tenantId: string, vendorName: string) {
    await this.send({
      recipientRole: 'tenant',
      recipientId: tenantId,
      title: 'Vendor Started Work',
      body: `${vendorName} has accepted and started work on your request.`,
      complaintId
    });
  }

  async onJobCompleted(complaintId: string, tenantId: string, vendorName: string) {
    await this.send({
      recipientRole: 'tenant',
      recipientId: tenantId,
      title: 'Job Completed — Review & Rate',
      body: `${vendorName} has completed the repair and submitted photos. Please verify and rate.`,
      complaintId
    });
  }

  async onComplaintClosed(complaintId: string, managerName: string, rating: number) {
    await this.send({
      recipientRole: 'manager',
      title: 'Complaint Closed & Verified',
      body: `Complaint ${complaintId} was verified with a ${rating}/5 star rating.`,
      complaintId
    });
  }
}

export const notificationService = new NotificationService();
