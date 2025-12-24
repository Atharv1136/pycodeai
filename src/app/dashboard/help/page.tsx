"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  BookOpen, 
  Video, 
  FileText, 
  Send,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function HelpPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'medium'
  })

  const handleSearch = () => {
    toast({
      title: "Search Results",
      description: `Searching for "${searchQuery}"...`,
    })
  }

  const handleSubmitSupport = () => {
    toast({
      title: "Support Ticket Created",
      description: "Your support request has been submitted. We'll get back to you within 24 hours.",
    })
    setSupportForm({ subject: '', category: '', message: '', priority: 'medium' })
  }

  const quickLinks = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of PyCode AI',
      icon: BookOpen,
      href: '#',
      badge: 'Popular'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step tutorials',
      icon: Video,
      href: '#',
      badge: 'New'
    },
    {
      title: 'API Documentation',
      description: 'Complete API reference',
      icon: FileText,
      href: '#',
      badge: null
    },
    {
      title: 'Community Forum',
      description: 'Connect with other developers',
      icon: MessageCircle,
      href: '#',
      badge: null
    }
  ]

  const faqs = [
    {
      question: 'How do I run Python code in PyCode AI?',
      answer: 'Simply write your Python code in the editor and click the "Run" button. Your code will execute in a secure sandbox environment and display the output in the console below.'
    },
    {
      question: 'Can I use external Python libraries?',
      answer: 'Yes! PyCode AI supports most popular Python libraries including pandas, numpy, matplotlib, requests, and many others. Some libraries may have limitations in the sandbox environment.'
    },
    {
      question: 'How does the AI assistant work?',
      answer: 'Our AI assistant analyzes your code context and provides intelligent suggestions, explanations, and debugging help. You can ask questions about your code or request help with specific programming tasks.'
    },
    {
      question: 'Is my code secure and private?',
      answer: 'Absolutely. All code is executed in isolated sandbox environments. Private projects are encrypted and only accessible by you. We never share your code with third parties.'
    },
    {
      question: 'Can I collaborate with others on projects?',
      answer: 'Yes! Team plan users can share projects and collaborate in real-time. You can invite team members, share code, and work together on the same project simultaneously.'
    },
    {
      question: 'What file formats can I work with?',
      answer: 'PyCode AI primarily supports Python files (.py), but you can also work with text files, configuration files, and data files like CSV and JSON.'
    }
  ]

  const supportCategories = [
    'Account & Billing',
    'Code Execution Issues',
    'AI Assistant Problems',
    'Project Management',
    'Collaboration Features',
    'Performance Issues',
    'Bug Report',
    'Feature Request',
    'Other'
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers, get help, and connect with our community
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help articles, tutorials, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{link.title}</h3>
                    {link.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {link.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {link.description}
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    Learn more <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Support Ticket */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={supportForm.category} onValueChange={(value) => setSupportForm({...supportForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={supportForm.priority} onValueChange={(value) => setSupportForm({...supportForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleSubmitSupport}
                disabled={!supportForm.subject || !supportForm.message}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Support Status */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Support Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">All systems operational</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Average response time: 2 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Scheduled maintenance: None</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>
            Explore more ways to get help and learn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Documentation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary flex items-center gap-1">
                    Getting Started <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary flex items-center gap-1">
                    API Reference <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary flex items-center gap-1">
                    Best Practices <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary flex items-center gap-1">
                    Discord Server <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary flex items-center gap-1">
                    GitHub Discussions <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary flex items-center gap-1">
                    Stack Overflow <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Learning</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary flex items-center gap-1">
                    Video Tutorials <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary flex items-center gap-1">
                    Code Examples <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary flex items-center gap-1">
                    Blog Posts <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
