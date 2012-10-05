define(['jquery', 'hbs!templates/lecture'], function($, lectureViewTmpl){

	/**
	 * Конструктор лекции
	 * @param {Object} obj Объект инициализации
	 */
	var Lecture = function(obj){
		this.title = obj.title || 'Без названия';

		this.$el = $(this.render());
	};

	/**
	 * Методы лекций
	 */
	Lecture.prototype = {
		render: function(){
			return lectureViewTmpl({
				'title': this.title
			});
		}
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
					$el.detach();
				});
			}

			$el.find('input').val('');
			$el.data('id', parent.data('id'));
			parent.append($el);
		};
	}();

	return Lecture;
});