"use client"

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FEATURES } from '@/lib/constants'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
}

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-headline tracking-tight">
            Why Choose Our Platform?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Everything you need for a productive Python development workflow, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="h-full text-center transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-2 bg-card/50">
                <CardHeader className="p-8">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold font-headline">{feature.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
