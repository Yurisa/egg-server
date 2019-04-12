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
}

module.exports = HomeController;
