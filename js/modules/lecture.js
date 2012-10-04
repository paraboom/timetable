define(['jquery', 'hbs!templates/lecture'], function($, lectureViewTmpl){

	/**
	 * Конструктор лекции
	 * @param {Object} obj Объект инициализации
	 */
	var Lecture = function(obj){
		this.title = obj.title || 'Без названия';
	};

	/**
	 * Методы лекций
	 */
	Lecture.prototype = {

	};

	Lecture.dialog = function(){
		var $el;

		return function(parent, callback){
			if (!$el) {
				$el = $(lectureViewTmpl({}));

				$el.on('blur', 'input', function(){
					if (callback && $.isFunction(callback)) {
						callback({
							'id': $(this).closest('.lecture').data('id'),
							'title': $(this).val()
						});
					}
				});
			}

			$el.data('id', parent.data('id'));
			parent.append($el);
		};
	}();

	return Lecture;
});