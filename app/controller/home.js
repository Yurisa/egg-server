'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  async test() {
    const { ctx, app } = this;
    app.redis.set('hdd', '123') // 把token存入redis
  }

  async getFileContent() {
    const { ctx } = this;
    const data = await ctx.service.home.getFileContent();
    if (data) {
      ctx.body = {
        code: 1,
        data
      }
    } else {
      ctx.body = {
        code: 0,
        data: '没有该文件'
      }
    }
  }

  async getFilesByType() {
    const { ctx } = this;
    const data = await ctx.service.home.queryFilesByType();
    ctx.body = {
      code: 1,
      body: data
    }
  }
}

module.exports = HomeController;
