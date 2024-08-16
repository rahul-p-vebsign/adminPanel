const { handleUserAction } = require('../resource_handlers/userHandler');
const { handleCourseAction } = require('../resource_handlers/courseHandler');
const { handleCourseModuleAction } = require('../resource_handlers/course_moduleHandler');
const { handleContentAction } = require('../resource_handlers/contentHandler');

exports.preSave = async (req, res, args, next) => {

  if (args.name === 'users') {
    await handleUserAction(args);
  } else if (args.name === 'courses') {
    await handleCourseAction(args);
  } else if (args.name === 'course_modules') {
    await handleCourseModuleAction(args);
  }else if (args.name === 'contents') {
    await handleContentAction(args);
  }

  next();
}
