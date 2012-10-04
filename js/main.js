requirejs(['jquery', 'modules/calendar'], function($, Calendar){

	var calendar;

	calendar = new Calendar({
		'name': 'Расписание'
	});

	$(function(){
		$('.calendar-container').append(calendar.show());
	});
});