import Link from 'next/link'
import { Code, Github, Twitter, Linkedin } from 'lucide-react'
import { APP_NAME, FOOTER_LINKS } from '@/lib/constants'
import { Button } from '@/components/ui/button'

export function Footer() {
  const socialLinks = [
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ]

  return (
    <footer className="bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-headline mb-4">
              <Code className="h-8 w-8 text-primary" />
              <span>{APP_NAME}</span>
            </Link>
            <p className="text-muted-foreground max-w-xs">
              The ultimate web-based Python IDE with AI-powered features.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex items-start gap-4">
            {socialLinks.map((link) => (
              <a key={link.name} href={link.href} aria-label={link.name} className="text-muted-foreground hover:text-primary transition-colors">
                <link.icon className="h-6 w-6" />
              </a>
            ))}
          </div>

        </div>
        <div className="mt-16 pt-8 border-t flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
