// Service to notify super admin page of client status changes
let superAdminUpdateCallback = null;

export const setSuperAdminUpdateCallback = (callback) => {
  superAdminUpdateCallback = callback;
};

export const notifyClientStatusChange = (email, newStatus) => {
  if (superAdminUpdateCallback) {
    superAdminUpdateCallback(email, newStatus);
  }
};