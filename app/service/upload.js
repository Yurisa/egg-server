const Service = require('egg').Service;
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const fs = require('fs');
const uploadPath = path.join(__dirname, '../', '/public/uploads');
let fileIndex = 1;

function streamToBuffer(stream) {  
  return new Promise((resolve, reject) => {
    let buffers = [];
    stream.on('error', reject);
    stream.on('data', (data) => buffers.push(data));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

class UploadService extends Service {
  async index() {
    const { ctx } = this;

    const fileData = await ctx.getFileStream();
    const data = fileData.fields;
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
            await sendToWormhole(fileData); //将流消耗掉否则会造成浏览器卡死
            ctx.body = JSON.stringify({exist: 1, success: true, filePath: `/public/uploads/${data.fileName}`}).toString('utf8');
            return;
          }
        }
      }
    }
  
    if (fileIndex == data.fileChunks) { // 最后一块文件blob
      fileIndex = 1;
      fs.appendFileSync(`${uploadPath}/${data.fileName}`, await streamToBuffer(fileData));
      /**
       * 向表upload_file插入一条数据
       */
      const result = await this.app.mysql.insert('upload_file', {
        file_path: `/public/uploads/${data.fileName}`, 
        file_size: data.fileSize, 
        file_suffix: data.fileName.replace(/.+\./,""), 
        file_name: data.fileName,
        file_md5: data.fileMD5,
        create_time: new Date(),
        update_time: new Date(),
        file_status: 'success'
      })
      ctx.body = JSON.stringify({exist: 0, success: true, filePath: `/public/uploads/${data.fileName}`}).toString('utf8');
    } else if (fileIndex == data.fileIndex) {
      fileIndex++
      fs.appendFileSync(`${uploadPath}/${data.fileName}`, await streamToBuffer(fileData))
      ctx.body = JSON.stringify({exist: 0, success: true, chunkIndex: fileIndex});
    }
  
  }

  async findAll() {
    const data = await this.app.mysql.select('upload_file');
    return data;
  }
}

module.exports = UploadService;