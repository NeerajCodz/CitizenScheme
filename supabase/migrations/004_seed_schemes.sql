-- ============================================================
-- Citizen Scheme — Supabase Migration
-- 004: Seed Data — Sample Government Schemes
-- ============================================================

insert into public.schemes (slug, scheme_name, scheme_code, description, benefits, department, state, category, eligibility_rules, application_process, official_website) values

-- Central Schemes
(
  'pm-kisan',
  'PM-KISAN Samman Nidhi',
  'PMKISAN',
  'Income support of ₹6,000 per year for all landholding farmer families across the country, paid in three equal instalments of ₹2,000 each.',
  '₹6,000 per year in three instalments of ₹2,000 directly to bank account.',
  'Ministry of Agriculture & Farmers Welfare',
  null,
  'Agriculture',
  '{
    "max_income": 500000,
    "occupation": ["farmer"],
    "required_documents": ["aadhaar"]
  }'::jsonb,
  '1. Visit pmkisan.gov.in or nearest CSC centre\n2. Provide Aadhaar, bank details, and land records\n3. Verification by state nodal officer\n4. Benefits credited to bank account',
  'https://pmkisan.gov.in'
),

(
  'ayushman-bharat',
  'Ayushman Bharat - PMJAY',
  'ABPMJAY',
  'Health insurance cover of ₹5 lakh per family per year for secondary and tertiary care hospitalisation to poor and vulnerable families.',
  '₹5 lakh cashless health cover per family per year at empanelled hospitals.',
  'National Health Authority',
  null,
  'Healthcare',
  '{
    "max_income": 300000,
    "caste_categories": ["sc", "st", "obc", "ews"],
    "required_documents": ["aadhaar"]
  }'::jsonb,
  '1. Check eligibility at mera.pmjay.gov.in\n2. Visit nearest Ayushman Mitra at empanelled hospital\n3. Get e-card generated using Aadhaar\n4. Avail cashless treatment',
  'https://pmjay.gov.in'
),

(
  'pm-awas-yojana',
  'Pradhan Mantri Awas Yojana',
  'PMAY',
  'Affordable housing scheme providing financial assistance for construction or purchase of houses for the urban and rural poor.',
  'Subsidy of ₹1.5 lakh to ₹2.67 lakh on home loan interest for EWS/LIG/MIG categories.',
  'Ministry of Housing & Urban Affairs',
  null,
  'Housing',
  '{
    "max_income": 1800000,
    "caste_categories": ["general", "obc", "sc", "st", "ews"],
    "required_documents": ["aadhaar"]
  }'::jsonb,
  '1. Apply online at pmaymis.gov.in or visit nearest CSC\n2. Submit income proof, Aadhaar, and address proof\n3. Application verified by Urban Local Body\n4. Subsidy credited via CLSS to lending institution',
  'https://pmaymis.gov.in'
),

(
  'pm-ujjwala-yojana',
  'Pradhan Mantri Ujjwala Yojana',
  'PMUY',
  'Free LPG connections to women from Below Poverty Line (BPL) families to promote clean cooking fuel.',
  'Free LPG connection with deposit-free cylinder and regulator. First refill and stove provided free.',
  'Ministry of Petroleum & Natural Gas',
  null,
  'Energy',
  '{
    "max_income": 200000,
    "gender": ["female"],
    "min_age": 18,
    "required_documents": ["aadhaar"]
  }'::jsonb,
  '1. Visit nearest LPG distributor\n2. Fill KYC form with Aadhaar and BPL card\n3. Get connection installed at home',
  'https://www.pmujjwalayojana.com'
),

(
  'national-scholarship-portal',
  'National Scholarship Portal Schemes',
  'NSP',
  'Umbrella portal for central and state scholarships for students from economically weaker sections, minorities, and SC/ST communities.',
  'Scholarships ranging from ₹5,000 to ₹2,00,000 per year based on scheme and course.',
  'Ministry of Education',
  null,
  'Education',
  '{
    "max_income": 800000,
    "max_age": 35,
    "caste_categories": ["sc", "st", "obc", "ews"],
    "required_documents": ["aadhaar"]
  }'::jsonb,
  '1. Register at scholarships.gov.in\n2. Fill application with academic and income details\n3. Upload required documents\n4. Track status online',
  'https://scholarships.gov.in'
),

(
  'sukanya-samriddhi-yojana',
  'Sukanya Samriddhi Yojana',
  'SSY',
  'Small savings scheme for the girl child offering attractive interest rates and tax benefits under Section 80C.',
  'Interest rate of ~8% p.a., tax-free maturity amount, minimum deposit ₹250/year.',
  'Ministry of Finance',
  null,
  'Women & Child',
  '{
    "gender": ["female"],
    "max_age": 10,
    "required_documents": ["aadhaar"]
  }'::jsonb,
  '1. Visit any post office or authorised bank\n2. Open account with birth certificate and guardian ID\n3. Make initial deposit of minimum ₹250',
  'https://www.nsiindia.gov.in'
),

-- State Schemes (Tamil Nadu)
(
  'tn-marriage-assistance',
  'Tamil Nadu Marriage Assistance Scheme',
  'TNMAS',
  'Financial assistance for marriage of women from economically weaker families in Tamil Nadu.',
  '₹50,000 and 8 grams of gold coin for degree holders; ₹25,000 for non-degree holders.',
  'Social Welfare Department, Tamil Nadu',
  'Tamil Nadu',
  'Women & Child',
  '{
    "max_income": 300000,
    "gender": ["female"],
    "min_age": 18,
    "states": ["Tamil Nadu"],
    "required_documents": ["aadhaar"]
  }'::jsonb,
  '1. Apply at District Social Welfare Office\n2. Submit income certificate, community certificate, and educational certificates\n3. Marriage must be registered',
  'https://www.tnsocialwelfare.tn.gov.in'
),

-- State Schemes (Karnataka)
(
  'karnataka-bhagyalakshmi',
  'Karnataka Bhagyalakshmi Scheme',
  'KBLS',
  'Financial assistance for girl children born in BPL families in Karnataka.',
  '₹19,300 maturity benefit at age 18 plus annual scholarships during education.',
  'Women & Child Development, Karnataka',
  'Karnataka',
  'Women & Child',
  '{
    "max_income": 250000,
    "gender": ["female"],
    "states": ["Karnataka"],
    "caste_categories": ["sc", "st", "obc", "ews"],
    "required_documents": ["aadhaar"]
  }'::jsonb,
  '1. Apply at nearest Anganwadi centre within one year of birth\n2. Submit BPL card and birth certificate\n3. Open savings account in girl child name',
  'https://dwcd.karnataka.gov.in'
),

-- State Schemes (Maharashtra)
(
  'maharashtra-ladki-bahin',
  'Maharashtra Ladki Bahin Yojana',
  'MLBY',
  'Monthly financial assistance of ₹1,500 to women between 21-65 years from economically weaker sections in Maharashtra.',
  '₹1,500 per month (₹18,000 per year) directly to bank account.',
  'Women & Child Development, Maharashtra',
  'Maharashtra',
  'Women & Child',
  '{
    "max_income": 250000,
    "gender": ["female"],
    "min_age": 21,
    "max_age": 65,
    "states": ["Maharashtra"],
    "required_documents": ["aadhaar"]
  }'::jsonb,
  '1. Apply online or at nearest Gram Panchayat office\n2. Submit Aadhaar, ration card, and income certificate\n3. Amount credited monthly to linked bank account',
  'https://ladkibahin.maharashtra.gov.in'
),

-- Disability
(
  'disability-pension-scheme',
  'Indira Gandhi National Disability Pension Scheme',
  'IGNDPS',
  'Monthly pension for persons with severe or multiple disabilities belonging to BPL families.',
  '₹300 per month (₹500 for 80%+ disability) from Central Government + state top-up.',
  'Ministry of Rural Development',
  null,
  'Disability',
  '{
    "max_income": 200000,
    "disability": true,
    "min_age": 18,
    "max_age": 79,
    "required_documents": ["aadhaar"]
  }'::jsonb,
  '1. Apply at District Social Welfare Office or Block Office\n2. Submit disability certificate (40%+), BPL card, Aadhaar\n3. Pension credited to bank account monthly',
  'https://nsap.nic.in'
);
