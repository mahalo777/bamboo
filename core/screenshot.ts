import { launch } from "puppeteer";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const screenshot = async () => {
  const browser = await launch({
    headless: false,
    slowMo: 100,
    defaultViewport: { width: 1400, height: 900},
    args: [
      "-no-sandbox",
      "--window-size=1400,900"
    ]
  })

  const page = await browser.newPage();

  try {
    await page.goto("http://www.baidu.com", { waitUntil: ["networkidle0", "domcontentloaded", "load"] });
    const path = `./temp`;
    fs.mkdirSync(path);
    await page.pdf({
      path: `${path}/test.pdf`,
      format: 'a2'
    });
    browser.close();

    const fileUrl = fs.createReadStream(`${path}/test.pdf`);
    const formData = new FormData();
    formData.append('file', fileUrl);

    // const res = await axios.post("xxxxxx", formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //     'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJhY2NvdW50SWQiOiIxNjQ0MjI0MDQyNzcxMDY2ODgwIiwidGVuYW50SWQiOiIxNjQ0MjY5OTY4NTk3NzY2MTQ0IiwidXNlck5hbWUiOiLlvKDkuozlk4giLCJ1c2VySWQiOiIxNjQ0MjcwMTgwNzAzNzE5NDI0IiwidXNlcktleSI6Ijk5YWY0MTExLTQ2N2ItNDQ2ZC1hNjc2LTgzOWFkZDkyYmM2OCJ9.mAjZG5hkD-nPeoRajQKUF3XvHlxQYMo7whu9vFh7fGpLevkvXwMtkK61LIV0pfGqolggATf8pY3yFUoX6lpHVA'
    //   }
    // })
    // return res.data;
  } catch (e) {
    console.log(e);
    return { success: false }
  }
}
