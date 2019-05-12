'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/upload-files', controller.upload.findAllUploadFiles);
  router.post('/upload', controller.upload.index);
  router.get('/fileContent', controller.home.getFileContent);
  router.get('/test', controller.home.test);
  router.get('/files/:type', controller.home.getFilesByType);
};
