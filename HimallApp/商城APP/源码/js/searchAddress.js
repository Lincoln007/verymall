//页面级参数
var positionKeyName = 'curPosition',
	fromLatLng = '',
	curAddress = '',
	cityId = '';
cityName = '',
	isRefresh = true;
proId = 0, cityId = 0, districtId = 0, streetId = 0,
	searchService,
	pageIndex = 0,
	pageCapacity = 100,
	geocoder,
	hasData = true,
	userkey = himall.getState().userkey;

$(function() {

	var spanCityName = document.getElementById("spanCityName");
	$.ajax({
		url: '/common/RegionAPI/GetAllRegion',
		type: 'get', //GET
		async: true, //或false,是否异步
		data: {},
		timeout: 10000, //超时时间
		dataType: 'json', //返回的数据格式：json/xml/html/script/jsonp/text
		success: function(data, textStatus, jqXHR) {
			cityPicker3 = new mui.PopPicker({
				layer: 2
			});
			cityPicker3.setData(data);
			spanCityName.addEventListener('tap', function() {
				cityPicker3.show(function(items) {
					spanCityName.innerHTML = (items[1].Name || '');
					cityName = items[1].Name || '';
				});
			}, false);
		}
	});
	//加载收货地址

	bindUserAddress();

});

function setUserAddressHeight() {
	var listLength = $("#locates li").length;
	if(listLength > 2) {
		$("#locates li").eq(1).nextAll().hide();
		$("#shousuo").html('还有<i>' + (listLength - 2) + '</i>个收货地址');
		$("#shousuo").click(function() {
			if($("#locates li").eq(2).is(":hidden")) {
				$("#locates li").eq(1).nextAll().show();
				$("#shousuo").addClass('active');
				$("#shousuo").html('收起');
			} else {
				$("#locates li").eq(1).nextAll().hide();
				$("#shousuo").removeClass('active');
				$("#shousuo").html('还有<i>' + (listLength - 2) + '</i>个收货地址');
			}
		});
	} else {
		$("#shousuo").hide();
		if(listLength == 0) {
			$("#divDeliveryAddress").hide();
		}
	}
}

$(document).ready(function() {
	//设置Poi检索服务，用于本地检索、周边检索
	searchService = new qq.maps.SearchService({
		//检索成功的回调函数
		complete: function(results) {
			//设置回调函数参数
			var pois = results.detail.pois;
			if(pois == undefined) {
				$("#divMore").html("查询不到数据");
			} else {
				for(var i = 0, l = pois.length; i < l; i++) {
					var poi = pois[i];
					if(typeof(poi.address) != "undefined") {
						var parText = "\'" + poi.latLng.lat + ',' + poi.latLng.lng + "\'" + "," + "\'" + poi.address + "\'" + "," + "\'" + poi.name + "\'";
						$("#nearAddress").append('<li data-addr=\"' + poi.name + '\" onclick="choosePosition(' + parText + ')"> <h3>' + poi.name + '</h3><p>' + poi.address + '</p></li>');
					}
				}
				$("#divAdr").show();
				if(pois.length < 10) {
					$("#divMore").html("附近没有更多地址了");
					hasData = false;
				} else {
					//$("#divMore").html("加载更多...");
				}
				pageIndex++;
			}
		},
		//若服务请求失败，则运行以下函数
		error: function() {
			$("#divMore").html("查询不到数据");
		}
	});
	$("#divAdr").hide();
	$("#consigneeAddress").bind('input propertychange', function() {
		var keyword = $("#consigneeAddress").val();
		if(keyword != "" && keyword != null) {
			searchKeyword(1);
		}
	});

	fromLatLng = GetQueryString(positionKeyName) || '';
	curAddress = decodeURIComponent(escape(GetQueryString('curAddress') || ''));
	cityName = decodeURIComponent(escape(GetQueryString('CityInfoName') || ''));
	cityId = decodeURIComponent(escape(GetQueryString('CityInfoId') || ''));
	$('#curAddress').text(curAddress == '' ? '无法定位' : curAddress);
	$('#spanCityName').text(cityName == '' ? '请选择' : cityName);
	$('#curAddress').click(function() {
		choosePosition(fromLatLng);
	});
	//设置位置搜索服务参数
	setSearchServiceOption(curAddress);
});

function setSearchServiceOption(keyword) {
	//根据输入的城市设置搜索范围
	searchService.setLocation(cityName);
	//设置搜索页码
	searchService.setPageIndex(pageIndex);
	//设置每页的结果数
	searchService.setPageCapacity(pageCapacity);
	//根据输入的关键字在搜索范围内检索
	searchService.search(keyword);
}

function geoPosition() {
	var mapkey = $("#hdQQMapKey").val();
	var geolocation = new qq.maps.Geolocation(mapkey, "myapp");
	if(geolocation) {
		geolocation.getLocation(getPositionSuccess, ShowError)
	} else {
		$.dialog.tips("请在系统设置中打开“定位服务“允许Himall商城获取您的位置");
	}
}
//获取定位
function getPositionSuccess(position) {
	var lat = position.lat;
	var lng = position.lng;
	fromLatLng = lat + ',' + lng;
	//本地存储当前位置经纬度
	$.addCurPositionCookie(fromLatLng);
	if(position.city) {
		cityName = position.city;
	}
	if(position.addr) {
		curAddress = position.addr;
	} else if(position.district) {
		curAddress = position.district;
	}

	$('#curAddress').text(curAddress == '' ? cityName : curAddress);
	$('#spanCityName').text(cityName == '' ? '请选择' : cityName);
	console.log(fromLatLng);

}
//定位错误
function ShowError(error) {
	switch(error.code) {
		case error.PERMISSION_DENIED:
			break;
		case error.POSITION_UNAVAILABLE:
			break;
		case error.TIMEOUT:
			break;
		case error.UNKNOWN_ERROR:
			break;
	}
}
//设置搜索的范围和关键字等属性
function searchKeyword(index) {
	if(!isRefresh && index == 2) {
		isRefresh = true;
		return;
	}
	//$("#container").hide();
	$("#divAdr").show();
	var keyword = $("#txtKeyWord").val();
	if(keyword == "") {
		$.dialog.tips("请输入要搜索的地址信息");
		return;
	}
	if(index == 1) {
		pageIndex = 0;
		hasData = true;
		$("#nearAddress").empty();
	} else {
		if(!hasData) {
			return;
		}
	}
	//设置位置搜索服务参数
	setSearchServiceOption(keyword);
}
//--------滚动时，往下加载数据 start--------------

function scrollLoadData() {
	var scrollTop = $(this).scrollTop();
	var scrollHeight = $(this)[0].scrollHeight;
	var windowHeight = $(this).height();
	if(scrollTop + windowHeight >= scrollHeight) {
		setTimeout(searchKeyword(2), 200);
	}
}
$(window).scroll(function() {
	if(hasData)
		scrollLoadData();
});
//选择地址操作，返回周边门店
function choosePosition(latLng, address, name) {
	$("#Longitude").val(latLng.split(',')[1].trim());
	$("#Latitude").val(latLng.split(',')[0].trim());
	isRefresh = false;
	$("#divAdr").hide();
	$.addCurPositionCookie(latLng);
	location.href = './StoreList';
}

function getNewAddress(address, showCity, street) {
	if(showCity != '') {
		var storeAreaArr = showCity.split(' ');
		if(street != '') {
			storeAreaArr.push(street);
		}
		for(var i = 0; i < storeAreaArr.length; i++) {
			address = address.replace(storeAreaArr[i], '');
		}
	}
	return address;
}

function bindUserAddress() {
	var dataUrl = URL + 'api/ShippingAddress/GetShippingAddressList';
	$.ajax({
		url: dataUrl,
		type: 'get',
		data: himall.md5Data({
			userkey: userkey
		}),
		dataType: 'json',
		success: function(result) {
			console.log(result);
			if(result.success) {
				var data = result.Data;
				var htmlArray = new Array();
				if(data.length > 0) {
					$.each(data, function(idx, item) {
						if(item.latitude && item.longitude) {
							var parText = "\'" + item.latitude + ',' + item.longitude + "\'" + "," + "\'" + item.fullRegionName + "\'" + "," + "\'" + item.address + "\'";
							htmlArray.push('<li onclick="choosePosition(' + parText + ')">');
							htmlArray.push('<h3>' + item.fullRegionName + ' ' + item.address + '</h3>');
							htmlArray.push('<p>' + item.shipTo + '，' + item.phone + '</p>');
							htmlArray.push('</li>');
						}
					});
				} else {
					var addAddressUrl = '/' + areaName + '/Order/EditShippingAddress';
					htmlArray.push('< h3 >暂无收货地址</h3 ><a href="' + addAddressUrl + '"></a>');
				}
				$('#locates').html(htmlArray.join(''));

				//设置收货地址高度
				setUserAddressHeight();
			} else {
				if(result.msg == 'nologin') {
					$("#shousuo").hide();
					$('#locates').html("<li>未登录，无法获取地址信息</li>");
				}
			}
		}
	});
}

function GetQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) return unescape(r[2]);
	return null;
};