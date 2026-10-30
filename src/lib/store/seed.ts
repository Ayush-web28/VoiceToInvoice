import { invoiceStore, clientStore } from './index';
import { InvoiceData } from '@/types';

export const sampleSeedInvoices: InvoiceData[] = [
  {
    id: 'inv_seed_plumbing',
    invoiceNumber: 'INV2-VTI-9401',
    paypalInvoiceId: 'INV2-SIM-PAID9401',
    status: 'PAID',
    currency: 'USD',
    invoiceDate: '2026-10-18',
    merchant: {
      name: 'Apex Mechanical Contracting',
      businessName: 'Apex Mechanical LLC',
      email: 'billing@apexmechanical.com',
      phone: '(555) 234-5678',
    },
    customer: {
      name: 'Robert Hastings',
      email: 'rhastings@crestwoodproperties.com',
      companyName: 'Crestwood Commercial Properties',
      phone: '(555) 302-8841',
      address: {
        addressLine1: '1420 Grand Avenue, Suite 200',
        adminArea2: 'Portland',
        adminArea1: 'OR',
        postalCode: '97201',
      },
    },
    items: [
      {
        id: '1',
        name: 'Commercial Boiler Annual Servicing & Flue Inspection',
        description: 'Exhaust analysis, safety valve recalibration, gasket replacement',
        quantity: 8,
        unitPrice: 110,
        taxRate: 0,
        itemDate: '2026-10-18',
      },
      {
        id: '2',
        name: 'High-Temperature Flange Gaskets',
        description: 'Commercial 4-inch neoprene reinforced seals',
        quantity: 4,
        unitPrice: 45,
        taxRate: 8.25,
        itemDate: '2026-10-18',
      },
    ],
    discount: { percent: 0, amount: 0 },
    paymentTerms: {
      termType: 'NET_15',
      dueDate: '2026-10-25',
      notes: 'Commercial maintenance agreement completed.',
      termsAndConditions: 'Payment due within 15 days of invoice date.',
    },
    subtotal: 1060,
    discountAmount: 0,
    taxAmount: 14.85,
    totalAmount: 1074.85,
    paypalPaymentUrl: 'https://www.sandbox.paypal.com/invoice/p/#INV2-SIM-PAID9401',
    paidAt: '2026-10-24T15:30:00Z',
    createdAt: '2026-10-18T09:00:00Z',
    updatedAt: '2026-10-24T15:30:00Z',
    metadata: {
      sourceType: 'voice',
      rawTranscript: 'Eight hours commercial boiler servicing at 110 an hour plus four gaskets at 45 each with 8.25 percent sales tax.',
    },
  },
  {
    id: 'inv_seed_webdev',
    invoiceNumber: 'INV2-VTI-9402',
    paypalInvoiceId: 'INV2-SIM-SENT9402',
    status: 'SENT',
    currency: 'USD',
    invoiceDate: '2026-10-25',
    merchant: {
      name: 'Elena Rostova',
      businessName: 'Rostova Cloud Solutions',
      email: 'elena@cloudarchitecture.io',
      phone: '(415) 555-0199',
    },
    customer: {
      name: 'David Vance',
      email: 'dvance@venturecorp.org',
      companyName: 'Venture Corp Holdings',
      phone: '(415) 555-7821',
      address: {
        addressLine1: '450 Mission Street, 12th Floor',
        adminArea2: 'San Francisco',
        adminArea1: 'CA',
        postalCode: '94105',
      },
    },
    items: [
      {
        id: '1',
        name: 'Full-Stack Next.js 14 App Router Modernization',
        description: 'Complete migration to App Router, React Server Components, and AG Grid ledger',
        quantity: 24,
        unitPrice: 125,
        taxRate: 0,
        itemDate: '2026-10-24',
      },
      {
        id: '2',
        name: 'PayPal Invoicing API v2 & Webhook Integration',
        description: 'OAuth2 token caching, draft dispatch, and automated payment webhook listeners',
        quantity: 12,
        unitPrice: 135,
        taxRate: 0,
        itemDate: '2026-10-25',
      },
    ],
    discount: { percent: 5, amount: 0 },
    paymentTerms: {
      termType: 'NET_30',
      dueDate: '2026-11-24',
      notes: 'Phase 1 deliverable accepted. 5% prompt payment discount applied.',
      termsAndConditions: 'Net 30. Payment via official PayPal business gateway.',
    },
    subtotal: 4620,
    discountAmount: 231,
    taxAmount: 0,
    totalAmount: 4389,
    paypalPaymentUrl: 'https://www.sandbox.paypal.com/invoice/p/#INV2-SIM-SENT9402',
    createdAt: '2026-10-25T11:00:00Z',
    updatedAt: '2026-10-25T11:00:00Z',
    metadata: {
      sourceType: 'text',
      rawTranscript: '24 hours nextjs modernization at 125/hr, 12 hours paypal v2 api integration at 135/hr, 5 percent discount for repeat contract.',
    },
  },
  {
    id: 'inv_seed_emergency_plumbing',
    invoiceNumber: 'INV2-VTI-9403',
    paypalInvoiceId: 'INV2-SIM-SENT9403',
    status: 'SENT',
    currency: 'USD',
    invoiceDate: '2026-10-28',
    merchant: {
      name: 'Apex Mechanical Contracting',
      businessName: 'Apex Mechanical LLC',
      email: 'billing@apexmechanical.com',
      phone: '(555) 234-5678',
    },
    customer: {
      name: 'Sarah Jenkins',
      email: 'sjenkins.home@gmail.com',
      phone: '(555) 876-5432',
      address: {
        addressLine1: '742 Evergreen Terrace',
        adminArea2: 'Springfield',
        adminArea1: 'OR',
        postalCode: '97477',
      },
    },
    items: [
      {
        id: '1',
        name: 'Labor - Emergency Plumbing & Pipe Fitting',
        description: 'Spoken note: Four and a half hours emergency pipe fitting',
        quantity: 4.5,
        unitPrice: 80,
        taxRate: 0,
        itemDate: '2026-10-28',
      },
      {
        id: '2',
        name: 'Brass Pressure Valve & Fittings',
        description: 'Replacement high-pressure brass valves',
        quantity: 1,
        unitPrice: 60,
        taxRate: 7.5,
        itemDate: '2026-10-28',
      },
    ],
    discount: { percent: 0, amount: 0 },
    paymentTerms: {
      termType: 'NET_15',
      dueDate: '2026-11-11',
      notes: 'Thank you for your business! Work covered by 1-year warranty.',
      termsAndConditions: 'Payment due within 14 days of invoice date.',
    },
    subtotal: 420,
    discountAmount: 0,
    taxAmount: 4.5,
    totalAmount: 424.5,
    paypalPaymentUrl: 'https://www.sandbox.paypal.com/invoice/p/#INV2-SIM-SENT9403',
    createdAt: '2026-10-28T14:15:00Z',
    updatedAt: '2026-10-28T14:15:00Z',
    metadata: {
      sourceType: 'voice',
      rawTranscript: 'Billed four and a half hours at eighty bucks an hour plus sixty dollars for parts. Client Sarah Jenkins at 742 Evergreen.',
    },
  },
  {
    id: 'inv_seed_hvac_overdue',
    invoiceNumber: 'INV2-VTI-9404',
    paypalInvoiceId: 'INV2-SIM-SENT9404',
    status: 'OVERDUE',
    currency: 'USD',
    invoiceDate: '2026-10-05',
    merchant: {
      name: 'Apex Mechanical Contracting',
      businessName: 'Apex Mechanical LLC',
      email: 'billing@apexmechanical.com',
      phone: '(555) 234-5678',
    },
    customer: {
      name: 'Marcus Brody',
      email: 'mbrody@brodyautomotive.com',
      companyName: 'Brody Automotive Works',
      phone: '(555) 441-9982',
      address: {
        addressLine1: '880 Industrial Parkway',
        adminArea2: 'Eugene',
        adminArea1: 'OR',
        postalCode: '97402',
      },
    },
    items: [
      {
        id: '1',
        name: 'Pneumatic Lift Air Line Repair & Valve Swap',
        description: 'Repaired fractured pneumatic pressure line and replaced quick-connect regulator',
        quantity: 3,
        unitPrice: 95,
        taxRate: 0,
        itemDate: '2026-10-05',
      },
      {
        id: '2',
        name: 'Heavy Duty 3/8" Air Couplers & Gauge',
        description: 'Industrial shop-grade pneumatic fittings',
        quantity: 2,
        unitPrice: 42.5,
        taxRate: 7.5,
        itemDate: '2026-10-05',
      },
    ],
    discount: { percent: 0, amount: 0 },
    paymentTerms: {
      termType: 'DUE_ON_RECEIPT',
      dueDate: '2026-10-12',
      notes: 'Second reminder: Past due balance. Please submit payment via PayPal link.',
      termsAndConditions: 'Payment due on receipt. 1.5% monthly finance charge on overdue accounts.',
    },
    subtotal: 370,
    discountAmount: 0,
    taxAmount: 6.38,
    totalAmount: 376.38,
    paypalPaymentUrl: 'https://www.sandbox.paypal.com/invoice/p/#INV2-SIM-SENT9404',
    createdAt: '2026-10-05T08:00:00Z',
    updatedAt: '2026-10-13T10:00:00Z',
    metadata: {
      sourceType: 'vision',
      rawTranscript: 'Receipt OCR: 3 hours mechanic diagnostic at 95 plus two 3/8 air couplers at 42.50 each.',
    },
  },
];

/**
 * Seed store with sample invoices and client profiles
 */
export function seedInitialData() {
  console.log('Seeding initial contractor invoices and client directories...');
  invoiceStore.seed(sampleSeedInvoices);

  for (const inv of sampleSeedInvoices) {
    clientStore.save({
      id: `client_${inv.customer.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: inv.customer.name,
      email: inv.customer.email,
      phone: inv.customer.phone,
      companyName: inv.customer.companyName,
      totalInvoiced: inv.totalAmount,
      totalPaid: inv.status === 'PAID' ? inv.totalAmount : 0,
      lastInvoiceDate: inv.invoiceDate,
      defaultPaymentTerms: inv.paymentTerms.termType,
    });
  }
  console.log(`Successfully seeded ${sampleSeedInvoices.length} contractor scenarios.`);
}

// Auto-seed if run directly
if (typeof require !== 'undefined' && require.main === module) {
  seedInitialData();
}
