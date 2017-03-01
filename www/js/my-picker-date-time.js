// Inline date-time
function getDateTimePicker(params) {
    var today = new Date();
    return myApp.picker({
        input: params.input || '.picker-inline-date-time',
        rotateEffect: true,
        value: [
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            today.getHours(),
            isArray(params.minInterval) ? params.minInterval[0] : (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())
        ],
        onChange: function(p, values, displayValues) {
            var daysInMonth = new Date(p.value[2], p.value[0]*1 + 1, 0).getDate();
            if (values[1] > daysInMonth) {
                p.cols[1].setValue(daysInMonth);
            }
        },
        onOpen: function(p) {
            //
        },
        onClose: function(p) {
            //
        },
        formatValue: function(p, values, displayValues) {
            var month = ['01','02','03','04','05','06','07','08','09','10','11','12'][values[1]];
            return values[0] + '-' + month + '-' +  values[2] + ' ' + values[3] + ':' + values[4];
        },
        cols: [
            // Years
            {
                values: (function() {
                    var year = today.getFullYear(), 
                        range = 10;
                    var arr = [];
                    for (var i = year - range; i <= year + range; i++) { arr.push(i); }
                    return arr;
                })(),
            },
            // Months
            {
                values: [0,1,2,3,4,5,6,7,8,9,10,11],
                displayValues: ['01','02','03','04','05','06','07','08','09','10','11','12']
            },
            // Days
            {
                values: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
            },
            // Space divider
            {
                divider: true,
                content: '&nbsp;&nbsp;'
            },
            // Hours
            {
                values: (function() {
                    var arr = [];
                    for (var i = 0; i <= 23; i++) { arr.push(i); }
                    return arr;
                })(),
            },
            // Divider
            {
                divider: true,
                content: ':'
            },
            // Minutes
            {
                values: isArray(params.minInterval) ? params.minInterval : (function() {
                    var arr = [];
                    for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
                    return arr;
                })(),
            }
        ]
    });
}

// Format date
function formatDate(date, p) {
    date = new Date(date);
    var year = date.getFullYear();
    var month = date.getMonth();
    var month1 = month + 1;
    var day = date.getDate();
    var weekDay = date.getDay();

    return p.params.dateFormat
        .replace(/yyyy/g, year)
        .replace(/yy/g, (year + '').substring(2))
        .replace(/mm/g, month1 < 10 ? '0' + month1 : month1)
        .replace(/m(\W+)/g, month1 + '$1')
        .replace(/MM/g, p.params.monthNames[month])
        .replace(/M(\W+)/g, p.params.monthNamesShort[month] + '$1')
        .replace(/dd/g, day < 10 ? '0' + day : day)
        .replace(/d(\W+)/g, day + '$1')
        .replace(/DD/g, p.params.dayNames[weekDay])
        .replace(/D(\W+)/g, p.params.dayNamesShort[weekDay] + '$1');
}