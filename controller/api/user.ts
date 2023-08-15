import { Context } from 'koa';

export default {
  async getUser(ctx: Context): Promise<void> {
    const res = {
      name: "wenny",
    }
    ctx.body = res;
  },
};


