define(['jquery', 'hbs!templates/lecture'], function($, lectureViewTmpl){

	/**
	 * Конструктор лекции
	 * @param {Object} obj Объект инициализации
	 */
	var Lecture = function(obj){
		this.title = obj.title || 'Без названия';

		this.id = new Date().valueOf();

		this.$el = $(this.render());
	};

	/**
	 * Методы лекций
	 */
	Lecture.prototype = {
		render: function(){
			return lectureViewTmpl({
				'title': this.title,
				'id': this.id
			});
		},

		show: function(){
			return this.$el;
		},

		showHtml: function() {
			return this.$el[0].outerHTML;
		},

		activate: function(trigger){
			this.$el.toggleClass('lecture-active-mode', !!trigger);
		}
	};

	Lecture.dialog = function(){
		var $el;

		return function(parent, callback){
			if (!$el) {
				$el = $(lectureViewTmpl({}));

				$el.on('keypress', 'input', function(evt){
					evt.stopPropagation();
					if ((evt.which && evt.which == 13) || !evt.which)  {
						if (callback && $.isFunction(callback)) {
							callback({
								'id': $(this).closest('.lecture').data('id'),
								'title': $(this).val()
							});
						}
						$el.detach();
					}
				});
			}

			$el.data('id', parent.data('id'));
			parent.append($el);
			$el.find('input').val('').focus();
		};
	}();

	return Lecture;
});