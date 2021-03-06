requirejs(['jquery', 'modules/calendar', 'modules/lecture'], function($, Calendar, Lecture){

	var storedData = localStorage['shriCalendar'] || {};

	if (!$.isEmptyObject(storedData)) {
		storedData = JSON.parse(storedData);
		if (storedData.items) {
			$.each(storedData.items, function(key, lectures){
				var tmp_obj = [];

				for (var i = 0, l = lectures.length; i<l; i++) {
					tmp_obj.push(new Lecture(lectures[i]));
				}

				storedData.items[key] = tmp_obj;
			});
		}
	}

	var calendar = new Calendar(storedData || {});

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

		container.on('click', '.calendar-printversion', function(evt){
			evt.preventDefault();
			calendar.showPrint();
		});

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
			localStorage['shriCalendar'] = JSON.stringify(data);
		});

		Lecture.editor.on('lectureDelete', function(evt, lecture){
			var targetId = lecture.$el.closest('.calendar-item').data('id');
			calendar.removeItem(targetId, lecture);
		});

		Lecture.editor.on('lectureSave', function(evt, lecture){
			calendar.save();
		});

	});
});