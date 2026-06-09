'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mail, MapPin, Clock, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

const subjects = [
  'General Inquiry',
  'Bug Report',
  'Feature Request',
  'Content Issue',
  'Account Problem',
  'Partnership',
  'Other',
]

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
}

export function ContactPageClient() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      const existing = JSON.parse(localStorage.getItem('akal_contact_submissions') || '[]')
      existing.push({ ...data, createdAt: Date.now() })
      localStorage.setItem('akal_contact_submissions', JSON.stringify(existing))
    } catch {
      // localStorage unavailable
    }

    toast({
      title: 'Message Saved!',
      description: 'Your message has been recorded. For a faster response, email us at akalloksewa@gmail.com directly.',
    })
    reset()
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <PageHeader
        title="Contact Us"
        subtitle="Have a question, suggestion, or issue? We would love to hear from you."
        centered
      />

      <div className="mt-12 grid md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <motion.div className="space-y-6" {...fadeUp}>
          <Card className="card-hover">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-ink-500/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-ink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Email</h3>
                <p className="text-sm text-muted-foreground mt-1">akalloksewa@gmail.com</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-ink-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-ink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Location</h3>
                <p className="text-sm text-muted-foreground mt-1">Kathmandu, Nepal</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-ink-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-ink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Response Time</h3>
                <p className="text-sm text-muted-foreground mt-1">Within 24-48 hours</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Form */}
        <motion.div className="md:col-span-2" {...fadeUp}>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" {...register('name')} />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select onValueChange={(v) => setValue('subject', v, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p className="text-xs text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help..."
                    rows={6}
                    {...register('message')}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto btn-press">
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
