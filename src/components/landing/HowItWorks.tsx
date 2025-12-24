"use client"

import { motion } from 'framer-motion'
import { HOW_IT_WORKS_STEPS } from '@/lib/constants'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

const stepVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: "easeOut"
    }
  })
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-headline tracking-tight">
            Get Started in 3 Simple Steps
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            From idea to execution in minutes.
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" aria-hidden="true"></div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <motion.div
                key={step.step}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={stepVariants}
              >
                <Card className="bg-background text-center shadow-lg">
                  <CardContent className="p-8">
                    <Badge variant="default" className="text-lg w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold mb-6">
                      {step.step}
                    </Badge>
                    <h3 className="text-xl font-bold font-headline mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
