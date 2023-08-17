import { Context } from 'koa';
import { getFullScreenShot, uploadOSS } from '../../core/ullScreenShot';

export interface ScreenShoot {
  url: string;
  type?: string;
  format?: string;
}


export default {
  async getFullScreenShot(ctx: Context): Promise<void> {
    const query = ctx.request.query;
    const params = {
      url: query?.url || '',
      type: query.type || 'jpg',
      format: query.format || 'a4',
    } as ScreenShoot;

    const { fileName, filePath } = await getFullScreenShot(params);
    const res = await uploadOSS(filePath || '', fileName || '');
    ctx.body = res;
  },
};
