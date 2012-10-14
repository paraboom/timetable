define(['jquery', 'handlebars', 'text!/templates/lecture.html', 'text!/templates/lectureEditor.html'], function($, Handlebars, lectureViewTmpl, lectureEditorTmpl){

	lectureViewTmpl = Handlebars.compile(lectureViewTmpl);
	lectureEditorTmpl = Handlebars.compile(lectureEditorTmpl);

	/**
	 * Не очень хорошо расширять стандартные прототипы, но когда очень хочется - можно
	 */
	String.prototype.capitalize = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	};

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
				id: this.id,
				attributes: this.attributes
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
			var editor = Lecture.editor.getEl(this);
		},

		save: function(data){
			var that = this;

			that.title = data.title;
			delete data.title;

			$.each(data, function(key, value){
				that.attributes[key] = value;
			});

			that.$el.find('.lecture-title').text(that.title);
		},

		destroy: function(){
			this.title = null;
			this.id = null;
			this.attributes = null;
			this.$el.remove();
			this.$el = null;
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
			$container = $('.calendar-container'),
			containerOffset = $container.offset(),
			containerWidth = $container.width(),
			containerHeight = $container.height(),
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
			],
			eventDispatcher = $({}),
			currentLecture;

		return {
			getEl: function(lecture){
				var that = this;

				currentLecture = lecture;

				if (!$el) {
					$el = $('<div class="lecture-editor"></div>').appendTo('body');

					$el.click(function(evt){
						evt.stopPropagation();
					});

					$el.on('click', '.lecture-editor-value', function(){
						$(this)
							.closest('.lecture-editor-item')
							.toggleClass('lecture-editor-item-active', true)
							.find('.lecture-editor-value-input').focus();
					});

					$el.on('blur', '.lecture-editor-value-input', function(){
						var input = $(this),
							parent = input.closest('.lecture-editor-item');

						parent
							.find('.lecture-editor-value')
							.text(input.val())
							.end()
							.toggleClass('lecture-editor-item-active', false);
					});

					$el.on('click', '.lecture-editor-button', function(){
						that['button' + $(this).val().capitalize()](currentLecture);
					});

					$('body').click(function(){
						$el.toggleClass('lecture-editor-active', false);
					});
				}

				var lectureOffest = lecture.$el.offset();

				$el
					.css({
						left: lectureOffest.left + lecture.$el.width(),
						top: lectureOffest.top
					})
					.html(lectureEditorTmpl(Lecture.editor.getData(lecture)))
					.toggleClass('measurer', true)
					.removeClass('lecture-editor-right');

				// Эту проверку нужно как-то вынести отсюда, чтобы не завязываться на контейнер
				if ($el.offset().left + $el.width() > containerOffset.left + containerWidth) {
					$el.css({
						left: lectureOffest.left - $el.outerWidth()
					}).addClass('lecture-editor-right');
				}

				$el.toggleClass('measurer', false);

				return $el.toggleClass('lecture-editor-active', true);
			},

			getData: function(lecture){

				var values = {};
				$.each(lecture.attributes, function(key, value){
					values[key] = {'value': value};
				});

				var data = {};
				data.title = lecture.title;
				data.attributes = $.map($.extend(true, emptyAttrs, values), function(obj, key){
					if (key == 'optional') {
						obj.value = (obj.value) ? 'да' : 'нет';
					}
					return $.extend({}, {'key': key}, obj);
				});
				data.buttons = defaultButtons;

				return data;
			},

			on: function(eventType, callback){
				eventDispatcher.on(eventType, callback);
			},

			buttonDelete: function(lecture){
				$el.toggleClass('lecture-editor-active', false);
				eventDispatcher.trigger('lectureDelete', lecture);
			},

			buttonDone: function(lecture){
				$el.toggleClass('lecture-editor-active', false);
				var obj = {};
				$el.find('.lecture-editor-value-input').each(function(){
					obj[$(this).attr('name')] = $(this).val();
				});

				lecture.save(obj);
				eventDispatcher.trigger('lectureSave', lecture);
			}
		};
	}();

	return Lecture;
});