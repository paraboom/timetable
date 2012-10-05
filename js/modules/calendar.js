define(['jquery', 'hbs!templates/table'], function($, tableTmpl){

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
		}
	};

	/**
	 * Конструктор календаря
	 * @param {Object} obj Настройки календаря
	 */
	var Calendar = function(obj){
		var that = this;

		this.name = obj.name;
		this.month = (obj.month || obj.month === 0) ? obj.month : new Date().getMonth();
		this.year = obj.year || new Date().getFullYear();

		// Внутреннее хранилище лекций
		this.items = {};

		this.$el = $(this.render());

		this.$el.on('click', '.icon-arrow-left', function(){
			that.prevMonth();
		});

		this.$el.on('click', '.icon-arrow-right', function(){
			that.nextMonth();
		});
	};

	Calendar.prototype = {
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
			this.$el.find('td[data-id=' + targetId + ']').append(item.render());
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
					value: tmp_date.getDate()
				};
				// проверяем сегодняшняя ли это дата
				if (tmp_date.valueOf() == today.valueOf()) tmp_obj.today = true;

				if (this.items[tmp_obj.id]) {
					var tmp_html = '';
					$.each(this.items[tmp_obj.id], function(i, lecture){
						tmp_html += lecture.render();
					});
					tmp_obj.lectures = tmp_html;
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

			return tableTmpl({
						'rows': tmp,
						'month': helper.monthNames[this.month],
						'year': this.year
					});
		},

		show: function(){
			return this.$el;
		}
	};

	return Calendar;
});