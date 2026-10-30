'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  Square,
  Upload,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  DollarSign,
  Send,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Clock,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { AudioRecorder } from '@/lib/audio/recorder';
import { InvoiceData, InvoiceItem, InvoiceExtractionSchema } from '@/types';

type InputMode = 'voice' | 'vision' | 'text';

export default function InvoiceStudioPage() {
  const router = useRouter();

  // Mode Selection
  const [activeTab, setActiveTab] = useState<InputMode>('voice');

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveformLevels, setWaveformLevels] = useState<number[]>(Array(24).fill(10));
  const recorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Vision State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Text Prompt State
  const [textPrompt, setTextPrompt] = useState(
    'Met with client Sarah Jenkins at 742 Evergreen Terrace. Worked four and a half hours doing pipe fitting and boiler repair at eighty bucks an hour. Replaced pressure valve and brass fittings for sixty dollars. Due in two weeks with no discount.'
  );

  // Extraction Processing State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionSource, setExtractionSource] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Dispatch / PayPal State
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{
    invoiceId: string;
    paymentUrl: string;
    invoiceNumber: string;
  } | null>(null);

  // Invoice Form State
  const [invoice, setInvoice] = useState<InvoiceData>({
    status: 'DRAFT',
    currency: 'USD',
    invoiceNumber: 'INV2-VTI-1001',
    invoiceDate: new Date().toISOString().split('T')[0],
    merchant: {
      name: 'Apex Mechanical Contracting',
      email: 'billing@apexmechanical.com',
      phone: '(555) 234-5678',
      businessName: 'Apex Mechanical LLC',
    },
    customer: {
      name: 'Sarah Jenkins',
      email: 'sjenkins.home@gmail.com',
      phone: '(555) 876-5432',
      companyName: '',
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
        description: 'Diagnostic and boiler repair work',
        quantity: 4.5,
        unitPrice: 80,
        taxRate: 0,
        itemDate: new Date().toISOString().split('T')[0],
      },
      {
        id: '2',
        name: 'Brass Pressure Valve & Fittings',
        description: 'Replacement high-pressure valve parts',
        quantity: 1,
        unitPrice: 60,
        taxRate: 7.5,
        itemDate: new Date().toISOString().split('T')[0],
      },
    ],
    discount: {
      percent: 0,
      amount: 0,
    },
    paymentTerms: {
      termType: 'NET_15',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      notes: 'Thank you for your business! Work covered by 1-year service warranty.',
      termsAndConditions: 'Payment due within 14 days of invoice date via PayPal.',
    },
    subtotal: 420,
    discountAmount: 0,
    taxAmount: 4.5,
    totalAmount: 424.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Calculate Subtotal, Taxes, Discounts, and Grand Total dynamically
  const calculations = useMemo(() => {
    const subtotal = invoice.items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      return sum + q * p;
    }, 0);

    let discountAmount = 0;
    if (invoice.discount?.amount && invoice.discount.amount > 0) {
      discountAmount = Number(invoice.discount.amount);
    } else if (invoice.discount?.percent && invoice.discount.percent > 0) {
      discountAmount = (subtotal * Number(invoice.discount.percent)) / 100;
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    const taxAmount = invoice.items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      const rate = Number(item.taxRate) || 0;
      const lineTotal = q * p;
      return sum + (lineTotal * rate) / 100;
    }, 0);

    const totalAmount = discountedSubtotal + taxAmount;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  }, [invoice.items, invoice.discount]);

  // Keep invoice calculated totals synchronized
  useEffect(() => {
    setInvoice((prev) => ({
      ...prev,
      subtotal: calculations.subtotal,
      discountAmount: calculations.discountAmount,
      taxAmount: calculations.taxAmount,
      totalAmount: calculations.totalAmount,
    }));
  }, [calculations]);

  // Audio Recording Handlers
  const handleStartRecording = async () => {
    try {
      setStatusMessage(null);
      const recorder = new AudioRecorder((freqData) => {
        // Sample frequencies to render waveform bars
        const bars: number[] = [];
        const step = Math.floor(freqData.length / 24) || 1;
        for (let i = 0; i < 24; i++) {
          const val = freqData[i * step] || 10;
          bars.push(Math.max(12, Math.min(80, Math.floor(val * 0.7))));
        }
        setWaveformLevels(bars);
      });

      recorderRef.current = recorder;
      await recorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Microphone permission denied or device not found.',
      });
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current || !isRecording) return;
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      const { blob } = await recorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      setWaveformLevels(Array(24).fill(16));
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  // Synchronize AI extraction into editable invoice fields
  const applyAIExtraction = (schema: InvoiceExtractionSchema, source: string) => {
    setInvoice((prev) => {
      const items: InvoiceItem[] = (schema.items || []).map((item, idx) => ({
        id: String(idx + 1),
        name: item.name || 'Service Item',
        description: item.description || '',
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        taxRate: Number(item.taxRate) || 0,
        itemDate: item.itemDate || prev.invoiceDate,
      }));

      return {
        ...prev,
        currency: schema.currency || prev.currency || 'USD',
        merchant: {
          name: schema.merchant?.name || prev.merchant.name,
          email: schema.merchant?.email || prev.merchant.email,
          phone: schema.merchant?.phone || prev.merchant.phone,
          businessName: schema.merchant?.businessName || prev.merchant.businessName,
        },
        customer: {
          name: schema.customer?.name || prev.customer.name,
          email: schema.customer?.email || prev.customer.email,
          phone: schema.customer?.phone || prev.customer.phone || '',
          companyName: '',
          address: {
            addressLine1: schema.customer?.address || prev.customer.address?.addressLine1 || '',
            adminArea2: prev.customer.address?.adminArea2 || '',
            adminArea1: prev.customer.address?.adminArea1 || '',
            postalCode: prev.customer.address?.postalCode || '',
          },
        },
        items: items.length > 0 ? items : prev.items,
        discount: {
          percent: schema.discount?.percent || 0,
          amount: schema.discount?.amount || 0,
        },
        paymentTerms: {
          termType: prev.paymentTerms.termType,
          dueDate: schema.paymentTerms?.dueDate || prev.paymentTerms.dueDate,
          notes: schema.paymentTerms?.notes || prev.paymentTerms.notes,
          termsAndConditions:
            schema.paymentTerms?.termsAndConditions || prev.paymentTerms.termsAndConditions,
        },
      };
    });

    setExtractionSource(source);
    setStatusMessage({
      type: 'success',
      text: `Gemini 2.5 extracted ${schema.items?.length || 0} line items and client data from ${source}!`,
    });
  };

  // Submit Voice Note to API
  const handleExtractVoice = async () => {
    if (!audioBlob) return;
    setIsExtracting(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const res = await fetch('/api/invoice/voice', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Voice extraction failed');

      applyAIExtraction(data.extraction, 'Voice Recording');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to extract voice note';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsExtracting(false);
    }
  };

  // Submit Vision Photo to API
  const handleExtractVision = async () => {
    if (!selectedImage) return;
    setIsExtracting(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const res = await fetch('/api/invoice/vision', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Vision OCR extraction failed');

      applyAIExtraction(data.extraction, 'Receipt Photo OCR');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to OCR image';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsExtracting(false);
    }
  };

  // Submit Text Prompt to API
  const handleExtractText = async () => {
    if (!textPrompt.trim()) return;
    setIsExtracting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/invoice/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textPrompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Text extraction failed');

      applyAIExtraction(data.extraction, 'Text Note');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to extract text prompt';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle Preset Canned Scenarios
  const loadPresetScenario = (scenario: 'contractor' | 'hvac' | 'web') => {
    if (scenario === 'contractor') {
      setTextPrompt(
        'Billed four and a half hours at eighty bucks an hour plus sixty dollars for parts. Client Sarah Jenkins, sjenkins.home@gmail.com, 742 Evergreen Terrace. Replace valves.'
      );
    } else if (scenario === 'hvac') {
      setTextPrompt(
        'Emergency HVAC condenser replacement for Acme Tech Solutions, accounting@acmetech.io. 6 hours labor at $110/hr. 1 commercial fan capacitor for $240. 8.25% sales tax on parts. Due in 7 days.'
      );
    } else {
      setTextPrompt(
        'Freelance Web Design & Next.js modernization for David Vance, dvance@venturecorp.org. 15 hours UI development at $95/hour. $150 domain and hosting setup. 10 percent discount applied. Due in 30 days.'
      );
    }
    setActiveTab('text');
  };

  // Line Items Controls
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      itemDate: invoice.invoiceDate,
    };
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleUpdateItem = (id: string | undefined, field: keyof InvoiceItem, value: unknown) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const handleDeleteItem = (id: string | undefined) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // Dispatch via PayPal Invoicing API v2
  const handleDispatchPayPal = async () => {
    setIsDispatching(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/invoice/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to dispatch PayPal invoice');

      setDispatchResult({
        invoiceId: result.paypalInvoiceId,
        paymentUrl: result.paymentUrl,
        invoiceNumber: result.invoiceNumber,
      });

      setInvoice((prev) => ({
        ...prev,
        status: 'SENT',
        paypalInvoiceId: result.paypalInvoiceId,
        paypalPaymentUrl: result.paymentUrl,
      }));

      setStatusMessage({
        type: 'success',
        text: `Official PayPal Invoice ${result.invoiceNumber} successfully created and dispatched!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'PayPal dispatch failed';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interactive Invoice Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Live Copilot
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Speak a voice note or upload a receipt photo. Gemini 2.5 extracts line items into an official PayPal invoice in real time.
          </p>
        </div>

        {/* Quick Demo Scenario Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quick Prompts:
          </span>
          <button
            onClick={() => loadPresetScenario('contractor')}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Plumbing Job
          </button>
          <button
            onClick={() => loadPresetScenario('hvac')}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            HVAC Ticket
          </button>
          <button
            onClick={() => loadPresetScenario('web')}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Web Dev Net30
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-start gap-3 border shadow-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {statusMessage.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
          {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
          <div className="flex-1 text-sm font-medium">{statusMessage.text}</div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT PANEL: Multimodal Input Switcher ================= */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Input Tabs Header */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5">
              <button
                onClick={() => setActiveTab('voice')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'voice'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mic className="w-4 h-4" />
                Voice Recorder
              </button>
              <button
                onClick={() => setActiveTab('vision')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'vision'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Receipt OCR
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'text'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                Text Prompt
              </button>
            </div>

            <div className="p-6">
              {/* TAB 1: Voice Recorder */}
              {activeTab === 'voice' && (
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <button
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center text-white transition-all shadow-xl ${
                        isRecording
                          ? 'bg-rose-600 hover:bg-rose-700 scale-105 shadow-rose-500/40'
                          : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-7 h-7 fill-white" />
                          <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Stop</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-8 h-8" />
                          <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Record</span>
                        </>
                      )}
                    </button>
                    {isRecording && (
                      <span className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping"></span>
                    )}
                  </div>

                  {/* Waveform / Frequency Indicator */}
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'
                          }`}
                        ></span>
                        {isRecording ? 'Recording Live Audio...' : 'Microphone Ready'}
                      </span>
                      <span className="font-mono text-slate-700 text-sm">
                        {Math.floor(recordDuration / 60)
                          .toString()
                          .padStart(2, '0')}
                        :
                        {(recordDuration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    {/* Waveform bars */}
                    <div className="flex items-end justify-center gap-1.5 h-16 px-2">
                      {waveformLevels.map((lvl, idx) => (
                        <div
                          key={idx}
                          style={{ height: `${lvl}%` }}
                          className={`w-2 rounded-full transition-all duration-75 ${
                            isRecording ? 'bg-gradient-to-t from-blue-600 to-indigo-500' : 'bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Audio Player Preview */}
                  {audioUrl && (
                    <div className="w-full mb-4">
                      <audio controls src={audioUrl} className="w-full h-10 rounded-lg" />
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={handleExtractVoice}
                    disabled={!audioBlob || isExtracting || isRecording}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Gemini 2.5 Transcribing Voice...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Transcribe & Extract with Gemini 2.5
                      </>
                    )}
                  </button>
                  <p className="mt-3 text-xs text-slate-400">
                    Supports colloquial phrases: &ldquo;four and a half hours at eighty bucks an hour plus sixty for parts&rdquo;
                  </p>
                </div>
              )}

              {/* TAB 2: Vision / Receipt OCR */}
              {activeTab === 'vision' && (
                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedImage(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition mb-4"
                  >
                    {imagePreview ? (
                      <div className="relative group">
                        <img
                          src={imagePreview}
                          alt="Receipt preview"
                          className="max-h-48 mx-auto rounded-xl shadow-sm object-contain"
                        />
                        <div className="mt-3 text-xs text-blue-600 font-semibold group-hover:underline">
                          Click to choose a different photo
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          Upload receipt or handwritten job ticket
                        </p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleExtractVision}
                    disabled={!selectedImage || isExtracting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Gemini 2.5 Reading Receipt OCR...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Extract Receipt Line Items & Taxes
                      </>
                    )}
                  </button>
                  <p className="mt-3 text-xs text-slate-400 text-center">
                    Gemini 2.5 Vision OCR extracts line items, sales taxes, and customer details.
                  </p>
                </div>
              )}

              {/* TAB 3: Text Prompt */}
              {activeTab === 'text' && (
                <div className="flex flex-col">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Contractor Spoken / Typed Job Notes
                  </label>
                  <textarea
                    rows={6}
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder="Describe the job, hours, rates, materials, client name, and email..."
                    className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 resize-none mb-4"
                  />

                  <button
                    onClick={handleExtractText}
                    disabled={!textPrompt.trim() || isExtracting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Gemini 2.5 Structuring Invoice...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Extract Invoice Fields with Gemini 2.5
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Extraction Source Badge */}
          {extractionSource && (
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-4 flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>
                  Synchronized from: <strong>{extractionSource}</strong>
                </span>
              </div>
              <span className="font-mono bg-blue-200/60 text-blue-800 px-2 py-0.5 rounded font-bold">
                Gemini 2.5 Flash
              </span>
            </div>
          )}

          {/* Successful Dispatch Modal / Card */}
          {dispatchResult && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Official PayPal Invoice Dispatched!
              </div>
              <p className="text-xs text-emerald-700 mb-3">
                PayPal Invoice <strong>{dispatchResult.invoiceNumber}</strong> (ID: {dispatchResult.invoiceId}) is live in Sandbox mode.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={dispatchResult.paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  PayPal Payer Portal
                </a>
                <button
                  onClick={() => router.push(`/portal/${dispatchResult.invoiceId}`)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-800 text-xs font-semibold rounded-lg transition"
                >
                  View Client Portal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT PANEL: Live Interactive Invoice Editor ================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden print-page">
          {/* Top Document Ribbon */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center text-blue-300 border border-blue-400/20">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight">Official PayPal Invoice Document</h2>
                <span className="text-[11px] text-blue-200">
                  PayPal Invoicing API v2 Format
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  invoice.status === 'SENT'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Merchant and Invoice Number Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="flex-1 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Invoicer / Merchant
                </label>
                <input
                  type="text"
                  value={invoice.merchant.businessName || ''}
                  onChange={(e) =>
                    setInvoice((prev) => ({
                      ...prev,
                      merchant: { ...prev.merchant, businessName: e.target.value },
                    }))
                  }
                  placeholder="Business Trade Name"
                  className="w-full text-lg font-bold text-slate-900 border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-blue-600 focus:outline-none pb-0.5"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    value={invoice.merchant.name || ''}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        merchant: { ...prev.merchant, name: e.target.value },
                      }))
                    }
                    placeholder="Merchant Contact Name"
                    className="text-xs text-slate-600 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    value={invoice.merchant.email || ''}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        merchant: { ...prev.merchant, email: e.target.value },
                      }))
                    }
                    placeholder="billing@domain.com"
                    className="text-xs text-slate-600 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Invoice Meta Dates */}
              <div className="sm:text-right space-y-2 sm:min-w-[200px]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Invoice #
                  </span>
                  <input
                    type="text"
                    value={invoice.invoiceNumber || ''}
                    onChange={(e) =>
                      setInvoice((prev) => ({ ...prev, invoiceNumber: e.target.value }))
                    }
                    className="text-sm font-mono font-bold text-slate-900 sm:text-right border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Date</span>
                    <input
                      type="date"
                      value={invoice.invoiceDate}
                      onChange={(e) =>
                        setInvoice((prev) => ({ ...prev, invoiceDate: e.target.value }))
                      }
                      className="border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 w-full"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Due Date</span>
                    <input
                      type="date"
                      value={invoice.paymentTerms.dueDate}
                      onChange={(e) =>
                        setInvoice((prev) => ({
                          ...prev,
                          paymentTerms: { ...prev.paymentTerms, dueDate: e.target.value },
                        }))
                      }
                      className="border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 w-full font-semibold text-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Billed To (Customer Details) */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Billed To (Client / Customer)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={invoice.customer.name}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        customer: { ...prev.customer, name: e.target.value },
                      }))
                    }
                    placeholder="Customer Name"
                    className="w-full text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                  />
                  <input
                    type="email"
                    value={invoice.customer.email}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        customer: { ...prev.customer, email: e.target.value },
                      }))
                    }
                    placeholder="client.email@example.com"
                    className="w-full text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={invoice.customer.address?.addressLine1 || ''}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        customer: {
                          ...prev.customer,
                          address: { ...prev.customer.address, addressLine1: e.target.value },
                        },
                      }))
                    }
                    placeholder="Street Address, City, State"
                    className="w-full text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                  />
                  <input
                    type="text"
                    value={invoice.customer.phone || ''}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        customer: { ...prev.customer, phone: e.target.value },
                      }))
                    }
                    placeholder="Phone number"
                    className="w-full text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Line Items & Billable Hours
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line Item
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-3">Description / Service</th>
                      <th className="py-2.5 px-2 w-20 text-center">Qty / Hrs</th>
                      <th className="py-2.5 px-2 w-24 text-right">Rate ($)</th>
                      <th className="py-2.5 px-2 w-20 text-center">Tax %</th>
                      <th className="py-2.5 px-3 w-24 text-right">Amount</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {invoice.items.map((item) => {
                      const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                              placeholder="Item or service name"
                              className="w-full font-semibold text-slate-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                            />
                            <input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) =>
                                handleUpdateItem(item.id, 'description', e.target.value)
                              }
                              placeholder="Detailed notes or specs..."
                              className="w-full text-slate-500 text-[11px] bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 mt-0.5"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              step="any"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                              }
                              className="w-full text-center font-medium bg-slate-50 border border-slate-200 rounded py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <input
                              type="number"
                              step="any"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                              }
                              className="w-full text-right font-medium bg-slate-50 border border-slate-200 rounded py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              step="any"
                              value={item.taxRate || 0}
                              onChange={(e) =>
                                handleUpdateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)
                              }
                              className="w-full text-center font-medium bg-slate-50 border border-slate-200 rounded py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-600"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900 font-mono">
                            ${lineTotal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={invoice.items.length <= 1}
                              className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals & Financial Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
              {/* Notes and Terms */}
              <div className="flex-1 w-full space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Customer Notes
                  </label>
                  <textarea
                    rows={2}
                    value={invoice.paymentTerms.notes || ''}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        paymentTerms: { ...prev.paymentTerms, notes: e.target.value },
                      }))
                    }
                    placeholder="Notes to the buyer..."
                    className="w-full text-xs text-slate-700 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Terms & Conditions
                  </label>
                  <input
                    type="text"
                    value={invoice.paymentTerms.termsAndConditions || ''}
                    onChange={(e) =>
                      setInvoice((prev) => ({
                        ...prev,
                        paymentTerms: { ...prev.paymentTerms, termsAndConditions: e.target.value },
                      }))
                    }
                    placeholder="e.g. Net 15, warranty terms, late fee policy"
                    className="w-full text-xs text-slate-600 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Financial Summary Card */}
              <div className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ${calculations.subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    Discount (%):
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      value={invoice.discount?.percent || 0}
                      onChange={(e) =>
                        setInvoice((prev) => ({
                          ...prev,
                          discount: { ...prev.discount, percent: parseFloat(e.target.value) || 0 },
                        }))
                      }
                      className="w-12 text-center bg-white border border-slate-200 rounded px-1 py-0.5 text-xs text-slate-700"
                    />
                  </span>
                  <span className="font-mono text-rose-600 font-semibold">
                    -${calculations.discountAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-600">
                  <span>Sales Tax Total:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    +${calculations.taxAmount.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-extrabold text-slate-900">Total Due:</span>
                  <span className="text-xl font-extrabold text-blue-700 font-mono">
                    ${calculations.totalAmount.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      {invoice.currency}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                Print / Save PDF
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDispatchPayPal}
                  disabled={isDispatching || invoice.items.length === 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0070BA] hover:bg-[#003087] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isDispatching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Dispatching via PayPal API v2...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      Dispatch via PayPal Invoicing API
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
