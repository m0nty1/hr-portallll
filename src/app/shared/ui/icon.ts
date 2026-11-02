import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ArrowUp, ArrowUpDown, Award, Bell, Briefcase, Calculator, Calendar, ChartColumn, Check, ChevronDown,
  ChevronLeft, ChevronRight, ChevronUp, CircleAlert, CircleCheck, Clipboard, ClipboardList, Clock, CreditCard,
  Ellipsis, Eye, File, FileSpreadsheet, FileText, Folder, House, Info, LayoutGrid, List, Lock, LogOut,
  LucideAngularModule, LucideIconData, Mail, Menu, Percent, Plus, Printer, RotateCcw, Save, Search, Settings,
  Shield, SquareCheck, SquarePen, Trash2, TrendingUp, TriangleAlert, Upload, User, UserPlus, Users, Wallet, X, Zap, Activity, MapPin, Download,
} from 'lucide-angular';

/** Every icon used in the portal, by kebab-case name. Add new ones here. */
export const ICONS = {
  'arrow-up': ArrowUp, 'arrow-up-down': ArrowUpDown, award: Award, bell: Bell, briefcase: Briefcase,
  calculator: Calculator, calendar: Calendar, chart: ChartColumn, check: Check, 'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft, 'chevron-right': ChevronRight, 'chevron-up': ChevronUp, 'alert-circle': CircleAlert,
  'check-circle': CircleCheck, clipboard: Clipboard, 'clipboard-list': ClipboardList, clock: Clock, card: CreditCard,
  dots: Ellipsis, eye: Eye, file: File, excel: FileSpreadsheet, 'file-text': FileText, folder: Folder, home: House,
  info: Info, grid: LayoutGrid, list: List, lock: Lock, logout: LogOut, mail: Mail, menu: Menu, percent: Percent,
  plus: Plus, print: Printer, refresh: RotateCcw, save: Save, search: Search, settings: Settings, shield: Shield,
  'check-square': SquareCheck, edit: SquarePen, delete: Trash2, trend: TrendingUp, alert: TriangleAlert,
  upload: Upload, user: User, 'user-plus': UserPlus, users: Users, wallet: Wallet, close: X, zap: Zap, activity: Activity, 'map-pin': MapPin, download: Download,
} satisfies Record<string, LucideIconData>;

export type IconName = keyof typeof ICONS;

@Component({
  selector: 'app-icon',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0' },
  template: `<lucide-icon [img]="data()" [size]="size()" [strokeWidth]="strokeWidth()" />`,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(16);
  readonly strokeWidth = input(2);
  protected readonly data = computed(() => ICONS[this.name()]);
}
