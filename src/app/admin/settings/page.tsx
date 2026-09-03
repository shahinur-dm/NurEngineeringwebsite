"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import {
  PaletteIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeIcon,
  SettingsIcon,
  ImageIcon,
} from "@/components/admin/AdminIcons";

export default function AdminSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") || "branding";
  const [tab, setTab] = useState(tabParam);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerField, setPickerField] = useState<"logo" | "favicon">("logo");

  // Settings state across all 5 tabs
  const [brandName, setBrandName] = useState("Nur Engineering Solution");
  const [tagline, setTagline] = useState("Machine, spare parts and Technical service provider");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [phone, setPhone] = useState("+880 1700-000000");
  const [email, setEmail] = useState("info@nurengineering.com");
  const [hours, setHours] = useState("Sat–Thu 9:00–18:00");
  const [notice, setNotice] = useState("Out of stock products will be delivered within 3-5 days.");
  const [address, setAddress] = useState("Dhaka, Bangladesh");
  const [mapsEmbed, setMapsEmbed] = useState("");
  const [facebook, setFacebook] = useState("https://www.facebook.com/");
  const [linkedin, setLinkedin] = useState("https://www.linkedin.com/");
  const [youtube, setYoutube] = useState("https://www.youtube.com/");
  const [whatsapp, setWhatsapp] = useState("+880170000000");

  // SEO & Analytics state
  const [seoTitle, setSeoTitle] = useState("Nur Engineering Solution | Machine Parts & Technical Service");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("PLC Bangladesh, machine parts, VFD, motors, sensors, EEE spare parts");
  const [gaMeasurementId, setGaMeasurementId] = useState("");
  const [googleSiteVerification, setGoogleSiteVerification] = useState("");

  // Sync active tab with URL query parameter
  useEffect(() => {
    if (tabParam && tabParam !== tab) {
      setTab(tabParam);
    }
  }, [tabParam, tab]);

  function handleTabClick(newTab: string) {
    setTab(newTab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", newTab);
    router.replace(`/admin/settings?${params.toString()}`);
  }

  // Load existing saved settings from API
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          if (s.brandName) setBrandName(s.brandName);
          if (s.tagline) setTagline(s.tagline);
          if (s.description) setDescription(s.description);
          if (s.logoUrl || s.logo) setLogo(s.logoUrl || s.logo);
          if (s.favicon) setFavicon(s.favicon);
          if (s.phone) setPhone(s.phone);
          if (s.email) setEmail(s.email);
          if (s.hours) setHours(s.hours);
          if (s.notice) setNotice(s.notice);
          if (s.address) setAddress(s.address);
          if (s.mapEmbedUrl) setMapsEmbed(s.mapEmbedUrl);
          if (s.social?.facebook) setFacebook(s.social.facebook);
          if (s.social?.linkedin) setLinkedin(s.social.linkedin);
          if (s.social?.youtube) setYoutube(s.social.youtube);
          if (s.social?.whatsapp) setWhatsapp(s.social.whatsapp);

          if (s.seo?.defaultTitle) setSeoTitle(s.seo.defaultTitle);
          if (s.seo?.defaultDescription) setSeoDescription(s.seo.defaultDescription);
          if (Array.isArray(s.seo?.keywords)) {
            setSeoKeywords(s.seo.keywords.join(", "));
          } else if (typeof s.seo?.keywords === "string") {
            setSeoKeywords(s.seo.keywords);
          }

          if (s.analytics?.gaMeasurementId) setGaMeasurementId(s.analytics.gaMeasurementId);
          if (s.analytics?.googleSiteVerification) setGoogleSiteVerification(s.analytics.googleSiteVerification);
        }
      })
      .catch((err) => console.error("Error fetching settings:", err))
      .finally(() => setLoading(false));
  }, []);

  function handleSelectMedia(url: string) {
    if (pickerField === "logo") setLogo(url);
    if (pickerField === "favicon") setFavicon(url);
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage("");

    try {
      const keywordsArray = seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        settings: {
          brandName,
          tagline,
          description,
          logoUrl: logo,
          logo,
          favicon,
          phone,
          email,
          hours,
          notice,
          address,
          mapEmbedUrl: mapsEmbed,
          social: {
            facebook,
            linkedin,
            youtube,
            whatsapp,
          },
          seo: {
            defaultTitle: seoTitle,
            defaultDescription: seoDescription || description,
            keywords: keywordsArray,
          },
          analytics: {
            gaMeasurementId,
            googleSiteVerification,
          },
        },
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMessage(data.error || "Failed to save settings. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-xs font-bold uppercase tracking-wider text-mist">Loading website settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-navy">
            Website Settings &amp; Live CMS
          </h2>
          <p className="text-xs text-steel">
            Changes saved here automatically update the live public website.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="btn-orange px-5 sm:px-6 py-2 text-xs font-bold uppercase shadow-sm disabled:opacity-50 w-full sm:w-auto text-center"
        >
          {saving ? "Saving Settings..." : "Save & Update Live Site"}
        </button>
      </div>

      {savedSuccess && (
        <div className="rounded border border-emerald-500/30 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
          ✓ Website settings successfully updated and published to the live frontend!
        </div>
      )}

      {errorMessage && (
        <div className="rounded border border-red-500/30 bg-red-50 p-3 text-xs font-bold text-red-700">
          ✕ {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 border-b border-line pb-2">
        {[
          { id: "branding", label: "Logo & Branding", Icon: PaletteIcon },
          { id: "header", label: "Header & Contacts", Icon: PhoneIcon },
          { id: "location", label: "Location & Maps", Icon: MapPinIcon },
          { id: "social", label: "Social Links", Icon: GlobeIcon },
          { id: "general", label: "General & SEO", Icon: SettingsIcon },
        ].map((t) => {
          const ActiveIcon = t.Icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabClick(t.id)}
              className={`flex items-center gap-2 rounded px-3 sm:px-4 py-2 text-xs font-bold transition flex-1 sm:flex-none justify-center ${
                tab === t.id
                  ? "bg-navy text-white shadow-xs"
                  : "bg-white text-navy hover:bg-paper border border-line"
              }`}
            >
              <ActiveIcon size={16} className={tab === t.id ? "text-orange" : "text-steel"} />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Logo & Branding */}
        {tab === "branding" && (
          <div className="rounded-lg border border-line bg-white p-4 sm:p-6 shadow-xs space-y-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              Logo & Visual Branding
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Company Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-bold text-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Tagline / Sub-heading</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Custom Logo Image (Optional)</label>
              <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-1">
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="Paste URL or select from Media Library..."
                  className="flex-1 min-w-0 rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerField("logo");
                    setPickerOpen(true);
                  }}
                  className="btn-navy px-3 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5"
                >
                  <ImageIcon size={16} />
                  <span>Media Library</span>
                </button>
              </div>
              <p className="mt-1.5 text-[10.5px] text-mist">
                If blank, the default classic circular NES emblem displays cleanly.
              </p>

              {/* Live Preview */}
              {logo && (
                <div className="mt-3 flex items-center gap-3 p-3 rounded border border-line bg-paper/30">
                  <div className="relative h-14 w-14 shrink-0 rounded-full border-2 border-orange/40 bg-white p-1 shadow-sm overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy">Active Logo Preview</p>
                    <p className="text-[10.5px] text-steel">This logo is live on your header and footer.</p>
                    <button
                      type="button"
                      onClick={() => setLogo("")}
                      className="mt-1 text-[10.5px] font-bold text-red-600 hover:underline"
                    >
                      Reset to Default Badge
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-line pt-4">
              <label className="block text-xs font-bold uppercase text-navy">Favicon Icon (Optional)</label>
              <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-1">
                <input
                  type="text"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  placeholder="Paste favicon URL or select from Media Library..."
                  className="flex-1 min-w-0 rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerField("favicon");
                    setPickerOpen(true);
                  }}
                  className="btn-navy px-3 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5"
                >
                  <ImageIcon size={16} />
                  <span>Media Library</span>
                </button>
              </div>
              {favicon && (
                <div className="mt-3 flex items-center gap-3 p-2.5 rounded border border-line bg-paper/30">
                  <div className="relative h-8 w-8 shrink-0 rounded border border-line bg-white p-1 shadow-xs overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={favicon} alt="Favicon Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy">Favicon Preview</p>
                    <button
                      type="button"
                      onClick={() => setFavicon("")}
                      className="text-[10.5px] font-bold text-red-600 hover:underline"
                    >
                      Remove Favicon
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Header & Contacts */}
        {tab === "header" && (
          <div className="rounded-lg border border-line bg-white p-6 shadow-xs space-y-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              Top Bar & Header Contacts
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Business Hours</label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>
            </div>

            {/* Top Bar Notice / Announcement Ticker */}
            <div className="border-t border-line pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase text-navy">
                  Top Bar Notice / Announcement Ticker
                </label>
                <span className="text-[10.5px] font-bold text-orange uppercase tracking-wider">
                  Live Ticker Banner
                </span>
              </div>
              <input
                type="text"
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                placeholder="e.g. Out of stock products will be delivered within 3-5 days."
                className="w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
              />
              <div className="rounded border border-line bg-paper/60 p-3 flex items-center gap-2">
                <span className="text-[10px] font-bold text-mist uppercase">Preview:</span>
                <span className="text-[11.5px] font-bold text-amber-500">NOTICE:</span>
                <span className="text-[11.5px] font-medium text-navy truncate">
                  {notice || "Out of stock products will be delivered within 3-5 days."}
                </span>
              </div>
              <p className="text-[10.5px] text-mist">
                This notice continuously animates from right to left in the top blue contact bar. Hovering over it pauses the movement for easy reading.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Location & Maps */}
        {tab === "location" && (
          <div className="rounded-lg border border-line bg-white p-6 shadow-xs space-y-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              Office Location & Maps
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. House #, Road #, Sector #, Dhaka, Bangladesh"
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Google Maps Link / Embed URL</label>
              <input
                type="text"
                value={mapsEmbed}
                onChange={(e) => setMapsEmbed(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none font-mono text-[11px]"
              />
              <p className="mt-1 text-[10.5px] text-mist">
                Provide a Google Maps iframe embed URL or location link for the contact section map.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Social Links */}
        {tab === "social" && (
          <div className="rounded-lg border border-line bg-white p-6 shadow-xs space-y-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              Social Media & WhatsApp
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Facebook Page URL</label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">LinkedIn URL</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">YouTube Channel URL</label>
                <input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">WhatsApp Phone / Direct Link</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+880170000000"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: General & SEO */}
        {tab === "general" && (
          <div className="rounded-lg border border-line bg-white p-6 shadow-xs space-y-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              General Information & Website Meta
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Company Bio & Overview</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive overview of company services and offerings..."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none leading-relaxed"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Default Meta Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Meta Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="PLC, Motors, VFD, Sensors"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Default Meta Description</label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Meta description for search engines..."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none leading-relaxed"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 border-t border-line pt-4">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Google Analytics 4 Measurement ID</label>
                <input
                  type="text"
                  value={gaMeasurementId}
                  onChange={(e) => setGaMeasurementId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Google Search Console Verification</label>
                <input
                  type="text"
                  value={googleSiteVerification}
                  onChange={(e) => setGoogleSiteVerification(e.target.value)}
                  placeholder="google-site-verification token"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-orange px-8 py-3 text-xs font-bold uppercase shadow-md disabled:opacity-50"
          >
            {saving ? "Saving All Settings..." : "Save & Update Live Site"}
          </button>
        </div>
      </form>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectMedia}
      />
    </div>
  );
}
