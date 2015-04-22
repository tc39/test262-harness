/*---
description: should load helper.js from the proper directory
includes: ['helper.js']
---*/
if(helper() !== 'secret') $ERROR('helper not correct');
