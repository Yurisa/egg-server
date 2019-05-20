const Service = require('egg').Service;
const path = require('path');
const fs = require('fs');
const uploadPath = path.join(__dirname, '../', '/public/uploads');

class UploadService extends Service {
  async index() {
    const { ctx } = this;
    const fileData = ctx.request.files[0];
    const data = ctx.request.body;
    const fileIndex = data.fileIndex;
    ctx.status = 200;
    ctx.set('Content-Type', 'text/plain');
    
    // 上传目录是否存在，不存在则创建
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath)
    }

    if (fileIndex == 1) {
      const result = await this.app.mysql.select('upload_file', {
        columns: ['file_md5']
      });
      if (result && result.length > 0) {
        for (const r in result) {
          if(result[r].file_md5 === data.fileMD5) {
            ctx.body = JSON.stringify({exist: 1, success: true, filePath: `/public/uploads/${data.fileName}`}).toString('utf8');
            return;
          }
        }
      }
    }
  
    if (fileIndex == data.fileChunks) { // 最后一块文件blob
      let fileChunk = fs.readFileSync(fileData.filepath);      
      fs.appendFileSync(`${uploadPath}/${data.fileName}`, fileChunk)
      /**
       * 向表upload_file插入一条数据
       */
      const result = await this.app.mysql.insert('upload_file', {
        file_path: `/public/uploads/${encodeURIComponent(data.fileName)}`, 
        file_size: data.fileSize, 
        file_suffix: data.fileName.replace(/.+\./,""), 
        file_name: data.fileName,
        file_md5: data.fileMD5,
        create_time: new Date(),
        update_time: new Date(),
        file_status: 'success'
      })
      ctx.body = JSON.stringify({exist: 0, success: true, filePath: `/public/uploads/${data.fileName}`}).toString('utf8');
    } else {
      let fileChunk = fs.readFileSync(fileData.filepath);
      fs.appendFileSync(`${uploadPath}/${data.fileName}`, fileChunk);
      ctx.body = JSON.stringify({exist: 0, success: true, chunkIndex: fileIndex});
    }
  
  }

  async findAll() {
    const data = await this.app.mysql.select('upload_file');
    return data;
  }
}

module.exports = UploadService;