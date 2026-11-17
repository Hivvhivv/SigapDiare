import {
  Activity,
  BookOpen,
  Calculator,
  CircleQuestionMark,
  ClipboardCheck,
  Droplets,
  House,
  Info,
  LayoutGrid,
  ListChecks,
  Bell,
  Pill,
  Siren,
  type LucideIcon,
} from "lucide-react";

export const SITE_NAME = "SIGAP DIARE";
// Tagline asli dokumen master: "Sahabat Ibu untuk ...". Diperluas agar menyapa ayah juga.
export const TAGLINE = "Sahabat Ayah Bunda untuk Cegah dan Tangani Diare pada Si Kecil.";
export const TAGLINE_SHORT = "Sahabat Ayah Bunda & Si Kecil";

export type NavItem = { href: string; label: string; shortLabel: string; Icon: LucideIcon };

export const MAIN_NAV: NavItem[] = [
  { href: "/beranda", label: "Beranda", shortLabel: "Beranda", Icon: House },
  { href: "/edukasi", label: "Edukasi Diare", shortLabel: "Edukasi", Icon: BookOpen },
  { href: "/fitur", label: "Fitur & Pemantauan", shortLabel: "Fitur", Icon: LayoutGrid },
  { href: "/evaluasi", label: "Kuis", shortLabel: "Kuis", Icon: ClipboardCheck },
  { href: "/faq", label: "Tanya Jawab", shortLabel: "Tanya", Icon: CircleQuestionMark },
];

export type QuickAccessItem = {
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  danger?: boolean;
};

export const QUICK_ACCESS: QuickAccessItem[] = [
  { href: "/edukasi/mengenal-diare", title: "Mengenal Diare", description: "Apa itu diare dan penyebabnya", Icon: Info },
  { href: "/edukasi/pencegahan", title: "Cegah Diare", description: "Kebiasaan bersih di rumah", Icon: Droplets },
  { href: "/edukasi/penanganan", title: "5 LINTAS DIARE", description: "Yang dilakukan saat anak diare", Icon: Pill },
  { href: "/tanda-bahaya", title: "Tanda Bahaya", description: "Kapan harus segera ke dokter", Icon: Siren, danger: true },
  { href: "/fitur/panduan-takaran", title: "Panduan Takaran", description: "Info oralit dan zinc", Icon: Calculator },
  { href: "/fitur/checklist", title: "Checklist Harian", description: "Kebiasaan sehat hari ini", Icon: ListChecks },
  { href: "/fitur/pelacak", title: "Catatan Diare", description: "Catat kondisi si kecil", Icon: Activity },
  { href: "/fitur/pengingat", title: "Pengingat", description: "Supaya tidak lupa", Icon: Bell },
  { href: "/faq", title: "Tanya Jawab", description: "Pertanyaan yang sering muncul", Icon: CircleQuestionMark },
  { href: "/evaluasi", title: "Kuis Pengetahuan", description: "Kuis singkat untuk Ayah/Bunda", Icon: ClipboardCheck },
];

export const FOOTER_LINKS = {
  education: [
    { href: "/edukasi/mengenal-diare", label: "Mengenal Diare" },
    { href: "/edukasi/pencegahan", label: "Pencegahan Diare" },
    { href: "/edukasi/penanganan", label: "Panduan LINTAS DIARE" },
    { href: "/tanda-bahaya", label: "Gejala & Tanda Bahaya" },
  ],
  features: [
    { href: "/fitur/panduan-takaran", label: "Panduan Takaran" },
    { href: "/fitur/pelacak", label: "Catatan Diare" },
    { href: "/fitur/checklist", label: "Checklist Harian" },
    { href: "/fitur/pengingat", label: "Pengingat" },
    { href: "/evaluasi", label: "Kuis Pengetahuan" },
  ],
};
