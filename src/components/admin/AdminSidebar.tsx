"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavGroup {
  title: string;
  items: {
    label: string;
    href: string;
    icon: string;
    badge?: number;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    ],
  },
  {
    title: "PRODUCT MANAGEMENT",
    items: [
      { label: "All Products", href: "/admin/products", icon: "📦" },
      { label: "Add Product", href: "/admin/products/new", icon: "➕" },
      { label: "Categories", href: "/admin/categories", icon: "📁" },
      { label: "Brands", href: "/admin/brands", icon: "🏷️" },
    ],
  },
  {
    title: "CONTENT & BLOG",
    items: [
      { label: "Blog Posts", href: "/admin/blogs", icon: "📝" },
      { label: "Add Blog Post", href: "/admin/blogs/new", icon: "✍️" },
      { label: "Blog Categories", href: "/admin/blogs/categories", icon: "📑" },
    ],
  },
  {
    title: "ASSETS & MEDIA",
    items: [
      { label: "Media Library", href: "/admin/media", icon: "🖼️" },
    ],
  },
  {
    title: "WEBSITE SETTINGS",
    items: [
      { label: "General Settings", href: "/admin/settings?tab=general", icon: "⚙️" },
      { label: "Logo & Branding", href: "/admin/settings?tab=branding", icon: "🎨" },
      { label: "Header & Contacts", href: "/admin/settings?tab=header", icon: "📞" },
      { label: "Location & Maps", href: "/admin/settings?tab=location", icon: "📍" },
      { label: "Social Links", href: "/admin/settings?tab=social", icon: "🌐" },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { label: "User Management", href: "/admin/users", icon: "👥" },
      { label: "Activity Logs", href: "/admin/logs", icon: "📜" },
    ],
  },
];

export function AdminSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-line bg-[#071422] text-white transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header Branding */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded bg-orange font-display text-base font-bold text-white shadow-sm">
              NES
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <span className="font-display text-sm font-bold tracking-wider text-white">
                  NUR CMS
                </span>
                <span className="text-[10px] text-white/50">Admin Panel</span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={onToggle}
            className="hidden h-7 w-7 items-center justify-center rounded border border-white/15 text-white/70 hover:bg-white/10 lg:flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    item.href === "/admin/dashboard"
                      ? pathname === "/admin/dashboard" || pathname === "/admin"
                      : pathname.startsWith(item.href.split("?")[0]);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={`group flex items-center gap-3 rounded px-3 py-2 text-xs font-medium transition ${
                        active
                          ? "bg-orange text-white font-semibold shadow-xs"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="text-base shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Live Website Link */}
        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2.5 rounded bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-orange hover:text-white transition ${
              collapsed ? "justify-center" : ""
            }`}
            title="View Public Website"
          >
            <span>↗</span>
            {!collapsed && <span>View Live Site</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
