import { PaperFormat, connect, devices, launch } from "puppeteer";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import dayjs from "dayjs";
import { ScreenShot } from "../controller/api/screen";
import { getNonDuplicateId } from "../common/utils";

const DESKTOP_DEVICE = {
  name: 'Desktop 1920x1080',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36',
  viewport: {
    width: 1920,
    height: 1080,
  },
};

const CUSTOM_DEVICE = {
  name: 'custom',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36',
  viewport: {
    width: 750,
    height: 1334,
  },
};

const MAX_WSE = 4;  // 启动的browser个数
const MAX_COUNT = 100;  // 当访问次数达到多少次时重启browser

// 或者用os的temp dir
const TEMP_PATH = process.env.NODE_ENV === 'development' ? path.dirname(path.dirname(__dirname)) : '/dev/shm';

class ScreenShotService {
  
  private isBrowserReady: boolean;
  private browser: any;
  private wseList: any;
  private reqCount: number;

  constructor() {
    this.isBrowserReady = false;
    this.browser = null;
    this.wseList = []; // 存储browserWSEndpoint列表
    this.reqCount = 0;

    this.initBrowser();
  }

  private async initBrowser() {
    for (let i = 0; i < MAX_WSE; i++) {
      this.browser = await launch({
        headless: 'new',
        args: [
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
          '--mute-audio',
        ],
        timeout: 5000,
      });
      const browserWSEndpoint = await this.browser.wsEndpoint();
      this.wseList[i] = browserWSEndpoint;
    }
    this.isBrowserReady = true;
  }


  /**
     * 当请求次数大于 MAX_COUNT 时 重新启动browser，避免浏览器内存无法释放
     */
  private restart() {
    this.reqCount += 1;
    if (this.reqCount < MAX_COUNT) {
      return;
    }
    this.browser.close();
    this.isBrowserReady = false;
    this.reqCount = 0;

    this.initBrowser();
  }

  async getImgPath(query: ScreenShot) {
    const { url, device, type, format, quality, width, height } = query;
    if (!this.isBrowserReady) {
      throw Error('Browser is not ready');
    }
    const idx = Math.floor(Math.random() * MAX_WSE);
    const browserWSEndpoint = this.wseList[idx];
    const browser = await connect({ browserWSEndpoint });
    const page = await browser.newPage();

    let _device = null;
    if (device === 'pc') {
      _device = DESKTOP_DEVICE;
    } else if (device === 'custom') {
      _device = {
        ...CUSTOM_DEVICE,
        viewport: {
          width: parseInt(width as string, 10),
          height: parseInt(height as string, 10),
        }
      };
    } else {
      _device = devices['iPhone 6'];
    }
    await page.emulate(_device);
    await page.goto(url, { waitUntil: ["networkidle0", "domcontentloaded", "load"] });

    const fileName = `screenshot-${dayjs().format('YYYYMMDD-HHmmss')}-${getNonDuplicateId(6)}.${type}`;
    const tempDirPath = path.join(TEMP_PATH, './temp');
    const filePath = path.join(tempDirPath, fileName);

    if (!fs.existsSync(tempDirPath)) {
      fs.mkdirSync(tempDirPath);
    }

    if (type === 'pdf') {
      await page.pdf({
        path: filePath,
        format: format as PaperFormat,
      });
    } else {
      await page.screenshot({
        path: filePath,
        type: 'jpeg',
        quality: parseInt(`${quality}`, 10),
        fullPage: true
      });
    }

    await page.close();
    this.restart();

    return {
      fileName,
      filePath
    };
  }

  async uploadOSS (filePath: string) {
    try {
      const fileUrl = fs.createReadStream(filePath);
      const formData = new FormData();
      formData.append('file', fileUrl);
      const res = await axios.post("http://xxx", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJhY2NvdW50SWQiOiIxNjQ0MjI0MDQyNzcxMDY2ODgwIiwidGVuYW50SWQiOiIxNjQ0MjY5OTY4NTk3NzY2MTQ0IiwidXNlck5hbWUiOiLlvKDkuozlk4giLCJ1c2VySWQiOiIxNjQ0MjcwMTgwNzAzNzE5NDI0IiwidXNlcktleSI6Ijk5YWY0MTExLTQ2N2ItNDQ2ZC1hNjc2LTgzOWFkZDkyYmM2OCJ9.mAjZG5hkD-nPeoRajQKUF3XvHlxQYMo7whu9vFh7fGpLevkvXwMtkK61LIV0pfGqolggATf8pY3yFUoX6lpHVA'
        }
      })
      return res.data;
    } catch (error) {
      return { success: false }
    }
  }
}

const screenShotService = new ScreenShotService();

export default screenShotService;