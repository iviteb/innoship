export const defaultAWBFormat = 'A4';
export const awbContent = 'goods';
export const awbSourceChannel = 'ONLINE';
export const addressTypePickUp = 'pickup';
export const serviceLockers = 'Lockers';
export const requestHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
export const defaultServiceId = 1;
export const defaultCountryCode = 'RO';
export const defaultEnvelopeCount = 0;
export const defaultPalettesCount = 0;
export const pickupServiceId = 3;
export const awbStatusNew = 'New';
export const toDoStep = 'toDo';
export const completedStep = 'completed';
export const canceledStatus = 'canceled';

export const allFilterStatuses = {
  waitingAuth: 'waiting-ffmt-authorization,on-order-completed-ffm,order-accepted',
  paymentPending: 'payment-pending',
  paymentApproved: 'payment-approved',
  handling: 'handling',
  readyForHandling: 'ready-for-handling',
  invoiced: 'invoiced',
  canceled: 'canceled',
  windowToCancel: 'window-to-cancel'
}

export const allShippingEstimates = {
  nextDays: '7.days',
  tomorrow: '1.days',
  today: '0.days',
  late: '-1.days'
}
