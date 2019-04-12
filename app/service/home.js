const Service = require('egg').Service;

class HomeService extends Service {
  async findAll() {
    console.log(this.app.mysql)
    const data = await this.app.mysql.select('upload_file');
    return data;
  }
}

module.exports = HomeService;
