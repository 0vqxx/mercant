'use client'

import React, { useState } from 'react'
import {
  Mail,
  MessageSquare,
  LifeBuoy,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function SupportPage() {
  const supportEmail = 'hello@mercant.org'
  const [copied, setCopied] = useState(false)
  
  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('billing')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketData, setTicketData] = useState<{ ticketId: string; submittedAt: string } | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          category,
          message,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || 'Error al enviar mensaje.')
      } else {
        setTicketData({
          ticketId: data.ticketId,
          submittedAt: data.submittedAt,
        })
        setSubmitted(true)
      }
    } catch {
      setFormError('Error de conexión con el servidor de soporte.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const faqs = [
    {
      q: '¿Cuál es el tiempo de respuesta del equipo de soporte?',
      a: 'Nuestro equipo de soporte humano responde en menos de 2 horas hábiles. Para usuarios con suscripción Plan Pro Unlimited o Enterprise, el canal de soporte prioritario opera 24/7.',
    },
    {
      q: '¿Cómo canjeo mi código promocional (ej. MERCANT10)?',
      a: 'Ve a Configuración > Facturación & Plan (/settings?tab=billing), introduce tu código en la casilla de "Canjear código promocional" y pulsa "Canjear". Tu cuenta obtendrá acceso Pro de inmediato.',
    },
    {
      q: '¿Qué distribuidores y tiendas analiza Mercant AI?',
      a: 'Mercant AI cuenta con un motor universal multi-canal que audita en tiempo real los catálogos verificados de MercadoLibre México, Amazon México, mayoristas de tecnología, ferretería, papelería comercial y distribuidores autorizados.',
    },
    {
      q: '¿Cómo obtengo mi factura fiscal (CFDI) deducible en México?',
      a: 'En la sección de Facturación (/settings?tab=billing), en la tabla "Historial de facturación", encontrarás cada uno de tus comprobantes. Haz clic en "Ver PDF" para visualizar e imprimir el recibo oficial con RFC y desglose de IVA (16%).',
    },
    {
      q: '¿Puedo integrar Mercant AI con el ERP de mi empresa?',
      a: 'Sí, contamos con soporte para integraciones personalizadas vía API REST y Webhooks para ERPs como SAP, Odoo, Oracle y sistemas propietarios. Contáctanos a hello@mercant.org para asistencia técnica.',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 pt-2 text-[#f4f4f5]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222429] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#7f56d9]/15 text-[#9e77ed] border border-[#7f56d9]/30">
              <LifeBuoy className="w-3 h-3" /> Mesa de Ayuda
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#052e16] text-[#4ade80] border border-[#14532d]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" /> Sistemas 100% Operativos
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Centro de Soporte & Asistencia
          </h1>
          <p className="text-xs text-[#94969c] mt-1">
            Estamos disponibles para resolver cualquier duda técnica, de facturación o de integración corporativa.
          </p>
        </div>

        {/* Quick Email Pill */}
        <div className="flex items-center gap-2 bg-[#121316] border border-[#222429] p-2 rounded-xl shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#7f56d9]/20 flex items-center justify-center text-[#9e77ed]">
            <Mail className="w-4 h-4" />
          </div>
          <div className="text-left pr-2">
            <span className="text-[10px] font-medium text-[#94969c] block">Correo directo</span>
            <a
              href={`mailto:${supportEmail}`}
              className="text-xs font-mono font-semibold text-white hover:text-[#9e77ed] transition-colors"
            >
              {supportEmail}
            </a>
          </div>
          <button
            onClick={handleCopyEmail}
            className="p-1.5 rounded-lg bg-[#18191c] hover:bg-[#222429] text-[#94969c] hover:text-white transition-colors cursor-pointer border border-[#2c2e33]"
            title="Copiar correo"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Grid: 2 Cards (Contact Channels + Direct Ticket Form) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Direct Channels & SLA Info */}
        <div className="space-y-4">
          {/* Card 1: Official Email */}
          <div className="rounded-2xl border border-[#222429] bg-[#121316] p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7f56d9]/20 flex items-center justify-center text-[#9e77ed] shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Soporte por Email</h3>
                <span className="text-xs text-[#94969c]">Atención oficial y seguimiento</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#18191c] border border-[#2c2e33] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white font-medium">{supportEmail}</span>
                <button
                  onClick={handleCopyEmail}
                  className="text-[11px] text-[#9e77ed] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="text-[11px] text-[#94969c] leading-relaxed">
                Escríbenos para temas de cuentas, facturación CFDI o dudas sobre compras.
              </p>
            </div>

            <a
              href={`mailto:${supportEmail}`}
              className="w-full py-2 px-3 rounded-xl bg-[#7f56d9] hover:bg-[#6941c6] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Enviar correo ahora</span>
            </a>
          </div>

          {/* Card 2: SLA & Guarantees */}
          <div className="rounded-2xl border border-[#222429] bg-[#121316] p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#9e77ed]" /> Compromiso de Servicio
            </h3>
            
            <ul className="space-y-2.5 text-xs text-[#94969c]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80] shrink-0 mt-0.5" />
                <span><strong className="text-white">Respuesta rápida:</strong> &lt; 2 horas en días hábiles.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80] shrink-0 mt-0.5" />
                <span><strong className="text-white">Soporte Pro 24/7:</strong> Atención prioritaria para cuentas Pro y Enterprise.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80] shrink-0 mt-0.5" />
                <span><strong className="text-white">Asesoría de Sourcing:</strong> Ayuda en cotizaciones complejas de alto volumen.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Enterprise Integration Desk */}
          <div className="rounded-2xl border border-[#222429] bg-[#121316] p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#9e77ed]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">¿Eres Empresa o Comprador?</span>
            </div>
            <p className="text-xs text-[#94969c] leading-relaxed">
              Si requieres cotizaciones corporativas con crédito a 30 días, órdenes de compra masivas o conector con tu ERP, nuestro equipo de Enterprise te asiste directamente.
            </p>
          </div>
        </div>

        {/* Right Column (2 cols wide): Interactive Contact Form */}
        <div className="md:col-span-2 rounded-2xl border border-[#222429] bg-[#121316] p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#9e77ed]" /> Enviar Mensaje a Soporte
            </h2>
            <p className="text-xs text-[#94969c] mt-0.5">
              Completa los datos a continuación y nuestro equipo te responderá a tu correo electrónico.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-[#052e16] border border-[#14532d] text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-[#14532d] flex items-center justify-center text-[#4ade80] mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¡Ticket de Soporte Registrado!</h3>
                <span className="font-mono text-xs text-[#4ade80] font-semibold block mt-1">
                  Folio de Seguimiento: {ticketData?.ticketId || 'TCK-2026-ACTIVO'}
                </span>
              </div>
              <p className="text-xs text-[#86efac] max-w-md mx-auto leading-relaxed">
                Tu mensaje ha sido enrutado directamente al equipo de atención en <span className="font-mono font-bold text-white">{supportEmail}</span>. Te responderemos al correo proporcionado en menos de 2 horas hábiles.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setMessage('')
                    setSubject('')
                    setTicketData(null)
                  }}
                  className="px-4 py-2 rounded-lg bg-[#166534] hover:bg-[#15803d] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Enviar otra consulta
                </button>
                <a
                  href={`mailto:${supportEmail}?subject=${encodeURIComponent(`[Seguimiento ${ticketData?.ticketId}] ${subject}`)}`}
                  className="px-4 py-2 rounded-lg bg-[#121316] hover:bg-[#18191c] border border-[#2c2e33] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#9e77ed]" />
                  <span>Abrir en Gmail / Mail</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-[#2a0f12] border border-[#521c22] text-xs text-[#f87171]">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white mb-1.5">
                    Tu Nombre o Empresa
                  </label>
                  <Input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Roberto Gómez / Innova Tech"
                    className="bg-[#18191c] border-[#2c2e33] text-white text-xs focus:border-[#7f56d9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white mb-1.5">
                    Correo Electrónico de Contacto
                  </label>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu-correo@empresa.com"
                    className="bg-[#18191c] border-[#2c2e33] text-white text-xs focus:border-[#7f56d9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white mb-1.5">
                    Categoría de la Consulta
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#18191c] border border-[#2c2e33] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#7f56d9]"
                  >
                    <option value="billing">Facturación & Plan Pro (CFDI / Pagos)</option>
                    <option value="quotes">Dudas sobre Cotizador IA & Proveedores</option>
                    <option value="integrations">Integraciones API & Conectores</option>
                    <option value="whatsapp">Notificaciones de WhatsApp</option>
                    <option value="bug">Reporte de Error o Bug Técnico</option>
                    <option value="other">Otro Asunto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white mb-1.5">
                    Asunto
                  </label>
                  <Input
                    required
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Breve descripción del tema"
                    className="bg-[#18191c] border-[#2c2e33] text-white text-xs focus:border-[#7f56d9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1.5">
                  Detalle del Mensaje / Consulta
                </label>
                <Textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe detalladamente cómo podemos ayudarte. Si es referente a una cotización, puedes incluir el ID o los productos..."
                  className="bg-[#18191c] border-[#2c2e33] text-white text-xs focus:border-[#7f56d9] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#667085]">
                  Envío directo a <strong className="text-[#94969c] font-mono">{supportEmail}</strong>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#7f56d9] hover:bg-[#6941c6] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Mensaje</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="rounded-2xl border border-[#222429] bg-[#121316] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#7f56d9]/20 flex items-center justify-center text-[#9e77ed]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Preguntas Frecuentes (FAQ)</h2>
            <p className="text-xs text-[#94969c]">Respuestas inmediatas a las dudas más comunes sobre la plataforma.</p>
          </div>
        </div>

        <div className="divide-y divide-[#1e2025] pt-2">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div key={index} className="py-3.5">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left gap-4 text-xs font-semibold text-white hover:text-[#9e77ed] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#9e77ed] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#667085] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-xs text-[#94969c] mt-2.5 leading-relaxed pl-1 pr-4 animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
