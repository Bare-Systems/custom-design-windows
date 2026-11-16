// Existing business information and selected project photographs from
// https://www.customdesignwindows.com/ (accessed November 2026).
// Gallery images currently use the former website's media CDN; migrate owned
// originals into public/images before retiring that site or its media account.

export const BUSINESS = {
  name: 'Custom Design Windows',
  owner: 'Dale Ellen Iarossi',
  credential: 'WFCP · Window Fashion Certified Professional',
  since: 1984,
  phone: '(954) 654-0821',
  phoneHref: 'tel:+19546540821',
  email: 'customdesignwindows1@gmail.com',
  address: ['2460 E Commercial Blvd.', 'Suite 204', 'Fort Lauderdale, FL 33308'],
  serviceArea: 'Broward County & South Florida',
  appointments: 'By appointment only',
  phoneHours: 'Phone calls: 9 AM – 7 PM, seven days a week',
};

export const ROUTES = [
  { label: 'Home', path: '' },
  { label: 'About', path: 'about' },
  { label: 'Treatments', path: 'window-treatments' },
  { label: 'Gallery', path: 'gallery' },
  { label: 'Reviews', path: 'reviews' },
  { label: 'FAQ', path: 'custom-window-treatments-faq-fort-lauderdale-' },
  { label: 'Contact', path: 'contact' },
];

export const SERVICES = [
  {
    title: 'Custom drapery',
    subtitle: 'Softness, structure, and a perfect fit.',
    text: 'Tailored panels, sheers, and lined drapery designed around the proportions and purpose of each window.',
    detail: 'A wide fabric selection, thoughtful linings, and careful finishing create a truly individual look.',
  },
  {
    title: 'Shades & blinds',
    subtitle: 'Light control, beautifully considered.',
    text: 'Functional shading that balances privacy, sunlight, and the style of your space.',
    detail: 'Ask about solar screen shades for glare and heat management in South Florida.',
  },
  {
    title: 'Top treatments',
    subtitle: 'The detail that makes a room.',
    text: 'Valances, cornices, and coordinated top treatments add a finished architectural touch.',
    detail: 'Patterns, trims, and proportions are selected to work with the room and surrounding furnishings.',
  },
  {
    title: 'Home accessories',
    subtitle: 'Made to coordinate.',
    text: 'Custom pillows, bedding, table skirts, and select light upholstery for a cohesive interior.',
    detail: 'Finishing touches can be designed using complementary fabrics and details.',
  },
  {
    title: 'Commercial projects',
    subtitle: 'Solutions for working spaces.',
    text: 'Custom window fashions and specialty fabric treatments for commercial interiors.',
    detail: 'Project requirements and materials can be discussed during an initial consultation.',
  },
];

const MEDIA = 'https://lirp.cdn-website.com/c4ec1d9d/dms3rep/multi/opt/';
// Paths below reference photos linked from the current site's public Gallery.
// Names are editorial descriptions, not assertions about which client owned a project.
export const GALLERY = [
  { image: MEDIA + 'Freeman%2Bafter%2B3-d1fc5724-545w.jpg', title: 'Living room drapery', type: 'Drapery', alt: 'Sunlit living room with pale floor-length curtains across large windows' },
  { image: MEDIA + '1-%2BSW%2BBasics%2Bw%2Bdeco%2Brods-1920w.jpg', title: 'Coordinated panels & shades', type: 'Window treatments', alt: 'Living room with patterned drapery flanking roller shades' },
  { image: MEDIA + '20240125_160102-1920w.jpg', title: 'Soft gray pleated curtains', type: 'Drapery', alt: 'Tall gray custom curtains framing the corner of a bright room' },
  { image: MEDIA + '20231208_144539-1920w.jpg', title: 'Outdoor drapery', type: 'Outdoor', alt: 'Green curtains hanging from a white pergola beside a pool' },
  { image: MEDIA + 'Shick%2BMBR%2B1-1920w.jpg', title: 'Patterned valance and curtains', type: 'Top treatments', alt: 'Custom floral valance above softly pleated curtains in a bedroom' },
  { image: MEDIA + 'Shick%2BMBR%2B2-1920w.jpg', title: 'Layered window details', type: 'Top treatments', alt: 'Coordinating patterned valances and long cream panels' },
  { image: MEDIA + 'Quarterman%2BAfter%2B1-1920w.jpg', title: 'Bedroom panel treatment', type: 'Drapery', alt: 'Bedroom with pale panels and deep navy cornice accent' },
  { image: MEDIA + 'Freeman%2BSW-1920w.jpg', title: 'Light-filled family room', type: 'Drapery', alt: 'Open-plan family room with long light curtains around a series of windows' },
  { image: MEDIA + 'Bloom%2Bpic%2B2%2Bafter-1920w.jpg', title: 'Coastal living room', type: 'Drapery', alt: 'Living room with tall drapes framing an ocean view' },
  { image: MEDIA + 'Caruso%2BLVR%2BAfter%2B2-1920w.jpg', title: 'Sheer window coverings', type: 'Shades', alt: 'Bright living area with sheer white window shades' },
];

export const FAQ = [
  {
    question: 'Why choose custom treatments instead of ready-made curtains?',
    answer: 'A custom treatment is designed for the exact window and for the room around it. It offers more control over fabric, color, pattern placement, lining, privacy, and light. The result is a tailored fit rather than a compromise with standard sizes.',
  },
  {
    question: 'Do beautiful custom treatments require expensive fabrics?',
    answer: 'Not necessarily. Thoughtful fabric selection, quality lining, and professional construction can elevate a moderately priced textile. The best choice depends on the look, function, and budget you have in mind.',
  },
  {
    question: 'Why work with Custom Design Windows?',
    answer: 'Dale works directly with clients to understand their style and needs. Professional workroom fabrication, skilled installation, and attention to materials and details are central to the process.',
  },
  {
    question: 'What areas do you serve?',
    answer: 'The studio is based in Fort Lauderdale and primarily serves Broward County and nearby South Florida communities. Call to discuss a specific location or project.',
  },
  {
    question: 'How do I arrange a consultation?',
    answer: 'Call (954) 654-0821 or email customdesignwindows1@gmail.com. Visits are by appointment. The current business website advertises a free first-time, one-hour in-home consultation.',
  },
];
