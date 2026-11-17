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
export const TAGLINE = "Sahabat Ibu untuk Cegah dan Tangani Diare pada Si Kecil.";

export type NavItem = { href: string; label: string; shortLabel: string; Icon: LucideIcon };

export const MAIN_NAV: NavItem[] = [
  { href: "/beranda", label: "Beranda", shortLabel: "Beranda", Icon: House },
  { href: "/edukasi", label: "Edukasi Diare", shortLabel: "Edukasi", Icon: BookOpen },
  { href: "/fitur", label: "Fitur & Pemantauan", shortLabel: "Fitur", Icon: LayoutGrid },
  { href: "/evaluasi", label: "Evaluasi Pengetahuan", shortLabel: "Evaluasi", Icon: ClipboardCheck },
  { href: "/faq", label: "FAQ", shortLabel: "FAQ", Icon: CircleQuestionMark },
];

export type QuickAccessItem = {
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  danger?: boolean;
};

export const QUICK_ACCESS: QuickAccessItem[] = [
  { href: "/edukasi/mengenal-diare", title: "Mengenal Diare", description: "Pengertian, penyebab, dan gejala", Icon: Info },
  { href: "/edukasi/pencegahan", title: "Pencegahan Diare", description: "Kebiasaan bersih di rumah", Icon: Droplets },
  { href: "/edukasi/penanganan", title: "5 LINTAS DIARE", description: "Langkah penanganan awal", Icon: Pill },
  { href: "/tanda-bahaya", title: "Tanda Bahaya", description: "Kapan harus segera ke faskes", Icon: Siren, danger: true },
  { href: "/fitur/panduan-takaran", title: "Panduan Takaran", description: "Info oralit dan zinc", Icon: Calculator },
  { href: "/fitur/checklist", title: "Checklist Harian", description: "Cek kebiasaan sehat hari ini", Icon: ListChecks },
  { href: "/fitur/pelacak", title: "Pelacak Diare", description: "Catat kondisi si kecil", Icon: Activity },
  { href: "/fitur/pengingat", title: "Pengingat SIGAP", description: "Atur pengingat perawatan", Icon: Bell },
  { href: "/faq", title: "Tanya Jawab (FAQ)", description: "Pertanyaan yang sering diajukan", Icon: CircleQuestionMark },
  { href: "/evaluasi", title: "Evaluasi Ibu", description: "Pretest dan posttest", Icon: ClipboardCheck },
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
    { href: "/fitur/pelacak", label: "Pelacak Diare" },
    { href: "/fitur/checklist", label: "Checklist Harian" },
    { href: "/fitur/pengingat", label: "Pengingat SIGAP" },
    { href: "/evaluasi", label: "Evaluasi Pengetahuan" },
  ],
};
