"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlaceHolderImages } from '@/lib/placeholder-images'

const TypingEffect = ({ text, speed = 100 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('')
  
  useEffect(() => {
    let i = 0
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1))
        i++
      } else {
        clearInterval(typingInterval)
      }
    }, speed)
    
    return () => clearInterval(typingInterval)
  }, [text, speed])
  
  return <>{displayedText}</>
}

export function Hero() {
  const editorImage = PlaceHolderImages.find(img => img.id === 'hero-editor');

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10"></div>
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]"
          style={{
            maskImage: 'radial-gradient(ellipse at center, white 20%, transparent 70%)'
          }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#6c5ce7] to-[#007acc] opacity-20 animate-gradient-bg" style={{backgroundSize: '200% 200%'}} />
      </div>

      <div className="container px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-headline tracking-tight text-foreground">
            Code Python Anywhere,
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                <TypingEffect text="Anytime with AI" />
              </span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent animate-pulse"></span>
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            Build, run, and debug Python code with intelligent AI assistance. No setup required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Start Coding Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Demo
              </Link>
            </Button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16"
        >
          <Card className="shadow-2xl shadow-primary/10 overflow-hidden bg-background/50 backdrop-blur-sm border-primary/20">
            <CardContent className="p-2 md:p-4">
              {editorImage && (
                <Image
                  src={editorImage.imageUrl}
                  alt={editorImage.description}
                  width={1200}
                  height={800}
                  data-ai-hint={editorImage.imageHint}
                  className="rounded-md w-full"
                  priority
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
