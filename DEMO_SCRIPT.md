# VoiceToInvoice — Hackathon Video Walkthrough Demo Script
**Total Run Time:** 2 minutes 45 seconds (02:45)  
**Target Audience:** Hackathon Judges, Contractors, Freelancers & Small Business Owners  

---

### [00:00 – 00:25] The Problem & The Hook
**Visual on Screen:**  
- Camera opens on the speaker holding up a messy crumpled store receipt and scribbled paper napkin, then switches to the VoiceToInvoice Dashboard landing page (`/`).
- Quick highlight of the tagline: *"Turn Voice Notes & Receipts into Official PayPal Invoices"*.

**Voiceover:**  
> *"If you are a contractor, plumber, electrician, or freelance consultant, you know this pain: you finish a long job, have greasy hands or drive between sites, and jot notes on the back of receipts or try to remember your hours at midnight.*  
> *Contractors lose up to 18 hours every month just drafting invoices, leading to delayed payments and choked cash flow.*  
> *Meet **VoiceToInvoice** — the multimodal AI invoicing and cash flow copilot powered by Google Gemini 2.5 and PayPal Invoicing API v2."*

---

### [00:25 – 00:55] Voice Note Recording & Gemini 2.5 Multimodal Extraction
**Visual on Screen:**  
- Click **"Launch Invoice Studio"** (`/invoicing`).
- Click the glowing red **Record** button. The waveform visualizer pulses dynamically with the speaker's voice.
- Speaker says:
  > *"Met with client Sarah Jenkins at 742 Evergreen Terrace. Worked four and a half hours doing emergency pipe fitting and boiler diagnostic at eighty bucks an hour. Replaced high-pressure brass valve for sixty dollars. Payment due in two weeks."*
- Click **Stop**, then click **"Transcribe & Extract with Gemini 2.5"**.
- A momentary spinner appears, followed by an emerald toast notification: *"Gemini 2.5 extracted line items and client data from Voice Recording!"*

**Voiceover:**  
> *"Watch how easy this is. Right from my truck, I record a casual spoken memo. Notice I didn't format anything or use accounting jargon — I just said: 'four and a half hours at eighty bucks an hour plus sixty for parts'.*  
> *In under two seconds, Google Gemini 2.5 Multimodal analyzes the audio, extracts the exact billable rate, calculates 4.5 hours times $80, adds the $60 hardware item, detects the client name and address, and infers a Net 14 due date."*

---

### [00:55 – 01:30] Live Interactive Invoice Studio & Real-Time Math Engine
**Visual on Screen:**  
- Focus shifts to the right panel: The Live Interactive PayPal Invoice Document.
- Hover over the line items table.
- Demonstrate changing the quantity from 4.5 to 5 hours: watch the subtotal and total amount recalculate instantly.
- Toggle a 5% discount: observe the discount row recalculate dynamically.
- Briefly click the **Receipt OCR** tab on the left to show the drag-and-drop receipt image uploader.

**Voiceover:**  
> *"On the right panel, VoiceToInvoice gives us a live, interactive document editor. Every field is fully editable. If I tweak the hours from 4.5 to 5, the math engine updates the subtotal, sales tax, and total due in real time.*  
> *We also support receipts and handwritten job tickets! If you took a photo of your Home Depot receipt, Gemini 2.5 Vision cleans up the OCR noise, separates sales tax from the parts subtotal, and drops it right into this official invoice format."*

---

### [01:30 – 02:05] PayPal Invoicing API v2 Dispatch & Public Client Portal
**Visual on Screen:**  
- Click the prominent blue button: **"Dispatch via PayPal Invoicing API"**.
- The button displays a spinning state: *"Dispatching via PayPal API v2..."*.
- A success banner appears: *"Official PayPal Invoice INV2-VTI-9403 created and dispatched!"*
- Click **"View Client Portal"** (`/portal/[id]`).
- Display the clean, branded invoice portal showing the invoice details, the **"Pay with PayPal"** button, and the **"Print to PDF"** button.
- Click **"Print to PDF"** to briefly show the clean, print-optimized document layout.

**Voiceover:**  
> *"Now for the magic. We click 'Dispatch via PayPal'.*  
> *Behind the scenes, our Next.js backend requests an OAuth2 token from the PayPal Sandbox, calls `generate-next-invoice-number`, creates the draft invoice via the PayPal Invoicing API v2, and dispatches it immediately to the customer.*  
> *The customer gets an official email and can view this dedicated Client Portal. They can print an audit-ready PDF or click the official 'Pay with PayPal' button to settle their balance instantly."*

---

### [02:05 – 02:45] AG Grid Cash Flow Ledger, Webhooks & Render Deployment
**Visual on Screen:**  
- Navigate to the **Cash Flow Ledger** (`/invoices`).
- Show the 3 top metrics cards: **Total Paid Receivables** ($1,074.85), **Pending Revenue** ($4,813.50), and **Average Turnaround Time** (2.4 Days).
- Show the **AG Grid** interactive table:
  - Type *"Jenkins"* in the quick filter search box to show instant filtering.
  - Click the **"Remind"** button on an overdue invoice to demonstrate the automated payment cadence toast.
- Briefly switch back to the portal and click **"Simulate Sandbox Payment"**, then refresh the ledger to show the status turning from SENT to green PAID and receivables increasing.
- Show the `render.yaml` file in the repository to highlight zero-config deployment.

**Voiceover:**  
> *"Finally, we solve the cash flow tracking problem. This is our Cash Flow Ledger, powered by AG Grid React.*  
> *Contractors can see their total paid receivables, pending cash flow, and average turnaround time.*  
> *When customers pay, our PayPal webhook listener captures `INVOICING.INVOICE.PAID` and updates the ledger in real time.*  
> *And with one-click automated reminder cadences, you never have to manually chase late payments again.*  
> *VoiceToInvoice is fully open-source, Dockerized, and deployable to Render with zero configuration via our `render.yaml` blueprint.*  
> *Voice notes to paid invoices — in seconds. Thank you!"*
