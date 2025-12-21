import { differenceInBusinessDays } from 'date-fns';
import { DeliveryWindow } from '@/types/database';

/**
 * Calculate the target delivery window based on the tentative delivery date
 * Rules:
 * - Within 10 business days: "immediate"
 * - 10-30 business days: "month"
 * - 30-70 business days: "quarter"
 * - More than 70 business days: "flexible"
 */
export function calculateDeliveryWindow(tentativeDate: Date | string | null): DeliveryWindow {
  if (!tentativeDate) return 'flexible';
  
  const date = typeof tentativeDate === 'string' ? new Date(tentativeDate) : tentativeDate;
  const today = new Date();
  
  // If date is in the past, return flexible
  if (date < today) return 'flexible';
  
  const businessDays = differenceInBusinessDays(date, today);
  
  if (businessDays <= 10) return 'immediate';
  if (businessDays <= 30) return 'month';
  if (businessDays <= 70) return 'quarter';
  return 'flexible';
}

/**
 * Calculate a suggested tentative delivery date based on target window
 * This provides a rough estimate when user selects a window
 */
export function suggestDeliveryDate(window: DeliveryWindow): Date | null {
  const today = new Date();
  
  switch (window) {
    case 'immediate':
      // 5 business days from now (roughly 1 week)
      return addBusinessDays(today, 5);
    case 'month':
      // 20 business days from now (roughly 1 month)
      return addBusinessDays(today, 20);
    case 'quarter':
      // 50 business days from now (roughly 2.5 months)
      return addBusinessDays(today, 50);
    case 'flexible':
      return null;
  }
}

/**
 * Add business days to a date
 */
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }
  
  return result;
}

/**
 * Format the delivery window for display
 */
export function formatDeliveryWindow(window: DeliveryWindow): string {
  switch (window) {
    case 'immediate':
      return 'Immediate (≤10 days)';
    case 'month':
      return 'This Month (10-30 days)';
    case 'quarter':
      return 'This Quarter (30-70 days)';
    case 'flexible':
      return 'Flexible (>70 days)';
  }
}

/**
 * Check if an initiative is at risk based on status and delivery date
 * At risk if:
 * - Status is 'blocked' or 'approved' (not started)
 * - AND tentative delivery date is within 10 business days
 */
export function isInitiativeAtRisk(
  status: string,
  tentativeDeliveryDate: string | null
): boolean {
  if (!tentativeDeliveryDate) return false;
  
  const atRiskStatuses = ['blocked', 'approved'];
  if (!atRiskStatuses.includes(status)) return false;
  
  const date = new Date(tentativeDeliveryDate);
  const today = new Date();
  
  if (date < today) return true; // Past due
  
  const businessDays = differenceInBusinessDays(date, today);
  return businessDays <= 10;
}

/**
 * Check if an initiative is upcoming (launching soon)
 * Upcoming if:
 * - Status is 'in_progress'
 * - AND tentative delivery date is within 10 business days
 */
export function isUpcomingLaunch(
  status: string,
  tentativeDeliveryDate: string | null
): boolean {
  if (!tentativeDeliveryDate) return false;
  if (status !== 'in_progress') return false;
  
  const date = new Date(tentativeDeliveryDate);
  const today = new Date();
  
  if (date < today) return false;
  
  const businessDays = differenceInBusinessDays(date, today);
  return businessDays <= 10;
}
