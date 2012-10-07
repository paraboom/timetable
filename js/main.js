requirejs(['jquery', 'modules/calendar', 'modules/lecture'], function($, Calendar, Lecture){

	var calendar;

	calendar = new Calendar({
		'name': 'Расписание'
	});

	function findLecture(parent, id) {
		if (!calendar.items[parent]) return false;
		var lectures = calendar.items[parent];
		for (var i = 0, l = lectures.length; i<l; i++) {
			var itm = lectures[i];
			if (itm.id === id) return itm;
		}

		return false;
	}

	$(function(){
		var container = $('.calendar-container');
		container.append(calendar.show());

		container.on('dblclick', '.calendar-item', function(evt){
			Lecture.dialog($(this), function(data){
				calendar.addItem(data.id, new Lecture(data));
			});
		});

		container.on('click', '.lecture', function(evt){
			var el = $(this),
				lecture = findLecture(el.closest('.calendar-item').data('id'), el.data('id'));

			calendar.itemsCollection(function(item){
				item.activate(false);
			});

			if (lecture) {
				lecture.activate(true);
			}
		});


	});
});