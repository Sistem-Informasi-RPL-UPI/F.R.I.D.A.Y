/**
 * Zero-dependency browser XLSX parser (supports standard ZIP stored & DEFLATE entries)
 * Parses the first worksheet of an .xlsx file into a 2D array of strings (rows x cols),
 * properly preserving empty columns (e.g., blank Dosen 2 column H before column I).
 */

function colLettersToIndex(letters: string): number {
  let idx = 0
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64)
  }
  return idx - 1
}

async function inflateRaw(compressed: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("Browser tidak mendukung DecompressionStream untuk membaca .xlsx.")
  }
  const ds = new DecompressionStream("deflate-raw")
  const writer = ds.writable.getWriter()
  writer.write(compressed as BufferSource)
  writer.close()

  const chunks: Uint8Array[] = []
  const reader = ds.readable.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }
  const totalLen = chunks.reduce((sum, c) => sum + c.length, 0)
  const out = new Uint8Array(totalLen)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

async function unzipEntries(buffer: ArrayBuffer): Promise<Record<string, Uint8Array>> {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  const decoder = new TextDecoder("utf-8")

  // Locate End of Central Directory (EOCD) signature 0x06054b50
  let eocdOffset = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i
      break
    }
  }
  if (eocdOffset === -1) {
    throw new Error("File .xlsx tidak valid (ZIP header tidak ditemukan).")
  }

  const cdEntries = view.getUint16(eocdOffset + 10, true)
  let cdOffset = view.getUint32(eocdOffset + 16, true)

  const files: Record<string, Uint8Array> = {}

  for (let e = 0; e < cdEntries; e++) {
    if (view.getUint32(cdOffset, true) !== 0x02014b50) break
    const method = view.getUint16(cdOffset + 10, true)
    const compSize = view.getUint32(cdOffset + 20, true)
    const nameLen = view.getUint16(cdOffset + 28, true)
    const extraLen = view.getUint16(cdOffset + 30, true)
    const commentLen = view.getUint16(cdOffset + 32, true)
    const localHeaderOffset = view.getUint32(cdOffset + 42, true)

    const fileName = decoder.decode(bytes.subarray(cdOffset + 46, cdOffset + 46 + nameLen))
    cdOffset += 46 + nameLen + extraLen + commentLen

    // Only extract needed XML files
    if (
      fileName === "xl/sharedStrings.xml" ||
      fileName === "xl/workbook.xml" ||
      fileName === "xl/_rels/workbook.xml.rels" ||
      fileName.startsWith("xl/worksheets/sheet")
    ) {
      const lNameLen = view.getUint16(localHeaderOffset + 26, true)
      const lExtraLen = view.getUint16(localHeaderOffset + 28, true)
      const dataStart = localHeaderOffset + 30 + lNameLen + lExtraLen
      const rawData = bytes.subarray(dataStart, dataStart + compSize)

      if (method === 0) {
        files[fileName] = rawData
      } else if (method === 8) {
        files[fileName] = await inflateRaw(rawData)
      }
    }
  }

  return files
}

export async function parseXlsxFile(file: File): Promise<string[][]> {
  const buffer = await file.arrayBuffer()
  const entries = await unzipEntries(buffer)
  const decoder = new TextDecoder("utf-8")
  const parser = new DOMParser()

  // 1. Parse sharedStrings.xml if present
  const sharedStrings: string[] = []
  if (entries["xl/sharedStrings.xml"]) {
    const ssXml = decoder.decode(entries["xl/sharedStrings.xml"])
    const ssDoc = parser.parseFromString(ssXml, "application/xml")
    const siNodes = ssDoc.getElementsByTagName("si")
    for (let i = 0; i < siNodes.length; i++) {
      const tNodes = siNodes[i].getElementsByTagName("t")
      let text = ""
      for (let j = 0; j < tNodes.length; j++) {
        text += tNodes[j].textContent || ""
      }
      sharedStrings.push(text)
    }
  }

  // 2. Find first worksheet XML
  const sheetPath =
    entries["xl/worksheets/sheet1.xml"]
      ? "xl/worksheets/sheet1.xml"
      : Object.keys(entries)
          .filter((k) => k.startsWith("xl/worksheets/sheet") && k.endsWith(".xml"))
          .sort()[0]

  if (!sheetPath || !entries[sheetPath]) {
    throw new Error("Worksheet tidak ditemukan di dalam file .xlsx.")
  }

  const sheetXml = decoder.decode(entries[sheetPath])
  const sheetDoc = parser.parseFromString(sheetXml, "application/xml")
  const rowNodes = sheetDoc.getElementsByTagName("row")

  const rows: string[][] = []
  for (let r = 0; r < rowNodes.length; r++) {
    const rowEl = rowNodes[r]
    const cellNodes = rowEl.getElementsByTagName("c")
    const rowValues: string[] = []
    let hasAnyValue = false

    for (let c = 0; c < cellNodes.length; c++) {
      const cell = cellNodes[c]
      const ref = cell.getAttribute("r") || ""
      const colLetters = ref.replace(/[0-9]/g, "")
      const colIdx = colLetters ? colLettersToIndex(colLetters) : c
      const cellType = cell.getAttribute("t") || ""

      let value = ""
      if (cellType === "s") {
        const vEl = cell.getElementsByTagName("v")[0]
        const ssIdx = vEl ? parseInt(vEl.textContent || "", 10) : -1
        value = ssIdx >= 0 && ssIdx < sharedStrings.length ? sharedStrings[ssIdx] : ""
      } else if (cellType === "inlineStr") {
        const tNodes = cell.getElementsByTagName("t")
        for (let k = 0; k < tNodes.length; k++) {
          value += tNodes[k].textContent || ""
        }
      } else {
        const vEl = cell.getElementsByTagName("v")[0]
        value = vEl?.textContent || ""
      }

      const trimmed = value.trim()
      if (trimmed !== "") hasAnyValue = true
      while (rowValues.length <= colIdx) rowValues.push("")
      rowValues[colIdx] = trimmed
    }

    if (hasAnyValue) {
      rows.push(rowValues)
    }
  }

  return rows
}
