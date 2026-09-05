'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PriorityModeSelector } from '@/components/procurement/PriorityModeSelector'
import { extractTextFromFile } from '@/lib/pdf/extractPdfText'
import type { ProductQuery, PriorityMode } from '@/types'
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  AlertCircle,
  Search,
  CheckCircle2,
  Layers,
  FileUp,
  FileText,
  UploadCloud,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react'

const DEFAULT_SAMPLE_TEXT = `Computadora de escritorio | Dell | OptiPlex 7020 | 50 | Intel Core i5, 16 GB RAM, SSD 512 GB, Windows 11 Pro
Monitor | Dell | P2425H | 50 | 24", Full HD, IPS, HDMI/DisplayPort
Teclado | Dell | KB216 | 50 | USB, distribución español
Mouse | Dell | MS116 | 50 | USB, óptico
Regulador | APC | BVX900 | 50 | 900 VA, protección contra sobretensiones
Servidor | Dell | PowerEdge T150 | 2 | Intel Xeon, 32 GB RAM, 1 TB SSD
Switch | TP-Link | TL-SG1048 | 2 | 48 puertos Gigabit Ethernet
Router | TP-Link | ER7206 | 1 | Gigabit, VPN, administración empresarial
Licencia de sistema operativo | Microsoft | Windows 11 Pro | 50 | Licencia por equipo
Suite ofimática | Microsoft | Microsoft 365 Business | 50 | Aplicaciones Office, almacenamiento en la nube
Instalación y configuración | — | — | 1 | Configuración de equipos, red y software
Cableado de red | — | Cat6 | 1 | Instalación y configuración para 50 equipos`

export default function NewProcurementPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [rawText, setRawText] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  // PDF and Document Upload state
  const [activeInputTab, setActiveInputTab] = useState<'pdf' | 'text'>('pdf')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string | null>(null)

  // Procurement metadata
  const [procurementName, setProcurementName] = useState('')
  const [budget, setBudget] = useState<string>('')
  const [currency, setCurrency] = useState('MXN')
  const [priorityMode, setPriorityMode] = useState<PriorityMode>('BALANCE')

  // Structured products
  const [items, setItems] = useState<ProductQuery[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const processFile = async (file: File) => {
    if (!file) return
    setParseError(null)
    setIsParsing(true)
    setUploadedFileName(file.name)
    setPdfStatusMessage(`Leyendo archivo "${file.name}" y extrayendo contenido...`)

    try {
      // 1. Extract text from PDF / Document in browser
      const extractedText = await extractTextFromFile(file)
      if (!extractedText || extractedText.trim().length < 5) {
        throw new Error('El documento no contiene texto legible. Asegúrate de que no sea una imagen escaneada.')
      }

      setRawText(extractedText)
      setPdfStatusMessage(`Analizando licitación con IA y extrayendo requerimientos y cantidades...`)

      // 2. Parse extracted text with AI
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al analizar el contenido de la licitación')

      if (data.items && data.items.length > 0) {
        setItems(data.items)
        if (data.suggestedName && !procurementName) {
          setProcurementName(data.suggestedName)
        }
        if (data.suggestedBudget && !budget) {
          setBudget(String(data.suggestedBudget))
        }
        setPdfStatusMessage(null)
        setStep(2)
      } else {
        setParseError('No se encontraron artículos o requerimientos en el documento. Revisa el archivo o introduce el texto manualmente.')
      }
    } catch (err: any) {
      setParseError(err.message || 'Error al procesar el archivo PDF')
    } finally {
      setIsParsing(false)
      setPdfStatusMessage(null)
    }
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const handleParseWithAI = async () => {
    if (!rawText.trim()) return
    setIsParsing(true)
    setParseError(null)

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar el texto')

      if (data.items && data.items.length > 0) {
        setItems(data.items)
        if (data.suggestedName && !procurementName) {
          setProcurementName(data.suggestedName)
        }
        if (data.suggestedBudget && !budget) {
          setBudget(String(data.suggestedBudget))
        }
        setStep(2)
      } else {
        setParseError('No se identificaron productos válidos. Revisa el formato de entrada.')
      }
    } catch (err: any) {
      setParseError(err.message || 'Error de conexión con el analizador.')
    } finally {
      setIsParsing(false)
    }
  }

  const handleItemChange = (index: number, field: keyof ProductQuery, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `manual-${Date.now()}`,
        name: 'Nuevo producto',
        quantity: 1,
        currency: 'MXN',
      },
    ])
  }

  const handleRemoveItem = (index: number) => {
    const updated = [...items]
    updated.splice(index, 1)
    setItems(updated)
  }

  const [searchSubmitError, setSearchSubmitError] = useState<string | null>(null)

  const handleStartSearch = async () => {
    if (items.length === 0) return
    setIsSubmitting(true)
    setSearchSubmitError(null)

    try {
      const parsedBudget = budget && !isNaN(parseFloat(budget)) ? parseFloat(budget) : null

      // 1. Create procurement in DB / API
      const createRes = await fetch('/api/procurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: procurementName.trim() || 'Compra sin nombre',
          budget: parsedBudget,
          currency,
          priorityMode,
          items,
          rawInput: rawText,
        }),
      })

      const createData = await createRes.json().catch(() => ({}))
      
      const procurementId = 
        createData?.procurement?.id || 
        createData?.procurementId || 
        createData?.id || 
        `proc-${Date.now()}`

      const targetUrl = `/procurements/${encodeURIComponent(procurementId)}?startSearch=true`

      try {
        router.push(targetUrl)
      } catch (routerErr) {
        // Fallback to direct location change if router.push has pattern mismatch in Safari/WebKit
        window.location.href = targetUrl
      }
    } catch (err: any) {
      console.error('Error starting search:', err)
      setSearchSubmitError(err.message || 'Error al iniciar la búsqueda. Intentando redirigir...')
      // Even if network failed completely, direct user to dashboard or fallback proc
      const fallbackUrl = `/procurements/proc-${Date.now()}?startSearch=true`
      setTimeout(() => {
        window.location.href = fallbackUrl
      }, 500)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-[#0a2540] dark:text-white">
          Nueva Búsqueda & Sourcing
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Introduce tu lista de requerimientos. La IA normalizará cada línea y buscará en toda la web y marketplaces.
        </p>
      </div>

      {/* Step Tabs */}
      {/* Stepper (Stripe Tab Bar) */}
      <div className="flex items-center gap-4 text-xs font-medium text-[#697386] dark:text-[#8792a2] border-b border-[#e3e8ee] dark:border-[#232a38] pb-2.5">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 pb-2 -mb-2.5 border-b-2 transition-colors cursor-pointer ${
            step === 1
              ? 'text-[#635bff] dark:text-[#7a73ff] border-[#635bff] dark:border-[#7a73ff] font-semibold'
              : 'border-transparent hover:text-[#0a2540] dark:hover:text-white'
          }`}
        >
          <span className="w-4 h-4 rounded bg-[#f4f6f8] dark:bg-[#1e2430] flex items-center justify-center text-[10px] font-bold">
            1
          </span>
          <span>Lista de requerimientos</span>
        </button>

        <span className="text-[#d8dee4] dark:text-[#2e3748]">/</span>

        <button
          type="button"
          disabled={items.length === 0}
          onClick={() => setStep(2)}
          className={`flex items-center gap-2 pb-2 -mb-2.5 border-b-2 transition-colors disabled:opacity-40 cursor-pointer ${
            step === 2
              ? 'text-[#635bff] dark:text-[#7a73ff] border-[#635bff] dark:border-[#7a73ff] font-semibold'
              : 'border-transparent hover:text-[#0a2540] dark:hover:text-white'
          }`}
        >
          <span className="w-4 h-4 rounded bg-[#f4f6f8] dark:bg-[#1e2430] flex items-center justify-center text-[10px] font-bold">
            2
          </span>
          <span>Revisión y cotización</span>
        </button>
      </div>

      {/* STEP 1: Paste text input & Budget Settings */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Metadata & Budget configuration card directly on Step 1 */}
          <div className="p-5 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] shadow-xs space-y-4">
            <div className="border-b border-[#f4f6f8] dark:border-[#1e2430] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white">
                1. Configuración de Presupuesto & Parámetros
              </h2>
              <p className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-0.5">
                Personaliza el presupuesto estimado o déjalo en blanco para cotizar sin límite.
              </p>
            </div>

            {/* Row 1: Name and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Nombre de la cotización
                </label>
                <Input
                  value={procurementName}
                  onChange={(e) => setProcurementName(e.target.value)}
                  placeholder="Ej. Equipamiento de Oficina Q3"
                  className="h-9 text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Tu presupuesto objetivo
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Ej. 75000 (opcional)"
                    className="h-9 text-xs tabular-nums bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="h-9 px-3 rounded-md border border-[#e3e8ee] dark:border-[#1e2430] bg-[#f8fafc] dark:bg-[#121826] text-xs font-semibold text-[#0a2540] dark:text-white cursor-pointer shrink-0"
                  >
                    <option value="MXN">MXN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                {/* Quick preset badges */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                  <span className="text-[#8792a2] text-[10px]">Rápidos:</span>
                  {[
                    { label: '$25k', val: '25000' },
                    { label: '$50k', val: '50000' },
                    { label: '$100k', val: '100000' },
                    { label: '$200k', val: '200000' },
                    { label: 'Sin límite', val: '' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBudget(preset.val)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                        budget === preset.val
                          ? 'bg-[#635bff] text-white border-[#635bff]'
                          : 'bg-[#f4f6f8] dark:bg-[#121826] text-[#697386] dark:text-[#8792a2] border-[#e3e8ee] dark:border-[#1e2430] hover:text-[#0a2540] dark:hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Full-width Priority Criteria */}
            <div className="pt-2 border-t border-[#f4f6f8] dark:border-[#1e2430]">
              <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                Criterio de prioridad
              </label>
              <PriorityModeSelector value={priorityMode} onChange={setPriorityMode} />
            </div>
          </div>

          <div className="p-5 rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white">
                    2. Entrada de Requerimientos & Licitación
                  </label>
                  <p className="text-xs text-[#697386] dark:text-[#8792a2] mt-0.5">
                    Puedes subir un archivo PDF de licitación oficial o pegar tu lista en texto libre.
                  </p>
                </div>

                {/* Sub-tabs for input mode */}
                <div className="inline-flex rounded-lg p-1 bg-[#f4f6f8] dark:bg-[#1a2130] border border-[#e3e8ee] dark:border-[#232a38] self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveInputTab('pdf')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      activeInputTab === 'pdf'
                        ? 'bg-white dark:bg-[#0c1018] text-[#635bff] dark:text-[#7a73ff] shadow-xs'
                        : 'text-[#697386] hover:text-[#0a2540] dark:hover:text-white'
                    }`}
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Subir PDF / Archivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveInputTab('text')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      activeInputTab === 'text'
                        ? 'bg-white dark:bg-[#0c1018] text-[#635bff] dark:text-[#7a73ff] shadow-xs'
                        : 'text-[#697386] hover:text-[#0a2540] dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Pegar texto / Tabla</span>
                  </button>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.csv,.tsv,.json,.md,application/pdf,text/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* TAB 1: PDF & Document Upload Dropzone */}
              {activeInputTab === 'pdf' && (
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${
                      isDragging
                        ? 'border-[#635bff] bg-[#f0f5ff] dark:bg-[#635bff]/10'
                        : isParsing
                        ? 'border-[#635bff]/40 bg-[#f8fafc] dark:bg-[#1a2130]/50 opacity-90'
                        : 'border-[#d8dee4] dark:border-[#2e3748] hover:border-[#635bff] dark:hover:border-[#7a73ff] bg-[#f8fafc]/50 dark:bg-[#121826]/50 hover:bg-[#f8fafc] dark:hover:bg-[#121826]'
                    }`}
                  >
                    {isParsing ? (
                      <div className="space-y-3 py-4">
                        <div className="w-12 h-12 mx-auto rounded-full bg-[#f0f5ff] dark:bg-[#635bff]/20 flex items-center justify-center text-[#635bff] animate-pulse">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#0a2540] dark:text-white">
                            {pdfStatusMessage || 'Extrayendo datos de la licitación con IA...'}
                          </p>
                          <p className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                            Esto tomará solo unos segundos. Identificando marcas, modelos, cantidades y fichas técnicas.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-[#f0f5ff] dark:bg-[#1e2430] group-hover:bg-[#e0eaff] dark:group-hover:bg-[#635bff]/20 flex items-center justify-center text-[#635bff] dark:text-[#7a73ff] transition-colors">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0a2540] dark:text-white">
                            Arrastra y suelta tu archivo PDF de licitación o pliego petitorio
                          </p>
                          <p className="text-[11px] text-[#697386] dark:text-[#8792a2] mt-0.5">
                            Soporta documentos PDF oficiales, bases de concurso, anexos técnicos, TXT y CSV
                          </p>
                        </div>
                        <div className="pt-1">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="pointer-events-none text-xs gap-1.5 font-semibold"
                          >
                            <FileUp className="w-3.5 h-3.5 text-[#635bff]" />
                            <span>Seleccionar archivo desde tu equipo</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadedFileName && (
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-[#f4f6f8] dark:bg-[#1a2130] border border-[#e3e8ee] dark:border-[#232a38] text-xs">
                      <div className="flex items-center gap-2 text-[#0a2540] dark:text-white font-medium">
                        <FileText className="w-4 h-4 text-[#635bff]" />
                        <span className="truncate max-w-[280px] sm:max-w-md">{uploadedFileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                        className="text-[11px] text-[#635bff] dark:text-[#7a73ff] font-semibold hover:underline cursor-pointer"
                      >
                        Cambiar archivo
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Freeform / Table Text Input */}
              {activeInputTab === 'text' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#697386] dark:text-[#8792a2]">
                      Introduce líneas con cantidades, marcas o descripciones:
                    </span>
                    {rawText ? (
                      <button
                        type="button"
                        onClick={() => setRawText('')}
                        className="text-[11px] font-semibold text-[#697386] hover:text-[#df1b41] dark:hover:text-[#ff6b6b] transition-colors cursor-pointer"
                      >
                        Limpiar texto
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRawText(DEFAULT_SAMPLE_TEXT)}
                        className="text-[11px] font-semibold text-[#635bff] dark:text-[#7a73ff] hover:underline cursor-pointer"
                      >
                        Cargar ejemplo
                      </button>
                    )}
                  </div>
                  <Textarea
                    rows={7}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Ej:&#10;50 laptops Lenovo ThinkPad E14&#10;100 x Logitech MX Master 3S&#10;200 sillas ergonómicas negras&#10;30 monitores 24&quot;"
                    className="font-mono text-xs leading-relaxed p-3 bg-[#f8fafc] dark:bg-[#1a2130] border-[#e3e8ee] dark:border-[#232a38] rounded-md focus:border-[#635bff]"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                      Procesamiento instantáneo con catálogo mexicano e internacional
                    </span>
                    <Button
                      type="button"
                      onClick={handleParseWithAI}
                      isLoading={isParsing}
                      disabled={!rawText.trim()}
                      className="gap-2 text-xs font-semibold"
                    >
                      <span>Procesar y estructurar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {parseError && (
              <div className="p-2.5 rounded-md bg-[#fff1f2] border border-[#fecdd3] dark:bg-[#881337]/20 dark:border-[#be123c]/40 text-[#df1b41] text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Review structured items & settings */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Metadata & Budget config */}
          <div className="p-5 rounded-xl border border-[#e3e8ee] dark:border-[#1e2430] bg-white dark:bg-[#0c1018] shadow-xs space-y-4">
            <div className="border-b border-[#f4f6f8] dark:border-[#1e2430] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-white">
                1. Parámetros de la Cotización
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Nombre de la cotización
                </label>
                <Input
                  value={procurementName}
                  onChange={(e) => setProcurementName(e.target.value)}
                  placeholder="Ej. Equipamiento de Oficina Q3"
                  className="h-9 text-xs bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                  Presupuesto asignado
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Ej. 150000"
                    className="h-9 text-xs tabular-nums bg-[#f8fafc] dark:bg-[#121826] border-[#e3e8ee] dark:border-[#1e2430]"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="h-9 px-3 rounded-md border border-[#e3e8ee] dark:border-[#1e2430] bg-[#f8fafc] dark:bg-[#121826] text-xs font-semibold text-[#0a2540] dark:text-white cursor-pointer shrink-0"
                  >
                    <option value="MXN">MXN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#f4f6f8] dark:border-[#1e2430]">
              <label className="block text-xs font-semibold text-[#0a2540] dark:text-white mb-1.5">
                Prioridad de cotización
              </label>
              <PriorityModeSelector value={priorityMode} onChange={setPriorityMode} />
            </div>
          </div>

          {/* Structured items editor */}
          <div className="rounded-lg border border-[#e3e8ee] dark:border-[#232a38] bg-white dark:bg-[#151a24] shadow-[0px_1px_1px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-3.5 border-b border-[#f4f6f8] dark:border-[#1e2430] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a2540] dark:text-[#0a2540] dark:text-white">
                  Artículos identificados ({items.length})
                </h3>
                <p className="text-[11px] text-[#697386] dark:text-[#8792a2]">
                  Verifica especificaciones antes de lanzar la cotización web.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddItem}
                className="gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar artículo
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] dark:bg-[#1a2130] text-[#697386] dark:text-[#8792a2] font-semibold text-[11px] border-b border-[#e3e8ee] dark:border-[#232a38]">
                  <tr>
                    <th className="py-2.5 px-3.5">Producto</th>
                    <th className="py-2.5 px-2.5">Marca</th>
                    <th className="py-2.5 px-2.5">Modelo / SKU</th>
                    <th className="py-2.5 px-2.5 w-24 text-center">Cantidad</th>
                    <th className="py-2.5 px-2.5">Especificaciones</th>
                    <th className="py-2.5 px-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3e8ee] dark:divide-[#232a38]">
                  {items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-[#f8fafc] dark:hover:bg-[#1a2130]/60">
                      <td className="py-2 px-3.5">
                        <Input
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          className="h-7 text-xs font-medium bg-[#f8fafc] dark:bg-[#1a2130] border-[#e3e8ee] dark:border-[#232a38]"
                        />
                      </td>
                      <td className="py-2 px-2.5">
                        <Input
                          value={item.brand || ''}
                          onChange={(e) => handleItemChange(idx, 'brand', e.target.value)}
                          placeholder="Opcional"
                          className="h-7 text-xs bg-[#f8fafc] dark:bg-[#1a2130] border-[#e3e8ee] dark:border-[#232a38]"
                        />
                      </td>
                      <td className="py-2 px-2.5">
                        <Input
                          value={item.model || ''}
                          onChange={(e) => handleItemChange(idx, 'model', e.target.value)}
                          placeholder="Opcional"
                          className="h-7 text-xs bg-[#f8fafc] dark:bg-[#1a2130] border-[#e3e8ee] dark:border-[#232a38]"
                        />
                      </td>
                      <td className="py-2 px-2.5">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                          }
                          className="h-7 text-xs text-center font-bold tabular-nums bg-[#f8fafc] dark:bg-[#1a2130] border-[#e3e8ee] dark:border-[#232a38]"
                        />
                      </td>
                      <td className="py-2 px-2.5">
                        <Input
                          value={item.specifications || ''}
                          onChange={(e) =>
                            handleItemChange(idx, 'specifications', e.target.value)
                          }
                          placeholder="Detalles técnicos"
                          className="h-7 text-xs bg-[#f8fafc] dark:bg-[#1a2130] border-[#e3e8ee] dark:border-[#232a38]"
                        />
                      </td>
                      <td className="py-2 px-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-[#8792a2] hover:text-[#df1b41] rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {searchSubmitError && (
            <div className="p-2.5 rounded-md bg-[#fff1f2] border border-[#fecdd3] dark:bg-[#881337]/20 dark:border-[#be123c]/40 text-[#df1b41] text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{searchSubmitError}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e3e8ee] dark:border-[#232a38]">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setStep(1)}
            >
              Volver a editar texto
            </Button>

            <Button
              variant="primary"
              type="button"
              onClick={handleStartSearch}
              isLoading={isSubmitting}
              className="gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cotizar en distribuidores</span>
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}
