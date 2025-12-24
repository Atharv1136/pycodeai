import { Code } from 'lucide-react'
import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  description: string;
};

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-secondary p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-blue-600 opacity-80"></div>
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:36px_36px]"
          style={{
            maskImage: 'radial-gradient(ellipse at center, white 5%, transparent 60%)'
          }}>
        </div>
        <div className="relative z-10 text-primary-foreground text-center">
            <Link href="/" className="inline-flex items-center gap-3 text-4xl font-bold font-headline mb-6">
                <Code className="h-10 w-10" />
                <span>{APP_NAME}</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">
                {title}
            </h1>
            <p className="text-lg text-primary-foreground/80 mt-2">
                {description}
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden text-center">
                <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold font-headline mb-6 text-foreground">
                    <Code className="h-8 w-8 text-primary" />
                    <span>{APP_NAME}</span>
                </Link>
            </div>
            {children}
        </div>
      </div>
    </div>
  );
}
