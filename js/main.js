requirejs(['jquery', 'modules/calendar', 'modules/lecture'], function($, Calendar, Lecture){

	var calendar;

	var storedData = JSON.parse(localStorage['1349785335253']);
	if (storedData.items) {
		$.each(storedData.items, function(key, lectures){
			var tmp_obj = [];

			for (var i = 0, l = lectures.length; i<l; i++) {
				tmp_obj.push(new Lecture(lectures[i]));
			}

			storedData.items[key] = tmp_obj;
		});
	}

	calendar = new Calendar(storedData);

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
				calendar.addItem(data.parent_id, new Lecture(data));
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

		container.on('dblclick', '.lecture', function(evt){
			evt.stopPropagation();
			var el = $(this),
				lecture = findLecture(el.closest('.calendar-item').data('id'), el.data('id'));

			if (lecture) {
				lecture.editor();
			}
		});

		calendar.on('save', function(evt, data){
			localStorage[data.id] = JSON.stringify(data);
		});


	});
});