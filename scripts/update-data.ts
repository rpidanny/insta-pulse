import { CalendarDatum } from '@nivo/calendar'
import { readFile, writeFile } from 'fs/promises'
import { chromium } from 'playwright'

interface ProcessedData {
  yearlyData: Record<string, CalendarDatum[]>
  updatedAt: string
}

const DATA_FILE = 'src/data/day-map.json'
const PROCESSED_FILE = 'src/data/processed.json'

async function checkInstagramAccountStatus(account: string): Promise<number> {
  const browser = await chromium.launch({
    headless: true,
  })

  const context = await browser.newContext({ recordVideo: { dir: 'videos/' } })

  const page = await context.newPage()
  try {
    await page.goto(`https://www.instagram.com/${account}/`, { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5_000)
    await page.screenshot({ path: 'screenshot.png', fullPage: true })

    const isAccountActive = await page.isVisible("text=Sorry, this page isn't available")
    console.log('Content: ', await page.content())
    return isAccountActive ? 0 : 1
  } catch (error) {
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
}

function transformData(data: Record<string, number>): ProcessedData {
  const sortedEntries = Object.entries(data).sort(
    ([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime(),
  )

  const yearlyData = sortedEntries.reduce<Record<string, CalendarDatum[]>>((acc, [date, value]) => {
    const [year, month, day] = date.split('-')
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

    if (!acc[year]) {
      acc[year] = []
    }

    acc[year].push({ day: formattedDate, value })
    return acc
  }, {})

  return {
    yearlyData,
    updatedAt: new Date().toISOString(),
  }
}

async function updateData(value: number, day: string): Promise<void> {
  const currentData = JSON.parse(await readFile(DATA_FILE, 'utf-8'))
  currentData[day] = value

  await Promise.all([
    writeFile(DATA_FILE, JSON.stringify(currentData, null, 2)),
    writeFile(PROCESSED_FILE, JSON.stringify(transformData(currentData), null, 2)),
  ])
}

;(async () => {
  // const username = 'ayinosngh' // Replace with the Instagram account to check
  const username = 'rpidanny' // Replace with the Instagram account to check
  const status = await checkInstagramAccountStatus(username)
  const today = new Date().toISOString().split('T')[0]
  await updateData(status, today)
  console.log(status)
})().catch(console.error)
