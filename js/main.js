requirejs(['jquery', 'modules/calendar', 'modules/lecture'], function($, Calendar, Lecture){

	var calendar;

	calendar = new Calendar({
		'name': 'Расписание'
	});

	$(function(){
		$('.calendar-container').append(calendar.show());

		calendar.$el.on('dblclick', '.calendar-item', function(evt){
			evt.preventDefault();
			Lecture.dialog($(this), function(data){
				calendar.addItem(new Lecture(data));
			});
		});
	});
});