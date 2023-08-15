import { Context } from 'koa';
import { screenshot } from '../../core/screenshot';

export default {
  async getScreen(ctx: Context): Promise<void> {
    const res = await screenshot();
    ctx.body = res;
  },
};
