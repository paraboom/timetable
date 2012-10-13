define(['jquery', 'handlebars', 'text!/templates/lecture.html', 'text!/templates/lectureEditor.html'], function($, Handlebars, lectureViewTmpl, lectureEditorTmpl){

	lectureViewTmpl = Handlebars.compile(lectureViewTmpl);
	lectureEditorTmpl = Handlebars.compile(lectureEditorTmpl);



	/**
	 * Конструктор лекции
	 * @param {Object} obj Объект инициализации
	 */
	var Lecture = function(obj){
		this.title = obj.title || 'Без названия';

		this.id = obj.id || new Date().valueOf();

		this.attributes = obj.attributes || {};

		this.$el = $(this.render());
	};

	/**
	 * Методы лекций
	 */
	Lecture.prototype = {
		toJSON: function(){
			return {
				title: this.title,
				id: this.id
			};
		},

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
		},

		editor: function(){
			var data = Lecture.editor.getData(this);
			var editor = Lecture.editor.getEl().html(lectureEditorTmpl(data)).toggleClass('lecture-editor-active', true);

			editor.offset({left: this.$el.offset().left + this.$el.width()});
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
								'parent_id': $(this).closest('.lecture').data('id'),
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

	Lecture.editor = function(){
		var $el,
			emptyAttrs = {
				'time': {
					'label': 'Время начала',
					'value': '00:00'
				},
				'actor': {
					'label': 'Лектор',
					'value': 'Имя лектора'
				},
				'optional': {
					'label': 'Факультативная',
					'value': false
				}
			},
			defaultButtons = [
				{
					'value': 'delete',
					'text': 'Удалить'
				},
				{
					'value': 'done',
					'text': 'Ок'
				}
			];

		return {
			getEl: function(){
				if (!$el) {
					$el = $('<div class="lecture-editor"></div>').appendTo('body');

					$el.click(function(evt){
						evt.stopPropagation();
					});

					$('body').click(function(){
						$el.toggleClass('lecture-editor-active', false);
					});
				}

				return $el;
			},

			getData: function(lecture){
				var data = {};
				data.title = lecture.title;
				data.attributes = $.map($.extend(emptyAttrs, lecture.attributes), function(obj, key){
					return $.extend({}, {'key': key}, obj);
				});
				data.buttons = defaultButtons;

				return data;
			}
		};
	}();

	return Lecture;
});