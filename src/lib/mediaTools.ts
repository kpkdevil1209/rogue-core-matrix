/* ---------------- EXIF (JPEG APP1 / TIFF) ---------------- */

const EXIF_TAGS: Record<number, string> = {
  0x010f: "Make", 0x0110: "Model", 0x0112: "Orientation", 0x011a: "XResolution",
  0x011b: "YResolution", 0x0128: "ResolutionUnit", 0x0131: "Software",
  0x0132: "DateTime", 0x013b: "Artist", 0x8298: "Copyright", 0x829a: "ExposureTime",
  0x829d: "FNumber", 0x8827: "ISO", 0x9003: "DateTimeOriginal", 0x9004: "DateTimeDigitized",
  0x920a: "FocalLength", 0xa002: "PixelXDimension", 0xa003: "PixelYDimension",
  0xa430: "OwnerName", 0xa433: "LensMake", 0xa434: "LensModel", 0x8825: "GPSInfoOffset",
  0x9286: "UserComment", 0x9209: "Flash", 0xa406: "SceneCaptureType",
};

export interface ExifResult {
  tags: Record<string, string>;
  warnings: string[];
}

export function readExif(buffer: ArrayBuffer): ExifResult {
  const view = new DataView(buffer);
  const tags: Record<string, string> = {};
  const warnings: string[] = [];
  if (view.byteLength < 4) return { tags, warnings: ["file too small"] };
  if (view.getUint16(0) !== 0xffd8) {
    warnings.push("Not a JPEG — EXIF blocks only exist in JPEG/TIFF containers.");
    return { tags, warnings };
  }
  let offset = 2;
  let tiff = -1;
  while (offset < view.byteLength - 4) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    const size = view.getUint16(offset + 2);
    if (marker === 0xe1 && view.getUint32(offset + 4) === 0x45786966) {
      tiff = offset + 10;
      break;
    }
    offset += 2 + size;
  }
  if (tiff < 0) {
    warnings.push("No APP1/EXIF segment — metadata likely stripped by an editor or social platform.");
    return { tags, warnings };
  }
  const little = view.getUint16(tiff) === 0x4949;
  const u16 = (o: number) => view.getUint16(o, little);
  const u32 = (o: number) => view.getUint32(o, little);
  const ifd0 = tiff + u32(tiff + 4);

  const readDir = (dir: number) => {
    const count = u16(dir);
    for (let i = 0; i < count; i += 1) {
      const entry = dir + 2 + i * 12;
      const tag = u16(entry);
      const type = u16(entry + 2);
      const num = u32(entry + 4);
      let valueOffset = entry + 8;
      const bytesPer = type === 1 || type === 2 || type === 7 ? 1 : type === 3 ? 2 : type === 5 || type === 10 ? 8 : 4;
      if (num * bytesPer > 4) valueOffset = tiff + u32(entry + 8);
      let value = "";
      try {
        if (type === 2) {
          let s = "";
          for (let k = 0; k < num - 1; k += 1) s += String.fromCharCode(view.getUint8(valueOffset + k));
          value = s.trim();
        } else if (type === 3) value = String(u16(valueOffset));
        else if (type === 4) value = String(u32(valueOffset));
        else if (type === 5) value = `${u32(valueOffset)}/${u32(valueOffset + 4)}`;
        else value = `0x${u32(valueOffset).toString(16)}`;
      } catch {
        value = "unreadable";
      }
      if (tag === 0x8769) {
        try { readDir(tiff + u32(entry + 8)); } catch { /* ignore */ }
        continue;
      }
      const name = EXIF_TAGS[tag];
      if (name && value) tags[name] = value;
    }
  };
  try { readDir(ifd0); } catch { warnings.push("IFD walk aborted — truncated metadata."); }

  if (tags["GPSInfoOffset"]) warnings.push("GPS IFD present: this image may leak capture coordinates.");
  if (tags["Software"]) warnings.push(`Editor fingerprint exposed: ${tags["Software"]}`);
  if (tags["Artist"] || tags["OwnerName"]) warnings.push("Owner identity embedded in metadata.");
  if (!Object.keys(tags).length) warnings.push("EXIF segment present but no recognized tags.");
  return { tags, warnings };
}

/* ---------------- SVG path optimizer ---------------- */

export interface PathStats {
  commands: number;
  originalLength: number;
  optimizedLength: number;
  savedPct: number;
  optimized: string;
  issues: string[];
}

export function optimizePath(d: string, precision = 2): PathStats {
  const issues: string[] = [];
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const out: string[] = [];
  let commands = 0;
  for (const t of tokens) {
    if (/[a-zA-Z]/.test(t)) {
      commands += 1;
      out.push(t);
    } else {
      const n = Number(t);
      out.push(String(Number(n.toFixed(precision))));
    }
  }
  let optimized = "";
  for (let i = 0; i < out.length; i += 1) {
    const t = out[i]!;
    const prev = out[i - 1];
    if (/[a-zA-Z]/.test(t)) optimized += (optimized ? " " : "") + t;
    else if (prev && /[a-zA-Z]/.test(prev)) optimized += t;
    else optimized += (t.startsWith("-") ? "" : " ") + t;
  }
  optimized = optimized.replace(/\s+/g, " ").trim();
  if (!/^[Mm]/.test(d.trim())) issues.push("Path does not start with a moveto (M) command.");
  if (/[Zz]/.test(d) === false) issues.push("Open path — no closepath (Z); fills may render unpredictably.");
  if (commands > 400) issues.push("Very high command count; consider simplifying with a curve fitter.");
  const savedPct = d.length ? Math.max(0, Math.round(((d.length - optimized.length) / d.length) * 1000) / 10) : 0;
  return { commands, originalLength: d.length, optimizedLength: optimized.length, savedPct, optimized, issues };
}

export const SAMPLE_PATH =
  "M 60.000000 10.0000 L 110.00000 40.000000 L 110.000 100.00000 L 60.00000 130.000 L 10.000000 100.0000 L 10.00000 40.00000 Z M 60.0000 45.00000 L 85.000 60.0000 L 85.0000 90.00000 L 60.00000 105.0000 L 35.0000 90.000 L 35.00000 60.000000 Z";

/* ---------------- Translator (50+ languages) ---------------- */

export interface Language { code: string; name: string; native: string }

export const LANGUAGES: Language[] = [
  { code: "ar", name: "Arabic", native: "العربية" }, { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "bg", name: "Bulgarian", native: "Български" }, { code: "ca", name: "Catalan", native: "Català" },
  { code: "zh", name: "Chinese", native: "中文" }, { code: "hr", name: "Croatian", native: "Hrvatski" },
  { code: "cs", name: "Czech", native: "Čeština" }, { code: "da", name: "Danish", native: "Dansk" },
  { code: "nl", name: "Dutch", native: "Nederlands" }, { code: "en", name: "English", native: "English" },
  { code: "et", name: "Estonian", native: "Eesti" }, { code: "fi", name: "Finnish", native: "Suomi" },
  { code: "fr", name: "French", native: "Français" }, { code: "de", name: "German", native: "Deutsch" },
  { code: "el", name: "Greek", native: "Ελληνικά" }, { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "he", name: "Hebrew", native: "עברית" }, { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "hu", name: "Hungarian", native: "Magyar" }, { code: "is", name: "Icelandic", native: "Íslenska" },
  { code: "id", name: "Indonesian", native: "Indonesia" }, { code: "it", name: "Italian", native: "Italiano" },
  { code: "ja", name: "Japanese", native: "日本語" }, { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "kk", name: "Kazakh", native: "Қазақ" }, { code: "ko", name: "Korean", native: "한국어" },
  { code: "lv", name: "Latvian", native: "Latviešu" }, { code: "lt", name: "Lithuanian", native: "Lietuvių" },
  { code: "ms", name: "Malay", native: "Melayu" }, { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "mr", name: "Marathi", native: "मराठी" }, { code: "ne", name: "Nepali", native: "नेपाली" },
  { code: "no", name: "Norwegian", native: "Norsk" }, { code: "ps", name: "Pashto", native: "پښتو" },
  { code: "fa", name: "Persian", native: "فارسی" }, { code: "pl", name: "Polish", native: "Polski" },
  { code: "pt", name: "Portuguese", native: "Português" }, { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ro", name: "Romanian", native: "Română" }, { code: "ru", name: "Russian", native: "Русский" },
  { code: "sr", name: "Serbian", native: "Српски" }, { code: "si", name: "Sinhala", native: "සිංහල" },
  { code: "sk", name: "Slovak", native: "Slovenčina" }, { code: "sl", name: "Slovenian", native: "Slovenščina" },
  { code: "so", name: "Somali", native: "Soomaali" }, { code: "es", name: "Spanish", native: "Español" },
  { code: "sw", name: "Swahili", native: "Kiswahili" }, { code: "sv", name: "Swedish", native: "Svenska" },
  { code: "ta", name: "Tamil", native: "தமிழ்" }, { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "th", name: "Thai", native: "ไทย" }, { code: "tr", name: "Turkish", native: "Türkçe" },
  { code: "uk", name: "Ukrainian", native: "Українська" }, { code: "ur", name: "Urdu", native: "اردو" },
  { code: "uz", name: "Uzbek", native: "Oʻzbek" }, { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
  { code: "cy", name: "Welsh", native: "Cymraeg" }, { code: "zu", name: "Zulu", native: "isiZulu" },
];

const PHRASES: Record<string, Record<string, string>> = {
  hello: { es: "hola", fr: "bonjour", de: "hallo", ur: "ہیلو", hi: "नमस्ते", ar: "مرحبا", ja: "こんにちは", zh: "你好", ru: "привет", tr: "merhaba", pt: "olá", it: "ciao", ko: "안녕하세요" },
  world: { es: "mundo", fr: "monde", de: "welt", ur: "دنیا", hi: "दुनिया", ar: "عالم", ja: "世界", zh: "世界", ru: "мир", tr: "dünya", pt: "mundo", it: "mondo", ko: "세계" },
  system: { es: "sistema", fr: "système", de: "system", ur: "نظام", hi: "प्रणाली", ar: "نظام", ja: "システム", zh: "系统", ru: "система", tr: "sistem", pt: "sistema", it: "sistema", ko: "시스템" },
  power: { es: "poder", fr: "puissance", de: "macht", ur: "طاقت", hi: "शक्ति", ar: "قوة", ja: "力", zh: "力量", ru: "сила", tr: "güç", pt: "poder", it: "potere", ko: "힘" },
  code: { es: "código", fr: "code", de: "code", ur: "کوڈ", hi: "कोड", ar: "كود", ja: "コード", zh: "代码", ru: "код", tr: "kod", pt: "código", it: "codice", ko: "코드" },
};

export function translate(text: string, target: string): { output: string; matched: number; total: number } {
  const words = text.split(/(\s+)/);
  let matched = 0;
  let total = 0;
  const output = words
    .map((w) => {
      if (/^\s+$/.test(w) || !w) return w;
      total += 1;
      const key = w.toLowerCase().replace(/[^a-z]/g, "");
      const hit = PHRASES[key]?.[target];
      if (hit) { matched += 1; return hit; }
      return w;
    })
    .join("");
  return { output, matched, total };
}
