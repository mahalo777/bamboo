import { PaperFormat, launch } from "puppeteer";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { getNonDuplicateId } from "../common/utils";
import dayjs from "dayjs";
import { FullScreenShot } from "../controller/api/screen";

// /private/var/vm
const TEMP_PATH = process.env.NODE_ENV === 'development' ? path.dirname(path.dirname(__dirname)) : '/dev/shm';

export const getFullScreenShot = async (params: FullScreenShot) => {
  const { url, type, format } = params;
  const browser = await launch({
    headless: false,
    slowMo: 100,
    defaultViewport: { width: 1400, height: 900 },
    args: [
      "-no-sandbox",
      "--window-size=1400,900"
    ]
  })

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: ["networkidle0", "domcontentloaded", "load"] });

    const fileName = `screenshot-${dayjs().format('YYYYMMDD-HHmmss')}-${getNonDuplicateId(6)}.${type}`;
    const tempDirPath = path.join(TEMP_PATH, './temp');
    const filePath = path.join(tempDirPath, fileName);
    if (!fs.existsSync(tempDirPath)) {
      fs.mkdirSync(tempDirPath);
    }
    await page.pdf({
      path: filePath,
      format: format as PaperFormat
    });
    browser.close();
    return { filePath, fileName}
  } catch (e) {
    return { success: false }
  }
}

export const uploadOSS = async (filePath: string, fileName: string) => {
    try {
      const fileUrl = fs.createReadStream(filePath);
      const formData = new FormData();
      formData.append('file', fileUrl);
      const res = await axios.post("http://xxx/oss/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJhY2NvdW50SWQiOiIxNjQ0MjI0MDQyNzcxMDY2ODgwIiwidGVuYW50SWQiOiIxNjQ0MjY5OTY4NTk3NzY2MTQ0IiwidXNlck5hbWUiOiLlvKDkuozlk4giLCJ1c2VySWQiOiIxNjQ0MjcwMTgwNzAzNzE5NDI0IiwidXNlcktleSI6Ijk5YWY0MTExLTQ2N2ItNDQ2ZC1hNjc2LTgzOWFkZDkyYmM2OCJ9.mAjZG5hkD-nPeoRajQKUF3XvHlxQYMo7whu9vFh7fGpLevkvXwMtkK61LIV0pfGqolggATf8pY3yFUoX6lpHVA'
        }
      })
      console.log('上传成功', res)
      return res.data;
    } catch (error) {
      return { success: false }
    }
}
