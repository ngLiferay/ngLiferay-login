'use strict';

module.exports = function (grunt) {
  grunt.registerTask('createWar', 'Task to create a war', function () {
    var props = grunt.config('createWar').props;
    var themeId = props.themeId, themeName = props.themeName, warName = props.warName;			
		
		if(!themeId){
			grunt.fail.fatal(new Error("Theme id not exists."));
		}
    //create a new tmp dir.
    grunt.file.delete(".tmpWar", {force:true});
    grunt.file.mkdir(".tmpWar");
		
		//create theme dir
		grunt.log.writeln("Creating war: " + warName);
		grunt.file.mkdir(".tmpWar/" + warName);
		
		//copy default theme tmpls
		grunt.task.run(['copy:copyDefaultWar', 'copy:distCopyToWar', 
		                'copy:indexCopyToPortalNormal', 'war']);
		
  });
	
	grunt.registerTask('deployWar', 'Task to deploy war', function () {
		var props = grunt.config('createWar').props, warName = props.warName;
		var dist = grunt.config('yeoman').dist, warPath = dist + '/' + warName + '.war',
			deployDir = grunt.config('lr').portalDir + "/deploy";
		
		//deploy war to liferay
		grunt.log.writeln("Deploying war: " + warName);		
		if(deployDir && grunt.file.isDir(deployDir)){
			grunt.file.copy(warPath, deployDir + '/' + warName + '.war');
			grunt.log.ok(warName + " is deployed.");
		}
		else{
			grunt.log.error("Deploy directory is incorrect.");
		}
		
	});	
};