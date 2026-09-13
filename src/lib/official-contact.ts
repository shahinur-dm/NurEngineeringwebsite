export const OFFICIAL_CONTACT = {
  email: "ceo@nurengineering.bd.com",
  phone: "+8801805030940",
  phone2: "01805030941",
  phone3: "01805030947",
  whatsapp: "+8801713798987",
  wechatId: "nurul01713798987",
  addressHouse: "43-44",
  addressRoad: "1",
  addressBlock: "B",
  address:
    "House#43-44, Road-1, Block -B, Mirpur-1 (Beside Shah Ali Thana), Dhaka-1216",
};

const STALE = new Set(
  [
    "",
    "info@nurengineering.com",
    "ceo@nurengineeringbd.com",
    "+880 1700-000000",
    "+880170000000",
    "+8801713798987",
    "+880 1713-798987",
    "+8801713-798987",
    "Dhaka, Bangladesh",
  ].map((s) => s.trim().toLowerCase())
);

export function officialOrExisting(value: string | undefined, official: string) {
  if (!value || STALE.has(value.trim().toLowerCase())) return official;
  return value;
}

export function telHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("+") ? digits : digits}`;
}
