define(['jquery', 'hbs!templates/calendar'], function($, calendarTmpl){

	var helper = {
		getDaysInMonth: function(year, month){
			return new Date(year, month + 1, 0).getDate();
		},
		monthNames: {
			0: 'Январь',
			1: 'Февраль',
			2: 'Март',
			3: 'Апрель',
			4: 'Май',
			5: 'Июнь',
			6: 'Июль',
			7: 'Август',
			8: 'Сентябрь',
			9: 'Октябрь',
			10: 'Ноябрь',
			11: 'Декабрь'
		},
		monthNamesGenitive: {
			0: 'января',
			1: 'февраля',
			2: 'марта',
			3: 'апреля',
			4: 'мая',
			5: 'июня',
			6: 'июля',
			7: 'августа',
			8: 'ментября',
			9: 'октября',
			10: 'ноября',
			11: 'декабря'
		},
		dayNames: [
			'Воскресенье',
			'Понедельник',
			'Вторник',
			'Среда',
			'Четверг',
			'Пятница',
			'Суббота'
		],
		dayNamesShort: [
			'Вс',
			'Пн',
			'Вт',
			'Ср',
			'Чт',
			'Пт',
			'Сб'
		]
	};

	/**
	 * Конструктор календаря
	 * @param {Object} obj Настройки календаря
	 */
	var Calendar = function(obj){
		if (!obj) obj = {};
		var that = this;

		this.id = obj.id || new Date().valueOf();
		this.eventDispatcher = $({});

		this.name = obj.name;
		this.month = (obj.month || obj.month === 0) ? obj.month : new Date().getMonth();
		this.year = obj.year || new Date().getFullYear();

		// Хранилище лекций
		this.items = obj.items || {};

		this.$el = $(this.render());

		this.$el.on('click', '.icon-caret-left', function(){
			that.prevMonth();
		});

		this.$el.on('click', '.icon-caret-right', function(){
			that.nextMonth();
		});

		this.$el.on('click', '.calendar-controls-today', function(){
			that.month = new Date().getMonth();
			that.year = new Date().getFullYear();
			that.$el.html(that.render());
		});
	};

	Calendar.prototype = {

		/**
		 * Возвращем календарь в виде JSON
		 * @return {Object} JSON
		 */
		toJSON: function(){
			var obj = {
				id: this.id,
				name: this.name,
				month: this.month,
				year: this.year
			};

			$.each(this.items, function(key, lectures){
				if (!obj.items) obj.items = {};

				obj.items[key] = [];
				for (var i = 0, l = lectures.length; i<l; i++) {
					obj.items[key].push(lectures[i].toJSON());
				}
			});
			return obj;
		},

		/**
		 * Подписывание на события
		 * @param  {String}   eventType Тип события
		 * @param  {Function} callback  Callback
		 */
		on: function(eventType, callback){
			this.eventDispatcher.on(eventType, callback);
		},

		/**
		 * Добавляем новый элемент в календарь
		 * @param {String} targetId ID даты
		 * @param {Lecture} item Лекция
		 */
		addItem: function(targetId, item) {
			if (!this.items[targetId]) {
				this.items[targetId] = [];
			}
			this.items[targetId].push(item);
			this.$el.find('td[data-id=' + targetId + ']').append(item.show());
			// дергаем событие, что состояние календаря изменилось
			this.eventDispatcher.trigger('save', this.toJSON());
		},

		/**
		 * Показывает календарь за предыдущий месяц
		 */
		prevMonth: function(){
			if (this.month === 0) {
				this.month = 11;
				this.year--;
			} else {
				this.month--;
			}

			this.$el.html(this.render());
		},

		/**
		 * Показывает календарь за следующий месяц
		 */
		nextMonth: function(){
			if (this.month === 11) {
				this.month = 0;
				this.year++;
			} else {
				this.month++;
			}

			this.$el.html(this.render());
		},

		/**
		 * Возвращает календарь за указанный месяц, если месяц не задан, то за текущий
		 * @param  {Number} year   Год
		 * @param  {Number} month  Номер месяца начиная с 0
		 * @return {String}        HTML календаря
		 */
		render: function(){
			var year = this.year,
				month = this.month;

			var tmp = [[]], cnt = 0, today = new Date();
			today.setHours(0);
			today.setMinutes(0);
			today.setSeconds(0);
			today.setMilliseconds(0);

			// строим календарь
			for (var i = 1, l = helper.getDaysInMonth(year, month, 0); i<=l; i++) {
					// для каждого дня делаем новый объект даты
				var tmp_date = new Date(year, month, i),
					// день недели
					dayNumber = tmp_date.getDay();

				// заполняем пустые позиции перед первым числом
				if (dayNumber !== 1 && i == 1) {
					for (var k = 1, j = (dayNumber === 0) ? 7 : dayNumber; k<j; k++) {
						tmp[cnt].push('');
					}
				}

				// информацию о каждом дне храним в объекте
				var tmp_obj = {
					id: 'c' + year + month + tmp_date.getDate(),
					// в первую строку впишем название дней недели
					value: (cnt === 0) ? helper.dayNamesShort[dayNumber] + ', ' + tmp_date.getDate() : tmp_date.getDate(),
					isWeekend: (dayNumber === 0 || dayNumber === 6)
				};
				// проверяем сегодняшняя ли это дата
				if (tmp_date.valueOf() == today.valueOf()) {
					tmp_obj.today = true;
					tmp_obj.value += ' ' + helper.monthNamesGenitive[month];
				}

				tmp[cnt].push(tmp_obj);

				if (tmp_date.getDay() === 0) {
					cnt++;
					tmp[cnt] = [];
				}
			}

			while (tmp[cnt].length !== 7) {
				tmp[cnt].push('');
			}

			var calendarHtml = $(calendarTmpl({
									'rows': tmp,
									'month': helper.monthNames[this.month],
									'year': this.year
								}));

			// Вставляем лекции
			$.each(this.items, function(key, items){
				var item = calendarHtml.find('.calendar-item[data-id=' + key + ']');
				$.each(items, function(i, itm){
					item.append(itm.show());
				});
			});

			return calendarHtml;
		},

		// Сделать что-нибудь с коллекцией лекций
		itemsCollection: function(callback){
			$.each(this.items, function(key, items){
				$.each(items, function(i, item){
					callback(item);
				});
			});
		},

		show: function(){
			return this.$el;
		}
	};

	return Calendar;
});