'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  async test() {
    const { ctx } = this;
    const data = await ctx.service.home.findAll();
    ctx.body = data;
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
}

module.exports = HomeController;
