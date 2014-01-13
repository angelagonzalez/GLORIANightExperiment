'use strict';

var numImages=0;

function TeleoperationExperimentCtrl(GloriaAPI, $scope, $timeout,
		$gloriaLocale, $routeParams) {

	$gloriaLocale.loadResource('telexp');

	$scope.requestRid = $routeParams.rid;
	$scope.reservationEnd = false;
	$scope.notAuthorized = false;
	$scope.serverDown = false;
	$scope.infoUpdated = false;
	$scope.wrongReservation = false;
	$scope.reservationActive = false;
	$scope.reservationObsolete = false;

	$scope.specificHtml = 'experiments/teleoperation/content.html';

	/*
	 * GloriaAPI.getActiveReservations(function(data) {
	 * data.forEach(function(element) { if ($scope.rid == undefined &&
	 * element.experiment == "SOLAR") {
	 * 
	 * if (element.status == "READY") { $scope.rid = element.reservationId;
	 * $scope.reservationActive = true; $scope.infoUpdated = true; } else if
	 * (element.status == "SCHEDULED") { $scope.preRid = element.reservationId;
	 * $scope.resTimer = $timeout($scope.onReservation, 1000); } } }); if
	 * ($scope.rid == undefined) { $scope.rid = -1; $scope.reservationActive =
	 * false; } }, function(error) { $scope.rid = -1; $scope.reservationActive =
	 * false; $scope.infoUpdated = true; }, function() { $scope.notAuthorized =
	 * true; });
	 */
	$scope.onReservation = function() {
		GloriaAPI.getReservationInformation($scope.preRid, function(data) {

			if (data.status == 'READY') {
				$scope.rid = $scope.preRid;
				$scope.reservationActive = true;
				$scope.infoUpdated = true;
			} else if (data.status == "SCHEDULED") {
				$scope.resTimer = $timeout($scope.onReservation, 1000);
			} else if (data.status == "OBSOLETE") {
				$scope.rid = -1;
				$scope.reservationObsolete = true;
				$scope.reservationActive = false;
				$scope.infoUpdated = true;
			}

		}, function(error) {
			$scope.rid = -1;
			$scope.reservationObsolete = false;
			$scope.reservationActive = false;
			$scope.infoUpdated = true;
		}, function() {
			$scope.notAuthorized = true;
		});
	};

	$scope.onUnauth = function() {
		$scope.$emit('unauthorized');
	};

	$scope.onDown = function() {
		$scope.$emit('server down');
	};

	$scope.onTimeout = function() {
		$scope.reservationActive = false;
	};

	$scope.onDeviceProblem = function() {
		$scope.deviceProblem = true;
		$scope.reservationActive = false;
	};

	$scope.$watch('reservationEnd', function() {
		if ($scope.reservationEnd) {
			$scope.endTimer = $timeout($scope.onTimeout, 1500);
		}
	});

	$scope.$watch('notAuthorized', function() {
		if ($scope.notAuthorized) {
			$scope.unauthTimer = $timeout($scope.onUnauth, 1500);
		}
	});

	$scope.$watch('serverDown', function() {
		if ($scope.serverDown) {
			$scope.srvTimer = $timeout($scope.onDown, 1500);
		}
	});

	$scope.$on('$destroy', function() {
		$timeout.cancel($scope.endTimer);
		$timeout.cancel($scope.unauthTimer);
		$timeout.cancel($scope.srvTimer);
		$timeout.cancel($scope.resTimer);
	});

	if ($routeParams.rid != undefined) {
		$scope.preRid = parseInt($scope.requestRid);

		if (!isNaN($scope.preRid)) {
			$scope.onReservation();
		} else {
			$scope.wrongReservation = true;
		}
	} else {
		$scope.reservationActive = true;
	}
}

function InitDevices(GloriaAPI, $scope){
	//GlAPI = GloriaAPI;
	
	//$scope.ccd_order = 0;

		GloriaAPI.executeOperation($scope.requestRid,'get_filters', function(success){
			GloriaAPI.getParameterValue($scope.requestRid, 'fw', function(listFilters){
				$scope.filters_0 = listFilters.filters;
				//$scope.filter = listFilters.filters[0];
				GloriaAPI.setParameterTreeValue($scope.requestRid,'fw','selected',listFilters.filters[0],function(success){
					
				}, function(error){
					
				});
			}, function(error){
				//alert(error);
			});
				
		}, function(dataError, statusError){

		});
	
	
	GloriaAPI.executeOperation($scope.requestRid,'get_ccd_attributes', function(success){
			
	}, function(error){
		//alert(error);
	});
		
		GloriaAPI.getImagesByContext($scope.requestRid,function(success){
			 $.each(success, function(i, image){ //Iterate among all images generate previously
					var htmlCode = "<a rel=\"prettyPhoto[caroufredsel]\" href=\""+image.jpg+"\" style=\"width:235px\">";
					htmlCode = htmlCode + "<img src=\""+image.jpg+"\"/></a>";
					$(htmlCode).appendTo("#foo2");
					numImages++;
					
		            console.log(image.jpg);
		        });
			 
			 //If number of  images is greater than 4, apply carousel effect
			 if (numImages>4){
					$("#foo2").carouFredSel({
						circular: false,
						infinity: false,
						auto : false,
						responsive:true,
						items:4,
						width:"variable",
						prev : "#foo1_prev",
						next : "#foo1_next"
					});			
				}
			 	//If the number of images is greater than 0, apply pretty effect
			 	if (numImages>0){
					$("#foo2 a").prettyPhoto({
						theme: "facebook",
						changepicturecallback: function() {
							$("#foo2").trigger("pause");
						},
						callback: function() {
							$("#foo2").trigger("play");
						}
					});			 		
			 	}
			
		}, function(error){
			
		});
		/*
		GloriaAPI.getParameterTreeValue($scope.reservation,'focuser','position',function(success){
			console.log("Initial position:"+success);
		}, function(dataError,statusError){

		});
 */
}

function GetCamerasCtrl(GloriaAPI, $scope){
	//Cambiar a $scope.rid
		GloriaAPI.getParameterValue($scope.requestRid,'cameras',function(success){
			
			//$("#scam0").append("<img src=\""+success.scam.images[0].url+"\" width=\"100px\"/>");
			//$("#scam1").append("<img src=\""+success.scam.images[1].url+"\"/>");
				
				for (var nscam=0;nscam<success.scam.number;nscam++){
					
					var scamCode = "<div style=\"margin-top:"+80+"px;\">" +
							"<div style=\"width:100px;text-align:center;\"><span class=\"title\">"+success.scam.images[nscam].name+"</span></div>" +
							"<div class=\"expand\" style=\"z-index:"+(500-nscam)+";\">" +
							"<div class=\"positioner\">" +
							"<a class=\"slide\" aria-haspopup=\"true\">";
					scamCode = scamCode + "<img src=\""+success.scam.images[nscam].url+"\"/>";
					scamCode = scamCode + "</a></div></div></div>";
					
					$("#surveillance_panel").append(scamCode);	
				}
				
			}, function(error){
					alert(error);
					});

}
/* Devices controllers */
function MountDevice(GloriaAPI , $scope){
	
	$scope.go = function(){

		var raRegularExpr = new RegExp(/^[-]?[0-9]+.[0-9]+$/);
		var decRegularExpr = new RegExp(/^[-]?[0-9]+.[0-9]+$/);
		var ra_value = $("#coords_ra").val();
		var dec_value = $("#coords_dec").val();
		
		if ($("#tags").val() == ""){	//Check if this field is empty
			if ((ra_value.match(raRegularExpr)) && (ra_value>=0) && (ra_value<360)){
					if ((dec_value.match(decRegularExpr) && (dec_value>=-90) && (dec_value<=90))){
						//Set radec
						SetRADEC(GloriaAPI, Sequence, $scope);
						//Execute go operation
						//GoRADEC(GloriaAPI, Sequence, $scope);
						
						
					} else {
						alert("Wrong dec value (MIN:-90, MAX:90)");
					}
			}  else {
				alert("Wrong ra value (MIN:0, MAX:360 not incluided)");
			}	
		} else {
			//Set target name
			SetTargetName(GloriaAPI, Sequence, $scope);
			//Execute go operation
			//GoTargetName(GloriaAPI, Sequence, $scope)

		}
		
	};
}
function CcdDevice(GloriaAPI, $scope, $timeout){
	
	
	
	$scope.setFilter = function(){
		GloriaAPI.setParameterTreeValue($scope.reservation,'fw','selected',$scope.filter,function(success){
			
		}, function(error){
			
		});
	};
	
	$scope.setOrder = function(order) {
		$scope.ccd_order = order;
		/*if ($scope.exposure_time[$scope.ccd_order] != undefined){
			$scope.exposure_time = $scope.exposure_time[$scope.ccd_order];
		}*/
		if (order == 0){
			$("#ccd_button_0").attr("class", "ccd_button_selected");
			$("#ccd_button_1").attr("class", "ccd_button");
			$("#filter_selector").removeAttr("disabled");
		} else if (order == 1){
			$("#ccd_button_1").attr("class", "ccd_button_selected");
			$("#ccd_button_0").attr("class", "ccd_button");
			$("#filter_selector").attr("disabled",true);
		}
		GloriaAPI.setParameterTreeValue($scope.requestRid,'cameras','ccd.order',parseInt(order),function(success){
			//ccdOrder = parseInt(order);
		}, function(error){
			
		});
	};
	
	$scope.expose = function(){

		if (!isNaN($scope.exposure_time) && ($scope.exposure_time>0) && ($scope.exposure_time<=120)){
			$("#expose_0_button").attr("disabled",true);
			//$("#loading").css("visibility","visible");
			$("#ccd_status").addClass("mess-info");
			$scope.status_main_ccd = "EXPOSING";
			$scope.exposure_time[$scope.ccd_order] = $scope.exposure_time;
			num_ccd_timer=max_ccd_timer;
			/*
			console.log("set exposure time");
			SetExposureTime(GloriaAPI, Sequence, $scope);
			console.log("set ccd attributes");
			SetCCDAttributes(GloriaAPI, Sequence, $scope);
			console.log("start exposure");
			StartExposure(GloriaAPI, Sequence, $scope, $timeout);
			*/
		} else {
			alert("Wrong parameter exposure time (MIN:0, MAX:120)");
		}
		
	};
}

/* Auxiliar functions */
function GetFilters(GloriaAPI, $scope, cid){
	GloriaAPI.getParameterValue(cid, 'fw', function(success){
		$scope.filters_0 = success.filters;
		$scope.filter = success.filters[0];
		GloriaAPI.setParameterTreeValue($scope.reservation,'fw','selected',$scope.filter,function(success){
			
		}, function(error){
			
		});
	}, function(error){
		//alert(error);
	});
	
}
function rotateAnnotationCropper(offsetSelector, xCoordinate, yCoordinate, cropper){
    //alert(offsetSelector.left);
    var x = xCoordinate - offsetSelector.offset().left - offsetSelector.width()/2;
    var y = -1*(yCoordinate - offsetSelector.offset().top - offsetSelector.height()/2);
    var theta = Math.atan2(y,x)*(180/Math.PI);        


    var cssDegs = convertThetaToCssDegs(theta);
        
    return cssDegs;   
}

function convertThetaToCssDegs(theta){
	var cssDegs = 90 - theta;
	return cssDegs;
}