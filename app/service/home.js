const Service = require('egg').Service;
const fs = require('fs');
const path = require('path');
const basePath = path.join(__dirname, '../', '/public/uploads');

class HomeService extends Service {
  async findAll() {
    const data = await this.app.mysql.select('upload_file');
    return data;
  }

  async getFileContent() {
    const { ctx } = this;
    const { fileName } = ctx.query;
    const readPath = `${basePath}/${fileName}`;
    try {
      if (fs.existsSync(readPath)) {
        const data = fs.readFileSync( readPath, 'utf-8');
        return data;
      } else {
        return null;
      }
    } catch (e) {
      throw new Error(e);
    }
  }
}

module.exports = HomeService;
