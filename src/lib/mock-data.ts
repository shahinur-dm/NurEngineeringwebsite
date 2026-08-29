import type {
  ICategory,
  IBanner,
  IProduct,
  IService,
  ISiteSettings,
  ICompanyProfile,
} from "./models";
import { navLinks, useCaseContent } from "./use-cases";

export const mockImg = {
  desk: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
  plc: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
  motor: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80",
  drive: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
  sensor: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1600&q=80",
  panel: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
  factory: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1600&q=80",
  bearing: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80",
  cable: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
  workshop: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1600&q=80",
};

export const mockCategories: ICategory[] = [
  { _id: "cat-1", name: "PLC", slug: "plc", type: "product", order: 1, description: "Programmable logic controllers and I/O modules." },
  { _id: "cat-2", name: "Motors", slug: "motors", type: "product", order: 2, description: "Induction, servo and gear motors." },
  { _id: "cat-3", name: "VFD / Drives", slug: "drives", type: "product", order: 3, description: "Variable frequency drives and soft starters." },
  { _id: "cat-4", name: "Sensors", slug: "sensors", type: "product", order: 4, description: "Proximity, photoelectric and encoder sensors." },
  { _id: "cat-5", name: "Contactors", slug: "contactors", type: "product", order: 5, description: "AC contactors and motor starters." },
  { _id: "cat-6", name: "Relays", slug: "relays", type: "product", order: 6, description: "Control, timer and overload relays." },
  { _id: "cat-7", name: "Circuit Breakers", slug: "breakers", type: "product", order: 7, description: "MCB, MCCB and protection devices." },
  { _id: "cat-8", name: "HMI & Display", slug: "hmi", type: "product", order: 8, description: "Operator panels and industrial displays." },
  { _id: "cat-9", name: "Power Supplies", slug: "power-supplies", type: "product", order: 9, description: "SMPS and DIN-rail power units." },
  { _id: "cat-10", name: "Bearings", slug: "bearings", type: "product", order: 10, description: "Ball bearings and mechanical wear parts." },
  { _id: "cat-11", name: "Cables & Wires", slug: "cables", type: "product", order: 11, description: "Control cable, motor cable and lugs." },
  { _id: "cat-12", name: "Technical Service", slug: "technical-service", type: "service", order: 1 },
];

const catMap = Object.fromEntries(mockCategories.map((c) => [c.slug, c]));

export const mockBanners: IBanner[] = [
  {
    _id: "ban-1",
    title: "Industrial PLC & Automation Parts",
    subtitle: "Siemens, Delta, Mitsubishi and Omron controllers in stock for panel builders.",
    image: mockImg.plc,
    ctaLabel: "Browse PLC",
    ctaHref: "/products?category=plc",
    order: 1,
    active: true,
  },
  {
    _id: "ban-2",
    title: "Motors, Drives & Spare Parts",
    subtitle: "Matched 3-phase motors and VFDs for pumps, conveyors and workshop machines.",
    image: mockImg.motor,
    ctaLabel: "View motors",
    ctaHref: "/products?category=motors",
    order: 2,
    active: true,
  },
  {
    _id: "ban-3",
    title: "Technical Service You Can Call",
    subtitle: "EEE-backed part matching, panel support and substitution advice.",
    image: mockImg.workshop,
    ctaLabel: "Our services",
    ctaHref: "/services",
    order: 3,
    active: true,
  },
];

export const mockServices: IService[] = [
  {
    _id: "svc-1",
    title: "PLC Programming Support",
    slug: "plc-programming-support",
    shortDescription: "I/O mapping, basic ladder logic and panel commissioning help.",
    description: "Practical PLC support for small automation jobs — module selection, I/O lists, and first-run checks so your panel actually starts.",
    image: mockImg.plc,
    features: ["Controller selection", "I/O list review", "First-run support"],
    category: catMap["technical-service"]._id,
    order: 1,
    featured: true,
    published: true,
  },
  {
    _id: "svc-2",
    title: "Motor & Drive Matching",
    slug: "motor-drive-matching",
    shortDescription: "Correct kW, voltage and VFD pairing for the machine you already have.",
    description: "We match motors and VFDs by rating, frame, and application so replacements fit pumps, fans and conveyors without guesswork.",
    image: mockImg.drive,
    features: ["kW / HP matching", "VFD sizing", "Soft-start options"],
    category: catMap["technical-service"]._id,
    order: 2,
    featured: true,
    published: true,
  },
  {
    _id: "svc-3",
    title: "Control Panel Parts",
    slug: "control-panel-parts",
    shortDescription: "Contactors, breakers, relays and DIN hardware as a kit.",
    description: "One-desk supply for panel builders: protection, switching, terminals and power supplies pulled to a parts list.",
    image: mockImg.panel,
    features: ["Starter kits", "Protection devices", "DIN-rail hardware"],
    category: catMap["technical-service"]._id,
    order: 3,
    featured: true,
    published: true,
  },
  {
    _id: "svc-4",
    title: "Sensor & Automation Fit",
    slug: "sensor-automation-fit",
    shortDescription: "Proximity, photoelectric and encoder selection for real machines.",
    description: "We help you pick sensing distance, output type (NPN/PNP) and housing so sensors survive the job, not just the datasheet.",
    image: mockImg.sensor,
    features: ["NPN/PNP selection", "IP rating advice", "Mounting options"],
    category: catMap["technical-service"]._id,
    order: 4,
    featured: true,
    published: true,
  },
  {
    _id: "svc-5",
    title: "Spare Parts Sourcing",
    slug: "spare-parts-sourcing",
    shortDescription: "OEM and compatible alternatives from a photo or part number.",
    description: "Send a photo, nameplate or part number. We cross-reference and quote working equivalents for workshops that cannot wait.",
    image: mockImg.factory,
    features: ["Part-number search", "Compatible options", "Nationwide delivery"],
    category: catMap["technical-service"]._id,
    order: 5,
    featured: true,
    published: true,
  },
];

export const mockProducts: IProduct[] = [
  // 4 Featured Products in order
  {
    _id: "prd-1",
    name: "7-Inch HMI Touch Panel",
    slug: "hmi-7-inch",
    sku: "NES-HMI-7",
    brand: "Weintek / Delta class",
    category: catMap.hmi._id,
    shortDescription: "7-inch industrial HMI with Ethernet and serial.",
    description: "Operator panel for PLC visualization. Drivers for common Delta, Siemens and Mitsubishi PLCs.",
    price: 18500,
    currency: "BDT",
    image: mockImg.plc,
    specs: ["7 inch", "Ethernet", "RS232/485", "IP65 front"],
    relatedServices: ["svc-1"],
    inStock: true,
    featured: true,
    published: true,
    order: 1,
  },
  {
    _id: "prd-2",
    name: "Inductive Proximity Sensor M18",
    slug: "proximity-sensor-m18",
    sku: "NES-SNS-M18",
    brand: "Autonics / equivalent",
    category: catMap.sensors._id,
    shortDescription: "M18 inductive proximity sensor for metal detection.",
    description: "Industrial inductive sensor for end-of-travel, counting and fixture detection on machines.",
    price: 950,
    currency: "BDT",
    image: mockImg.sensor,
    specs: ["M18", "NPN/PNP", "10–30 VDC", "IP67"],
    relatedServices: ["svc-4"],
    inStock: true,
    featured: true,
    published: true,
    order: 2,
  },
  {
    _id: "prd-3",
    name: "3-Phase Induction Motor 1.5 HP",
    slug: "induction-motor-1-5hp",
    sku: "NES-MTR-15",
    brand: "Generic IE2",
    category: catMap.motors._id,
    shortDescription: "Foot-mounted 1.5 HP motor for pumps and conveyors.",
    description: "Reliable three-phase induction motor for light industrial drives. Confirm frame and shaft before ordering.",
    price: 18500,
    currency: "BDT",
    image: mockImg.motor,
    specs: ["1.5 HP", "3-phase", "1400 RPM class", "IE2"],
    relatedServices: ["svc-2"],
    inStock: true,
    featured: true,
    published: true,
    order: 3,
  },
  {
    _id: "prd-4",
    name: "VFD Drive 2.2 kW",
    slug: "vfd-2-2kw",
    sku: "NES-VFD-22",
    brand: "Delta / INVT class",
    category: catMap.drives._id,
    shortDescription: "2.2 kW variable frequency drive for motor speed control.",
    description: "Compact VFD for soft start, speed control and energy savings on small three-phase motors.",
    price: 22000,
    currency: "BDT",
    image: mockImg.drive,
    specs: ["2.2 kW", "380–440V", "Modbus", "Overload protection"],
    relatedServices: ["svc-2"],
    inStock: true,
    featured: true,
    published: true,
    order: 4,
  },
  // 5 More Spare Parts in exact order
  {
    _id: "prd-5",
    name: "Incremental Rotary Encoder 400 PPR",
    slug: "encoder-400ppr",
    sku: "NES-SNS-ENC",
    brand: "Autonics / equivalent",
    category: catMap.sensors._id,
    shortDescription: "400 PPR encoder for speed and position feedback.",
    description: "Use with PLC high-speed counters or VFD pulse input for length and speed control.",
    price: 3800,
    currency: "BDT",
    image: mockImg.sensor,
    specs: ["400 PPR", "AB / ABZ", "5–24 VDC", "6 mm shaft"],
    relatedServices: ["svc-4"],
    inStock: true,
    featured: false,
    published: true,
    order: 5,
  },
  {
    _id: "prd-6",
    name: "Control Cable 1.5 mm² × 4C",
    slug: "control-cable-4c",
    sku: "NES-CBL-15-4",
    brand: "BRB / equivalent",
    category: catMap.cables._id,
    shortDescription: "Flexible 4-core control cable for panels and field I/O.",
    description: "Sold per meter. Suitable for 24 VDC I/O and 220 VAC control circuits.",
    price: 95,
    currency: "BDT",
    image: mockImg.workshop,
    specs: ["1.5 mm²", "4 core", "Flexible", "Per meter"],
    relatedServices: ["svc-5"],
    inStock: true,
    featured: false,
    published: true,
    order: 6,
  },
  {
    _id: "prd-7",
    name: "DIN Rail SMPS 24V 10A",
    slug: "smps-24v-10a",
    sku: "NES-PSU-2410",
    brand: "Mean Well class",
    category: catMap["power-supplies"]._id,
    shortDescription: "24 VDC 10A DIN-rail power supply for PLC panels.",
    description: "Industrial SMPS for PLC, HMI, sensors and relays. Size with 20–30% headroom.",
    price: 4200,
    currency: "BDT",
    image: mockImg.drive,
    specs: ["24 VDC", "10A", "DIN rail", "Overload protection"],
    relatedServices: ["svc-3"],
    inStock: true,
    featured: false,
    published: true,
    order: 7,
  },
  {
    _id: "prd-8",
    name: "Deep Groove Ball Bearing 6205",
    slug: "bearing-6205",
    sku: "NES-BRG-6205",
    brand: "SKF / equivalent",
    category: catMap.bearings._id,
    shortDescription: "6205 bearing for motors, pulleys and fans.",
    description: "Standard 6205 deep groove ball bearing. Sealed options for dusty workshops.",
    price: 350,
    currency: "BDT",
    image: mockImg.bearing,
    specs: ["6205", "25×52×15 mm", "2RS / ZZ"],
    relatedServices: ["svc-5"],
    inStock: true,
    featured: false,
    published: true,
    order: 8,
  },
  {
    _id: "prd-9",
    name: "AC Contactor 40A",
    slug: "contactor-40a",
    sku: "NES-CNT-40",
    brand: "Schneider / Chint class",
    category: catMap.contactors._id,
    shortDescription: "40A contactor for larger motors and feeders.",
    description: "40A AC contactor for 5–10 HP class motors depending on utilization category.",
    price: 3200,
    currency: "BDT",
    image: mockImg.panel,
    specs: ["40A", "3-pole", "AC-3", "Aux kit optional"],
    relatedServices: ["svc-3"],
    inStock: true,
    featured: false,
    published: true,
    order: 9,
  },
  // Additional catalog products
  {
    _id: "prd-10",
    name: "Siemens S7-1200 CPU 1214C",
    slug: "siemens-s7-1200-cpu-1214c",
    sku: "NES-PLC-1214",
    brand: "Siemens",
    category: catMap.plc._id,
    shortDescription: "Compact PLC CPU for machine and process control panels.",
    description: "Siemens SIMATIC S7-1200 CPU 1214C for small to mid automation.",
    price: 48500,
    currency: "BDT",
    image: mockImg.plc,
    specs: ["CPU 1214C", "14 DI / 10 DO", "2 analog in", "Profinet"],
    relatedServices: ["svc-1"],
    inStock: true,
    featured: false,
    published: true,
    order: 10,
  },
  {
    _id: "prd-11",
    name: "Delta DVP-14SS2 PLC",
    slug: "delta-dvp-14ss2",
    sku: "NES-PLC-D14",
    brand: "Delta",
    category: catMap.plc._id,
    shortDescription: "Slim PLC for compact control cabinets and OEM machines.",
    description: "Delta DVP Slim series PLC — popular in Bangladesh workshops.",
    price: 12500,
    currency: "BDT",
    image: mockImg.panel,
    specs: ["14 points", "High-speed counters", "MODBUS", "Expansion ready"],
    relatedServices: ["svc-1"],
    inStock: true,
    featured: false,
    published: true,
    order: 11,
  },
  {
    _id: "prd-12",
    name: "Mitsubishi FX5U-32M",
    slug: "mitsubishi-fx5u-32m",
    sku: "NES-PLC-FX5",
    brand: "Mitsubishi",
    category: catMap.plc._id,
    shortDescription: "iQ-F series compact PLC with built-in Ethernet.",
    description: "Mitsubishi FX5U for OEMs who need Ethernet, motion and a clear upgrade path.",
    price: 52000,
    currency: "BDT",
    image: mockImg.plc,
    specs: ["32 I/O", "Ethernet", "SD card", "GX Works3"],
    relatedServices: ["svc-1"],
    inStock: true,
    featured: false,
    published: true,
    order: 12,
  },
  {
    _id: "prd-13",
    name: "Omron CP1E-N20DR-A",
    slug: "omron-cp1e-n20",
    sku: "NES-PLC-CP1E",
    brand: "Omron",
    category: catMap.plc._id,
    shortDescription: "Entry Omron PLC for simple sequential machines.",
    description: "CP1E is a practical choice for small machines and student projects.",
    price: 9800,
    currency: "BDT",
    image: mockImg.panel,
    specs: ["20 I/O", "Relay outputs", "USB programming", "CX-Programmer"],
    relatedServices: ["svc-1"],
    inStock: true,
    featured: false,
    published: true,
    order: 13,
  },
  {
    _id: "prd-14",
    name: "3-Phase Induction Motor 3 HP",
    slug: "induction-motor-3hp",
    sku: "NES-MTR-30",
    brand: "Generic IE2",
    category: catMap.motors._id,
    shortDescription: "3 HP industrial motor for fans, mixers and machine tools.",
    description: "Standard 3 HP three-phase motor. Pair with a matching VFD.",
    price: 26800,
    currency: "BDT",
    image: mockImg.motor,
    specs: ["3 HP", "3-phase", "IE2", "Foot / flange options"],
    relatedServices: ["svc-2"],
    inStock: true,
    featured: false,
    published: true,
    order: 14,
  },
  {
    _id: "prd-15",
    name: "VFD Drive 5.5 kW",
    slug: "vfd-5-5kw",
    sku: "NES-VFD-55",
    brand: "Delta / INVT class",
    category: catMap.drives._id,
    shortDescription: "5.5 kW VFD for pumps, fans and conveyor lines.",
    description: "Mid-range VFD with PID and multi-speed control.",
    price: 38500,
    currency: "BDT",
    image: mockImg.drive,
    specs: ["5.5 kW", "3-phase in/out", "PID", "Brake chopper ready"],
    relatedServices: ["svc-2"],
    inStock: true,
    featured: false,
    published: true,
    order: 15,
  },
  {
    _id: "prd-16",
    name: "Photoelectric Sensor Kit",
    slug: "photoelectric-sensor-kit",
    sku: "NES-SNS-PE",
    brand: "Autonics / equivalent",
    category: catMap.sensors._id,
    shortDescription: "Through-beam and diffuse photoelectric sensors.",
    description: "Useful for packaging lines, counting and presence detection.",
    price: 2200,
    currency: "BDT",
    image: mockImg.sensor,
    specs: ["Diffuse / through-beam", "12–24 VDC", "Adjustable sensitivity"],
    relatedServices: ["svc-4"],
    inStock: true,
    featured: false,
    published: true,
    order: 16,
  },
  {
    _id: "prd-17",
    name: "AC Contactor 25A",
    slug: "contactor-25a",
    sku: "NES-CNT-25",
    brand: "Schneider / Chint class",
    category: catMap.contactors._id,
    shortDescription: "25A 3-pole AC contactor for motor starters.",
    description: "Standard 25A contactor for DOL starters and control panels.",
    price: 1800,
    currency: "BDT",
    image: mockImg.panel,
    specs: ["25A", "3-pole", "Aux contacts", "Coil 220VAC / 24VDC"],
    relatedServices: ["svc-3"],
    inStock: true,
    featured: false,
    published: true,
    order: 17,
  },
  {
    _id: "prd-18",
    name: "Thermal Overload Relay",
    slug: "thermal-overload-relay",
    sku: "NES-RLY-OL",
    brand: "Schneider / Chint class",
    category: catMap.relays._id,
    shortDescription: "Adjustable thermal overload for motor protection.",
    description: "Mounts under matching contactors. Set the FLA to protect the motor.",
    price: 1450,
    currency: "BDT",
    image: mockImg.panel,
    specs: ["Adjustable FLA", "1NO+1NC", "Manual/auto reset"],
    relatedServices: ["svc-3"],
    inStock: true,
    featured: false,
    published: true,
    order: 18,
  },
  {
    _id: "prd-19",
    name: "Timer Relay 0.1s–10h",
    slug: "timer-relay",
    sku: "NES-RLY-TMR",
    brand: "Omron / equivalent",
    category: catMap.relays._id,
    shortDescription: "Multi-mode DIN timer for sequential control.",
    description: "On-delay, off-delay and cyclic modes for relay logic machines.",
    price: 1100,
    currency: "BDT",
    image: mockImg.panel,
    specs: ["Multi-mode", "DIN rail", "8-pin / 11-pin"],
    relatedServices: ["svc-3"],
    inStock: true,
    featured: false,
    published: true,
    order: 19,
  },
  {
    _id: "prd-20",
    name: "MCB 32A 3-Pole",
    slug: "mcb-32a-3p",
    sku: "NES-BRK-32",
    brand: "Schneider / Chint class",
    category: catMap.breakers._id,
    shortDescription: "32A three-pole miniature circuit breaker.",
    description: "C-curve MCB for motor and distribution feeders in control panels.",
    price: 890,
    currency: "BDT",
    image: mockImg.panel,
    specs: ["32A", "3P", "C-curve", "6 kA"],
    relatedServices: ["svc-3"],
    inStock: true,
    featured: false,
    published: true,
    order: 20,
  },
];

export interface IMockBlogCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
}

export interface IMockBlogPost {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  category: { _id: string; name: string; slug: string };
  tags: string[];
  author: string;
  readTime: string;
  featured: boolean;
  status: "draft" | "published";
  createdAt: string;
}

export const mockBlogCategories: IMockBlogCategory[] = [
  { _id: "bcat-1", name: "PLC & Automation", slug: "plc-automation", order: 1 },
  { _id: "bcat-2", name: "VFD & Drives", slug: "vfd-drives", order: 2 },
  { _id: "bcat-3", name: "HMI & Displays", slug: "hmi-displays", order: 3 },
  { _id: "bcat-4", name: "Sensors & Detection", slug: "sensors-detection", order: 4 },
  { _id: "bcat-5", name: "Motors & Maintenance", slug: "motors-maintenance", order: 5 },
  { _id: "bcat-6", name: "Switchgear & Relays", slug: "switchgear-relays", order: 6 },
];

export const mockBlogPosts: IMockBlogPost[] = [
  {
    _id: "blog-1",
    title: "Guide to Selecting the Right PLC for Industrial Automation in Bangladesh",
    slug: "guide-to-selecting-plc-industrial-automation",
    summary:
      "A practical comparison of Siemens S7-1200, Delta DVP, and Mitsubishi FX series controllers: evaluating digital/analog I/O counts, relay vs. transistor switching, and communication protocols.",
    content: `## Choosing the Optimal PLC Architecture for Factory Automation

When modernizing or constructing a machine control system in Bangladesh, selecting the correct Programmable Logic Controller (PLC) determines both the machine's reliability and its lifetime maintenance cost.

### 1. I/O Capacity and Signal Types
Begin by creating a comprehensive spreadsheet of all physical field devices:
- **Digital Inputs (DI):** Emergency stop buttons, proximity switches, pushbuttons, optical sensors, and thermal trip contacts (typically 24 VDC sink/source).
- **Digital Outputs (DO):** Solenoid valves, auxiliary contactor coils, status pilot lamps, and signaling beacons.
- **Analog Inputs (AI):** 4–20 mA pressure transmitters, PT100 temperature sensors, and 0–10 V speed feedback signals.
- **Analog Outputs (AO):** Speed reference signals to Variable Frequency Drives (VFDs) or proportional valve controllers.

Always reserve a **20% to 25% spare I/O margin** for future sensors, bypass buttons, or mechanical upgrades.

### 2. Transistor vs. Relay Output Modules
- **Relay Outputs:** Best suited for switching alternating current (AC) loads up to 2A, such as 220V solenoid coils or contactor pilots. However, their mechanical contacts wear out under rapid switching cycles.
- **Transistor (Sink/Source) Outputs:** Essential when driving high-speed pulse outputs (e.g., servo/stepper motor pulse trains) or fast solid-state relays (SSRs). Lifetime is essentially unlimited compared to mechanical relays.

### 3. Communication Protocols & Networking
Modern Bangladeshi industrial setups require communication between the PLC, HMIs, inverters, and central SCADA systems:
- **Modbus RTU (RS-485):** Highly cost-effective and supported by virtually all brands (Delta, Inovance, Siemens, Omron) for reading VFD parameters, energy meters, and temperature controllers over two-wire daisy chains.
- **Profinet / Ethernet/IP:** Industrial Ethernet protocols that simplify wiring and provide high bandwidth for decentralized I/O racks and high-speed multi-axis synchronization.

### 4. Brand Availability & Spare Parts Support in Dhaka
For long-term peace of mind, prioritize controllers with readily available replacement CPU modules, expansion blocks, and local programming expertise. At **Nur Engineering Solution**, we stock and support Siemens SIMATIC S7-1200, Delta DVP-ES2/SS2 series, and compatible expansion units for rapid same-day dispatch.`,
    coverImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
    category: { _id: "bcat-1", name: "PLC & Automation", slug: "plc-automation" },
    tags: ["PLC", "Siemens", "Delta", "Automation", "Factory Control"],
    author: "Engr. Nuruzzaman, Lead EEE Specialist",
    readTime: "6 min read",
    featured: true,
    status: "published",
    createdAt: "2026-08-25T08:00:00.000Z",
  },
  {
    _id: "blog-2",
    title: "VFD Parameter Optimization: Maximizing Energy Efficiency in Industrial Pumps & Fans",
    slug: "vfd-parameter-optimization-pumps-fans",
    summary:
      "How Variable Frequency Drives cut electrical bills by 30-50% on centrifugal loads. Key parameter tuning for acceleration ramps, torque boost, PID loop feedback, and braking protection.",
    content: `## Why VFDs Transform Centrifugal Pump and Fan Economics

Centrifugal pumps, blower fans, and cooling tower exhausts obey Affinity Laws: fluid flow is directly proportional to impeller speed, while **power consumption varies with the cube of the speed (P ∝ N³)**. 

Operating a pump at 80% speed requires roughly half (51%) the electrical power of full-speed operation with a mechanical throttling valve.

### Essential Parameter Groups to Configure on Commissioning

#### 1. Motor Nameplate Matching (Group 01)
Never run a new inverter with factory default motor constants. Enter exact nameplate ratings:
- Rated motor kilowatt (kW) or horsepower (HP)
- Nominal voltage (e.g., 380V / 400V 3-phase)
- Full Load Amps (FLA)
- Base frequency (50 Hz) and rated RPM

Perform an offline or rotational **auto-tuning routine** so the drive accurately models stator resistance ($R_s$) and leakage inductance.

#### 2. Acceleration and Deceleration Ramps
- **Centrifugal Pumps:** Set acceleration ramp between 8.0s to 15.0s to prevent water hammer surges and mechanical pipe stress. Deceleration should use a gentle ramp with DC injection or coast-to-stop depending on check-valve dynamics.
- **High-Inertia Heavy Fans:** Use S-curve acceleration profile (15.0s to 30.0s) to prevent overcurrent trips ($OC$) on motor starting.

#### 3. PID Closed-Loop Pressure Control
By wiring a 4–20 mA pressure transducer (0–10 bar) into the analog input ($AI1$) and setting target pressure setpoints via digital keypad or HMI, the drive automatically modulates motor RPM to maintain rock-solid line pressure regardless of factory demand fluctuations.

Nur Engineering Solution provides complete VFD supply, matched panel enclosures, reactor chokes, and on-site tuning across Narayanganj, Gazipur, and Dhaka industrial belts.`,
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
    category: { _id: "bcat-2", name: "VFD & Drives", slug: "vfd-drives" },
    tags: ["VFD", "Inverters", "Energy Savings", "Pumps", "Drives"],
    author: "Nur Engineering Technical Team",
    readTime: "5 min read",
    featured: true,
    status: "published",
    createdAt: "2026-08-20T10:30:00.000Z",
  },
  {
    _id: "blog-3",
    title: "Connecting Industrial Touchscreen HMIs to Legacy PLCs via RS-485 Modbus",
    slug: "connecting-industrial-touchscreen-hmis-rs485-modbus",
    summary:
      "A step-by-step technical guide to integrating 7-inch and 10-inch color touch panels with older machines: baud rate matching, register mapping, alarm logging, and noise shielding.",
    content: `## Upgrading Legacy Operator Controls to Modern Touchscreen HMIs

Many operational machines in textile spinning, garment finishing, and plastic extrusion still rely on pushbuttons, analog dials, and segment LED displays. Adding a modern color Human-Machine Interface (HMI) immediately improves operator productivity, recipe management, and fault troubleshooting.

### 1. Physical Hardware Connection
- **RS-485 Differential Pair (D+ / D-):** Use twisted-pair shielded cable (Belden 9841 or equivalent). Connect terminal $A$ to $D+$ and terminal $B$ to $D-$.
- **Grounding and Shielding:** Ground the cable shield at **one end only** (usually the main panel grounding busbar) to prevent damaging ground loops.
- **Termination Resistor:** If the cable run exceeds 20 meters, engage the $120\Omega$ termination switch on the last device on the bus.

### 2. Matching Communication Parameters
Ensure identical settings across both the PLC communication port and HMI driver configuration:
- **Protocol:** Modbus RTU (Master on HMI, Slave on PLC)
- **Baud Rate:** 9600 bps or 19200 bps
- **Data Bits / Parity / Stop Bits:** 8, None/Even, 1 Stop bit
- **Station ID:** Unique address (e.g., PLC = Station 1, Temperature controller = Station 2)

### 3. Screen Design Best Practices
- **High-Contrast Alarm Banners:** Place active fault indicators (Motor Trip, Thermal Overload, Low Pressure) at the top in bright amber/red.
- **User Permission Levels:** Restrict calibration and timer settings behind a supervisor password.
- **Trend Charts:** Log temperature and speed curves directly to USB memory or internal flash storage.

Nur Engineering Solution supplies Weintek, Delta, and Siemens touch displays with full screen programming and backup assistance.`,
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
    category: { _id: "bcat-3", name: "HMI & Displays", slug: "hmi-displays" },
    tags: ["HMI", "Modbus", "Touchscreen", "Weintek", "Panel Building"],
    author: "Engr. Nuruzzaman",
    readTime: "7 min read",
    featured: false,
    status: "published",
    createdAt: "2026-08-15T14:00:00.000Z",
  },
  {
    _id: "blog-4",
    title: "Industrial Sensor Wiring & Troubleshooting: NPN vs. PNP and Optical Alignment",
    slug: "industrial-sensor-wiring-troubleshooting-npn-pnp",
    summary:
      "Clear wiring diagrams and fault resolution for inductive proximity sensors, photoelectric beams, and rotary encoders on high-speed packaging conveyors.",
    content: `## Demystifying Sensor Output Polarities in Industrial Machinery

One of the most frequent wiring issues in factory maintenance is confusing **NPN (Current Sinking)** and **PNP (Current Sourcing)** sensor outputs.

### Understanding NPN vs. PNP

- **PNP Sensor (Sourcing):** When the sensor detects a target, it connects the signal wire ($Black$) to positive supply ($+24\text{ VDC}$). European PLCs (Siemens, ABB, Schneider) typically standardize on PNP sinking inputs.
- **NPN Sensor (Sinking):** When activated, it pulls the signal wire ($Black$) to ground ($0\text{ VDC}$). Japanese and Asian machinery (Mitsubishi, Omron, Delta) frequently employ NPN sinking circuitry.

### Standard Wire Color Coding (IEC 60947-5-2)
- **Brown ($BN$):** $+24\text{ VDC}$ Power Supply
- **Blue ($BU$):** $0\text{ VDC}$ Common Ground
- **Black ($BK$):** Normally Open ($NO$) Signal Output
- **White ($WH$):** Normally Closed ($NC$) Signal Output (on 4-wire sensors)

### Common Field Failure Modes and Fixes
1. **Target Sensing Distance Drift:** Inductive proximity sensors have a rated sensing distance ($S_n$) calculated for mild steel. If detecting aluminum, brass, or stainless steel, apply correction reduction factors ($0.4\times$ to $0.7\times$).
2. **Optical Sensor Dust Fouling:** In cement, flour, or spinning mills, optical lenses accumulate airborne lint. Choose polarized retro-reflective or diffuse sensors with built-in stability status LEDs ($Green = Stable$, $Orange = Output$).
3. **Inductive Spikes from Nearby Coils:** Always route 24V sensor cables in a separate duct from 400V inverter and motor power cables.`,
    coverImage: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1600&q=80",
    category: { _id: "bcat-4", name: "Sensors & Detection", slug: "sensors-detection" },
    tags: ["Sensors", "Proximity", "Photoelectric", "Wiring", "Maintenance"],
    author: "Nur Engineering Technical Desk",
    readTime: "5 min read",
    featured: false,
    status: "published",
    createdAt: "2026-08-10T09:15:00.000Z",
  },
  {
    _id: "blog-5",
    title: "Three-Phase Induction Motor Maintenance: Preventing Bearing Wear and Winding Failure",
    slug: "three-phase-induction-motor-maintenance-guide",
    summary:
      "A preventative maintenance checklist for industrial motors: Megger insulation testing, vibration monitoring, lubrication intervals, and proper cooling fan airflow.",
    content: `## Extending the Lifespan of Factory 3-Phase Motors

Electric motors are the core workhorses of industrial manufacturing. More than 80% of premature motor failures result from **bearing degradation** or **stator winding insulation breakdown** due to heat and moisture.

### 1. Insulation Resistance Testing (Megger)
Before energizing a motor that has been sitting idle or exposed to high humidity:
- Disconnect supply cables and inverter leads.
- Apply a 500V or 1000V DC test voltage between phase windings ($U, V, W$) and motor ground frame.
- **Acceptance Rule:** Insulation resistance should exceed $1\text{ M}\Omega$ per kilovolt plus $1\text{ M}\Omega$. A healthy dry motor should typically read $>50\text{ M}\Omega$.

### 2. Bearing Inspection and Greasing
- **Over-greasing Hazard:** Adding too much grease forces excess lubricant into the winding cavity and creates friction churning, causing bearing temperatures to spike.
- Follow the manufacturer's recommended re-lubrication intervals using high-quality lithium-complex or polyurea grease suitable for industrial operating temperatures.
- Check for unusual axial play or high-frequency whistling during operation using an acoustic probe or vibration pen.

### 3. Cooling Fan and Cowl Clearance
Dust and cotton fluff clogging the motor's rear cooling fan cover cause internal stator temperatures to escalate rapidly. For every $10^\circ\text{C}$ increase above maximum rated insulation class temperature, **winding insulation lifespan is halved**.

Nur Engineering Solution provides three-phase motor replacement, rewinding inspection, and genuine SKF/NSK bearings for industrial plants.`,
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80",
    category: { _id: "bcat-5", name: "Motors & Maintenance", slug: "motors-maintenance" },
    tags: ["Motors", "Bearings", "Maintenance", "Insulation", "Pumps"],
    author: "Engr. Nuruzzaman",
    readTime: "6 min read",
    featured: false,
    status: "published",
    createdAt: "2026-08-05T11:45:00.000Z",
  },
  {
    _id: "blog-6",
    title: "Co-ordinating Contactors, Overload Relays, and Circuit Breakers in Motor Control Centers",
    slug: "coordinating-contactors-overload-relays-mcc",
    summary:
      "Type 1 vs. Type 2 co-ordination standards for industrial starter panels. Selecting AC-3 contactor ratings, bimetallic thermal settings, and short-circuit protection.",
    content: `## Designing Resilient Motor Starters in Control Panels

A reliable motor starter panel must handle both routine operational duty (starting and stopping high-inertia loads) and protect personnel and equipment during catastrophic fault conditions (short circuits, locked rotor, or single-phasing).

### 1. Sizing Contactors for AC-3 Duty
Never size an AC contactor based on its pure resistive thermal rating (AC-1). Squirrel-cage induction motors pull 6 to 8 times their rated current upon starting. Always select contactors rated for **AC-3 operational duty** matching or exceeding the motor's full-load running amps at 400V.

### 2. Thermal Overload Relay Calibration
- Set the thermal overload adjustment dial precisely to the **motor's rated Full Load Amps (FLA)** shown on the nameplate.
- For motors starting heavy inertia loads (crushers, ball mills), ensure the trip class ($10\text{A}$, $10$, or $20$) allows sufficient startup time without nuisance tripping.
- Utilize differential phase-loss protection mechanisms to rapidly disconnect the motor if one line fuse blows.

### 3. Short-Circuit Protection: Type 1 vs. Type 2 Co-ordination (IEC 60947-4-1)
- **Type 1 Co-ordination:** Under short-circuit conditions, the contactor or overload relay may suffer internal damage, requiring inspection or replacement before restoring service.
- **Type 2 Co-ordination:** Requires that under short circuit, no danger to operators occurs and the starter remains fully operational without component replacement (only contact welding may be easily separated).

Nur Engineering Solution stocks genuine Schneider, Chint, and Siemens contactors, auxiliary blocks, and thermal overloads ready for panel builders.`,
    coverImage: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1600&q=80",
    category: { _id: "bcat-6", name: "Switchgear & Relays", slug: "switchgear-relays" },
    tags: ["Contactors", "Relays", "Circuit Breakers", "MCC", "Switchgear"],
    author: "Nur Engineering Technical Desk",
    readTime: "5 min read",
    featured: false,
    status: "published",
    createdAt: "2026-08-01T08:30:00.000Z",
  },
];

