import { Bot, Cloud, Code, Cpu, Rocket, ShieldCheck, Star, Users } from 'lucide-react';
import { ImagePlaceholder, PlaceHolderImages } from '@/lib/placeholder-images';

export const APP_NAME = 'PyCode AI';

export const NAV_LINKS = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
];

export const FEATURES = [
  {
    icon: Bot,
    title: 'AI-Powered Assistant',
    description: 'Get instant code help, explanations, and suggestions from our intelligent AI partner.',
  },
  {
    icon: Rocket,
    title: 'Instant Execution',
    description: 'Run Python code in seconds within a secure, sandboxed environment. No setup required.',
  },
  {
    icon: Cloud,
    title: 'Cloud Storage',
    description: 'Save your projects in the cloud and access them from anywhere, on any device.',
  },
  {
    icon: Code,
    title: 'Beautiful Interface',
    description: 'Enjoy a professional, VS Code-like editor experience designed for productivity.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Sandbox',
    description: 'Your code is executed in an isolated environment, ensuring safety and privacy.',
  },
  {
    icon: Cpu,
    title: 'Fully Responsive',
    description: 'Seamlessly code on your desktop, tablet, or mobile device with a responsive UI.',
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Sign Up Free',
    description: 'Create your free account in just a few seconds. No credit card required.',
  },
  {
    step: 2,
    title: 'Start Coding',
    description: 'Jump into our powerful web-based Python editor with an integrated AI assistant.',
  },
  {
    step: 3,
    title: 'Run & Debug',
    description: 'Execute your code instantly, view output, and debug any issues with AI help.',
  },
];

export const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/ month',
    description: 'For hobbyists and students starting their coding journey.',
    features: [
      'Unlimited public projects',
      'Basic AI assistance',
      '100 code runs per day',
      'Community support',
    ],
    cta: 'Start for Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/ month',
    description: 'For professionals and serious developers who need more power.',
    features: [
      'Unlimited private projects',
      'Advanced AI assistance',
      'Unlimited code runs',
      'Priority email support',
      'More computing power',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Team',
    price: '$25',
    period: '/ user / month',
    description: 'For organizations and teams that need to collaborate.',
    features: [
      'All Pro features',
      'Real-time collaboration',
      'Shared team projects',
      'Centralized billing',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const testimonialImages = PlaceHolderImages.filter(img => img.id.startsWith('testimonial-'));

export const TESTIMONIALS = [
  {
    name: 'Sarah L.',
    role: 'Full-Stack Developer',
    quote: `PyCode AI has revolutionized my workflow. The AI assistant is incredibly smart and helps me write better, cleaner code faster than ever before. It's a game-changer for Python development.`,
    avatar: testimonialImages.find(img => img.id === 'testimonial-1')?.imageUrl ?? '',
  },
  {
    name: 'Mike R.',
    role: 'Data Scientist',
    quote: `I can finally run my Python scripts from anywhere without setting up a complex environment. The instant execution and cloud storage are exactly what I needed for my data analysis projects.`,
    avatar: testimonialImages.find(img => img.id === 'testimonial-2')?.imageUrl ?? '',
  },
  {
    name: 'Jen W.',
    role: 'Computer Science Student',
    quote: `As a student, PyCode AI is an invaluable learning tool. The AI's explanations of complex code snippets are clear and concise. It's like having a personal tutor available 24/7.`,
    avatar: testimonialImages.find(img => img.id === 'testimonial-3')?.imageUrl ?? '',
  },
  {
    name: 'Alex D.',
    role: 'Backend Engineer',
    quote: 'The editor is snappy, the UI is clean, and the AI is surprisingly helpful. I was skeptical at first, but now I use it for all my quick Python scripts and prototypes. Highly recommended!',
    avatar: testimonialImages.find(img => img.id === 'testimonial-4')?.imageUrl ?? '',
  },
];

export const FAQS = [
  {
    question: 'Is PyCode AI really free to use?',
    answer: 'Yes! We offer a generous free plan that includes unlimited public projects and a substantial number of daily code executions. It\'s perfect for students, hobbyists, and for trying out our platform.',
  },
  {
    question: 'What languages are supported?',
    answer: 'Currently, our platform is optimized for Python 3. We are focused on providing the best possible Python experience. We may consider adding support for other languages in the future based on user feedback.',
  },
  {
    question: 'How does the AI assistant work?',
    answer: 'Our AI assistant is powered by advanced large language models. It analyzes your code context to provide relevant suggestions, explanations, error fixes, and optimizations. You can interact with it through a chat interface.',
  },
  {
    question: 'Is my code secure?',
    answer: 'Absolutely. All code is executed in a secure, isolated sandbox environment. Your private projects are encrypted and accessible only by you. We take your code\'s privacy and security very seriously.',
  },
  {
    question: 'Can I collaborate with others on a project?',
    answer: 'Collaboration features, such as real-time shared editing and commenting, are available on our Team plan. This allows multiple developers to work together on the same project seamlessly.',
  },
  {
    question: 'Do I need to install anything on my computer?',
    answer: 'No, PyCode AI is a fully web-based application. All you need is a modern web browser and an internet connection. There are no installations or environment configurations required.',
  },
];

export const FOOTER_LINKS = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Documentation', href: '#' },
    { name: 'Changelog', href: '#' },
  ],
  company: [
    { name: 'About Us', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Careers', href: '#' },
  ],
};
