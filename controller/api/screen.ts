import { Context } from 'koa';
import fs from 'fs';
import screenShotService from '../../core/screen';

export interface ScreenShot {
  url: string;
  device?: string;
  width?: string;
  height?: string;
  type?: string;
  format?: string;
  quality?: number;
}

class ScreenShotController {

  async getScreenShot(ctx: Context): Promise<void> {
    const query = ctx.request.query;
    const params = {
      url: RegExp(/http/).exec(query.url as string) ? query.url : `http://${query.url}`,
      device: query.device || 'pc',
      width: query.width || '1920',
      height: query.height || '1080',
      type: query.type || 'pdf',
      format: query.format || 'a4',
      quality: parseInt(`${query.quality || 60}`, 10),
    } as ScreenShot;
  
    const { filePath } = await screenShotService.getImgPath(params);
    const res = await screenShotService.uploadOSS(filePath || '');
    filePath && fs.unlinkSync(filePath);
    ctx.body = res;
  }
}

const screenShotController = new ScreenShotController();
export default screenShotController;
