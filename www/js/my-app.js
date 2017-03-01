var app = {
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('backbutton', this.onBackButton, false);
        document.addEventListener('offline', this.onOffline, false);
        document.addEventListener('online', this.onOnline, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    onBackButton: function() {
        app.receivedEvent('backbutton');
    },
    onOffline: function() {
        app.receivedEvent('offline');
    },
    onOnline: function() {
        app.receivedEvent('online');
    },
    receivedEvent: function(id) {
        var closed = false;
        switch(id) {
            case 'deviceready':
                appInitialize();
                break;
            case 'backbutton':
                // panel
                var panel = $$('.panel.active')
                panel.each(function() {
                    myApp.closePanel();
                    closed = true;
                });
                if(closed) break;
                // actions-modal modal-in
                var actions = $$('.actions-modal.modal-in');
                actions.each(function() {
                    myApp.closeModal(this);
                    closed = true;
                });
                if(closed) break;
                // autocomplete
                var autocomplete_popup = $$('.popup.autocomplete-popup.modal-in');
                if(autocomplete_popup && AUTOCOMPLETES) {
                    // $$('.popup.autocomplete-popup.modal-in').hasClass("autocomplete-popup-radio-1487833204871")
                    AUTOCOMPLETES.forEach(function(autocomplete) {
                        if(autocomplete_popup.hasClass('autocomplete-popup-' + autocomplete.inputName)) {
                            try {
                                autocomplete.close();
                                closed = true;
                            } catch(e) {}
                        }
                    });
                    if(closed) break;
                }
                // popup
                var popup = $$('.popup.modal-in');
                if(popup.prop('style') && popup.prop('style').display === 'block') {
                    myApp.closeModal(popup);
                    break;
                }
                var picker = $$('.picker-modal.modal-in');
                if(picker.prop('style') && picker.prop('style').display === 'block') {
                    myApp.closeModal(picker);
                    break;
                }
                if(mainView.history.length > 1) {
                    mainView.router.back({url: 'index.html'});
                } else {
                    if(CUST_INFO.actionSheets.length > 0) {
                        CUST_INFO.actionSheets.forEach(function(actionSheet) {
                            myApp.closeModal(actionSheet);
                        });
                        CUST_INFO.actionSheets = [];
                        break;
                    }
                    if(!CUST_INFO.confirmExitApp) {
                        CUST_INFO.confirmExitApp = true;
                        myApp.confirm('LS+ 퀵앱을 종료하시겠습니까?', function() {
                            if(PAGE_INFO.myorderPagePolling) PAGE_INFO.myorderPagePolling.stop();
                            try {
                                window.navigator.app.exitApp(); // OK
                            } catch(e) {}
                        }, function() {
                            CUST_INFO.confirmExitApp = false;// Cancel
                        });
                    }
                }
                break;
            case 'offline':
            case 'online':
                CUST_INFO.networkLineStatus = id === 'online';
                break;
        }
    }
};

// Framework7
var myApp = new Framework7({
    modalTitle: 'LS+ Quick App',
    material: true,
    cache: false,
    preroute: function(view, options) {
        // {{ 자동완성기능 컴포넌트 삭제
        AUTOCOMPLETES.forEach(function(autocomplete) {
            try {
                autocomplete.close();
                autocomplete.destroy();
                autocomplete = null;
            } catch(e) {}
        });
        AUTOCOMPLETES = [];
        // }}
        if(options.url != undefined && !CUST_INFO.loggedIn) {
            switch(options.url) {
                case 'index.html':
                case 'login.html':
                case 'ifind.html':
                    break;
                case 'myinfo.html': 
                    if(options.query) {
                        // 신규고객 가입이면
                        if(options.query.info_gbn == 'new') {
                            break;
                        } else
                        // 기존고객 가입이면
                        if(options.query && options.query.info_gbn == 'old') {
                            break;
                        }
                    }
                default:
                    view.router.loadPage('login.html');
                    return false;
            }
            return true;
        }
    }
});
var mainView = myApp.addView('.view-main', {
});
var $$ = Dom7;
Template7.registerHelper('formatDate', function(value) {
    if(!value) return defaultString(value);
    return defaultString(value.slice(0, 4)) + '-' + defaultString(value.slice(4, 6)) + '-' + defaultString(value.slice(6, 8));
});
Template7.registerHelper('formatDateTime', function(value) {
    if(!value) return defaultString(value);
    return defaultString(value.slice(0, 4)) + '-' + defaultString(value.slice(4, 6)) + '-' + defaultString(value.slice(6, 8)) + ' ' + defaultString(value.slice(8, 10)) + ':' + defaultString(value.slice(10, 12));
});
Template7.registerHelper('formatCommas', function(value) {
    if(!value) return defaultString(value, '0');
    return defaultString((value + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,'));
});
Template7.registerHelper('defaultString', function(value) {
    return defaultString(value);
});
Template7.registerHelper('formatFullAddress', function(context) {
    var rvalue = '';
    if(!isObject(context)) return rvalue;
    if('f_sido' in context) {
        // return `${context.f_sido} ${context.f_gugun} ${context.f_dong} ${context.f_dong_num}`;
        return context.f_sido + ' ' + context.f_gugun + ' ' + context.f_dong + ' ' + context.f_dong_num;
    }
    return rvalue;
});
Template7.registerHelper('formatCarType', function(context) {
    var rvalue = '';
    if(!isObject(context)) return rvalue;
    if('f_car_type' in context) {
        var in_car_type = context.f_car_type.trim(),
            in_type1 = context.f_car_sub_type1.trim(),
            in_type2= context.f_car_sub_type2.trim(),
            in_fix_yn = context.f_car_type_fix_yn.trim();
        if(in_car_type == '밴') {
            if(in_type1.length > 0 && in_type1 != '미정') {
                rvalue += '차종:' + in_type1;
            }
        } else if(in_car_type == '트럭') {
            if(in_type1.length > 0 && in_type1 != '미정') {
                rvalue += '중량:' + in_type1;
                if(in_type2.length > 0 && in_type2 != '미정') {
                    rvalue += ' / 차종:' + in_type2;
                }
            }
        }
        //rvalue += in_fix_yn == 'Y' ? ', 차량지정' : '';
        if(!!rvalue) rvalue += ' (' + rvalue + ')';
    }
    return rvalue;
});
Template7.registerHelper('ifSiteType', function(context, options) {
    if(context.f_site_type_gbn != 'BD' || 
        (context.f_site_type_gbn == 'BD' && (context.f_doc_subal_gbn == '퀵' || context.f_doc_subal_gbn == '화물'))) {
        return options.fn(this, options.data);
    } else {
        return options.inverse(this, options.data);
    }
});
// return value1 ? undefined/null/'' 이면 value2
Template7.registerHelper('ifNull', function(value1, value2, options) {
    if(!value1) {
        return defaultString(value2);
    }
    return defaultString(value1);
});
Template7.registerHelper('ifContact', function(value1, value2, options) {
    value1 = defaultString(value1).trim();
    value2 = defaultString(value2).trim();
    if(value1 == value2 || value1.length > value2.length) {
        return value1;
    }
    return value2;
});
Template7.registerHelper('ifOdd', function(value, options) {
    if(value % 2) {
        return options.fn(this, options.data);
    } else {
        return options.inverse(this, options.data);
    }
});
Template7.registerHelper('ifEqual', function(value1, value2, options) {
    if(value1 === value2) {
        return options.fn(this, options.data);
    } else {
        return options.inverse(this, options.data);
    }
});
Template7.registerHelper('formatStatus', function(status, options) {
    var color = CUST_INFO.formatStatusColors[
        status == '대기' ? 0 : 
        status == '접수' ? 1 : 
        status == '취소' ? 2 : 
        status == '종료' ? 3 : 0 
    ];
    return '<p style="color: ' + color + ';">' + status + '</p>'
});

// actions events
$$(document).on('actions:opened', function() {
    CUST_INFO.actionSheets.push(this);
});
$$(document).on('actions:closed', function() {
    CUST_INFO.actionSheets.pop();
});

// data-page="index"
myApp.onPageInit('index', function(page) {
    CUST_INFO.indicator = true; // indicator
    // setting menu
    var menu = getMenuInfo();
    var menu_length = $$('[data-page="index"] .page-index-template-content').find('div[class="col-35"]');
    if(menu.length != menu_length) {
        setMenuTemplate(menu);
    }
});

$$(document).on('click', '[data-page="index"] a[id="menu-cc"]', function() {
    var cctitle = $$(this).find('.item-title').text();
    myApp.modal({
        title: cctitle + '로 전화연결하시겠습니까?',
        text: null,
        buttons: [
            {
                text: '취소할래요'
            }, {
                text: '좋아요',
                onClick: function() {
                    /*var tel = $$('a#callcenter').attr('href');
                    if(myApp.device.android) {
                        document.location.href = tel;
                    } else if(myApp.device.ios) {
                        window.open(tel, '_system');
                    }*/
                    $$('[data-page="index"] a[id="callcenter"]').trigger('click');
                }
            }
        ]
    });
});

// data-page="myorder"
myApp.onPageBeforeInit('myorder', function(page) {
    var in_site_type_gbn = page.query.site_type_gbn || 'NR';
    PAGE_INFO.myorderPageInfo = Object.assign({}, page, {
        toolbarBottomNames: [], // 이전|다음 이름배열
        in_site_type_gbn: in_site_type_gbn, // 기본값
        in_site_type_func: in_site_type_gbn == 'BD' ? 'BD01' : 'NR01', // 기본값
        pageTitle: in_site_type_gbn == 'BD' ? '문서수발' : '주문하기'
    });
    if(!isObject(PAGE_INFO.myorderPageTemplate)) {
        PAGE_INFO.myorderPageTemplate = {
            myOrderNeedTemplate: Template7.compile($$('script[id="my-order-need-template"]').html()), // 처리메세지
            myOrderPBarTemplate: Template7.compile($$('script[id="my-order-progressbar-template"]').html()), // 요금산정 60초
            myOrderTimeoutTemplate: Template7.compile($$('script[id="my-order-timeout-template"]').html()), // 시간초과
            myOrderToolbarTemplate: Template7.compile($$('script[id="my-order-toolbar-template"]').html()), // 이전|다음
        }
        for(var i = 0; i <= 4; i++) {
            PAGE_INFO.myorderPageTemplate['myOrder' + i + 'Template'] = 
                Template7.compile($$('script[id="my-order-' + i + '-template"]').html());
        }
    }
    // 보내기/찾아오기/타지역 설정
    $$('.panel.panel-right .list-block li').each(function() {
        var el = $$(this);
        el.find('.item-after').remove();
        if(el.index() === 0) {
            el.find('.item-inner').append('<div class="item-after"><span class="badge">선택</span></div>');
        }
    });
    // 탭 설정
    var tabbar = $$('[data-page="myorder"] .toolbar.tabbar .toolbar-inner');
    var tabs = $$('[data-page="myorder"] .page-content .tabs-swipeable-wrap .tabs');
    ['문서수발', '출발지', '도착지', '배송입력', '접수/요금'].forEach(function(name, index) {
        if(index == 0 && PAGE_INFO.myorderPageInfo.in_site_type_gbn == 'NR') {
            return false;
        }
        PAGE_INFO.myorderPageInfo.toolbarBottomNames.push(name); // 이전|다음 이름설정
        var active = index == 1 ? ' active' : '';
        // tabbar.append(`<a href="#myorder-tab${index}" class="tab-link${active}">${name}</a>`);
        tabbar.append('<a href="#myorder-tab' + index + '" class="tab-link' + active + '">' + name + '</a>');
        // tabs.append(`<div id="myorder-tab${index}" class="page-content tab${active}" style="padding-top: 36px;"></div>`);        
        tabs.append('<div id="myorder-tab' + index + '" class="page-content tab' + active + '" style="padding-top: 36px;"></div>');        
    });
    // 템플릿 내용 설정
    if(PAGE_INFO.myorderPageInfo.in_site_type_gbn == 'BD') {
        // 문서수발 및 기본선택[택배]
        html = PAGE_INFO.myorderPageTemplate.myOrder0Template(getCommonGBN('605'));
        $$('[data-page="myorder"] div#myorder-tab0').html(html).find('a').each(function() {
            var el = $$(this);
            // el.find('.item-after').remove();
            var code = el.data('code');
            if(code == '사내') {
                // el.find('.item-inner').append('<div class="item-after"><span class="badge">선택</span></div>');
                el.css({
                    backgroundColor: $$('meta[name="theme-color"]').attr('content'),
                    color: 'white',
                }).find('.item-after').css({
                    color: 'white'
                });
                $$('[data-page="myorder"] input[name="custtab0_doc_subal_gbn"]').val(code);
                PAGE_INFO.myorderPageInfo.in_site_type_func = 'BD01';
            }
        });
    }
});

myApp.onPageInit('myorder', function(page) {
    // 제목 설정
    $$('[data-page="myorder"] .navbar .navbar-inner div.center').eq(1).text(PAGE_INFO.myorderPageInfo.pageTitle);
    // 탭 내용 설정
    var html = PAGE_INFO.myorderPageTemplate.myOrder1Template(CUST_INFO.itemData);
    $$('[data-page="myorder"] div#myorder-tab1').html(html); // 출발지
    html = PAGE_INFO.myorderPageTemplate.myOrder2Template({});
    $$('[data-page="myorder"] div#myorder-tab2').html(html); // 도착지
    html = PAGE_INFO.myorderPageTemplate.myOrder3Template({});
    $$('[data-page="myorder"] div#myorder-tab3').html(html); // 배송입력
    html = PAGE_INFO.myorderPageTemplate.myOrderNeedTemplate({});
    $$('[data-page="myorder"] div#myorder-tab4').html(html); // 접수/요금 [필수입력]
    // 툴바 설정
    html = PAGE_INFO.myorderPageTemplate.myOrderToolbarTemplate();
    $$('[data-page="myorder"] .toolbar.toolbar-bottom > .toolbar-inner').html(html);
    // '사내' => 요금구분/배송수단/운행형태/탁송경유/운행구분 숨김처리
    if(PAGE_INFO.myorderPageInfo.in_site_type_gbn == 'BD') {
        $$('[data-page="myorder"] div[id="myorder-tab3"] .list-block li.doc-subal-not-item').hide();
    }
    // 이전|다음 호출
    setToolbarBottomNames();
    // favorite saerch
    getFavoriteAutoComplete({opener: '[data-page="myorder"] a[id="custtab1_favorite"]', pageTitle: PAGE_INFO.myorderPageInfo.pageTitle, changeCallback: function(autocomplete, value) {
        setMyOrderFavorite(value, 1); 
    }});
    getFavoriteAutoComplete({opener: '[data-page="myorder"] a[id="custtab2_favorite"]', pageTitle: PAGE_INFO.myorderPageInfo.pageTitle, changeCallback: function(autocomplete, value) {
        setMyOrderFavorite(value, 2); 
    }});
    // picker datetime
    getDateTimePicker({
        input: '[data-page="myorder"] input[name="custtab3_reserve_dttm"]',
        minInterval: ['00', '30']
    });
    // dong saerch
    getDongAutoComplete({opener: '[data-page="myorder"] input[name="custtab1_full_addr"]', pageTitle: PAGE_INFO.myorderPageInfo.pageTitle, changeCallback: function(autocomplete, value) {
        setMyOrderDong(value, 1);
    }});
    getDongAutoComplete({opener: '[data-page="myorder"] input[name="custtab2_full_addr"]', pageTitle: PAGE_INFO.myorderPageInfo.pageTitle, changeCallback: function(autocomplete, value) {
        setMyOrderDong(value, 2);
    }});
});

function setMyOrderFavorite(value, tab) {
    var favorite = $$.isArray(value) ? value[0] : value;
    favorite.f_name = favorite.f_num ? favorite.f_name : favorite.f_name.replace('[내정보] ', '');
    $$('[data-page="myorder"] input[name="custtab' + tab + '_name"]').val(defaultString(favorite.f_name));
    $$('[data-page="myorder"] input[name="custtab' + tab + '_depart_name"]').val(defaultString(favorite.f_depart_name));
    $$('[data-page="myorder"] input[name="custtab' + tab + '_person_name"]').val(defaultString(favorite.f_person_name));
    $$('[data-page="myorder"] input[name="custtab' + tab + '_tel"]').val(defaultString(favorite.f_tel));
    $$('[data-page="myorder"] input[name="custtab' + tab + '_hphone"]').val(defaultString(favorite.f_hphone));
    $$('[data-page="myorder"] input[name="custtab' + tab + '_sido"]').val(defaultString(favorite.f_sido));
    $$('[data-page="myorder"] input[name="custtab' + tab + '_gugun"]').val(defaultString(favorite.f_gugun));
    $$('[data-page="myorder"] input[name="custtab' + tab + '_dong"]').val(defaultString(favorite.f_dong));
    $$('[data-page="myorder"] input[name="custtab' + tab + '_full_addr"]').val(defaultString(favorite.f_full_addr));
    $$('[data-page="myorder"] input[name="custtab' + tab + '_lati"]').val(defaultString(favorite.f_lati));
    $$('[data-page="myorder"] input[name="custtab' + tab + '_longi"]').val(defaultString(favorite.f_longi));
    $$('[data-page="myorder"] input[name="custtab' + tab + '_dong_num"]').val(defaultString(favorite.f_dong_num));
    if(tab == 1) $$('[data-page="myorder"] input[name="custtab' + tab + '_pickup_place"]').val(defaultString(favorite.f_pickup_place));
    $$('[data-page="myorder"] input[name="custtab' + tab + '_addr_detail"]').val(defaultString(favorite.f_addr_detail));
}

function setMyOrderDong(value, tab) {
    var dong = $$.isArray(value) ? value[0] : value;
    $$('[data-page="myorder"] input[name="custtab' + tab + '_sido"]').val(dong.f_sido);
    $$('[data-page="myorder"] input[name="custtab' + tab + '_gugun"]').val(dong.f_gugun);
    $$('[data-page="myorder"] input[name="custtab' + tab + '_dong"]').val(dong.f_dong);
    $$('[data-page="myorder"] input[name="custtab' + tab + '_full_addr"]').val(dong.f_full_addr);
    $$('[data-page="myorder"] input[name="custtab' + tab + '_lati"]').val(dong.f_lati);
    $$('[data-page="myorder"] input[name="custtab' + tab + '_longi"]').val(dong.f_longi);
}

myApp.onPageBack('myorder', function(page) {
    CUST_INFO.indicator = true; // indicator
    CUST_INFO.myReceiveNew = undefined;
    PAGE_INFO.myorderPageInfo = undefined;
    if(PAGE_INFO.myorderPagePolling) {
        // myApp.confirm('현재 요금산정중입니다. 나가시겠습니까?', function() {
            PAGE_INFO.myorderPagePolling.stop();
        // });
    }
});

// 이벤트 핸들러 custtab0_doc_subal_gbn_sub
function onChangeDocSubalGbnSub(el) {
    myApp.showTab('#myorder-tab1'); // 출발지
}

$$(document).on('click', '[data-page="myorder"] a[id="custtab1_favnew"], [data-page="myorder"] a[id="custtab2_favnew"]', function() {
    var custtab = this.id.slice(0, 9);
    var params = {
        title: {}
    }
    $$('[data-page="myorder"] input[name^="' + custtab + '"]').each(function() {
        var el = $$(this),
            title = el.parent().prev().text(),
            required = el.hasClass('item-required');
        var name = this.name.slice(9),
            tab = custtab.slice(4, 8);
        var key = 'in_' + name;
        var category = $$('[data-page="myorder"] a[href="#myorder-' + tab + '"]').text();
        params[key] = el.val();
        if(required) {
            params.title[key] = '[' + category + '] 의 ' + ' <b style="color: red;">' + title + '</b>';
        }
    });
    // 검수
    var invalid_key = Object.keys(params).find(function(key) {
        return params.title[key] !== undefined && params[key].trim().length < 1;
    });
    if(invalid_key !== undefined) {
        myApp.modal({
            title: PAGE_INFO.myorderPageInfo.pageTitle,
            text: '해당 ' + params.title[invalid_key] + ' 항목은 <b style="color: red;">필수항목</b> 입니다.',
            buttons: [{ text: 'OK', onClick: function() {} }]
        });
        return false;
    }
    delete params.title;
    // save
    myApp.confirm('내거래처를 등록하시겠습니까?', function() {
        // new
        getJSON('myFavoriteNew', Object.assign({
            in_cust_num: CUST_INFO.itemData.f_num
        }, params), function(data) {
            myApp.alert('내거래처를 등록하였습니다.', function() {
                //
            });
        });
    }, function() {
        // Cancel
    });
});

$$(document).on('click', '[data-page="myorder"] .toolbar.toolbar-bottom > .toolbar-inner > a.link', function() {
    var tab = $$('[data-page="myorder"] a.tab-link');
    var tab_length = tab.length - 1;
    var tabidx = $$('[data-page="myorder"] a.tab-link.active').index();
    var idx = $$(this).index();
    switch(tabidx) {
        case 0:
            if(idx === 0) {
                return false;
            } else if(idx === 1) {
                tabidx++;
            }
            break;
        case tab_length:
            if(idx === 0) {
                tabidx--;
            } else if(idx === 1) {
                return false;
            }
            break;
        default: 
            if(idx === 0) {
                tabidx--;
            } else if(idx === 1) {
                tabidx++;
            }
            break;
    }
    if(tabidx < 0) tabidx = 0;
    if(tabidx > tab.length) tabidx = tab_length;
    myApp.showTab('#myorder-tab' + (tabidx + (PAGE_INFO.myorderPageInfo.in_site_type_gbn == 'BD' ? 0 : 1)));
    // 이전|다음 호출
    setToolbarBottomNames();
});

$$(document).on('tab:show', '[data-page="myorder"] div[id^="myorder-tab"]', function() {
    var idx = $$(this).index();
    $$('[data-page="myorder"] div#myorder-tab' + (idx + (PAGE_INFO.myorderPageInfo.in_site_type_gbn == 'BD' ? 0 : 1)) + '.page-content.tab').scrollTop(0);
    setToolbarBottomNames(idx);
});

// 이전|다음
function setToolbarBottomNames(idx) {
    var active = idx != undefined ? idx : $$('[data-page="myorder"] .toolbar.tabbar .toolbar-inner').find('a.active').index();
    var toolbar = $$('[data-page="myorder"] .toolbar.toolbar-bottom > .toolbar-inner > a.link');
    if(active == 0) {
        toolbar.eq(0).html('');
        toolbar.eq(1).html(PAGE_INFO.myorderPageInfo.toolbarBottomNames[active + 1]);
    } else if(active == PAGE_INFO.myorderPageInfo.toolbarBottomNames.length - 1) {
        toolbar.eq(0).html(PAGE_INFO.myorderPageInfo.toolbarBottomNames[active - 1]);
        toolbar.eq(1).html('');
    } else {
        toolbar.eq(0).html(PAGE_INFO.myorderPageInfo.toolbarBottomNames[active - 1]);
        toolbar.eq(1).html(PAGE_INFO.myorderPageInfo.toolbarBottomNames[active + 1]);
    }    
}

// 문서수발
$$(document).on('click', '[data-page="myorder"] div#myorder-tab0 a.item-link', function() {
    if(PAGE_INFO.myorderPageInfo.in_site_type_gbn == 'BD') {
        // 모두 지우고
        $$('[data-page="myorder"] div#myorder-tab0 a').each(function() {
            $$(this).css({
                backgroundColor: 'rgba(0, 0, 0, 0)',
                color: 'rgb(33, 33, 33)'
            }).find('.item-after').css({
                color: 'rgb(117, 117, 117)'
            });
            // $$(this).find('.item-after').remove();
        });
        // 선택 설정
        var el = $$(this);
        var code = el.data('code');
        // el.find('.item-inner').append('<div class="item-after"><span class="badge">선택</span></div>');
        el.css({
            backgroundColor: $$('meta[name="theme-color"]').attr('content'),
            color: 'white',
        }).find('.item-after').css({
            color: 'white'
        });
        $$('[data-page="myorder"] input[name="custtab0_doc_subal_gbn"]').val(code);
        PAGE_INFO.myorderPageInfo.in_site_type_func = (code == '퀵' || code == '화물') ? 'NR01' : 'BD01';
        if(code != '우편') { // 우편이 아니면 자동으로...,
            myApp.showTab('#myorder-tab1'); // 출발지
        }
        // 화물이면 차량수단에서는 차량에 해당하는 항목만 표시하도록...,
        $$('[data-page="myorder"] div[id="myorder-tab3"] .list-block li.doc-subal-not-item').hide();
        var tab3Item = true;
        if(code == '퀵') {
            var options = $$('[data-page="myorder"] select[name="custtab3_car_type"]').find('option');
            options.each(function() {
                var el = $$(this);
                switch(el.attr('value')) {
                    case '오토': // 여기서 한번만 실행하도록...,
                        el.prop('selected', true);
                        options.parent().next().find('.item-after').text(el.attr('value'));
                    default: 
                        el.prop('disabled', false);
                        break;
                }
            });
        } else if(code == '화물') {
            var sub = $$('[data-page="myorder"] select[name="custtab3_car_sub_type1"]').parent().parent().hide();
            sub.find('option').eq(0).prop('selected', true);
            sub.find('.item-after').text('미정');
            var sub = $$('[data-page="myorder"] select[name="custtab3_car_sub_type2"]').parent().parent().hide();
            sub.find('option').eq(0).prop('selected', true);
            sub.find('.item-after').text('미정');
            var options = $$('[data-page="myorder"] select[name="custtab3_car_type"]').find('option');
            options.each(function() {
                var el = $$(this);
                switch(el.attr('value')) {
                    case '다마': // 여기서 한번만 실행하도록...,
                        el.prop('selected', true);
                        options.parent().next().find('.item-after').text(el.attr('value'));
                    case '라보':
                    case '밴':
                    case '트럭':
                        el.prop('disabled', false);
                        break;
                    default: 
                        el.prop('disabled', true);
                }
            });
        } else { // 퀵|화물이 아니면...,
            tab3Item = false;
        }
        // 요금구분/배송수단/운행형태/탁송경유/운행구분 숨김처리
        $$('[data-page="myorder"] div[id="myorder-tab3"] .list-block a[href="#"]').each(function() {
            var title = $$(this).find('.item-title').text();
            switch(title) {
                case '요금구분':
                case '배송수단':
                case '운행형태':
                case '탁송경유':
                case '운행구분':
                    $$(this).parent()[tab3Item ? 'show' : 'hide']();
                    break;
            }
        });
    }
});

// input 포커스 처리
$$(document).on('click', '[data-page="myorder"] input[type="text"]', function(e) {
    e.stopPropagation();
    var el = $$(this);
    if(!el.prop('readonly')) {
        var value = el.val();
        el.focus().val(value);
    };
});

// 차량
$$(document).on('change', '[data-page="myorder"] select[name="custtab3_car_type"]', function() {
    var custtab3_car_sub_type1 = $$('[data-page="myorder"] select[name="custtab3_car_sub_type1"]');
    var custtab3_car_sub_type2 = $$('[data-page="myorder"] select[name="custtab3_car_sub_type2"]');
    var custtab3_car_sub_type1_li = custtab3_car_sub_type1.parent().parent();
    var custtab3_car_sub_type2_li = custtab3_car_sub_type2.parent().parent();
    var car_type = this.value;
    custtab3_car_sub_type1_li.hide();
    custtab3_car_sub_type2_li.hide();
    if(car_type == '밴' || car_type == '트럭') {
        custtab3_car_sub_type1_li.find('.item-title').text('밴 차종');
        custtab3_car_sub_type1.html(getOptions(car_type == '트럭' ? '104' : '103', '101', '미정'));
        custtab3_car_sub_type1_li.show();
        if(car_type == '트럭') {
            custtab3_car_sub_type1_li.find('.item-title').text('트럭 중량');
            custtab3_car_sub_type2_li.find('.item-title').text('트럭 차종');
            custtab3_car_sub_type2.html(getOptions('104', '102', '미정'));
            custtab3_car_sub_type2_li.show();
        }
    }
});

// 예약설정
$$(document).on('change', '[data-page="myorder"] input[name="custtab3_reserve_yn"]', function() {
    $$(this).closest('li').next()[$$(this).prop('checked') ? 'show' : 'hide']();
});

// 배송신청
$$(document).on('click', '[data-page="myorder"] a[id="custnew"]', function() {
    var params = {
        in_site_type_gbn: PAGE_INFO.myorderPageInfo.in_site_type_gbn, /* 배송업무구분 */
        in_site_type_func: PAGE_INFO.myorderPageInfo.in_site_type_func, /* 배송업무기능 */
        title: {}
    };
    $$('[data-page="myorder"] input[name^="custtab"], [data-page="myorder"] select[name^="custtab"], [data-page="myorder"] textarea[name^="custtab"]').each(function() {
        var el = $$(this),
            title = el.parent().prev().text(),
            required = el.hasClass('item-required');
        var custtab = this.name.slice(0, 9),
            name = this.name.slice(9),
            tab = custtab.slice(4, 8);
        var category, key;
        switch(custtab) {
            case 'custtab0_': // 문서수발
                key = 'in_' + name;
                break;
            case 'custtab1_': // 출발지
                key = 'in_start_' + name;
                break;
            case 'custtab2_': // 도착지
                key = 'in_end_' + name;
                break;
            case 'custtab3_': // 배송입력
                key = 'in_' + name;
                break;
        }
        if(el.attr('type') == 'checkbox') {
            params[key] = el.prop('checked') ? 'Y' : 'N';
        } else if(this.tagName.toLowerCase() == 'select') {
            title = el.data('title');
            params[key] = el.val();
            if(isArray(params[key])) {
                params[key] = params[key].join(', ');
            }
        } else {
            params[key] = this.value; // el.val();
        }
        category = $$('[data-page="myorder"] a[href="#myorder-' + tab + '"]').text();
        if(required) {
            if(params.in_site_type_gbn == 'BD' && custtab == 'custtab2_'
                && (params.in_doc_subal_gbn != '퀵' && params.in_doc_subal_gbn != '화물')) { 
                // 퀵&&화물(일반)이 아니면 도착지 정보는 필수체크 제외됨
            } else {
                params.title[key] = '[' + category + '] 의 ' + ' <b style="color: red;">' + title + '</b>';
            }
        }
    });
    // 2차 확인
    Object.keys(params).find(function(key) {
        switch(key) {
            case 'in_doc_subal_gbn': // 문서수발
                if(params[key] != '우편') {
                    params['in_doc_subal_gbn_sub'] = '';
                }
                break;
            case 'in_car_type': // 배송수단
                if(params[key] != '밴' && params[key] != '트럭') {
                    params['in_car_sub_type1'] = '';
                    params['in_car_sub_type2'] = '';
                }
                break;
            case 'in_reserve_yn': // 예약설정
                if(params[key] != 'Y') {
                    params['in_reserve_dttm'] = '';
                }
                break;
        }
    });
    // 3차 검수
    var invalid_key = Object.keys(params).find(function(key) {
        return params.title[key] !== undefined && params[key].trim().length < 1;
    });
    if(invalid_key !== undefined) {
        myApp.modal({
            title: PAGE_INFO.myorderPageInfo.pageTitle,
            text: '해당 ' + params.title[invalid_key] + ' 항목은 <b style="color: red;">필수항목</b> 입니다.',
            buttons: [{ text: 'OK', onClick: function() {} }]
        });
        return false;
    }
    delete params.title;
    // save
    window.localStorage.setItem('myReceiveNew', JSON.stringify({
        __timestamp__: Date.now(),
        params: params
    }));
    // get customer new receive info
    getJSON('myReceiveNew', Object.assign({
        in_cust_num: CUST_INFO.itemData.f_num,
        in_id: CUST_INFO.itemData.f_id
    }, params), function(data) {
        // setting
        CUST_INFO.myReceiveNew = data;
        // input 비활성화
        $$('[data-page="myorder"] div#myorder-tab0 .list-block a').attr('disabled', 'disabled'); // 문서수발
        $$('[data-page="myorder"] input, [data-page="myorder"] select, [data-page="myorder"] textarea').prop('disabled', true); // 그외
        // 접수/요금
        myApp.alert('의뢰하신 배송정보로 신청되었습니다.', function() {
            $$('[data-page="myorder"] a[id="custnew"]').parent().empty(); // 배송신청 버튼 DOM 삭제
            var html = PAGE_INFO.myorderPageTemplate.myOrderPBarTemplate({});
            $$('[data-page="myorder"] div#myorder-tab4').html(html); // 접수/요금
            myApp.showTab('#myorder-tab4');
            PAGE_INFO.myorderPagePollingTimer = 0;
            PAGE_INFO.myorderPagePolling = myReceivePollymer({ in_receive_num: CUST_INFO.myReceiveNew.f_num }, function(data) {
                PAGE_INFO.myorderPagePollingTimer += PAGE_INFO.myorderPagePollingInterval;
                if(PAGE_INFO.myorderPagePollingTimer > 60 || data.f_status == '요금산정') {
                    if(PAGE_INFO.myorderPagePolling) PAGE_INFO.myorderPagePolling.stop();
                    var html = data.f_status == '요금산정'
                        ? PAGE_INFO.myorderPageTemplate.myOrder4Template(data)
                        : PAGE_INFO.myorderPageTemplate.myOrderTimeoutTemplate({});
                    $$('[data-page="myorder"] div#myorder-tab4').html(html); // 접수/요금
                    myApp.showTab('#myorder-tab4'); // 아니면 강제 탭 이동으로...,
                }
            });
        });
    });
});

// 접수/요금 풀링
function myReceivePollymer(params, successCallback) {
    CUST_INFO.indicator = false; // indicator
    var polling = AsyncPolling(function(end) {
        getJSON('myReceive', Object.assign({
            in_cust_num: CUST_INFO.itemData.f_num,
            in_id: CUST_INFO.itemData.f_id
        }, params), function(data) {
            end(null, data);
        }, function() {
            end('의뢰하신 배송신청에 대한 요금산정 조회가 실패되었습니다.');
        });
    }, PAGE_INFO.myorderPagePollingInterval * 1000); // 초단위
    polling.on('error', function(error) {
        // ...,
    });
    polling.on('result', function(result) {
        if(typeof successCallback == 'function') successCallback(result);
    });
    polling.run();
    return polling;
}

// 접수/대기접수/취소
$$(document).on('click', '[data-page="myorder"] a[id="custconfirm"], [data-page="myorder"] a[id="custwait"], [data-page="myorder"] a[id="custcancel"]', function() {
    if(isObject(CUST_INFO.myReceiveNew) && 'f_num' in CUST_INFO.myReceiveNew) {
        var title = $$(this).text();
        var params = { in_receive_num: CUST_INFO.myReceiveNew.f_num };
        switch(this.id) {
            case 'custconfirm':
                params.in_status = 'STATUS_OK'; // 접수
                title = '<b>' + title + '</b>';
                break;
            case 'custwait':
                title = '<b>' + title + '</b>';
                params.in_status = 'STATUS_SKIP'; // 대기접수
                break;
            case 'custcancel':
                params.in_status = 'STATUS_CANCEL'; // 취소
                title = '<b style="color: red;">' + title + '</b>';
                break;
        }
        getJSON('myReceiveUpdate_2', Object.assign({
            in_cust_num: CUST_INFO.itemData.f_num,
            in_id: CUST_INFO.itemData.f_id
        }, params), function(data) {
            myApp.alert('의뢰하신 [배송신청] 건은 ' + title + ' 처리되었습니다.', function() {
                // back
                mainView.router.back({url: 'index.html'});
            });
        });
    } else {
        // SKIP!!!
    }
});

// 설정하기 data-page="settings"
myApp.onPageInit('settings', function(page) {
    if(!isObject(PAGE_INFO.settingsPageTemplate)) {
        PAGE_INFO.settingsPageTemplate = {
            settingsSiteTypeTemplate: Template7.compile($$('script[id="settings-site-type-template"]').html())
        }
    }
    $$('[data-page="settings"] .list-block').removeClass('inputs-list');
    // common => 배송업무구분
    getCommon('601', null, function(data) {
        var html = PAGE_INFO.settingsPageTemplate.settingsSiteTypeTemplate(data);
        $$('[data-page="settings"] div.list-block').eq(1).html(html);
        $$('[data-page="settings"] input[name="custsms11"]').prop('checked', CUST_INFO.itemData.f_sms11 === 'Y');
        $$('[data-page="settings"] input[name="custsms13"]').prop('checked', CUST_INFO.itemData.f_sms13 === 'Y');
        // cust site-type-gbn
        var in_gbn = CUST_INFO.itemData.f_site_type_gbn;
        $$('[data-page="settings"] input[value="' + in_gbn +'"]').prop('checked', true);
    });
});

myApp.onPageBeforeRemove('settings', function(page) {
    var params = {
        in_sms11: $$('[data-page="settings"] input[name="custsms11"]').prop('checked') ? 'Y' : 'N',
        in_sms13: $$('[data-page="settings"] input[name="custsms13"]').prop('checked') ? 'Y' : 'N',
        in_site_type_gbn: $$('[data-page="settings"] input[name="custsite_type_gbn"]:checked').val()
    }
    if(CUST_INFO.itemData.f_sms11 == params.in_sms11
        && CUST_INFO.itemData.f_sms13 == params.in_sms13
        && CUST_INFO.itemData.f_site_type_gbn == params.in_site_type_gbn) {
        return false;
    }
    // setting menu
    if(CUST_INFO.itemData.f_site_type_gbn != params.in_site_type_gbn) {
        CUST_INFO.itemData.f_site_type_gbn = params.in_site_type_gbn;
        setMenuTemplate();
    }
    // sync
    CUST_INFO.indicator = false;
    getJSON('settings', Object.assign({
        in_num: CUST_INFO.itemData.f_num,
        in_id: CUST_INFO.itemData.f_id
    }, params), function(data) {
        // setting
        CUST_INFO.itemData = data[0];
        // save
        window.localStorage.setItem(CUST_INFO.itemKey, JSON.stringify(CUST_INFO.itemData));
        CUST_INFO.indicator = true;
    }, function() {
        CUST_INFO.indicator = true;
    });
});

// 조회하기 data-page="mylist"
myApp.onPageInit('mylist', function(page) {
    if(!isObject(PAGE_INFO.mylistPageTemplate)) {
        PAGE_INFO.mylistPageTemplate = {
            myListTemplate: Template7.compile($$('script[id="my-list-template"]').html()),
            myListNotFoundTemplate: Template7.compile($$('script[id="my-list-not-found-template"]').html()),
            myDetailTemplate: Template7.compile($$('script[id="my-detail-template"]').html())
        }
    }
    var today = Date.now();
    // 캘린더(일정표) 설정
    var myListCalendar = myApp.calendar({
        input: '[data-page="mylist"] .search-range-datepicker',
        closeByOutsideClick: false,
        rangePicker: true,
        value: [today, today],
        onChange: function(p, values, displayValues) {},
        onClose: function(p) {
            var today = Date.now();
            var values = p.value;
            if(p.value.length < 1) {
                values = [today, today];
            } else if(p.value.length < 2) {
                // values = [Math.min(p.value[0], today), Math.max(p.value[0], today)];
                values = [p.value[0], p.value[0]];
            }
            p.setValue(values);
            // 날짜 범위 설정
            $$('[data-page="mylist"] input[name="in_start_dttm"]').val(formatDate(p.value[0], p));
            $$('[data-page="mylist"] input[name="in_end_dttm"]').val(formatDate(p.value[1], p));
            // 조회하기 [목록] 호출
            getMyList(getMyListParams({}), false);
        }
    });
    var todayFormat = formatDate(today, myListCalendar);
    // 날짜 범위 설정
    $$('[data-page="mylist"] input[name="in_start_dttm"]').val(todayFormat);
    $$('[data-page="mylist"] input[name="in_end_dttm"]').val(todayFormat);
    // 조회하기 [목록] 호출
    getMyList(getMyListParams({}), false);
});

// 상세보기 [배송신청] data-page="mylist"
$$(document).on('click', '.popup-order-detail a[id="custmyreorder"]', function() {
    myApp.confirm('동일 주문으로 다시 배송신청 하시겠습니까?', function() {
        var rnum = $$('.popup-order-detail div.my-order-num').data('rnum');
        var rdata = Object.assign({}, PAGE_INFO.mylistPageData.find(function(data) {
            return rnum != undefined && data.f_num == rnum;
        }));
        // 예약문제 및 접수/종료시에만 가능한지?...,
        // myApp.alert(`[원본: ${rnum}] 가상으로만 배송신청 처리되었습니다.`);
        myApp.alert('[원본: ' + rnum + '] 가상으로만 배송신청 처리되었습니다.');
        //if(isObject(rdata) && rdata.f_status) {
        //}
        // get customer new receive info
        getJSON('myReceiveReNew', Object.assign({
            in_cust_num: CUST_INFO.itemData.f_num,
            in_id: CUST_INFO.itemData.f_id,
            in_receive_num: rnum
        }, params), function(data) {
            // Todo
        });
    }, function() {
        // Cancel
    });
});

// 조회하기 [끌어다시보기] data-page="mylist"
$$(document).on('ptr:refresh', '[data-page="mylist"] .pull-to-refresh-content.mylist-pull-content', function() {
    getMyList(getMyListParams(PAGE_INFO.mylistPageParams), true);
});

// 조회하기 [이전|다음] data-page="mylist"
$$(document).on('click', '[data-page="mylist"] .toolbar-bottom a.link', function() {
    var data = PAGE_INFO.mylistPageData || [];
    var params = PAGE_INFO.mylistPageParams || { in_page: 1 };
    var idx = $$(this).index();
    if(idx < 1) {
        // prev
        params.in_page--;
        if(params.in_page < 1) params.in_page = 1;
    } else {
        // next
        params.in_page++;
        if(params.in_page >= params.in_total_pages) params.in_page = params.in_total_pages;
    }
    // 조회하기 [목록] 호출
    getMyList(getMyListParams(params), false);
});

function getMyListParams(params) {
    if(!isObject(params)) params = {};
    if(!params.in_page) params.in_page = 1;
    if(!params.in_total_pages) params.in_total_pages = 1;
    params.in_sdttm = $$('[data-page="mylist"] input[name="in_start_dttm"]').val().replace(/-/g, '');
    params.in_edttm = $$('[data-page="mylist"] input[name="in_end_dttm"]').val().replace(/-/g, '');
    return params;
}

// 조회하기 [목록] data-page="mylist"
function getMyList(params, pullToRefresh) {
    // get mylist info
    if(CUST_INFO.loggedIn && isObject(CUST_INFO.itemData)) {
        getJSON('myList', Object.assign({}, {
            in_cust_num: CUST_INFO.itemData.f_num
        }, params), function(data, params) {
            // setting
            PAGE_INFO.mylistPageData = $$.isArray(data) ? data : [];
            PAGE_INFO.mylistPageParams = isObject(params) ? params : {};
            var html = PAGE_INFO.mylistPageTemplate[data.length > 0 ? 'myListTemplate' : 'myListNotFoundTemplate'](data);
            $$('[data-page="mylist"] .page-mylist-template-content').html(html);
            $$('[data-page="mylist"] .page-content').scrollTop(0, 200);
            // myApp[data.length > 0 ? 'showToolbar' : 'hideToolbar']('[data-page="mylist"] .toolbar-bottom');
            // $$('[data-page="mylist"] div[id="my-list-paging-info"]').html(`
            //     <span>${params.in_page} / ${params.in_total_pages}</span>
            // `);
            $$('[data-page="mylist"] div[id="my-list-paging-info"]').html('<span>' + params.in_page + ' / ' + params.in_total_pages + '</span>');
            // 버그? 높이 맞추기
            var pageEl = $$('[data-page="mylist"] .page-content');
            pageEl.eq(1).css('height', pageEl.eq(0).height() + $$('[data-page="mylist"] .searchbar').height() + 'px');
            if(pullToRefresh) myApp.pullToRefreshDone();
        }, function() {
            PAGE_INFO.mylistPageData = [];
            PAGE_INFO.mylistPageParams = isObject(params) ? params : {};
            var html = PAGE_INFO.mylistPageTemplate.myListNotFoundTemplate([]);
            $$('[data-page="mylist"] .page-mylist-template-content').html(html);
            // myApp.hideToolbar('[data-page="mylist"] .toolbar-bottom');
            $$('[data-page="mylist"] div[id="my-list-paging-info"]').html('&nbsp;');
            if(pullToRefresh) myApp.pullToRefreshDone();
        });
    } else {
        if(pullToRefresh) myApp.pullToRefreshDone();
    }
}

// 상세보기 data-page="mylist"
$$(document).on('click', '[data-page="mylist"] li .item-content', function() {
    var rnum = $$(this).data('rnum');
    var rdata = Object.assign({}, PAGE_INFO.mylistPageData.find(function(data) {
        return rnum != undefined && data.f_num == rnum;
    }));
    // get order-detail info
    getJSON('orderDetail', { 
        in_cust_num: CUST_INFO.itemData.f_num,
        in_receive_num: rnum
     }, function(data) {
        rdata['PASS'] = [];
        if($$.isArray(data)) {
            data.forEach(function(row) {
                var obj = {
                    f_cust_name: row.f_cust_name,
                    f_tel: row.f_tel,
                    f_sido: row.f_sido,
                    f_gugun: row.f_gugun,
                    f_dong: row.f_dong,
                    f_dong_num: row.f_dong_num,
                    f_pickup_place: row.f_pickup_place,
                    f_addr_detail: row.f_addr_detail
                }
                switch(row.f_cust_gbn) {
                    case 'PASS':
                        rdata[row.f_cust_gbn].push(obj);
                        break;
                    default:
                        rdata[row.f_cust_gbn] = obj;
                    break;
                }
            });
        }
        if(rdata['PASS'].length < 1) delete rdata['PASS'];
        var html = PAGE_INFO.mylistPageTemplate.myDetailTemplate(rdata);
        myApp.popup('.popup-order-detail');
        $$('.popup-order-detail .page-content').scrollTop(0).html(html);
    });
});

// 내거래처 data-page="myfavorites"
myApp.onPageInit('myfavorites', function(page) {
    if(!isObject(PAGE_INFO.myfavoritesPageTemplate)) {
        PAGE_INFO.myfavoritesPageTemplate = {
            myFavoritesTemplate: Template7.compile($$('script[id="my-favorites-template"]').html()),
            myFavoritesNotFoundTemplate: Template7.compile($$('script[id="my-favorites-not-found-template"]').html()),
            myFavoritesDetailTemplate: Template7.compile($$('script[id="my-favorites-detail-template"]').html())
        }
    }
    getMyFavorites(getMyFavoritesParams({}), false);
});

function getMyFavoritesParams(params) {
    if(!isObject(params)) params = {};
    if(!params.in_page) params.in_page = 1;
    if(!params.in_total_pages) params.in_total_pages = 1;
    return params;
}

// 조회하기 [목록] data-page="myfavorites"
function getMyFavorites(params, pullToRefresh) {
    // get myfavorites info
    if(CUST_INFO.loggedIn && isObject(CUST_INFO.itemData)) {
        getJSON('myFavorite', Object.assign({}, {
            in_cust_num: CUST_INFO.itemData.f_num
        }, params), function(data, params) {
            // setting
            PAGE_INFO.myfavoritesPageData = $$.isArray(data) ? data : [];
            PAGE_INFO.myfavoritesPageParams = isObject(params) ? params : {};
            var html = PAGE_INFO.myfavoritesPageTemplate[data.length > 0 ? 'myFavoritesTemplate' : 'myFavoritesNotFoundTemplate'](data);
            $$('[data-page="myfavorites"] .page-myfavorites-template-content').html(html);
            $$('[data-page="myfavorites"] .page-content').scrollTop(0, 200);
            // myApp[data.length > 0 ? 'showToolbar' : 'hideToolbar']('[data-page="myfavorites"] .toolbar-bottom');
            // $$('[data-page="myfavorites"] div[id="my-favorites-paging-info"]').html(`
            //     <span>${params.in_page} / ${params.in_total_pages}</span>
            // `);
            $$('[data-page="myfavorites"] div[id="my-favorites-paging-info"]').html('<span>' + params.in_page + ' / ' + params.in_total_pages + '</span>');
            // 버그? 높이 맞추기
            var pageEl = $$('[data-page="myfavorites"] .page-content');
            pageEl.eq(1).css('height', pageEl.eq(0).height() - $$('[data-page="myfavorites"] .toolbar.toolbar-bottom').height() + 'px');
            if(pullToRefresh) myApp.pullToRefreshDone();
        }, function() {
            PAGE_INFO.myfavoritesPageData = [];
            PAGE_INFO.myfavoritesPageParams = isObject(params) ? params : {};
            var html = PAGE_INFO.myfavoritesPageTemplate.myFavoritesNotFoundTemplate([]);
            $$('[data-page="myfavorites"] .page-myfavorites-template-content').html(html);
            // myApp.hideToolbar('[data-page="myfavorites"] .toolbar-bottom');
            $$('[data-page="myfavorites"] div[id="my-favorites-paging-info"]').html('&nbsp;');
            if(pullToRefresh) myApp.pullToRefreshDone();
        });
    } else {
        if(pullToRefresh) myApp.pullToRefreshDone();
    }
}

// 상세보기 data-page="myfavorites"
$$(document).on('click', '[data-page="myfavorites"] li .item-content', function() {
    var rnum = $$(this).data('rnum');
    var rdata = Object.assign({}, PAGE_INFO.myfavoritesPageData.find(function(data) {
        return rnum != undefined && data.f_num == rnum;
    }));
    // get favorite-detail info
    getJSON('favoriteDetail', { 
        in_cust_num: CUST_INFO.itemData.f_num,
        in_num: rnum
     }, function(data) {
        var html = PAGE_INFO.myfavoritesPageTemplate.myFavoritesDetailTemplate(data[0]);
        myApp.popup('.popup-myfavorite-detail');
        $$('.popup-myfavorite-detail .page-content').scrollTop(0).html(html);
        $$('.popup-myfavorite-detail .navbar-inner .center').eq(0).text('내거래처');
        // dong search
        AUTOCOMPLETES.forEach(function(autocomplete) {
            try {
                autocomplete.close();
                autocomplete.destroy();
                autocomplete = null;
            } catch(e) {}
        });
        AUTOCOMPLETES = [];
        getDongAutoComplete({opener: '.popup-myfavorite-detail input[name="custfavfull_addr"]', pageTitle: '내거래처', changeCallback: function(autocomplete, value) {
            var dong = $$.isArray(value) ? value[0] : value;
            $$('.popup-myfavorite-detail input[name="custfavsido"]').val(dong.f_sido);
            $$('.popup-myfavorite-detail input[name="custfavgugun"]').val(dong.f_gugun);
            $$('.popup-myfavorite-detail input[name="custfavdong"]').val(dong.f_dong);
            $$('.popup-myfavorite-detail input[name="custfavfull_addr"]').val(dong.f_full_addr);
            $$('.popup-myfavorite-detail input[name="custfavlati"]').val(dong.f_lati);
            $$('.popup-myfavorite-detail input[name="custfavlongi"]').val(dong.f_longi);
        }});
    });
});

// 조회하기 [끌어다시보기] data-page="myfavorites"
$$(document).on('ptr:refresh', '[data-page="myfavorites"] .pull-to-refresh-content.myfavorites-pull-content', function() {
    getMyFavorites(getMyFavoritesParams(PAGE_INFO.myfavoritesPageParams), true);
});

// 조회하기 [이전|다음] data-page="myfavorites"
$$(document).on('click', '[data-page="myfavorites"] .toolbar-bottom a.link', function() {
    var data = PAGE_INFO.myfavoritesPageData || [];
    var params = PAGE_INFO.myfavoritesPageParams || { in_page: 1 };
    var idx = $$(this).index();
    if(idx < 1) {
        // prev
        params.in_page--;
        if(params.in_page < 1) params.in_page = 1;
    } else {
        // next
        params.in_page++;
        if(params.in_page >= params.in_total_pages) params.in_page = params.in_total_pages;
    }
    // 조회하기 [목록] 호출
    getMyFavorites(getMyFavoritesParams(params), false);
});

// 내거래처 [신규] data-page="myfavorites"
$$(document).on('click', '[data-page="myfavorites"] a[id="custfavnew"]', function() {
    var html = PAGE_INFO.myfavoritesPageTemplate.myFavoritesDetailTemplate({});
    myApp.popup('.popup-myfavorite-detail');
    $$('.popup-myfavorite-detail .page-content').scrollTop(0).html(html);
    $$('.popup-myfavorite-detail .navbar-inner .center').eq(0).text('내거래처 - 신규');
    // dong search
    AUTOCOMPLETES.forEach(function(autocomplete) {
        try {
            autocomplete.close();
            autocomplete.destroy();
            autocomplete = null;
        } catch(e) {}
    });
    AUTOCOMPLETES = [];
    getDongAutoComplete({opener: '.popup-myfavorite-detail input[name="custfavfull_addr"]', pageTitle: '내거래처', changeCallback: function(autocomplete, value) {
        var dong = $$.isArray(value) ? value[0] : value;
        $$('.popup-myfavorite-detail input[name="custfavsido"]').val(dong.f_sido);
        $$('.popup-myfavorite-detail input[name="custfavgugun"]').val(dong.f_gugun);
        $$('.popup-myfavorite-detail input[name="custfavdong"]').val(dong.f_dong);
        $$('.popup-myfavorite-detail input[name="custfavfull_addr"]').val(dong.f_full_addr);
        $$('.popup-myfavorite-detail input[name="custfavlati"]').val(dong.f_lati);
        $$('.popup-myfavorite-detail input[name="custfavlongi"]').val(dong.f_longi);
    }});
});

// 다시작성/취소/확인
$$(document).on('click', '.popup-myfavorite-detail .toolbar-bottom a.link', function() {
    var idx = $$(this).index();
    var myfavorites = $$('.popup-myfavorite-detail input[type="text"], .popup-myfavorite-detail input[type="hidden"]');
    var popup = $$('.popup.popup-myfavorite-detail.modal-in');
    if(idx === 0) {
        // 다시작성
        myfavorites.each(function() {
            this.value = defaultString($$(this).data('value'));
        });
    } else if(idx === 1) {
        // 취소
        if(popup.prop('style') && popup.prop('style').display === 'block') {
            myApp.closeModal(popup);
            $$('.popup-overlay').removeClass('modal-overlay-visible');
        }
    } else if(idx === 2) {
        // 확인
        var rnum = $$('.popup-myfavorite-detail div.my-favorite-num').data('rnum');
        var params = {}
        myfavorites.each(function() {
            params['in_' + this.name.slice(7)] = this.value;
        });
        if(!rnum) {
            myApp.confirm('내거래처를 등록하시겠습니까?', function() {
                // new
                getJSON('myFavoriteNew', Object.assign({
                    in_cust_num: CUST_INFO.itemData.f_num
                }, params), function(data) {
                    myApp.alert('내거래처를 등록하였습니다.', function() {
                        if(popup.prop('style') && popup.prop('style').display === 'block') {
                            myApp.closeModal(popup);
                            $$('.popup-overlay').removeClass('modal-overlay-visible');
                            // reload
                            getMyFavorites(getMyFavoritesParams(PAGE_INFO.myfavoritesPageParams), false);
                        }
                    });
                });
            }, function() {
                // Cancel
            });
        } else {
            myApp.confirm('내거래처를 수정하시겠습니까?', function() {
                // update
                getJSON('myFavoriteUpdate', Object.assign({
                    in_cust_num: CUST_INFO.itemData.f_num,
                    in_num: rnum
                }, params), function(data) {
                    myApp.alert('내거래처를 수정하였습니다.', function() {
                        if(popup.prop('style') && popup.prop('style').display === 'block') {
                            myApp.closeModal(popup);
                            $$('.popup-overlay').removeClass('modal-overlay-visible');
                            // reload
                            getMyFavorites(getMyFavoritesParams(PAGE_INFO.myfavoritesPageParams), false);
                        }
                    });
                });
            }, function() {
                // Cancel
            });
        }
    }
});

// input 포커스 처리
$$(document).on('click', '.popup-myfavorite-detail input[type="text"]', function(e) {
    e.stopPropagation();
    var el = $$(this);
    if(!el.prop('readonly')) {
        var value = el.val();
        el.focus().val(value);
    };
});

// 내정보 data-page="myinfo"
myApp.onPageInit('myinfo', function(page) {
    PAGE_INFO.myinfoPageInfo = Object.assign({}, page, {
        info_gbn: page.query.info_gbn || '', // 기본값
        value: [{
            f_dong: '',
            f_full_addr: '',
            f_gugun: '',
            f_name: '',
            f_num: '',
            f_parent_name: '',
            f_qcomp_num: '',
            f_sido: '',
            f_text: '선택없음'
        }]
    });
    if(!isObject(PAGE_INFO.myinfoPageTemplate)) {
        PAGE_INFO.myinfoPageTemplate = {
            myInfoTemplate: Template7.compile($$('script[id="my-info-template"]').html())
        }
    }
    var html = PAGE_INFO.myinfoPageTemplate.myInfoTemplate({});
    // 신규고객
    if(PAGE_INFO.myinfoPageInfo.info_gbn == 'new') {
        $$('[data-page="myinfo"] .navbar-inner .center').eq(1).text('내정보 - 신규고객');
        $$('[data-page="myinfo"] .toolbar-bottom a.link').eq(2).text('가입');
        // new myinfo
        $$('[data-page="myinfo"] .page-myinfo-template-content').html(html);
        $$('[data-page="myinfo"] input[name="custid"]').removeAttr('readonly'); // 아이디
        $$('[data-page="myinfo"] a[id="custidused"]').show(); // 중복확인
        $$('[data-page="myinfo"] input[name="custcredit_name"]').closest('li').hide(); // 결제구분
        $$('[data-page="myinfo"] input[name="custnum"]').closest('li').hide(); // 고객번호
    } else 
    // 기존고객
    if(PAGE_INFO.myinfoPageInfo.info_gbn == 'old') {
        $$('[data-page="myinfo"] .navbar-inner .center').eq(1).text('내정보 - 기존고객');
        $$('[data-page="myinfo"] .toolbar-bottom a.link').eq(2).text('가입');
        // new myinfo
        $$('[data-page="myinfo"] .page-myinfo-template-content').html(html);
    // 내정보
    } else {
        // get myinfo
        if(CUST_INFO.loggedIn && isObject(CUST_INFO.itemData)) {
            html = PAGE_INFO.myinfoPageTemplate.myInfoTemplate(CUST_INFO.itemData);
        }
        $$('[data-page="myinfo"] .page-myinfo-template-content').html(html);
    }
    /*if(PAGE_INFO.myinfoPageInfo.info_gbn == '') {
        // group num search
        getGroupNumAutoComplete({opener: '[data-page="myinfo"] input[name="custname"]', pageTitle: '내정보', changeCallback: function(autocomplete, value) {
            var group = $$.isArray(value) ? value[0] : value;
            $$('[data-page="myinfo"] input[name="custgroup_num"]').val(group.f_num);
            $$('[data-page="myinfo"] input[name="custname"]').val(group.f_name);
        }});
    }*/
    // dong search
    getDongAutoComplete({opener: '[data-page="myinfo"] input[name="custfull_addr"]', pageTitle: '내정보', changeCallback: function(autocomplete, value) {
        var dong = $$.isArray(value) ? value[0] : value;
        $$('[data-page="myinfo"] input[name="custsido"]').val(dong.f_sido);
        $$('[data-page="myinfo"] input[name="custgugun"]').val(dong.f_gugun);
        $$('[data-page="myinfo"] input[name="custdong"]').val(dong.f_dong);
        $$('[data-page="myinfo"] input[name="custfull_addr"]').val(dong.f_full_addr);
        $$('[data-page="myinfo"] input[name="custlati"]').val(dong.f_lati);
        $$('[data-page="myinfo"] input[name="custlongi"]').val(dong.f_longi);
    }});
});

// 중복확인
$$(document).on('click', '[data-page="myinfo"] a[id="custidused"]', function() {
    var in_id = $$('[data-page="myinfo"] input[name="custid"]').val();
    if(in_id.length < 4) return false;
    getJSON('myInfoId', { in_id: in_id }, function(data) {
        if(data[0].f_id == in_id) {
            myApp.alert('사용 가능한 아이디 입니다');
        } else {
            myApp.alert('이미 사용중입니다.');
        }
    });
});

// 다시작성/취소/가입|확인
$$(document).on('click', '[data-page="myinfo"] .toolbar-bottom a.link', function() {
    var idx = $$(this).index();
    var myinfo = $$('[data-page="myinfo"] input[type="text"], [data-page="myinfo"] input[type="hidden"]');
    if(idx === 0) {
        // 다시작성
        myinfo.each(function() {
            this.value = defaultString($$(this).data('value'));
        });
        $$('[data-page="myinfo"] input[name="custpw"]').val('');
    } else if(idx === 1) {
        // 취소
        mainView.router.back({url: 'index.html'});
    } else if(idx === 2) {
        // 가입|확인
        var params = {
            in_pw: $$('[data-page="myinfo"] input[name="custpw"]').val(),
            in_for_group: $$('[data-page="myinfo"] input[name="custfor_group"]').prop('checked') ? 'Y' : 'N'
        }
        myinfo.each(function() {
            params['in_' + this.name.slice(4)] = this.value;
        });
        if(PAGE_INFO.myinfoPageInfo.info_gbn == 'new') {
            myApp.confirm('신규고객 가입하시겠습니까?', function() {
                // new
                getJSON('myInfoNew', params, function(data) {
                    // setting
                    CUST_INFO.itemData = data[0];
                    // save
                    window.localStorage.setItem(CUST_INFO.itemKey, JSON.stringify(CUST_INFO.itemData));
                    myApp.alert('신규고객 가입하였습니다.', function() {
                        // back
                        mainView.router.back({url: 'index.html'});
                    });
                });
            }, function() {
                // Cancel
            });
        } else {
            myApp.confirm('내정보를 수정하시겠습니까?', function() {
                // update
                getJSON('myInfoUpdate', Object.assign({
                    in_num: CUST_INFO.itemData.f_num,
                    in_id: CUST_INFO.itemData.f_id
                }, params), function(data) {
                    // setting
                    CUST_INFO.itemData = data[0];
                    // save
                    window.localStorage.setItem(CUST_INFO.itemKey, JSON.stringify(CUST_INFO.itemData));
                    myApp.alert('내정보를 수정하였습니다.', function() {
                        // back
                        mainView.router.back({url: 'index.html'});
                    });
                });
            }, function() {
                // Cancel
            });
        }
    }
});

// input 포커스 처리
$$(document).on('click', '[data-page="myinfo"] input[type="text"]', function(e) {
    e.stopPropagation();
    var el = $$(this);
    if(!el.prop('readonly')) {
        var value = el.val();
        el.focus().val(value);
    };
});

// 회사용도
$$(document).on('change', '[data-page="myinfo"] input[name="custfor_group"]', function() {
    var disabled = !$$(this).prop('checked');
    var groupEl = $$('[data-page="myinfo"] input[name="custgroup_num"]');
    var nameEl = $$('[data-page="myinfo"] input[name="custname"]');
    if(disabled) {
        groupEl.val('');
        nameEl.val('').attr('placeholder', '(선택없음)').prop('disabled', true);
    } else {
        groupEl.val(groupEl.data('value'));
        nameEl.val(nameEl.data('value'));
        nameEl.removeAttr('placeholder').prop('disabled', false);
    }
});

// 기존고객 data-page="ifind"
myApp.onPageInit('ifind', function(page) {
    // name saerch
    getNameAutoComplete({opener: '[data-page="ifind"] a[id="custname"]', pageTitle: '기존고객', changeCallback: function(autocomplete, value) {
        // 보안은 어떻게???
        var name = $$.isArray(value) ? value[0] : value;
        $$('[data-page="ifind"] input[name="custnum"]').val(defaultString(name.f_num));
        $$('[data-page="ifind"] input[name="custperson_name"]').val(defaultString(name.f_person_name));
        $$('[data-page="ifind"] input[name="custhphone"]').val(defaultString(name.f_hphone));
        $$('[data-page="ifind"] input[name="custname"]').val(defaultString(name.f_name));
        $$('[data-page="ifind"] input[name="custfull_addr"]').val(defaultString(name.f_full_addr));
    }});
});

// 기존고객 [중복확인]
$$(document).on('click', '[data-page="ifind"] a[id="custidused"]', function() {
    var in_num = $$('[data-page="ifind"] input[name="custnum"]').val();
    var in_id = $$('[data-page="ifind"] input[name="custid"]').val();
    if(in_id.length < 4) return false;
    getJSON('myInfoId', { in_id: in_id, in_num: in_num }, function(data) {
        if(data[0].f_id == in_id) {
            myApp.alert('사용 가능한 아이디 입니다');
        } else {
            myApp.alert('이미 사용중입니다.');
        }
    });
});

// 기존고객 [가입]
$$(document).on('click', '[data-page="ifind"] a[id="custrenew"]', function() {
    var custnum = $$('[data-page="ifind"] input[name="custnum"]');
    var custid = $$('[data-page="ifind"] input[name="custid"]');
    var custpw = $$('[data-page="ifind"] input[name="custpw"]');
    var in_num = custnum.val();
    var in_id = custid.val();
    var in_pw = custpw.val();
    if(in_num.length < 1) {
        myApp.modal({
            title: '기존고객',
            text: '고객찾기를 하시고 가입 하시기 바랍니다.',
            buttons: [{ text: 'OK', onClick: function() {} }]
        });
        return false;
    } else if(in_id.length < 4) {
        myApp.modal({
            title: '기존고객',
            text: '아이디는 4자리 이상으로 입력하시기 바랍니다.',
            buttons: [{ text: 'OK', onClick: function() { custid.focus().val(in_id); } }]
        });
        return false;
    } else if(!isEmail(in_id)) {
        myApp.modal({
            title: '기존고객',
            text: '아이디는 이메일로 입력하시기 바랍니다.',
            buttons: [{ text: 'OK', onClick: function() { custid.focus().val(in_id); } }]
        });
        return false;
    } else if(in_pw.length < 4) {
        myApp.modal({
            title: '기존고객',
            text: '비밀번호는 4자리 이상으로 입력하시기 바랍니다.',
            buttons: [{ text: 'OK', onClick: function() { custpw.focus().val(in_pw); } }]
        });
        return false;
    }

    // get customer info
    getJSON('myInfoRenew', { in_num: in_num, in_id: in_id, in_pw: in_pw, 
        in_number: CUST_INFO.phoneNumber // log
    }, function(data) {
        // setting
        CUST_INFO.itemData = data[0];
        CUST_INFO.loggedIn = true;
        CUST_INFO.autoLoggedIn = true; // 기본값, custauto.prop('checked');
        // save
        window.localStorage.setItem(CUST_INFO.itemKey, JSON.stringify(CUST_INFO.itemData));
        window.localStorage.setItem(CUST_INFO.itemAutoLoggedIn, JSON.stringify(CUST_INFO.autoLoggedIn));
        // panel-left
        onMenuChangePanelLeft(true);
        // back
        mainView.router.back({url: 'index.html', force: true});
    });
});

// 배송조회 data-page="todaylist" => NOT USED
/*myApp.onPageInit('todaylist', function(page) {
    if(!isObject(PAGE_INFO.todaylistPageTemplate)) {
        PAGE_INFO.todaylistPageTemplate = {
            todayListTemplate: Template7.compile($$('script[id="today-list-template"]').html()),
            todayDetailTemplate: Template7.compile($$('script[id="today-detail-template"]').html())
        }
    }
    // get todaylist info
    if(CUST_INFO.loggedIn && isObject(CUST_INFO.itemData)) {
        getJSON('todayList', {
            in_cust_num: CUST_INFO.itemData.f_num
        }, function(data) {
            // setting
            PAGE_INFO.todaylistPageData = data;
            var html = PAGE_INFO.todaylistPageTemplate.todayListTemplate(data);
            $$('[data-page="todaylist"] div.list-block').html(html);
        });
    }
});*/

/*$$(document).on('click', '[data-page="todaylist"] li .item-content', function() {
    var rnum = $$(this).data('rnum');
    var rdata = PAGE_INFO.todaylistPageData.find(function(data) {
        return rnum != undefined && data.f_num == rnum;
    });
    // get work-detail info
    getJSON('orderDetail', { 
        in_cust_num: CUST_INFO.itemData.f_num,
        in_receive_num: rnum
     }, function(data) {
        rdata['PASS'] = [];
        if($$.isArray(data)) {
            data.forEach(function(row) {
                var obj = {
                    f_cust_name: row.f_cust_name,
                    f_sido: row.f_sido,
                    f_gugun: row.f_gugun,
                    f_dong: row.f_dong,
                    f_dong_num: row.f_dong_num,
                    f_addr_detail: row.f_addr_detail
                }
                switch(row.f_cust_gbn) {
                    case 'PASS':
                        rdata[row.f_cust_gbn].push(obj);
                        break;
                    default:
                        rdata[row.f_cust_gbn] = obj;
                    break;
                }
            });
        }
        var html = PAGE_INFO.todaylistPageTemplate.todayDetailTemplate(rdata);
        $$('.popup-order-detail div.page-content').html(html);
        myApp.popup('.popup-order-detail');
    });
});*/

/*$$(document).on('ptr:refresh', '[data-page="todaylist"] .pull-to-refresh-content', function() {
    // get todaylist info
    if(CUST_INFO.loggedIn && isObject(CUST_INFO.itemData)) {
        getJSON('completedList', { 
            in_cust_num: CUST_INFO.itemData.f_num
        }, function(data) {
            // setting
            PAGE_INFO.todaylistPageData = data;
            var html = PAGE_INFO.todaylistPageTemplate.todayListTemplate(data);
            $$('[data-page="todaylist"] div.list-block').html(html);
            myApp.pullToRefreshDone();
        }, function() {
            myApp.pullToRefreshDone();
        });
    } else {
        myApp.pullToRefreshDone();
    }
});*/

// 사용내역 data-page="uselist" => NOT USED
/*myApp.onPageInit('uselist', function(page) {
    if(!isObject(PAGE_INFO.uselistPageTemplate)) {
        PAGE_INFO.uselistPageTemplate = {
            useListTemplate: Template7.compile($$('script[id="use-list-template"]').html()),
            useDetailTemplate: Template7.compile($$('script[id="use-detail-template"]').html())
        }
    }
    // get uselist info
    if(CUST_INFO.loggedIn && isObject(CUST_INFO.itemData)) {
        getJSON('completedList', { 
            in_cust_num: CUST_INFO.itemData.f_num
        }, function(data) {
            // setting
            PAGE_INFO.uselistPageData = data;
            var html = PAGE_INFO.uselistPageTemplate.useListTemplate(data);
            $$('[data-page="uselist"] div.list-block').html(html);
        });
    }
});*/

$$(document).on('click', '[data-page="uselist"] li .item-content', function() {
    var rnum = $$(this).data('rnum');
    var rdata = PAGE_INFO.uselistPageData.find(function(data) {
        return rnum != undefined && data.f_num == rnum;
    });
    // get use-detail info
    getJSON('orderDetail', { 
        in_cust_num: CUST_INFO.itemData.f_num,
        in_receive_num: rnum
     }, function(data) {
        rdata['PASS'] = [];
        if($$.isArray(data)) {
            data.forEach(function(row) {
                var obj = {
                    f_cust_name: row.f_cust_name,
                    f_sido: row.f_sido,
                    f_gugun: row.f_gugun,
                    f_dong: row.f_dong,
                    f_dong_num: row.f_dong_num,
                    f_addr_detail: row.f_addr_detail
                }
                switch(row.f_cust_gbn) {
                    case 'PASS':
                        rdata[row.f_cust_gbn].push(obj);
                        break;
                    default:
                        rdata[row.f_cust_gbn] = obj;
                    break;
                }
            });
        }
        var html = PAGE_INFO.uselistPageTemplate.useDetailTemplate(rdata);
        $$('.popup-order-detail div.page-content').html(html);
        myApp.popup('.popup-order-detail');
    });
});

// 문의하기
$$(document).on('click', '.modal-action-contact', function() {
    myApp.actions(CONTACT_INFO.map(function(contact) {
        return {
            // text: `<div style="text-align: center;">${contact.title}</div>`,
            text: '<div style="text-align: center;">' + contact.title + '</div>',
            bold: true,
            onClick: callNumber.bind(null, contact.callNumber)
        }
    }))
});

// 메뉴 -> 문의하기
$$(document).on('click', '.panel.panel-left ul[id="contact-list"] li', function() {
    var number = $$(this).find('a').data('callnumber');
    callNumber(number);
});

// 메뉴 -> 보내기/찾아오기/타지역
$$(document).on('click', '.panel.panel-right .list-block li', function() {
    $$('.panel.panel-right .list-block li').each(function() {
        $$(this).find('.item-after').remove();
    });
    var el = $$(this);
    var text = el.find('.item-title').text();
    $$('[data-page="myorder"] .navbar .navbar-inner div.right span').text(text);
    el.find('.item-inner').append('<div class="item-after"><span class="badge">선택</span></div>');
    // 처리
    $$('[data-page="myorder"] input[name^="custtab1"]').each(function() {
        $$(this).val('');
    });
    $$('[data-page="myorder"] input[name^="custtab2"]').each(function() {
        $$(this).val('');
    });
    switch(text) {
        case '보내기': // 출발지 내용을 내정보 채우고 도착지 내용 지우기
            $$('[data-page="myorder"] input[name^="custtab1"]').each(function() {
                $$(this).val(CUST_INFO.itemData[this.name.replace('custtab1', 'f')]);
            });
            break;
        case '찾아오기': // 출발지 내용 지우고 도착지 내용을 내정보 채우기
            $$('[data-page="myorder"] input[name^="custtab2"]').each(function() {
                $$(this).val(CUST_INFO.itemData[this.name.replace('custtab2', 'f')]);
            });
            break;
        case '타지역': // 출발지/도착지 내용 지우기
            break;
    }
});

// 로그인 data-page="login"
myApp.onPageInit('login', function(page) {
    var custid = $$('[data-page="login"] input[name="custid"]');
    var custpw = $$('[data-page="login"] input[name="custpw"]');
    //var custpw_confirm = $$('[data-page="login"] input[name="custpw_confirm"]');
    var custauto = $$('[data-page="login"] input[name="custauto"]');   
    if(isObject(CUST_INFO.itemData)) {
        custid.val(CUST_INFO.itemData.f_id);
    }
    if(CUST_INFO.autoLoggedIn === true) {
        custauto.prop('checked', true);
    }    
});

// 로그인
$$(document).on('click', '[data-page="login"] a[id="custlog"]', function() {
    var custid = $$('[data-page="login"] input[name="custid"]');
    var custpw = $$('[data-page="login"] input[name="custpw"]');
    //var custpw_confirm = $$('[data-page="login"] input[name="custpw_confirm"]');
    var custauto = $$('[data-page="login"] input[name="custauto"]');   
    var in_id = custid.val();
    var in_pw = custpw.val();
    // var in_pw_confirm = custpw_confirm.val();
    if(in_id.length < 4) {
        myApp.modal({
            title: '로그인',
            text: '아이디는 4자리 이상으로 입력하시기 바랍니다.',
            buttons: [{ text: 'OK', onClick: function() { custid.focus().val(in_id); } }]
        });
        return false;
    /*} else if(!isEmail(in_id)) {
        myApp.modal({
            title: '로그인',
            text: '아이디는 이메일로 입력하시기 바랍니다.',
            buttons: [{ text: 'OK', onClick: function() { custid.focus().val(in_id); } }]
        });
        return false;*/
    } else if(in_pw.length < 4) {
        myApp.modal({
            title: '로그인',
            text: '비밀번호는 4자리 이상으로 입력하시기 바랍니다.',
            buttons: [{ text: 'OK', onClick: function() { custpw.focus().val(in_pw); } }]
        });
        return false;
    } /*else if(in_pw != in_pw_confirm) {
        myApp.modal({
            title: '로그인',
            text: '비밀번호를 다시 확인하시기 바랍니다.',
            buttons: [{ text: 'OK', onClick: function() { custpw.focus(); } }]
        });
        return false;
    }*/

    // get customer info
    getJSON('login', { in_id: in_id, in_pw: in_pw, 
        in_number: CUST_INFO.phoneNumber // log
    }, function(data) {
        // setting
        CUST_INFO.itemData = data[0];
        CUST_INFO.loggedIn = true;
        CUST_INFO.autoLoggedIn = custauto.prop('checked');
        // save
        window.localStorage.setItem(CUST_INFO.itemKey, JSON.stringify(CUST_INFO.itemData));
        window.localStorage.setItem(CUST_INFO.itemAutoLoggedIn, JSON.stringify(CUST_INFO.autoLoggedIn));
        // panel-left
        onMenuChangePanelLeft(true);
        // back
        mainView.router.back({url: 'index.html', force: true});
    });
});

// 비밀번호 찾기/신규고객 가입/기존고객 가입
$$(document).on('click', '[data-page="login"] a[id="custfind"], [data-page="login"] a[id="custnew"], [data-page="login"] a[id="custold"]', function() {
    switch(this.id) {
        case 'custfind': // 비밀번호 찾기
            myApp.confirm('고객센터로 문의하시기 바랍니다.<br>지금 연결하시겠습니까?', function() {
                callNumber(CUST_INFO.callcenterNumber);
            }, function() {
                // Cancel
            });
            break;
        case 'custnew': // 신규고객 가입, 로그인 화면 대체
            // mainView.router.back({url: 'index.html'});
            mainView.router.load({
                url: 'myinfo.html',
                query: {
                    info_gbn: 'new'
                },
                reload: true
            });
            break;
        case 'custold': // 기존고객 가입
            // 기존고객 목록에서 선택 후 신규고객 가입 화면에서 처리
            // 로그인 화면 나가고 신규고객 가입 화면으로 이동
            // 기존가입 화면
            /*  1. 이름(회사이름/사용자) 기준 검색
                2. f_person_name f_hphone [010-1234-xxxx] f_name f_full_addr
                3. 선택시 해당 정보를 신규고객 가입 화면에서 사용하도록...,
             */
            break;
    }
});

// 로그아웃
$$(document).on('click', '.panel.panel-left a[name="logout"]', function() {
    // setting
    CUST_INFO.itemData = undefined;
    CUST_INFO.loggedIn = false;
    CUST_INFO.autoLoggedIn = false;
    // reload localStorage 
    var data = window.localStorage.getItem(CUST_INFO.itemKey);
    if(data) CUST_INFO.itemData = JSON.parse(data);
    data = window.localStorage.getItem(CUST_INFO.itemAutoLoggedIn);
    if(data) CUST_INFO.autoLoggedIn = JSON.parse(data) || false;
    // panel-left
    onMenuChangePanelLeft(false);
    // back
    if(mainView.activePage.name != 'index') {
        mainView.router.back({url: 'index.html', force: true});
    } else {
        setMenuTemplate();
    }
});

function onMenuChangePanelLeft(login) {
    // panel-left
    $$('.panel.panel-left').find('a[name="login"]').parent()[login ? 'hide' : 'show']();
    $$('.panel.panel-left').find('a[name="logout"]').parent()[login ? 'show' : 'hide']();
    $$('.panel.panel-left').find('a[name="myfavorites"]').parent()[login ? 'show' : 'hide'](); // 내거래처
    $$('.panel.panel-left').find('a[name="settings"]').parent()[login ? 'show' : 'hide'](); // 설정
}

// 나가기/앱종료
$$(document).on('click', '.panel.panel-left a[name="exitapp"]', function() {
    if(PAGE_INFO.myorderPagePolling) PAGE_INFO.myorderPagePolling.stop();
    try {
        window.navigator.app.exitApp();
    } catch(e) {}
});

// Global variables
/*
    보내기/찾아오기/타지역 메뉴추가
    아이콘 적용하기
 */
var APP_INFO = {
    code: '1b7c7f59-d812-c0ec-4be0-94db79aec6bd',
    version: '1.0.3'
};

var MENU_INFO = [{ // 기본메뉴 구조
        href: 'myorder.html',
        class: 'link',
        icon: 'icons/pages.png',
        title: '주문하기'
    }, {
        href: 'mylist.html',
        class: 'link',
        icon: 'icons/blog.png',
        title: '조회하기'
    }, {
        href: 'myinfo.html',
        class: 'link',
        icon: 'icons/color.png',
        title: '내정보'
    }, {
        href: 'settings.html',
        class: 'link',
        icon: 'icons/feature.png',
        title: '설정하기'
    }, {
        href: '#',
        class: 'modal-action-contact',
        icon: 'icons/contact.png',
        title: '문의하기'
    }
];

var COMMON_INFO; // 공통코드
var AUTOCOMPLETES = []; // 자동완성기능 컴포넌트

var CONTACT_INFO = [ // 문의정보
    {
        title: '요금문의',
        showNumber: '1800-8280',
        callNumber: '18008280'
    }, {
        title: '예약문의',
        showNumber: '1800-8280',
        callNumber: '18008280'
    }, {
        title: '배송문의',
        showNumber: '1800-8280',
        callNumber: '18008280'
    }, {
        title: '기타문의',
        showNumber: '1800-8280',
        callNumber: '18008280'
    }
];

var CUST_INFO = { // 고객정보
    // ajax
    // baseURL: 'http://115.68.29.179/pq21/service/mobile_cust/',
    baseURL: 'http://www.lsplus.co.kr/pq21/service/mobile_cust/',
    baseSuffix: '.php',
    resultOK: 'OK',
    resultFAIL: 'FAIL',
    // localStorage
    itemKey: 'customer',
    itemAutoLoggedIn: 'custauto',
    itemData: undefined,
    // setting
    loggedIn: false,
    autoLoggedIn: false,
    init: true,
    // indicator
    indicator: false,
    // actionSheet
    actionSheets: [],
    // confirm exit app
    confirmExitApp: false,
    // network line status
    networkLineStatus: false,
    // cust phone number
    phoneNumber: undefined,
    // my order
    myReceiveNew: undefined,
    // login => callcenter
    callcenterNumber: '18008280',
    // debounceTime: ms, Params
    debounceTime: 500,
    debounceParams: {},
    // status color format
    formatStatusColors: [$$('meta[name="theme-color"]').attr('content'), 'blue', 'gray', 'black'] // 대기, 접수, 취소, 종료
}

var DONG_INFO = { // 주소캐쉬
    // address dong cache
    itemKey: 'dongcache',
    itemData: undefined,
    // match regex string => 한글만 입력가능하게...,
    itemMatchRx: /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
}

var PAGE_INFO = { // 페이지 정보
    // data-page="index"
    indexPageTemplate: undefined,
    // data-page="myorder"
    myorderPageInfo: undefined,
    myorderPageTemplate: undefined,
    myorderPageData: undefined,
    myorderPagePolling: undefined,
    myorderPagePollingTimer: 0, // 60초 대기
    myorderPagePollingInterval: 5, // 5초 반복
    // data-page="myinfo"
    myinfoPageInfo: undefined,
    myinfoPageTemplate: undefined,
    // data-page="mylist"
    mylistPageTemplate: undefined,
    mylistPageData: undefined,
    mylistPageParams: undefined,
    // data-page="myfavorites"
    myfavoritesPageTemplate: undefined,
    myfavoritesPageData: undefined,
    myfavoritesPageParams: undefined,
    // data-page="todaylist"
    todaylistPageTemplate: undefined,
    todaylistPageData: undefined,
    // data-page="uselist"
    uselistPageTemplate: undefined,
    uselistPageData: undefined,
    // data-page="settings"
    settingsPageTemplate: undefined
}

// Library

// my favorite saerch : 내거래처 -> Simple Standalone Autocomplete, f_name
function getFavoriteAutoComplete(params) {
    var ac = myApp.autocomplete({
        openIn: 'popup',
        pageTitle: params.pageTitle + ' - 내거래처',
        opener: params.opener,
        searchbarPlaceholderText: '예) 엘에스플러스',
        valueProperty: 'f_num',
        textProperty: 'f_text',
        backOnSelect: true,
        requestSourceOnOpen: true, // request source on autocomplete open
        preloader: true, // enable preloader
        source: function(autocomplete, query, render) {
            var results = [];
            if(autocomplete.params.requestSourceOnOpen) {
                autocomplete.params.requestSourceOnOpen = false;
            } else {
                if(query.length < 2) {
                    autocomplete.hidePreloader();
                    render(results); 
                    return;
                }
            }
            // 한글 2글자 이상
            if(query != '' && CUST_INFO.debounceParams.query == query) {
                autocomplete.hidePreloader();
                render(results);
                return;
            }
            CUST_INFO.debounceParams.query = query;
            if(!CUST_INFO.debounceParams.scheduled) {
                CUST_INFO.debounceParams.scheduled = true;
                clearTimeout(CUST_INFO.debounceParams.debounceTimer);
                CUST_INFO.debounceParams.debounceTimer = setTimeout(function $$getFavoriteAutoComplete() {
                    var in_name = CUST_INFO.debounceParams.query;
                    autocomplete.showPreloader();
                    getJSON('myFavorite', {
                        in_cust_num: CUST_INFO.itemData.f_num,
                        in_name: in_name
                    }, function(data) {
                        autocomplete.hidePreloader();
                        if(CUST_INFO.debounceParams.query != in_name) {
                            $$getFavoriteAutoComplete();
                            return;
                        }
                        // 내정보 기본 추가
                        if(!isArray(data)) data = [];
                        data.unshift({
                            f_num: 0,
                            f_name: '[내정보] ' + defaultString(CUST_INFO.itemData.f_name),
                            f_depart_name: defaultString(CUST_INFO.itemData.f_depart_name),
                            f_person_name: defaultString(CUST_INFO.itemData.f_person_name),
                            f_position: defaultString(CUST_INFO.itemData.f_position),
                            f_tel: defaultString(CUST_INFO.itemData.f_tel),
                            f_hphone: defaultString(CUST_INFO.itemData.f_hphone),
                            f_contact: defaultString(CUST_INFO.itemData.f_tel, CUST_INFO.itemData.f_hphone),
                            f_sido: defaultString(CUST_INFO.itemData.f_sido),
                            f_gugun: defaultString(CUST_INFO.itemData.f_gugun),
                            f_dong: defaultString(CUST_INFO.itemData.f_dong),
                            f_full_addr: CUST_INFO.itemData.f_sido + ' ' + CUST_INFO.itemData.f_gugun + ' ' + CUST_INFO.itemData.f_dong + ' ',
                            f_dong_num: defaultString(CUST_INFO.itemData.f_dong_num),
                            f_pickup_place: defaultString(CUST_INFO.itemData.f_pickup_place),
                            f_addr_detail: defaultString(CUST_INFO.itemData.f_addr_detail),
                            f_lati: defaultString(CUST_INFO.itemData.f_lati),
                            f_longi: defaultString(CUST_INFO.itemData.f_longi)                    
                        })
                        autocomplete.hidePreloader();
                        data.forEach(function(favorite) {
                            favorite.f_text = [
                                favorite.f_name ? favorite.f_name + (favorite.f_person_name ? ' / ' + favorite.f_person_name : '') : defaultString(favorite.f_person_name),
                                favorite.f_depart_name,
                                defaultString(favorite.f_contact),
                                defaultString(favorite.f_full_addr).trim() + ' ' + defaultString(favorite.f_dong_num).trim()
                            ].join('<br>');
                            results.push(favorite);
                        });
                        render(results);
                        CUST_INFO.debounceParams.scheduled = false;
                        openOnAutoComplete();
                    }, function() {
                        autocomplete.hidePreloader();
                        if(CUST_INFO.debounceParams.query != in_name) {
                            $$getNameAutoComplete();
                            return;
                        }
                        render(results); 
                        CUST_INFO.debounceParams.scheduled = false;
                    });
                }, CUST_INFO.debounceTime);
            }
        },
        notFoundText: '검색된 거래처이름이 없습니다.',
        onChange: params.changeCallback,
        onOpen: function(autocomplete) {
            CUST_INFO.indicator = false; // indicator
            CUST_INFO.init = true; // fail alert quietly
            CUST_INFO.debounceParams.scheduled = false;
            CUST_INFO.debounceParams.query = '';
            openOnAutoComplete(autocomplete);
        },
        onClose: function(autocomplete) {
            autocomplete.params.requestSourceOnOpen = true;
            $$('.popup-overlay').removeClass('modal-overlay-visible');
            CUST_INFO.indicator = true; // indicator
            CUST_INFO.init = false; // fail alert quietly
            CUST_INFO.debounceParams.scheduled = false;
            CUST_INFO.debounceParams.query = '';
        }
    });
    // ac.params.source.debounce(CUST_INFO.debounceTime); // debounce 처리
    AUTOCOMPLETES.push(ac);
    return ac;
}

// name saerch : 기존고객 찾기 -> Simple Standalone Autocomplete, f_name
function getNameAutoComplete(params) {
    var ac = myApp.autocomplete({
        openIn: 'popup',
        pageTitle: params.pageTitle + ' - 고객(이름검색)',
        opener: params.opener,
        searchbarPlaceholderText: '예) 홍길동',
        valueProperty: 'f_num',
        textProperty: 'f_text',
        backOnSelect: true,
        preloader: true, // enable preloader
        source: function(autocomplete, query, render) {
            var results = [];
            if(query.length < 2) {
                autocomplete.hidePreloader();
                render(results); 
                return;
            }
            // 한글 2글자 이상
            if(query != '' && CUST_INFO.debounceParams.query == query) {
                autocomplete.hidePreloader();
                render(results);
                return;
            }
            CUST_INFO.debounceParams.query = query;
            if(!CUST_INFO.debounceParams.scheduled) {
                CUST_INFO.debounceParams.scheduled = true;
                clearTimeout(CUST_INFO.debounceParams.debounceTimer);
                CUST_INFO.debounceParams.debounceTimer = setTimeout(function $$getNameAutoComplete() {
                    var in_name = CUST_INFO.debounceParams.query;
                    autocomplete.showPreloader();
                    getJSON('name', {
                        in_name: in_name
                    }, function(data) {
                        autocomplete.hidePreloader();
                        if(CUST_INFO.debounceParams.query != in_name) {
                            $$getNameAutoComplete();
                            return;
                        }
                        data.forEach(function(name) {
                            name.f_text = [
                                name.f_name ? name.f_name + (name.f_person_name ? ' / ' + name.f_person_name : '') : defaultString(name.f_person_name),
                                name.f_depart_name,
                                defaultString(name.f_contact),
                                defaultString(name.f_full_addr).trim() + ' ' + defaultString(name.f_dong_num).trim()
                            ].join('<br>');
                            results.push(name);
                        });
                        render(results);
                        CUST_INFO.debounceParams.scheduled = false;
                        openOnAutoComplete();
                    }, function() {
                        autocomplete.hidePreloader();
                        if(CUST_INFO.debounceParams.query != in_name) {
                            $$getNameAutoComplete();
                            return;
                        }
                        render(results); 
                        CUST_INFO.debounceParams.scheduled = false;
                    });
                }, CUST_INFO.debounceTime);
            }
        },
        notFoundText: '검색된 고객이름이 없습니다.',
        onChange: params.changeCallback,
        onOpen: function(autocomplete) {
            CUST_INFO.indicator = false; // indicator
            CUST_INFO.init = true; // fail alert quietly
            CUST_INFO.debounceParams.scheduled = false;
            CUST_INFO.debounceParams.query = '';
            openOnAutoComplete(autocomplete);
        },
        onClose: function(autocomplete) {
            $$('.popup-overlay').removeClass('modal-overlay-visible');
            CUST_INFO.indicator = true; // indicator
            CUST_INFO.init = false; // fail alert quietly
            CUST_INFO.debounceParams.scheduled = false;
            CUST_INFO.debounceParams.query = '';
        }
    });
    // ac.params.source.debounce(CUST_INFO.debounceTime); // debounce 처리
    AUTOCOMPLETES.push(ac);
    return ac;
}

// group num search : 회사(이름검색) -> Simple Standalone Autocomplete, f_name
function getGroupNumAutoComplete(params) {
    var ac = myApp.autocomplete({
        openIn: 'popup',
        pageTitle: params.pageTitle + ' - 회사(이름검색)',
        opener: params.opener,
        searchbarPlaceholderText: '예) 엘에스플러스',
        // value: PAGE_INFO.myinfoPageInfo.value,
        valueProperty: 'f_num',
        textProperty: 'f_text',
        backOnSelect: true,
        // requestSourceOnOpen: true, // request source on autocomplete open
        preloader: true, // enable preloader
        source: function(autocomplete, query, render) {
            var results = [];
            if(query.length < 2) {
                autocomplete.hidePreloader();
                render(results); // PAGE_INFO.myinfoPageInfo.value
                return;
            }
            // 한글 2글자 이상
            if(query != '' && CUST_INFO.debounceParams.query == query) {
                autocomplete.hidePreloader();
                render(results);
                return;
            }
            CUST_INFO.debounceParams.query = query;
            if(!CUST_INFO.debounceParams.scheduled) {
                CUST_INFO.debounceParams.scheduled = true;
                clearTimeout(CUST_INFO.debounceParams.debounceTimer);
                CUST_INFO.debounceParams.debounceTimer = setTimeout(function $$getGroupNumAutoComplete() {
                    var in_name = CUST_INFO.debounceParams.query;
                    autocomplete.showPreloader();
                    getJSON('groupName', {
                        in_name: in_name
                    }, function(data) {
                        autocomplete.hidePreloader();
                        if(CUST_INFO.debounceParams.query != in_name) {
                            $$getGroupNumAutoComplete();
                            return;
                        }
                        data.forEach(function(group) {
                            // group.f_text = `${group.f_name} (${group.f_full_addr})`;
                            group.f_text = group.f_name + ' (' + group.f_full_addr + ')';
                            results.push(group);
                        });
                        render(results);
                        CUST_INFO.debounceParams.scheduled = false;
                        openOnAutoComplete();
                    }, function() {
                        autocomplete.hidePreloader();
                        if(CUST_INFO.debounceParams.query != in_name) {
                            $$getNameAutoComplete();
                            return;
                        }
                        render(results); 
                        CUST_INFO.debounceParams.scheduled = false;
                    });
                }, CUST_INFO.debounceTime);
            }
        },
        notFoundText: '검색된 회사이름이 없습니다.',
        onChange: params.changeCallback,
        onOpen: function(autocomplete) {
            CUST_INFO.indicator = false; // indicator
            CUST_INFO.init = true; // fail alert quietly
            CUST_INFO.debounceParams.scheduled = false;
            CUST_INFO.debounceParams.query = '';
            openOnAutoComplete(autocomplete);
        },
        onClose: function(autocomplete) {
            $$('.popup-overlay').removeClass('modal-overlay-visible');
            CUST_INFO.indicator = true; // indicator
            CUST_INFO.init = false; // fail alert quietly
            CUST_INFO.debounceParams.scheduled = false;
            CUST_INFO.debounceParams.query = '';
        }
    });
    // ac.params.source.debounce(CUST_INFO.debounceTime); // debounce 처리
    AUTOCOMPLETES.push(ac);
    return ac;
}

// dong search : 주소(동검색) -> Simple Standalone Autocomplete, f_dong
function getDongAutoComplete(params) {
    var ac = myApp.autocomplete({
        openIn: 'popup',
        pageTitle: params.pageTitle + ' - 주소(동검색)',
        opener: $$(params.opener),
        searchbarPlaceholderText: '예) 신사동',
        valueProperty: 'f_num',
        textProperty: 'f_full_addr',
        backOnSelect: true,  
        source: function(autocomplete, query, render) {
            var results = [];
            if(DONG_INFO.itemMatchRx.test(query) && query.length > 1) { // 한글 2글자 이상
                var dong = new RegExp(query);
                results = DONG_INFO.itemData.filter(function(data) {
                    return dong.test(data.f_dong);
                });
                openOnAutoComplete();
            }
            render(results);
        },
        notFoundText: '검색된 동이름이 없습니다.',
        onChange: params.changeCallback,
        onOpen: function(autocomplete) {
            openOnAutoComplete(autocomplete);
        },
        onClose: function(autocomplete) {
            $$('.popup-overlay').removeClass('modal-overlay-visible');
        }
    });
    // ac.params.source.debounce(CUST_INFO.debounceTime); // debounce 처리
    AUTOCOMPLETES.push(ac);
    return ac;
}

// autocomplete 오픈시 일부 디자인 수정
function openOnAutoComplete(autocomplete) {
    var autoEl = $$('.page.autocomplete-page .page-content [class^="list-block autocomplete"]').css('margin', '0px');
    autoEl.find('.item-media').css('display', 'none');
    autoEl.find('.item-title').css('white-space', 'normal');
    if(autocomplete) {
        autocomplete.value = [];
        $$('.page.autocomplete-page .page-content .autocomplete-values').empty();
    }
}

// 데이터 통신 (POST/JSON)
function getJSON(url, params, successCallback, errorCallback) {
    if(CUST_INFO.indicator) myApp.showIndicator();
    if(!CUST_INFO.networkLineStatus) { // 네트워크 연결상태가 바른지 확인
        myApp.hideIndicator();
        // myApp.alert('네트워크 연결상태를 확인하시기 바랍니다.');
        if(typeof errorCallback === 'function') errorCallback();
        return false;
    }
    setTimeout(function() {
        var config = Object.assign({}, {
            url: CUST_INFO.baseURL + url + CUST_INFO.baseSuffix,
            method: 'post',
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            responseType: 'json',
            params: params,
            withCredentials: true
        });
        axios.request(config)
            .then(function(response) {
                myApp.hideIndicator();
                if(isObject(response.data) && response.data.resultCode != CUST_INFO.resultOK) {
                    if(!CUST_INFO.init) myApp.alert(response.data.resultMsg); // error message
                    if(typeof errorCallback === 'function') errorCallback(response.data.data);
                } else if(typeof successCallback === 'function') successCallback(response.data.data, response.data.params);
            })
            .catch(function(error) {
                console.log(error);
                myApp.hideIndicator();
                if(typeof errorCallback === 'function') errorCallback(error);
                else {
                    // myApp.alert(error);
                }
            });
    }, 250);
}

function getCommonGBN(in_gbn, in_sub_gbn) {
    if(!isArray(COMMON_INFO)) return [];
    return COMMON_INFO.filter(function(option) {
        if(!in_sub_gbn) {
            return option.f_gbn == in_gbn;
        } else {
            return option.f_gbn == in_gbn && option.f_sub_gbn == in_sub_gbn;
        }
    });
}

function getOptions(in_gbn, in_sub_gbn, in_added_option) {
    if(!COMMON_INFO) {
        if(!in_added_option) {
            in_added_option = '미정';
        }
        return '<option value="' + in_added_option + '" selected="selected">' + in_added_option + '</option>';
    }
    var options = getCommonGBN(in_gbn, in_sub_gbn).filter(function(option) {
        return option.f_value1 != in_added_option;
    }).map(function(option) {
        return '<option value="' + option.f_value1 + '">' + option.f_value1 + '</option>';
    });
    if(in_added_option !== undefined) {
        options.unshift('<option value="' + in_added_option + '" selected="selected">' + in_added_option + '</option>');
    }
    return options.join('');
}

function defaultString(data, defaultValue) {
  return (!data) ? ((!defaultValue) ? '' : defaultValue) : data;
}

// 직접통화 
function callNumber(number) {
    try {
        if(window.plugins && window.plugins.CallNumber) {
            window.plugins.CallNumber.callNumber(function(result) {
                // sucess
            }, function(result) {
                callNumberAlt(number);
            }, number, true);
        } else {
            callNumberAlt(number);
        }
    } catch(e) {
        callNumberAlt(number);
    }
}

// 대체 전화번호 보이기
function callNumberAlt(number) {
    $$('div.tel-overlay')
        .empty()
        .append('<a href="tel:' + number + '"></a>')
        .find('a')
        .trigger('click');
}

/*$$(document).on('click', 'div.tel-overlay a', function() {
    console.log(this);
});*/

function isObject(data) {
  return (!!data) && (data.constructor === Object);
}

function isArray(data) {
    return (!!data) && (data.constructor === Array);
};

function isEmail(data) {
    var emailMatchRx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return emailMatchRx.test(data.trim());
}

function getCommon(in_gbn, in_sub_gbn, successCallback) {
    getJSON('common', {
        in_gbn: in_gbn,
        in_sub_gbn: in_sub_gbn
    }, function(data) {
        // setting
        if(typeof successCallback === 'function') {
            successCallback(data);
        } else {
            return data;
        }
    }, function() {
        // error
    });
}

// setting menu
function setMenuTemplate(menu) {
    // 기본구조 설정
    if(!PAGE_INFO.indexPageTemplate) {
        PAGE_INFO.indexPageTemplate = {
            inexMenuRowTemplate: Template7.compile($$('script[id="index-menu-row-template"]').html()),
            inexMenuItemTemplate: Template7.compile($$('script[id="index-menu-item-template"]').html())
        }
    }
    menu = menu || getMenuInfo();
    // MENU ROWS
    var menuOverlay = $$('.menu-overlay');
    var menuRows = Math.floor(menu.length / 2) + (menu.length % 2 ? 1 : 0);
    for(var i = 0; i < menuRows; i++) {
        var html = PAGE_INFO.indexPageTemplate.inexMenuRowTemplate({});
        menuOverlay.append(html);
    }
    var menuRowHtml = $$('script[id="index-menu-row-template"]').html();
    menu.map(function(item) {
        return PAGE_INFO.indexPageTemplate.inexMenuItemTemplate(item);
    }).forEach(function(html, index) {
        menuOverlay.find('div[class="col-35"]').eq(index).html(html);
    });
    $$('[data-page="index"] .page-index-template-content').html(menuOverlay.html());
    menuOverlay.empty();
    // $$('[data-page="index"] .page-content').scrollTop(0);
}

// change menu
function getMenuInfo() {
    var site_type_gbn = isObject(CUST_INFO.itemData) && CUST_INFO.loggedIn === true ? CUST_INFO.itemData.f_site_type_gbn : 'NR';
    var menu = MENU_INFO.slice(0);
    switch(site_type_gbn) {
        case 'BD': // 문서수발(백화점용)
            menu.unshift({
                href: 'myorder.html?site_type_gbn=' + site_type_gbn,
                class: 'link',
                icon: 'icons/pages.png',
                title: '문서수발<br>(백화점용)'
            });
            break;
        default:
            break;
    }
    return menu;
}

// Initialize
function appInitialize() {
    var initialize = {
        shortcut: function(callback) {
            /*addShortcut({
                shortcuttext: 'LS+ 퀵앱'
            });*/
            callback(null, 'shortcut success...,');
        },
        callnumber: function(callback) {
            try {
                window.plugins.sim.getSimInfo(function(data) {
                    CUST_INFO.phoneNumber = data.phoneNumber;
                    callback(null, 'callnumber success..., ' + data.phoneNumber);
                }, function(error) {
                    callback(null, 'callnumber failed!!!');
                });
            } catch(e) {
                callback(null, '[Missing Command Error] callnumber failed!!!');
            }
        },
        updateversion: function(callback) {
            getJSON('updateVersion', {
                in_code: APP_INFO.code,
                in_version: APP_INFO.version
            }, function(data) {
                callback(null, 'updateversion success...,');
            }, function() {
                callback(null, 'updateversion failed!!!');
            });
        },
        dong: function(callback) {
            var in_create_dttm = 0;
            var data = window.localStorage.getItem(DONG_INFO.itemKey);
            if(data) DONG_INFO.itemData = JSON.parse(data);
            if($$.isArray(DONG_INFO.itemData)) {
                in_create_dttm = Math.max.apply(Math, DONG_INFO.itemData.map(function(data) {
                    return Number(data.f_create_dttm);
                }));
            }
            getJSON('dong', {
                in_create_dttm: in_create_dttm
            }, function(data) {
                if(data.length > 0) {
                    DONG_INFO.itemData = data;
                    // setting
                    window.localStorage.setItem(DONG_INFO.itemKey, JSON.stringify(data));
                }
                callback(null, 'dong success...,');
            }, function() {
                callback(null, 'dong failed!!!');
            });
        },
        common: function(callback) {
            getJSON('common', {
                in_gbn: '103,104,605' // 밴/트럭 상세정보, 문서수발
            }, function(data) {
                // setting
                COMMON_INFO = data;
                callback(null, 'common success...,');
            }, function() {
                callback(null, 'common failed!!!');
            });
        },
        autologin: function(callback) {
            var data = window.localStorage.getItem(CUST_INFO.itemKey);
            if(data) CUST_INFO.itemData = JSON.parse(data);
            data = window.localStorage.getItem(CUST_INFO.itemAutoLoggedIn);
            if(data) CUST_INFO.autoLoggedIn = JSON.parse(data) || false;
            if(isObject(CUST_INFO.itemData) && CUST_INFO.autoLoggedIn === true) {
                // get customer info
                getJSON('autologin', {
                    in_num: CUST_INFO.itemData.f_num,
                    in_id: CUST_INFO.itemData.f_id
                }, function(data) {
                    // setting
                    CUST_INFO.loggedIn = true;
                    CUST_INFO.itemData = data[0];
                    // save
                    window.localStorage.setItem(CUST_INFO.itemKey, JSON.stringify(CUST_INFO.itemData));
                    // panel-left
                    onMenuChangePanelLeft(true);
                    callback(null, 'autologin success...,');
                }, function() {
                    // setting
                    CUST_INFO.loggedIn = false;
                    CUST_INFO.autoLoggedIn = false;
                    // remove
                    window.localStorage.removeItem(CUST_INFO.itemKey);
                    window.localStorage.removeItem(CUST_INFO.itemAutoLoggedIn);
                    callback(null, 'autologin failed!!!');
                });
            } else {
                callback(null, '[Not AutoLog] autologin failed!!!');
            }
        },
        contact: function(callback) {
            // 문의 설정
            var contactEl = $$('.panel.panel-left').find('ul[id="contact-list"]');
            contactEl.empty();
            CONTACT_INFO.forEach(function(contact) {
                // contactEl.append(`
                // <li>
                //   <a href="#" class="item-content item-link close-panel" data-callnumber="${contact.callNumber}">
                //     <div class="item-inner">
                //       <div class="item-title">${contact.title}</div>
                //       <div class="item-after">${contact.showNumber}</div>
                //     </div>
                //   </a>
                // </li>
                // `);
                var html = [];
                html.push('<li>');
                html.push('  <a href="#" class="item-content item-link close-panel" data-callnumber="' + contact.callNumber + '">');
                html.push('    <div class="item-inner">');
                html.push('      <div class="item-title">' + contact.title + '</div>');
                html.push('      <div class="item-after"><i class="material-icons" style="font-size: 20px; margin-right: 4px;">contact_phone</i>' + contact.showNumber + '</div>');
                html.push('    </div>');
                html.push('  </a>');
                html.push('</li>');
                contactEl.append(html.join(''));
            });
            callback(null, 'contact success...,');
        },
        menu: function(callback) {
            $$('[data-page="index"] .content-block').css('height', 'auto');
            $$('[data-page="index"] .page-index-template-content').css('height', 'auto');
            if(isObject(CUST_INFO.itemData) && CUST_INFO.autoLoggedIn) {
                // mainView.router.back({url: 'index.html', force: true});
                setMenuTemplate();
            } else {
                // 로그인이 안되어 있는 상태 즉, 초기 상태라면 아래를 보여주도록...,
                if(!isObject(CUST_INFO.itemData)) {
                    setMenuTemplate([{
                        href: 'ifind.html',
                        class: 'link',
                        icon: 'icons/pages.png',
                        title: '기존고객찾기'
                    }, {
                        href: 'login.html',
                        class: 'link',
                        icon: 'icons/pages.png',
                        title: '로그인'
                    }]);
                }
            }
            callback(null, 'menu success...,');
        }
    }

    async.series([
        function(callback) {
            initialize.shortcut(callback); // 홈스크린
        },
        function(callback) {
            initialize.contact(callback); // 문의설정
        },
        function(callback) {
            initialize.callnumber(callback); // 내전화번호
        },
        function(callback) {
            initialize.autologin(callback); // 자동로그인
        },
        function(callback) {
            initialize.menu(callback); // 메뉴설정
        },
        function(callback) {
            initialize.dong(callback); // 주소캐쉬
        },
        function(callback) {
            initialize.updateversion(callback); // 버전관리
        },
        function(callback) {
            initialize.common(callback); // 공통코드
        }
    ], function(err, results) {
        CUST_INFO.init = false;
        CUST_INFO.indicator = true;
        if(err) console.log(err);
        // console.log(results);
    })
}
