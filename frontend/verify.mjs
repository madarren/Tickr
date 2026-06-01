import { chromium } from "playwright";

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:5173", { waitUntil: "networkidle" });

// 1) Valid ticker -> stats + chart render
await page.fill('input[type="text"]', "AAPL");
await page.click('button[type="submit"]');
await page.waitForSelector("text=Previous Close", { timeout: 20000 });
const priceText = await page.textContent("h2"); // "Apple Inc. (AAPL)"
const hasChart = (await page.locator("svg.recharts-surface").count()) > 0;
console.log("VALID:", JSON.stringify(priceText), "| chart svg present:", hasChart);

// 2) Switch timeframe -> chart still present
await page.click("text=1Y");
await page.waitForTimeout(2500);
const chartAfterTab = (await page.locator("svg.recharts-surface").count()) > 0;
console.log("TIMEFRAME 1Y chart present:", chartAfterTab);

// 3) Bad ticker -> inline error, no chart
await page.fill('input[type="text"]', "NOTAREALTICKERZZZ");
await page.click('button[type="submit"]');
await page.waitForSelector('[role="alert"]', { timeout: 20000 });
const alertText = await page.textContent('[role="alert"]');
const chartGone = (await page.locator("svg.recharts-surface").count()) === 0;
console.log("BAD TICKER alert:", JSON.stringify(alertText), "| chart cleared:", chartGone);

console.log("CONSOLE ERRORS:", errors.length ? errors : "none");
await browser.close();
