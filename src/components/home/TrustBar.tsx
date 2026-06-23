import { ShieldCheck, Award, Clock, Globe, Eye } from 'lucide-react';

const BADGES = [
  { icon: ShieldCheck, label: 'ISO 9001 Certified',           sub: 'Quality Management System' },
  { icon: Award,       label: 'AS9120 Rev. B',                sub: 'Aerospace Supply Chain' },
  { icon: Eye,         label: '100% Inspection',              sub: 'On Every Order' },
  { icon: Clock,       label: '24-Hr Quote Response',         sub: 'Guaranteed Response Time' },
  { icon: Globe,       label: 'Ships to 150+ Countries',      sub: 'Global Logistics Network' },
];

export default function TrustBar() {
  return (
    <div className="bg-white border-y border-silver">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
          {BADGES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-lg bg-navy/8 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-navy" />
              </div>
              <div>
                <div className="text-xs font-semibold text-text">{label}</div>
                <div className="text-[10px] text-text-muted">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
