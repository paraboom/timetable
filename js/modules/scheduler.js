define(['jquery', 'hbs!templates/table'], function($, tableTmpl){

	console.log('table');

	return {
		lala: function(){
			return 'lala from MODULE:' + tableTmpl();
		}
	};
});