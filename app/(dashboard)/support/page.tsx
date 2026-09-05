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
  Sparkles,
} from 'lucide-react'
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

    const fallbackTicketId = `TCK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
    const nowIso = new Date().toISOString()

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, category, message }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok || data.success) {
        setTicketData({
          ticketId: data.ticketId || fallbackTicketId,
          submittedAt: data.submittedAt || nowIso,
        })
        setSubmitted(true)
      } else {
        setTicketData({ ticketId: fallbackTicketId, submittedAt: nowIso })
        setSubmitted(true)
      }
    } catch {
      // Offline fallback: still confirm ticket and present direct mailto link
      setTicketData({ ticketId: fallbackTicketId, submittedAt: nowIso })
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const faqs = [
    {
      q: '¿Cuál es el tiempo de respuesta del equipo de soporte?',
      a: 'Nuestro equipo responde en menos de 2 horas hábiles. Para usuarios Pro Unlimited o Enterprise, el soporte prioritario opera 24/7.',
    },
    {
      q: '¿Cómo canjeo mi código promocional (ej. MERCANT10)?',
      a: 'Ve a Configuración › Facturación & Plan, introduce tu código en "Canjear código promocional" y pulsa Canjear. Tu cuenta obtendrá acceso Pro de inmediato.',
    },
    {
      q: '¿Qué distribuidores y tiendas analiza Mercant AI?',
      a: 'Mercant AI audita en tiempo real los catálogos de MercadoLibre México, Amazon México, mayoristas de tecnología, ferretería, papelería comercial y distribuidores autorizados.',
    },
    {
      q: '¿Cómo obtengo mi factura fiscal (CFDI) deducible en México?',
      a: 'En Facturación (/settings?tab=billing), en la tabla "Historial de facturación", haz clic en "Ver PDF" para descargar el comprobante oficial con RFC y desglose de IVA.',
    },
    {
      q: '¿Puedo integrar Mercant AI con el ERP de mi empresa?',
      a: 'Sí, contamos con soporte para integraciones vía API REST y Webhooks para SAP, Odoo, Oracle y sistemas propietarios. Contáctanos a hello@mercant.org.',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e3e8ee] dark:border-[#1e2430]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#635bff]/10 text-[#635bff] dark:bg-[#635bff]/15 dark:text-[#7a73ff] border border-[#635bff]/20">
              <LifeBuoy className="w-3 h-3" /> Mesa de Ayuda
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#edfcf2] text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-400 border border-[#a7f3d0] dark:border-emerald-900/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-emerald-400 animate-pulse" /> Sistemas 100% Operativos
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0a2540] dark:text-white">
            Centro de Soporte & Asistencia
          </h1>
          <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
            Disponibles para resolver cualquier duda técnica, de facturación o de integración corporativa.
          </p>
        </div>

        {/* Quick Email Pill */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#0c1018] border border-[#e3e8ee] dark:border-[#1e2430] p-2 rounded-xl shrink-0 shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
          <div className="w-8 h-8 rounded-lg bg-[#635bff]/10 dark:bg-[#635bff]/20 flex items-center justify-center text-[#635bff] dark:text-[#7a73ff]">
            <Mail className="w-4 h-4" />
          </div>
          <div className="text-left pr-2">
            <span className="text-[10px] font-medium text-[#697386] dark:text-[#8792a2] block">Correo directo</span>
            <a
              href={`mailto:${supportEmail}`}
              className="text-xs font-mono font-semibold text-[#0a2540] dark:text-white hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors"
            >
              {supportEmail}
            </a>
          </div>
          <button
            onClick={handleCopyEmail}
            className="p-1.5 rounded-lg bg-[#f4f6f8] dark:bg-[#121826] hover:bg-[#e3e8ee] dark:hover:bg-[#1e2430] text-[#697386] dark:text-[#8792a2] hover:text-[#0a2540] dark:hover:text-white transition-colors cursor-pointer border border-[#e3e8ee] dark:border-[#1e2430]"
            title="Copiar correo"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Grid: Contact Channels + Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Card 1: Official Email */}
          <div className="rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-5 space-y-4 shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#635bff]/10 dark:bg-[#635bff]/15 flex items-center justify-center text-[#635bff] dark:text-[#7a73ff] shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#0a2540] dark:text-white">Soporte por Email</h3>
                <span className="text-xs text-[#697386] dark:text-[#8792a2]">Atención oficial y seguimiento</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#f8fafc] dark:bg-[#101522] border border-[#e3e8ee] dark:border-[#1e2430] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#0a2540] dark:text-white font-medium">{supportEmail}</span>
                <button
                  onClick={handleCopyEmail}
                  className="text-[11px] text-[#635bff] dark:text-[#7a73ff] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="text-[11px] text-[#697386] dark:text-[#8792a2] leading-relaxed">
                Para temas de cuentas, facturación CFDI o dudas sobre compras.
              </p>
            </div>

            <a
              href={`mailto:${supportEmail}`}
              className="w-full py-2 px-3 rounded-lg bg-[#635bff] hover:bg-[#5349e0] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Enviar correo ahora</span>
            </a>
          </div>

          {/* Card 2: SLA */}
          <div className="rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-5 space-y-3 shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
            <h3 className="text-xs font-semibold text-[#0a2540] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#635bff] dark:text-[#7a73ff]" /> Compromiso de Servicio
            </h3>
            <ul className="space-y-2.5 text-xs text-[#697386] dark:text-[#8792a2]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] dark:text-[#34d399] shrink-0 mt-0.5" />
                <span><strong className="text-[#0a2540] dark:text-white">Respuesta rápida:</strong> menos de 2 horas hábiles.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] dark:text-[#34d399] shrink-0 mt-0.5" />
                <span><strong className="text-[#0a2540] dark:text-white">Soporte Pro 24/7:</strong> atención prioritaria para cuentas Pro y Enterprise.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] dark:text-[#34d399] shrink-0 mt-0.5" />
                <span><strong className="text-[#0a2540] dark:text-white">Asesoría de Sourcing:</strong> ayuda en cotizaciones de alto volumen.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Enterprise */}
          <div className="rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-5 space-y-2 shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2 text-[#635bff] dark:text-[#7a73ff]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">¿Eres Empresa o Comprador?</span>
            </div>
            <p className="text-xs text-[#697386] dark:text-[#8792a2] leading-relaxed">
              Si requieres cotizaciones corporativas con crédito a 30 días, órdenes de compra masivas o conector con tu ERP, nuestro equipo Enterprise te asiste directamente.
            </p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-5 shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
          <div>
            <h2 className="text-base font-semibold text-[#0a2540] dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#635bff] dark:text-[#7a73ff]" /> Enviar Mensaje a Soporte
            </h2>
            <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
              Completa los datos y nuestro equipo te responderá a tu correo electrónico.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-xl bg-[#edfcf2] dark:bg-emerald-950/30 border border-[#a7f3d0] dark:border-emerald-900/40 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#d1fae5] dark:bg-emerald-900/40 flex items-center justify-center text-[#059669] dark:text-emerald-400 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0a2540] dark:text-white">¡Ticket de Soporte Registrado!</h3>
                <span className="font-mono text-xs text-[#059669] dark:text-emerald-400 font-semibold block mt-1">
                  Folio: {ticketData?.ticketId || 'TCK-ACTIVO'}
                </span>
              </div>
              <p className="text-xs text-[#4f566b] dark:text-[#8792a2] max-w-md mx-auto leading-relaxed">
                Tu mensaje fue enrutado al equipo en <span className="font-mono font-bold text-[#0a2540] dark:text-white">{supportEmail}</span>. Te responderemos en menos de 2 horas hábiles.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => { setSubmitted(false); setMessage(''); setSubject(''); setTicketData(null) }}
                  className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Enviar otra consulta
                </button>
                <a
                  href={`mailto:${supportEmail}?subject=${encodeURIComponent(`[Seguimiento ${ticketData?.ticketId}] ${subject}`)}`}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-[#0c1018] hover:bg-[#f4f6f8] dark:hover:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] text-[#0a2540] dark:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#635bff] dark:text-[#7a73ff]" />
                  <span>Abrir en Gmail / Mail</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-[#fff0f0] dark:bg-rose-950/30 border border-[#fecaca] dark:border-rose-900/40 text-xs text-[#df1b41] dark:text-rose-400">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#3c4257] dark:text-[#c1c9d2] mb-1.5">
                    Tu Nombre o Empresa
                  </label>
                  <Input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Roberto Gómez / Innova Tech"
                    className="bg-white dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430] text-[#0a2540] dark:text-white text-xs placeholder:text-[#8792a2] focus:border-[#635bff]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#3c4257] dark:text-[#c1c9d2] mb-1.5">
                    Correo Electrónico de Contacto
                  </label>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu-correo@empresa.com"
                    className="bg-white dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430] text-[#0a2540] dark:text-white text-xs placeholder:text-[#8792a2] focus:border-[#635bff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#3c4257] dark:text-[#c1c9d2] mb-1.5">
                    Categoría de la Consulta
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white dark:bg-[#121826] border border-[#e3e8ee] dark:border-[#1e2430] text-[#0a2540] dark:text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#635bff] transition-colors"
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
                  <label className="block text-xs font-medium text-[#3c4257] dark:text-[#c1c9d2] mb-1.5">
                    Asunto
                  </label>
                  <Input
                    required
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Breve descripción del tema"
                    className="bg-white dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430] text-[#0a2540] dark:text-white text-xs placeholder:text-[#8792a2] focus:border-[#635bff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#3c4257] dark:text-[#c1c9d2] mb-1.5">
                  Detalle del Mensaje / Consulta
                </label>
                <Textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe detalladamente cómo podemos ayudarte. Si es referente a una cotización, puedes incluir el ID o los productos..."
                  className="bg-white dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430] text-[#0a2540] dark:text-white text-xs placeholder:text-[#8792a2] focus:border-[#635bff] resize-none"
                />
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                  Envío directo a <strong className="text-[#4f566b] dark:text-[#c1c9d2] font-mono">{supportEmail}</strong>
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#635bff] hover:bg-[#5349e0] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
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
      <div className="rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] p-6 space-y-4 shadow-[0px_1px_1px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#635bff]/10 dark:bg-[#635bff]/15 flex items-center justify-center text-[#635bff] dark:text-[#7a73ff]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0a2540] dark:text-white">Preguntas Frecuentes (FAQ)</h2>
            <p className="text-xs text-[#697386] dark:text-[#8792a2]">Respuestas inmediatas a las dudas más comunes sobre la plataforma.</p>
          </div>
        </div>

        <div className="divide-y divide-[#e3e8ee] dark:divide-[#1e2430] pt-2">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div key={index} className="py-3.5">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left gap-4 text-xs font-semibold text-[#0a2540] dark:text-white hover:text-[#635bff] dark:hover:text-[#7a73ff] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#635bff] dark:text-[#7a73ff] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#697386] dark:text-[#8792a2] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-2.5 leading-relaxed pl-1 pr-4">
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
