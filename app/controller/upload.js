const Controller = require('egg').Controller;

class UploadController extends Controller {
  async index() {
    const { ctx } = this;
    await ctx.service.upload.index();
  }

  async findAllUploadFiles() {
    const { ctx } = this;
    const data = await ctx.service.upload.findAll();
    ctx.body = data;
  }
}

module.exports = UploadController;