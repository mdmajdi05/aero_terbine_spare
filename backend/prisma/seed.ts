import { PrismaClient, UserRole, Condition, StockStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding database…');

  // ── Users ────────────────────────────────────────────────────
  const users: Array<{
    email: string; password: string; fullName: string; company: string;
    cageCode?: string; phone: string; country: string; role: UserRole;
  }> = [
    { email: 'superadmin@aeroturbinespare.com', password: 'SuperAdmin@2025!', fullName: 'System SuperAdmin', company: 'AeroTurbineSpare', phone: '+1-800-000-0000', country: 'United States', role: 'SuperAdmin' },
    { email: 'admin@aeroturbinespare.com',      password: 'Admin@2025!',      fullName: 'Admin User',        company: 'AeroTurbineSpare', phone: '+1-800-000-0001', country: 'United States', role: 'Admin' },
    { email: 'trader@aeroturbinespare.com',     password: 'Trader@2025!',     fullName: 'Trader User',       company: 'Global Aviation Supply', cageCode: '1ABZ2', phone: '+1-555-010-2030', country: 'United States', role: 'Trader' },
    { email: 'alice@boeing.com',                password: 'User@2025!',       fullName: 'Alice Johnson',     company: 'Boeing',     cageCode: '81205', phone: '+1-425-555-0100', country: 'United States', role: 'User' },
    { email: 'jean@airbus.com',                 password: 'User@2025!',       fullName: 'Jean Dupont',       company: 'Airbus',     cageCode: 'K1234', phone: '+33-1-5560-4567', country: 'France',        role: 'User' },
  ];

  for (const u of users) {
    const { password: _pw, ...userFields } = u;
    const passwordHash = await bcrypt.hash(_pw, 12);
    await prisma.user.upsert({
      where:  { email: u.email },
      create: { ...userFields, passwordHash },
      update: { passwordHash, role: u.role },
    });
    console.log(`   ✅  User: ${u.email} [${u.role}]`);
  }

  // ── Parts ────────────────────────────────────────────────────
  const parts: Array<{
    nsn: string; cage: string; partNumber: string; description: string; shortDescription: string;
    fsg: string; fsc: string; category: string; manufacturer: string; condition: Condition;
    stockStatus: StockStatus; quantityAvailable: number; unitPrice: number; tags: string[];
  }> = [
    {
      nsn: '2840-01-123-4567', cage: '81205', partNumber: 'CFM56-7B-FAN-01',
      description: 'CFM56-7B High-bypass turbofan fan blade assembly, titanium alloy with erosion-resistant coating',
      shortDescription: 'CFM56-7B Fan Blade', fsg: '28', fsc: '2840',
      category: 'Turbofan Engines', manufacturer: 'CFM International',
      condition: 'Overhauled', stockStatus: 'InStock', quantityAvailable: 4, unitPrice: 15750,
      tags: ['CFM56', 'fan blade', 'turbofan', 'Boeing 737'],
    },
    {
      nsn: '2840-01-234-5678', cage: '77777', partNumber: 'PW4000-HPC-BLADE-07',
      description: 'Pratt & Whitney PW4000 High-Pressure Compressor blade, 7th stage, nickel superalloy',
      shortDescription: 'PW4000 HPC Blade 7th', fsg: '28', fsc: '2840',
      category: 'Turbofan Engines', manufacturer: 'Pratt & Whitney',
      condition: 'New', stockStatus: 'OnOrder', quantityAvailable: 0, unitPrice: 8200,
      tags: ['PW4000', 'HPC blade', 'compressor'],
    },
    {
      nsn: '2840-01-345-6789', cage: '99991', partNumber: 'GE90-115B-LPT-VANE',
      description: 'GE90-115B Low-Pressure Turbine vane segment, directionally solidified nickel alloy',
      shortDescription: 'GE90-115B LPT Vane', fsg: '28', fsc: '2840',
      category: 'Turbofan Engines', manufacturer: 'GE Aviation',
      condition: 'Refurbished', stockStatus: 'Limited', quantityAvailable: 2, unitPrice: 22400,
      tags: ['GE90', 'LPT vane', 'Boeing 777'],
    },
    {
      nsn: '2915-01-456-7890', cage: '55512', partNumber: 'PT6A-65B-FUEL-CONTROL',
      description: 'PT6A-65B Hydro-mechanical fuel control unit, overhauled with 8-year certification',
      shortDescription: 'PT6A-65B Fuel Control', fsg: '29', fsc: '2915',
      category: 'Turboprop Engines', manufacturer: 'Pratt & Whitney Canada',
      condition: 'Overhauled', stockStatus: 'InStock', quantityAvailable: 3, unitPrice: 6800,
      tags: ['PT6A', 'fuel control', 'turboprop'],
    },
    {
      nsn: '2840-01-567-8901', cage: '33331', partNumber: 'TRENT-900-COMBUSTOR-LINER',
      description: 'Rolls-Royce Trent 900 combustor liner assembly, thermal barrier coated',
      shortDescription: 'Trent 900 Combustor Liner', fsg: '28', fsc: '2840',
      category: 'Turbofan Engines', manufacturer: 'Rolls-Royce',
      condition: 'New', stockStatus: 'InStock', quantityAvailable: 1, unitPrice: 41000,
      tags: ['Trent 900', 'combustor', 'A380'],
    },
    {
      nsn: '2840-01-678-9012', cage: '22221', partNumber: 'F110-GE-129-NOZZLE',
      description: 'F110-GE-129 convergent-divergent exhaust nozzle, titanium, F-16C/D compatible',
      shortDescription: 'F110-129 Exhaust Nozzle', fsg: '28', fsc: '2840',
      category: 'Military Engines', manufacturer: 'GE Aviation',
      condition: 'Overhauled', stockStatus: 'InStock', quantityAvailable: 2, unitPrice: 38500,
      tags: ['F110', 'F-16', 'military', 'exhaust nozzle'],
    },
    {
      nsn: '2840-01-789-0123', cage: '44441', partNumber: 'CFM56-5B-OGV',
      description: 'CFM56-5B/7B outlet guide vane, aluminum alloy, used on A320/B737',
      shortDescription: 'CFM56-5B Outlet Guide Vane', fsg: '28', fsc: '2840',
      category: 'Turbofan Engines', manufacturer: 'CFM International',
      condition: 'Used', stockStatus: 'Obsolete', quantityAvailable: 8, unitPrice: 2300,
      tags: ['CFM56', 'OGV', 'A320', 'B737'],
    },
    {
      nsn: '2840-01-890-1234', cage: '66661', partNumber: 'T700-GE-701C-POWER-TURBINE',
      description: 'T700-GE-701C power turbine module, used in UH-60 Black Hawk and AH-64 Apache',
      shortDescription: 'T700-701C Power Turbine', fsg: '28', fsc: '2840',
      category: 'Military Engines', manufacturer: 'GE Aviation',
      condition: 'Refurbished', stockStatus: 'InStock', quantityAvailable: 5, unitPrice: 19800,
      tags: ['T700', 'Black Hawk', 'Apache', 'military rotorcraft'],
    },
  ];

  for (const p of parts) {
    await prisma.part.upsert({
      where:  { nsn: p.nsn },
      create: p,
      update: { stockStatus: p.stockStatus, quantityAvailable: p.quantityAvailable, unitPrice: p.unitPrice },
    });
    console.log(`   ✅  Part: ${p.nsn} — ${p.shortDescription}`);
  }

  // ── System settings ───────────────────────────────────────────
  const defaultSettings = [
    { key: 'site_name',        value: 'AeroTurbineSpare' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'rfq_auto_assign',  value: 'true' },
    { key: 'max_file_upload_mb', value: '10' },
  ];
  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where:  { key: s.key },
      create: { ...s, updatedBy: 'seed' },
      update: {},
    });
  }
  console.log('   ✅  System settings seeded');

  console.log('\n✨  Seed complete');
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
