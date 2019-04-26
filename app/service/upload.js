const Service = require('egg').Service;
const path = require('path');
const fs = require('fs');
const uploadPath = path.join(__dirname, '../', '/public/uploads');
const md5Path = './file-md5';
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

    // 保存文件MD5的目录是否存在，不存在则创建
    if (!fs.existsSync(md5Path)) {
      fs.mkdirSync(md5Path)
    }

    if (fileIndex == 1) {
      if (fs.existsSync(md5Path + '/md5.txt')) {
        let fileContent = fs.readFileSync(md5Path + '/md5.txt', 'utf-8');
        if(fileContent.indexOf(`[${data.fileMD5}]`) != -1) {
          ctx.body = JSON.stringify({exist: 1, success: true, filePath: `/public/${data.fileName}`}).toString('utf8');
          return;
        }
      } else {
        fs.writeFileSync(md5Path + '/md5.txt', '');
      }
    }
  
    if (fileIndex == data.fileChunks) { // 最后一块文件blob
      fileIndex = 1;
      fs.appendFileSync(`${uploadPath}/${data.fileName}`, await streamToBuffer(fileData));
      fs.appendFileSync(md5Path + '/md5.txt', `[${data.fileMD5}]`);
      console.log(data.fileName)
      ctx.body = JSON.stringify({exist: 0, success: true, filePath: `/public/${data.fileName}`}).toString('utf8');
    } else if (fileIndex == data.fileIndex) {
      fileIndex++
      fs.appendFileSync(`${uploadPath}/${data.fileName}`, await streamToBuffer(fileData))
      ctx.body = JSON.stringify({exist: 0, success: true, chunkIndex: fileIndex});
    }
  
  }

  async findAll() {
    console.log(this.app.mysql)
    const data = await this.app.mysql.select('upload_file');
    return data;
  }
}

module.exports = UploadService;