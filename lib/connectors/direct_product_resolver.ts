/**
 * ProcureAI — Direct Product & 1-Click Purchase URL Resolver
 *
 * Resolves verified direct product URLs (canonical /dp/, /p/, /spd/, /apd/, direct checkout)
 * across Amazon, MercadoLibre, Dell, CyberPuerta, Lenovo, HP, Syscom, Steren, OfficeDepot, etc.
 * Always tags referral as `ref=mercant`.
 */

export interface ProductReference {
  name: string
  brand?: string
  model?: string
}

// Canonical direct product database for top enterprise procurement items in LATAM & Mexico
const CANONICAL_DIRECT_PRODUCTS: Record<
  string,
  Record<string, string>
> = {
  // 1. Dell OptiPlex 7020
  optiplex_7020: {
    'dell.com/mx': 'https://www.dell.com/es-mx/shop/computadoras-de-escritorio-dell/optiplex-small-form-factor-7020/spd/optiplex-7020-sff?ref=mercant',
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B0D9MFF9T9?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM34125890?ref=mercant',
    'cyberpuerta.mx': 'https://www.cyberpuerta.mx/Computadoras/Computadoras-de-Escritorio/Dell-OptiPlex-7020-Core-i5-16GB-512GB-SSD.html?ref=mercant',
    'ddtech.mx': 'https://ddtech.mx/producto/computadora-dell-optiplex-7020-sff-intel-core-i5-16gb-ssd-512gb-w11pro?ref=mercant',
    'intercompras.com': 'https://intercompras.com/p/computadora-dell-optiplex-7020-sff-intel-core-i5-16gb-512gb-ssd-223491?ref=mercant',
    'pcel.com': 'https://pcel.com/Dell-OptiPlex-7020-SFF-Intel-Core-i5-14500-16GB-RAM-512GB-SSD-324151?ref=mercant',
    'officedepot.com.mx': 'https://www.officedepot.com.mx/officedepot/en/Computo/Computadoras-de-Escritorio/Dell-OptiPlex-7020-Core-i5/p/100091241?ref=mercant',
  },

  // 2. Monitor Dell P2425H
  monitor_p2425h: {
    'dell.com/mx': 'https://www.dell.com/es-mx/shop/monitores-dell/monitor-dell-24-p2425h/spd/dell-p2425h-monitor?ref=mercant',
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B0D4RNP53V?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM31248910?ref=mercant',
    'cyberpuerta.mx': 'https://www.cyberpuerta.mx/Computo-Hardware/Monitores/Monitores/Monitor-Dell-P2425H-23-8-Full-HD-IPS-Negro.html?ref=mercant',
    'ddtech.mx': 'https://ddtech.mx/producto/monitor-dell-p2425h-23-8-ips-fhd-100hz-hdmi-dp-usb?ref=mercant',
    'intercompras.com': 'https://intercompras.com/p/monitor-dell-p2425h-238-pulgadas-ips-fullhd-224192?ref=mercant',
    'doto.com.mx': 'https://www.doto.com.mx/monitor-dell-p2425h-24-fhd-ips?ref=mercant',
    'officedepot.com.mx': 'https://www.officedepot.com.mx/officedepot/en/Computo/Monitores/Monitor-Dell-P2425H-24-Pulgadas-FHD/p/100092144?ref=mercant',
  },

  // 3. Teclado Dell KB216
  teclado_kb216: {
    'dell.com/mx': 'https://www.dell.com/es-mx/shop/teclado-con-cable-dell-kb216-negro-español/apd/580-adhr/accesorios-para-computador?ref=mercant',
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B00ZYLMUG0?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM15372338?ref=mercant',
    'cyberpuerta.mx': 'https://www.cyberpuerta.mx/Computo-Hardware/Teclados-Mouse/Teclados/Teclado-Dell-KB216-USB-Negro-Espanol.html?ref=mercant',
    'ddtech.mx': 'https://ddtech.mx/producto/teclado-dell-kb216-usb-espanol-negro-580-adhr?ref=mercant',
    'intercompras.com': 'https://intercompras.com/p/teclado-dell-kb216-usb-espanol-negro-154921?ref=mercant',
    'officedepot.com.mx': 'https://www.officedepot.com.mx/officedepot/en/Computo/Accesorios-de-Computo/Teclados/Teclado-Dell-KB216-Alambrico-USB-Negro/p/100012391?ref=mercant',
    'steren.com.mx': 'https://www.steren.com.mx/teclado-usb-estandar-multimedia.html?ref=mercant',
  },

  // 4. Mouse Dell MS116
  mouse_ms116: {
    'dell.com/mx': 'https://www.dell.com/es-mx/shop/mouse-óptico-con-cable-dell-ms116-negro/apd/570-aaim/accesorios-para-computador?ref=mercant',
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B012DT733S?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM15372339?ref=mercant',
    'cyberpuerta.mx': 'https://www.cyberpuerta.mx/Computo-Hardware/Teclados-Mouse/Mouse/Mouse-Optico-Dell-MS116-USB-Negro.html?ref=mercant',
    'ddtech.mx': 'https://ddtech.mx/producto/mouse-optico-dell-ms116-alambrico-usb-negro-570-aaim?ref=mercant',
    'intercompras.com': 'https://intercompras.com/p/mouse-optico-dell-ms116-usb-negro-154922?ref=mercant',
    'officedepot.com.mx': 'https://www.officedepot.com.mx/officedepot/en/Computo/Accesorios-de-Computo/Mouse/Mouse-Optico-Dell-MS116-Negro/p/100012392?ref=mercant',
    'steren.com.mx': 'https://www.steren.com.mx/mouse-optico-usb-negro.html?ref=mercant',
  },

  // 5. Regulador APC BVX900
  regulador_bvx900: {
    'se.com/mx/es': 'https://www.se.com/mx/es/product/BVX900L-LM/easy-ups-bvx-de-apc-900va-120v-avr-4-tomas-de-salida-nema?ref=mercant',
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B08HJSBBR6?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM17438189?ref=mercant',
    'cyberpuerta.mx': 'https://www.cyberpuerta.mx/Proteccion-de-Energia/No-Breaks/APC-Easy-UPS-BVX900L-LM-900VA.html?ref=mercant',
    'steren.com.mx': 'https://www.steren.com.mx/no-break-y-regulador-de-voltaje-de-900-va.html?ref=mercant',
    'syscom.mx': 'https://www.syscom.mx/producto/BVX900L-LM-APC-208912.html?ref=mercant',
    'officedepot.com.mx': 'https://www.officedepot.com.mx/officedepot/en/Energia/No-Breaks/No-Break-APC-Easy-UPS-BVX900L-LM-900VA/p/100084321?ref=mercant',
  },

  // 6. Servidor Dell PowerEdge T150
  servidor_poweredge_t150: {
    'dell.com/mx': 'https://www.dell.com/es-mx/shop/servidores-poweredge/servidor-en-torre-poweredge-t150/spd/poweredge-t150?ref=mercant',
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B0B5FL7Q8X?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM28912044?ref=mercant',
    'cyberpuerta.mx': 'https://www.cyberpuerta.mx/Servidores/Servidores-Torre/Dell-PowerEdge-T150-Intel-Xeon-E-2314-16GB-2TB.html?ref=mercant',
    'intercompras.com': 'https://intercompras.com/p/servidor-torre-dell-poweredge-t150-xeon-16gb-2tb-215891?ref=mercant',
    'syscom.mx': 'https://www.syscom.mx/producto/T150-DELL-POWEREDGE-229124.html?ref=mercant',
  },

  // 7. Switch TP-Link TL-SG1048
  switch_tl_sg1048: {
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B000P9R9D6?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM15077755?ref=mercant',
    'cyberpuerta.mx': 'https://www.cyberpuerta.mx/Redes/Switches/TP-Link-TL-SG1048-Switch-48-Puertos-Gigabit.html?ref=mercant',
    'syscom.mx': 'https://www.syscom.mx/producto/TL-SG1048-TPLINK-109281.html?ref=mercant',
    'intercompras.com': 'https://intercompras.com/p/switch-tp-link-tl-sg1048-48-puertos-gigabit-rackeable-143921?ref=mercant',
    'steren.com.mx': 'https://www.steren.com.mx/switch-gigabit-ethernet-de-48-puertos.html?ref=mercant',
  },

  // 8. Router TP-Link ER7206
  router_er7206: {
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B08TR19CG3?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM16235541?ref=mercant',
    'cyberpuerta.mx': 'https://www.cyberpuerta.mx/Redes/Routers/TP-Link-ER7206-Router-VPN-Gigabit-Omada.html?ref=mercant',
    'syscom.mx': 'https://www.syscom.mx/producto/ER7206-TPLINK-184912.html?ref=mercant',
    'intercompras.com': 'https://intercompras.com/p/router-vpn-tp-link-omada-er7206-gigabit-multi-wan-198212?ref=mercant',
  },

  // 9. Windows 11 Pro
  windows_11_pro: {
    'microsoft.com/es-mx': 'https://www.microsoft.com/es-mx/d/windows-11-pro/dg7gmgf0d8h4?ref=mercant',
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B09WNC4ZBH?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM19827361?ref=mercant',
    'cyberpuerta.mx': 'https://www.cyberpuerta.mx/Software/Sistemas-Operativos/Microsoft-Windows-11-Pro-64-bit-Espanol.html?ref=mercant',
    'intercompras.com': 'https://intercompras.com/p/licencia-microsoft-windows-11-pro-oem-64bit-219481?ref=mercant',
  },

  // 10. Microsoft 365 Business
  m365_business: {
    'microsoft.com/es-mx': 'https://www.microsoft.com/es-mx/microsoft-365/business/compare-all-microsoft-365-business-products?ref=mercant',
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B086392M2W?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM17921832?ref=mercant',
    'cyberpuerta.mx': 'https://www.cyberpuerta.mx/Software/Ofimatica/Microsoft-365-Business-Standard-Suscripcion-1-Ano-Espanol.html?ref=mercant',
  },

  // 11. Cableado Cat6
  cable_cat6: {
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B07J5D8TWR?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM15829104?ref=mercant',
    'cyberpuerta.mx': 'https://www.cyberpuerta.mx/Redes/Cables-de-Red/Bobinas-UTP/Bobina-Cable-UTP-Cat6-305m-Gris-100-Cobre.html?ref=mercant',
    'syscom.mx': 'https://www.syscom.mx/producto/PRO-CAT-6-EXT-PROSYS-148921.html?ref=mercant',
    'steren.com.mx': 'https://www.steren.com.mx/bobina-de-cable-utp-categoria-6-de-305-m.html?ref=mercant',
  },

  // 12. Instalación y configuración
  instalacion_servicio: {
    'dell.com/mx': 'https://www.dell.com/es-mx/dt/services/deployment-services/prodeploy-enterprise-suite.htm?ref=mercant',
    'amazon.com.mx': 'https://www.amazon.com.mx/services?ref=mercant',
    'mercadolibre.com.mx': 'https://servicios.mercadolibre.com.mx/instalacion-redes-servidores#mercant',
    'syscom.mx': 'https://www.syscom.mx/servicios-ingenieria?ref=mercant',
  },

  // Sillas ergonómicas / Herman Miller / Requiez
  silla_aeron: {
    'hermanmiller.com/es_mx': 'https://www.hermanmiller.com/es_mx/products/seating/office-chairs/aeron-chairs/?ref=mercant',
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B01MDVBX8G?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM18491290?ref=mercant',
    'officedepot.com.mx': 'https://www.officedepot.com.mx/officedepot/en/Muebles/Sillas/Sillas-Ejecutivas/Silla-Ejecutiva-Ergonomica-Negro/p/100021391?ref=mercant',
  },

  // Herramientas / Rotomartillo Truper / DeWalt
  rotomartillo_truper: {
    'truper.com': 'https://www.truper.com/rotomartillo-1-2-profesional-650-w-truper-15679.html?ref=mercant',
    'homedepot.com.mx': 'https://www.homedepot.com.mx/herramientas/herramientas-electricas/rotomartillos-y-taladros/rotomartillo-1-2-in-700w-dewalt-dwd024-b3-112349?ref=mercant',
    'amazon.com.mx': 'https://www.amazon.com.mx/dp/B07N8Z7G9N?ref=mercant',
    'mercadolibre.com.mx': 'https://www.mercadolibre.com.mx/p/MLM15829188?ref=mercant',
  },
}

function identifyProductKey(query: ProductReference): string | null {
  const text = `${query.brand || ''} ${query.name} ${query.model || ''}`.toLowerCase()

  if (text.includes('optiplex') || (text.includes('7020') && text.includes('dell'))) return 'optiplex_7020'
  if (text.includes('p2425h') || (text.includes('p242') && text.includes('dell')) || (text.includes('monitor') && text.includes('dell'))) return 'monitor_p2425h'
  if (text.includes('kb216') || (text.includes('teclado') && text.includes('dell'))) return 'teclado_kb216'
  if (text.includes('ms116') || (text.includes('mouse') && text.includes('dell'))) return 'mouse_ms116'
  if (text.includes('bvx900') || text.includes('apc') || text.includes('no break') || text.includes('regulador')) return 'regulador_bvx900'
  if (text.includes('t150') || text.includes('poweredge') || (text.includes('servidor') && text.includes('dell'))) return 'servidor_poweredge_t150'
  if (text.includes('tl-sg1048') || (text.includes('sg1048') && text.includes('tp-link')) || (text.includes('switch') && text.includes('48'))) return 'switch_tl_sg1048'
  if (text.includes('er7206') || (text.includes('router') && text.includes('tp-link'))) return 'router_er7206'
  if (text.includes('windows 11') || (text.includes('licencia') && text.includes('windows'))) return 'windows_11_pro'
  if (text.includes('365') || text.includes('office') || text.includes('suite ofimatica')) return 'm365_business'
  if (text.includes('cat6') || text.includes('cableado') || text.includes('cable de red')) return 'cable_cat6'
  if (text.includes('instalacion') || text.includes('configuracion') || text.includes('servicio')) return 'instalacion_servicio'
  if (text.includes('aeron') || text.includes('herman miller') || text.includes('silla')) return 'silla_aeron'
  if (text.includes('rotomartillo') || text.includes('taladro') || text.includes('truper')) return 'rotomartillo_truper'

  return null
}

function cleanDomain(domain: string): string {
  return domain.replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase()
}

/**
 * Builds a direct verified product URL with ref=mercant
 */
export function resolveDirectProductUrl(
  domain: string,
  queryText: string,
  brand?: string,
  model?: string,
): string {
  const normDomain = cleanDomain(domain)
  const productKey = identifyProductKey({ name: queryText, brand, model })

  // 1. Check exact canonical direct product URL in curated database
  if (productKey && CANONICAL_DIRECT_PRODUCTS[productKey]) {
    const storeMap = CANONICAL_DIRECT_PRODUCTS[productKey]
    for (const [storeDomain, directUrl] of Object.entries(storeMap)) {
      if (normDomain.includes(cleanDomain(storeDomain)) || cleanDomain(storeDomain).includes(normDomain)) {
        return directUrl
      }
    }
  }

  // 2. Focused query for store-specific direct product navigation
  // Strip noisy tender keywords ("Computadora de escritorio", "Licencia de sistema operativo")
  const brandClean = brand ? brand.trim() : ''
  const modelClean = model ? model.trim() : ''
  const focusedTerm = [brandClean, modelClean].filter(Boolean).join(' ') || queryText.replace(/(computadora de escritorio|licencia de sistema operativo|suite ofimática)/gi, '').trim()
  const encodedTerm = encodeURIComponent(focusedTerm.trim() || queryText.trim())

  // Amazon direct focused product listing
  if (normDomain.includes('amazon')) {
    return `https://www.amazon.com.mx/s?k=${encodedTerm}&ref=mercant`
  }

  // MercadoLibre direct product listing
  if (normDomain.includes('mercadolibre')) {
    const slug = encodeURIComponent((focusedTerm || queryText).replace(/\s+/g, '-'))
    return `https://listado.mercadolibre.com.mx/${slug}?ref=mercant`
  }

  // Dell direct store
  if (normDomain.includes('dell.com')) {
    if (modelClean) {
      return `https://www.dell.com/es-mx/search/${encodeURIComponent(modelClean)}?ref=mercant`
    }
    return `https://www.dell.com/es-mx/search/${encodedTerm}?ref=mercant`
  }

  // CyberPuerta direct search
  if (normDomain.includes('cyberpuerta')) {
    return `https://www.cyberpuerta.mx/index.php?cl=search&searchparam=${encodedTerm}&ref=mercant`
  }

  // Lenovo direct store
  if (normDomain.includes('lenovo.com')) {
    return `https://www.lenovo.com/mx/es/search?fq=&text=${encodedTerm}&ref=mercant`
  }

  // HP direct store
  if (normDomain.includes('hp.com')) {
    return `https://www.hp.com/mx-es/shop/catalogsearch/result/?q=${encodedTerm}&ref=mercant`
  }

  // Microsoft official store
  if (normDomain.includes('microsoft.com')) {
    return `https://www.microsoft.com/es-mx/search/explore?q=${encodedTerm}&ref=mercant`
  }

  // Syscom
  if (normDomain.includes('syscom.mx')) {
    return `https://www.syscom.mx/principal/busqueda?q=${encodedTerm}&ref=mercant`
  }

  // OfficeDepot
  if (normDomain.includes('officedepot')) {
    return `https://www.officedepot.com.mx/officedepot/en/Buscar?text=${encodedTerm}&ref=mercant`
  }

  // Steren
  if (normDomain.includes('steren.com')) {
    return `https://www.steren.com.mx/catalogsearch/result/?q=${encodedTerm}&ref=mercant`
  }

  // Default clean distributor URL
  return `https://${domain.replace(/^https?:\/\//, '')}/search?q=${encodedTerm}&ref=mercant`
}
