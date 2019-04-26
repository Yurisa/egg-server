const Controller = require('egg').Controller;

class UploadController extends Controller {
  async index() {
    const { ctx } = this;
    await ctx.service.upload.index();
  }
}

module.exports = UploadController;