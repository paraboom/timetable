requirejs(['jquery', 'modules/scheduler'], function($, table){
	console.log($('span').length);
	console.log('MAIN');

	$(function(){
		console.log('loaded');

		console.log(table);

		console.log(table.lala());
	});
});