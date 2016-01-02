'use strict';

var ngServicesGenerator = require("ngliferayservices-generator");

module.exports = function (grunt) {

	grunt.registerTask('buildService', 'Task to build ngLiferayServices', function () {

		var app = grunt.config('yeoman').app;
		var servicesDir = app + "/js";
		var done = this.async();

		function nextFn(err, p){
			done();
			if(err){
				grunt.log.error("Error occurred: " + err);
			} else{
				grunt.log.ok("ngLiferayServices file is created. Location: " + p);
			}
		}

		ngServicesGenerator({
			jsonServices : {},
			next: nextFn,
			dest: servicesDir,
			moduleName: grunt.config('yeoman').appName
		},{
			initModule: false
		});

	});

};
