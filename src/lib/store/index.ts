import fs from 'fs';
import path from 'path';
import os from 'os';
import { InvoiceData, ClientProfile } from '@/types';

// Storage file location for persistence (safe for local, Docker, and Vercel/serverless)
const DATA_DIR =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY
    ? path.join(os.tmpdir(), 'voicetoinvoice-data')
    : path.join(process.cwd(), '.data');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

// Ensure data directory exists
function ensureDataDir() {
  if (typeof window === 'undefined') {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (e) {
        console.error('Error creating data directory:', e);
      }
    }
  }
}

// In-memory cache for fast read/write
let memoryInvoices: InvoiceData[] = [];
let memoryClients: ClientProfile[] = [];
let isLoaded = false;

function loadFromDisk() {
  if (typeof window !== 'undefined' || isLoaded) return;
  ensureDataDir();
  try {
    if (fs.existsSync(INVOICES_FILE)) {
      const data = fs.readFileSync(INVOICES_FILE, 'utf-8');
      memoryInvoices = JSON.parse(data);
    }
    if (fs.existsSync(CLIENTS_FILE)) {
      const data = fs.readFileSync(CLIENTS_FILE, 'utf-8');
      memoryClients = JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed reading store files:', err);
  }
  isLoaded = true;
}

function saveToDisk() {
  if (typeof window !== 'undefined') return;
  ensureDataDir();
  try {
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(memoryInvoices, null, 2), 'utf-8');
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(memoryClients, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving store files:', err);
  }
}

export const invoiceStore = {
  getAll(): InvoiceData[] {
    loadFromDisk();
    return [...memoryInvoices];
  },

  getById(id: string): InvoiceData | undefined {
    loadFromDisk();
    return memoryInvoices.find(
      (inv) => inv.id === id || inv.paypalInvoiceId === id || inv.invoiceNumber === id
    );
  },

  save(invoice: InvoiceData): InvoiceData {
    loadFromDisk();
    const index = memoryInvoices.findIndex((i) => i.id === invoice.id);
    if (index >= 0) {
      memoryInvoices[index] = {
        ...invoice,
        updatedAt: new Date().toISOString(),
      };
    } else {
      memoryInvoices.unshift({
        ...invoice,
        createdAt: invoice.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    saveToDisk();
    return invoice;
  },

  updateStatus(id: string, status: InvoiceData['status'], paidAt?: string): InvoiceData | undefined {
    loadFromDisk();
    const invoice = memoryInvoices.find(
      (inv) => inv.id === id || inv.paypalInvoiceId === id || inv.invoiceNumber === id
    );
    if (invoice) {
      invoice.status = status;
      if (paidAt) invoice.paidAt = paidAt;
      invoice.updatedAt = new Date().toISOString();
      saveToDisk();
    }
    return invoice;
  },

  delete(id: string): boolean {
    loadFromDisk();
    const initialLen = memoryInvoices.length;
    memoryInvoices = memoryInvoices.filter((i) => i.id !== id && i.paypalInvoiceId !== id);
    const deleted = memoryInvoices.length < initialLen;
    if (deleted) saveToDisk();
    return deleted;
  },

  seed(initialInvoices: InvoiceData[]) {
    loadFromDisk();
    for (const inv of initialInvoices) {
      if (!memoryInvoices.some((existing) => existing.id === inv.id)) {
        memoryInvoices.push(inv);
      }
    }
    saveToDisk();
  },
};

export const clientStore = {
  getAll(): ClientProfile[] {
    loadFromDisk();
    return [...memoryClients];
  },

  save(client: ClientProfile): ClientProfile {
    loadFromDisk();
    const index = memoryClients.findIndex((c) => c.id === client.id || c.email === client.email);
    if (index >= 0) {
      memoryClients[index] = client;
    } else {
      memoryClients.push(client);
    }
    saveToDisk();
    return client;
  },
};
