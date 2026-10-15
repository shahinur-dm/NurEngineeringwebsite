# Nur Engineering Solution — Web Platform

**Official Website:** [https://nurengineeringbd.com](https://nurengineeringbd.com)  
**Production Deployment:** [https://nur-company-website.vercel.app](https://nur-company-website.vercel.app)  
**Vercel Dashboard:** [https://vercel.com/next-gen-technology/nur-company-website](https://vercel.com/next-gen-technology/nur-company-website)  
**GitHub Repository:** [https://github.com/shahinur-dm/NurEngineeringwebsite](https://github.com/shahinur-dm/NurEngineeringwebsite)  

---

## 📋 আজকের কাজের সারসংক্ষেপ (Today's Work Summary)

আজকে ওয়েবসাইটে ২টি প্রধান বড় টেকনিক্যাল সমস্যা সমাধান এবং নতুন আর্কিটেকচার ইমপ্লিমেন্ট করা হয়েছে, ডাটাবেজ কনফিগারেশন আপডেট করা হয়েছে এবং গিটহাব ও ভার্সেলে লাইভ প্রোডাকশনে ডিপ্লয় করা হয়েছে:

1. **টেকনিক্যাল এসইও (Technical SEO) এবং গুগল সার্চ ভিজিবিলিটি ফিক্স:**
   - সম্পূর্ণ ওয়েবসাইট গুগল সার্চ রেজাল্টে র‍্যাংক করানোর জন্য ডায়নামিক এক্সএমএল সাইটম্যাপ (`/sitemap.xml`) তৈরি করা হয়েছে।
   - সার্চ ইঞ্জিন ক্রলারদের জন্য স্ট্যান্ডার্ড `robots.txt` কনফিগার করা হয়েছে।
   - ডুপ্লিকেট কন্টেন্ট রোধে প্রতিটি পেজে ক্যানোনিকাল ট্যাগ (Canonical URLs) যোগ করা হয়েছে।
   - গুগল রিচ স্নsnippet-এর জন্য JSON-LD Structured Data (Organization, WebSite, Product, Service, BreadcrumbList) যুক্ত করা হয়েছে।
   - কোম্পানি, পিএলসি অটোমেশন, সার্ভো ড্রাইভ ও মোটর, ইনজেকশন মোল্ডিং মেশিনারিজ সম্পর্কিত মেটা টাইটেল, ডেসক্রিপশন এবং ওজি (Open Graph) ট্যাগ অপটিমাইজ করা হয়েছে।

2. **অ্যাডমিন প্যানেলে ৪MB পিডিএফ আপলোড লিমিট অপসারণ (Remove 4MB PDF Limitation in `/admin/downloads`):**
   - আগের ৪MB হার্ডকোডেড লিমিট এবং ভার্সেল সার্ভারলেসের ৪.৫MB পেলোড সিলিং (HTTP 413) সমস্যা চিরতরে সমাধান করা হয়েছে।
   - নতুন **ডাইরেক্ট গ্রিডএফএস চাঙ্ক স্ট্রিমিং আর্কিটেকচার (Direct GridFS Chunk Streaming Architecture)** তৈরি করা হয়েছে।
   - এখন অ্যাডমিন প্যানেল থেকে **২৫MB+ এবং সর্বোচ্চ ৫০MB** পর্যন্ত যেকোনো বড় সাইজের পিডিএফ ক্যাটালগ ও ইউজার ম্যানুয়াল অনায়াসে আপলোড ও ডাউনলোড করা যায়।
   - আপলোডের সময় লাইভ পার্সেন্টেজ প্রোগ্রেস বার (0% to 100%) যোগ করা হয়েছে।
   - সার্ভার মেমোরি ক্র্যাশ প্রতিরোধে স্ট্রিমিং ডাউনলোড ইমপ্লিমেন্ট করা হয়েছে।
   - সিকিউরিটির জন্য সার্ভার-সাইডে পিডিএফ ফাইল সিগনেচার (`%PDF-`) ভ্যালিডেশন নিশ্চিত করা হয়েছে।
   - ইউআই/ইউএক্স (UI/UX), ডিজাইন, বাটন বা টেবিল লেআউটে কোনো ধরনের পরিবর্তন না করে ব্যাকএন্ড নিখুঁতভাবে আপগ্রেড করা হয়েছে।

3. **ডাটাবেজ ও ক্লাউড কনফিগারেশন আপডেট:**
   - ডেডিকেটেড ক্লাস্টার কানেকশন স্ট্রিং (`NurCompanyWebsite`) আপডেট ও কনফিগার করা হয়েছে:
     `mongodb+srv://efootballmadrid25_db_user:ljvpbVMGVJTQPVcH@dawatit.5hxbo9c.mongodb.net/NurCompanyWebsite?appName=dawatit`

4. **গিট ও ভার্সেল প্রোডাকশন ডিপ্লয়মেন্ট:**
   - সমস্ত কোড গিটহাবে `main` ব্রাঞ্চে পুশ করা হয়েছে।
   - ভার্সেল প্রোডাকশনে সম্পূর্ণ বিল্ড সফলভাবে কম্পাইল ও ডিপ্লয় করা হয়েছে (State: READY, Exit Code 0)।

---

## 🛠️ Detailed Technical Documentation of Today's Work

### 1. Admin Downloads: 50MB PDF Upload & Streaming Architecture

#### Root Cause Analysis
* **Legacy Backend Validation:** Both `/api/admin/downloads` and `/api/admin/downloads/[id]` rejected files exceeding `4 * 1024 * 1024` bytes.
* **Hosting Platform Constraint:** Vercel Serverless Functions enforce a strict **4.5MB request payload limit** (`HTTP 413: Payload Too Large`). Single-request multipart uploads larger than 4.5MB fail at the network edge.
* **Legacy Memory Buffering:** The old download handler buffered the entire file into Node.js server RAM using `Buffer.concat`, which caused memory spikes on larger PDFs.

#### Architecture Solution Implemented
* **Client Chunk Size:** Set to `2,611,200 bytes` (~2.49 MB). Safely fits inside Vercel's 4.5MB limit.
* **Direct GridFS Alignment:** MongoDB GridFS stores files in chunks of 255KB (`261,120 bytes`). Each 2.49MB client chunk slices in Node memory into exactly 10 standard GridFS subchunks (`n = chunkIndex * 10 + subIndex`) and writes directly into MongoDB's native `download_files.chunks` collection using `chunksCol.insertMany(docs)`.
* **Instantaneous Assembly:** When all chunks finish, `action=finish` does not need to re-read or re-stream multi-megabyte binary data over the network. It writes a single metadata document into `download_files.files`, executing in under **10ms**.
* **Zero-Memory Streaming Download:** The download route (`/api/downloads/[id]/file`) reads natively via `bucket.openDownloadStream` and pipes a Web `ReadableStream` directly into the HTTP response. Server memory usage remains flat and minimal regardless of file size.
* **Security & Validation:**
  - Validates `%PDF-` magic header within the first 1024 bytes on chunk 0.
  - Rejects non-PDF files and files exceeding 50MB with clear HTTP 400 error responses.
  - Enforces Super Admin authentication (`role === "viewer"` rejected with HTTP 403).

#### Verification & Test Results
A comprehensive test suite was executed against the production Next.js build:

| Test Case | Description | Result | Status |
|---|---|---|---|
| **Test 1** | Unauthorized upload / access protection | HTTP 401 Unauthorized | **PASS** |
| **Test 2** | Non-PDF file upload rejection (`script.exe`) | HTTP 400 (`Only PDF files (.pdf) are allowed`) | **PASS** |
| **Test 3** | Oversized file rejection (>50MB) | HTTP 400 (`File size exceeds maximum allowed upload limit of 50MB`) | **PASS** |
| **Test 4** | Upload & Download PDF < 4MB (**1.5 MB**) | 1,572,864 bytes verified byte-for-byte; valid `%PDF-` | **PASS** |
| **Test 5** | Upload & Download PDF > 4MB (**10 MB**) | 10,485,760 bytes verified byte-for-byte; valid `%PDF-` | **PASS** |
| **Test 6** | Upload & Download PDF >= 25MB (**25 MB**) | 26,214,400 bytes verified byte-for-byte; valid `%PDF-` | **PASS** |
| **Test 7** | Tab persistence & filtering | 10MB in Catalogue; 1.5MB & 25MB in User Manual | **PASS** |
| **Test 8** | Existing original download links | HTTP 200 without corruption or truncation (828,310 bytes intact) | **PASS** |
| **Test 9** | Production Next.js build | Exit code 0 (`npm run build`) | **PASS** |

---

### 2. Technical SEO & Google Search Visibility

#### Implemented Features
* **Dynamic XML Sitemap (`/sitemap.xml`):** Automatically indexes all static and dynamic pages (products, categories, services, blogs, contact, use-cases) with appropriate `<changefreq>`, `<priority>`, and `<lastmod>` attributes.
* **Search Engine Directive (`/robots.txt`):** Allows crawling of public routes by Googlebot and all search engines while protecting administrative endpoints.
* **Canonical URL Implementation:** Added canonical tags across all pages to consolidate link equity and eliminate duplicate content penalties.
* **JSON-LD Structured Data:**
  - `Organization` & `WebSite` schema on homepage.
  - `Product` schema on individual product pages with price, availability, and description.
  - `Service` schema on service detail pages.
  - `BreadcrumbList` schema for breadcrumb navigation.
* **Keyword Optimization:** Tailored titles and descriptions focused on:
  - Nur Engineering Solution
  - PLC Automation & Programming (Ai530, Mi530, Hering628, Porcheson)
  - Servo Motors, Servo Drives & Hydraulic Pumps (Inovance, etc.)
  - Industrial Machineries & Machine Conversion (Injection Molding, Extrusion Blow Molding, Die Casting, Industrial Chillers).
* **Social Sharing:** Complete Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) and Twitter card tags.

---

### 3. Files Modified & Added Today

```text
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── downloads/
│   │   │       └── page.tsx              # Chunked upload UI with progress bar & 50MB limit
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   └── downloads/
│   │   │   │       ├── route.ts          # Raised fallback limit to 50MB + PDF verification
│   │   │   │       ├── [id]/
│   │   │   │       │   └── route.ts      # Raised fallback edit limit to 50MB
│   │   │   │       └── chunk/
│   │   │   │           └── route.ts      # [NEW] Chunk upload handling (start/upload/finish/delete)
│   │   │   └── downloads/
│   │   │       └── [id]/
│   │   │           └── file/
│   │   │               └── route.ts      # Memory-safe Web ReadableStream download handler
│   │   ├── robots.txt/
│   │   │   └── route.ts                  # Search engine crawl directives
│   │   └── sitemap.xml/
│   │       └── route.ts                  # Dynamic SEO XML Sitemap generator
│   └── lib/
│       ├── download-storage.ts           # Direct GridFS chunking, stream reader, PDF validator
│       ├── mongodb.ts                    # Updated default fallback connection URI
│       └── models/
│           ├── DownloadUpload.ts         # [NEW] Upload session tracking schema with 2-hour TTL
│           └── index.ts                  # Exported DownloadUpload models
├── .env.local                            # Updated MongoDB connection URI
└── README.md                             # Comprehensive project & implementation documentation
```

---

## 💻 Tech Stack & Architecture

* **Framework:** Next.js 15 (App Router, Server Components & Route Handlers)
* **Language:** TypeScript
* **Styling:** Vanilla CSS + Tailwind CSS 4
* **Database & Storage:** MongoDB Atlas (Mongoose Models + GridFS Bucket for PDF files)
* **Hosting:** Vercel Serverless Platform

---

## 🚀 Setup & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shahinur-dm/NurEngineeringwebsite.git
   cd NurEngineeringwebsite
   ```

2. **Configure Environment Variables (`.env.local`):**
   ```env
   MONGODB_URI=mongodb+srv://efootballmadrid25_db_user:ljvpbVMGVJTQPVcH@dawatit.5hxbo9c.mongodb.net/NurCompanyWebsite?appName=dawatit
   ADMIN_JWT_SECRET=super-secret-jwt-key-for-nur-engineering-website-2025
   ADMIN_API_KEY=nur-admin-api-key-2025
   NEXT_PUBLIC_SITE_URL=https://nurengineeringbd.com
   ```

3. **Install Dependencies & Run:**
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```
