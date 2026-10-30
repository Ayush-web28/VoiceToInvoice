import { NextRequest, NextResponse } from 'next/server';
import { invoiceStore } from '@/lib/store';
import { InvoiceData } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let invoices = invoiceStore.getAll();

    // If store is currently empty, seed with initial realistic contractor scenarios
    if (invoices.length === 0) {
      const today = new Date();
      const pastDate1 = new Date(today);
      pastDate1.setDate(today.getDate() - 12);
      const pastDate2 = new Date(today);
      pastDate2.setDate(today.getDate() - 5);
      const futureDate1 = new Date(today);
      futureDate1.setDate(today.getDate() + 9);

      const sampleInvoices: InvoiceData[] = [
        {
          id: 'inv_seed_1',
          invoiceNumber: 'INV2-VTI-9401',
          paypalInvoiceId: 'INV2-SIM-PAID9401',
          status: 'PAID',
          currency: 'USD',
          invoiceDate: pastDate1.toISOString().split('T')[0],
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
            },
            {
              id: '2',
              name: 'High-Temperature Flange Gaskets',
              description: 'Commercial 4-inch neoprene reinforced seals',
              quantity: 4,
              unitPrice: 45,
              taxRate: 8.25,
            },
          ],
          discount: { percent: 0, amount: 0 },
          paymentTerms: {
            termType: 'NET_15',
            dueDate: pastDate2.toISOString().split('T')[0],
            notes: 'Commercial maintenance agreement completed.',
          },
          subtotal: 1060,
          discountAmount: 0,
          taxAmount: 14.85,
          totalAmount: 1074.85,
          paypalPaymentUrl: 'https://www.sandbox.paypal.com/invoice/p/#INV2-SIM-PAID9401',
          paidAt: pastDate2.toISOString(),
          createdAt: pastDate1.toISOString(),
          updatedAt: pastDate2.toISOString(),
        },
        {
          id: 'inv_seed_2',
          invoiceNumber: 'INV2-VTI-9402',
          paypalInvoiceId: 'INV2-SIM-SENT9402',
          status: 'SENT',
          currency: 'USD',
          invoiceDate: pastDate2.toISOString().split('T')[0],
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
            },
            {
              id: '2',
              name: 'Brass Pressure Valve & Fittings',
              description: 'Replacement high-pressure brass valves',
              quantity: 1,
              unitPrice: 60,
              taxRate: 7.5,
            },
          ],
          discount: { percent: 0, amount: 0 },
          paymentTerms: {
            termType: 'NET_15',
            dueDate: futureDate1.toISOString().split('T')[0],
            notes: 'Thank you for your business! Work covered by warranty.',
          },
          subtotal: 420,
          discountAmount: 0,
          taxAmount: 4.5,
          totalAmount: 424.5,
          paypalPaymentUrl: 'https://www.sandbox.paypal.com/invoice/p/#INV2-SIM-SENT9402',
          createdAt: pastDate2.toISOString(),
          updatedAt: pastDate2.toISOString(),
        },
        {
          id: 'inv_seed_3',
          invoiceNumber: 'INV2-VTI-9403',
          paypalInvoiceId: 'INV2-SIM-SENT9403',
          status: 'OVERDUE',
          currency: 'USD',
          invoiceDate: pastDate1.toISOString().split('T')[0],
          merchant: {
            name: 'Apex Mechanical Contracting',
            businessName: 'Apex Mechanical LLC',
            email: 'billing@apexmechanical.com',
            phone: '(555) 234-5678',
          },
          customer: {
            name: 'Marcus Brody',
            email: 'mbrody@brodyautomotive.com',
            companyName: 'Brody Auto Care',
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
              name: 'Pneumatic Lift Air Line Repair',
              description: 'Repaired fractured pneumatic line and replaced quick-connect regulator',
              quantity: 3,
              unitPrice: 95,
              taxRate: 0,
            },
          ],
          discount: { percent: 0, amount: 0 },
          paymentTerms: {
            termType: 'DUE_ON_RECEIPT',
            dueDate: pastDate1.toISOString().split('T')[0],
            notes: 'Please submit payment promptly via PayPal link.',
          },
          subtotal: 285,
          discountAmount: 0,
          taxAmount: 0,
          totalAmount: 285,
          paypalPaymentUrl: 'https://www.sandbox.paypal.com/invoice/p/#INV2-SIM-SENT9403',
          createdAt: pastDate1.toISOString(),
          updatedAt: pastDate1.toISOString(),
        },
      ];

      invoiceStore.seed(sampleInvoices);
      invoices = invoiceStore.getAll();
    }

    // Compute metrics
    const totalPaidReceivables = invoices
      .filter((inv) => inv.status === 'PAID' || inv.status === 'MARKED_AS_PAID')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    const pendingRevenue = invoices
      .filter((inv) => inv.status === 'SENT' || inv.status === 'DRAFT' || inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    // Calculate turnaround days for paid invoices
    const paidInvoices = invoices.filter(
      (inv) => (inv.status === 'PAID' || inv.status === 'MARKED_AS_PAID') && inv.paidAt
    );
    let avgTurnaroundDays = 2.4; // standard benchmark default
    if (paidInvoices.length > 0) {
      const totalDays = paidInvoices.reduce((sum, inv) => {
        const issue = new Date(inv.invoiceDate).getTime();
        const paid = new Date(inv.paidAt!).getTime();
        const diffDays = Math.max(0.5, (paid - issue) / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      avgTurnaroundDays = Number((totalDays / paidInvoices.length).toFixed(1));
    }

    return NextResponse.json({
      success: true,
      invoices,
      metrics: {
        totalPaidReceivables: Number(totalPaidReceivables.toFixed(2)),
        pendingRevenue: Number(pendingRevenue.toFixed(2)),
        averageTurnaroundDays: avgTurnaroundDays,
        totalInvoicesCount: invoices.length,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching invoices:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch invoices';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
