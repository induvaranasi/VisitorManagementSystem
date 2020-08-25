jQuery.sap.require("sap.ndc.BarcodeScanner");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ndc/BarcodeScanner"
], function (Controller, UIComponent, JSONModel, MessageBox, MessageToast, BarcodeScanner) {
	"use strict";

	return Controller.extend("com.incture.VMSApplicationUI5.controller.Parking", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.incture.VMSApplicationUI5.view.Parking
		 */
		onInit: function () {
			var oData = {
				"vhId": "",
				"visitorParkingData": "",
				"newVisitorParkingData": "",
				"oFormData": {
					"parkingType": "",
					"vehicleNo": "",
					"pId": ""
				},
				"AvailableParkingSlots": "",
				"AllParkingSlots": "",
				"sSelectedKey": ""

			};
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel, "oParkingModel");
			var oParkingModel = this.getView().getModel("oParkingModel");
			var sUrl = "/VMS_Service/visitor/getAllParking";
			$.ajax({
				url: sUrl,
				data: null,
				async: true,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					sap.m.MessageToast.show("Data Successfully Loaded");

					oParkingModel.setProperty("/AllParkingSlots", data);

				},
				type: "GET"
			});

		},
		onImagePress: function () {
			this.getRouter().navTo("RouteApp");

		},
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},
		onScancodeCheckIn: function () {
			var that = this;
			var oParkingModel = this.getView().getModel("oParkingModel");
			// var vhId = oParkingModel.getProperty("/vhId");
			var vhId, sUrl;
			sap.ndc.BarcodeScanner.scan(
				function (oResult) {
					// console.log(oResult);
					vhId = oResult.text;
					// oParkingModel.setProperty("/vhId", vhId);
					console.log(vhId);
					sUrl = "/VMS_Service/security/getParkingSlotByvhId?vhId=" + vhId;
					$.ajax({
						url: sUrl,
						type: "GET",
						data: null,

						// dataType: "json",
						success: function (data, status, response) {
							// sap.m.MessageToast.show("Success");
							console.log(data);

							oParkingModel.setProperty("/visitorParkingData", data);
							// console.log(status);
							// console.log(response);

							// that.fnGetData();

						},
						error: function (e) {
							sap.m.MessageToast.show("fail");

						}
					});

					that.getView().byId("idParking").setVisible(true);
					that.getView().byId("idParkingSignIn").setVisible(false);
					// alert("We got a bar code\n" +
					// 	"Result: " + oResult.text + "\n" +
					// 	"Format: " + oResult.format + "\n" +
					// 	"Cancelled: " + oResult.cancelled);
					// / * process scan result * /
				},
				function (oError) {
					// alert(oError);
					// / * handle scan error * /
				},
				function (oResult) {
					// / * handle input dialog change * /
				}
			);
		},
		// onScancodeCheckin: function () {
		// 	var oParkingModel = this.getView().getModel("oParkingModel");
		// 	var vhId = oParkingModel.getProperty("/vhId");
		// 	var sUrl = "/VMS_Service/security/getParkingSlotByvhId?vhId=" + vhId;
		// 	$.ajax({
		// 		url: sUrl,
		// 		type: "GET",
		// 		data: null,

		// 		// dataType: "json",
		// 		success: function (data, status, response) {
		// 			// sap.m.MessageToast.show("Success");
		// 			console.log(data);
		// 			oParkingModel.setProperty("/visitorParkingData", data);
		// 			console.log(status);
		// 			console.log(response);

		// 			// that.fnGetData();

		// 		},
		// 		error: function (e) {
		// 			sap.m.MessageToast.show("fail");

		// 		}
		// 	});

		// 	this.getView().byId("idParking").setVisible(true);
		// 	this.getView().byId("idParkingSignIn").setVisible(false);
		// },
		onScanCodeCheckOut: function () {
			// var that = this;
			// var oParkingModel = this.getView().getModel("oParkingModel");
			// var vhId = oParkingModel.getProperty("/vhId");
			var vhId;
			sap.ndc.BarcodeScanner.scan(
				function (oResult) {
					// console.log(oResult);
					vhId = oResult.text;
					// oParkingModel.setProperty("/vhId", vhId);
					console.log(vhId);

					$.ajax({
						url: "/VMS_Service/visitor/checkOut",
						type: "POST",
						data: {
							"vhId": vhId,

						},
						// headers: {
						// 	"X-CSRF-Token": token
						// },

						dataType: "json",
						success: function (data, status, response) {
							if (data.status === 200) {

								MessageBox.success("Thank You For Visiting!!Visit Again!!");

							} else {
								MessageToast.show("Something Went Wrong");
							}

							// that.fnGetData();

						},
						error: function (e) {
							sap.m.MessageToast.show("fail");

						}
					});

				},
				function (oError) {
					// alert(oError);
					// / * handle scan error * /
				},
				function (oResult) {
					// / * handle input dialog change * /
				}
			);

		},
		onLoginSubmitPress: function () {
			var oParkingModel = this.getView().getModel("oParkingModel");
			var pId = oParkingModel.getProperty("/visitorParkingData").pId;
			var vehicleNumber = oParkingModel.getProperty("/visitorParkingData").vehicleNo;
			console.log(pId);
			console.log(vehicleNumber);
			$.ajax({
				url: "/VMS_Service/visitor/setPakingStatusOnParking",
				type: "POST",
				data: {
					"pId": 1,
					"vehicleNo": "AP3537"
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },

				dataType: "json",
				success: function (data, status, response) {
					if (data.status === 200) {
						oParkingModel.setProperty("/visitorParkingData", {});
						// this.getView().byId("idVehicleNumber").setValue("");

						MessageBox.success("Please Go ahead and Park Your Vehicle");

					} else {
						MessageToast.show("Something Went Wrong");
					}

					// that.fnGetData();

				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
			this.getView().byId("idParking").setVisible(false);
			this.getView().byId("idParkingSignIn").setVisible(true);
		},
		onParkingAvailabilityPress: function () {
			var oParkingModel = this.getView().getModel("oParkingModel");
			var oFormData = oParkingModel.getProperty("/oFormData");
			var parkingType = oFormData.parkingType;
			var sUrl = "/VMS_Service/security/getParkingSlots?parkingType=" + parkingType;
			$.ajax({
				url: sUrl,
				type: "GET",
				data: null,

				// dataType: "json",
				success: function (data, status, response) {
					sap.m.MessageToast.show("Success");
					console.log(data);
					oParkingModel.setProperty("/AvailableParkingSlots", data);
					console.log(status);
					console.log(response);

					// that.fnGetData();

				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
			this.getView().byId("idParkingAvailability").setVisible(true);
		},
		onRegisterSubmitPress: function () {
			var oParkingModel = this.getView().getModel("oParkingModel");
			var oFormData = oParkingModel.getProperty("/oFormData");
			// var vehicleNumber = this.getView().byId("idVehicleNumber").getValue();
			console.log(oFormData);
			// console.log(vehicleNumber);
			$.ajax({
				url: "/VMS_Service/visitor/setPakingStatusOnParking",
				type: "POST",
				data: {
					"pId": oFormData.pId,
					"vehicleNo": oFormData.vehicleNo
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },

				dataType: "json",
				success: function (data, status, response) {
					if (data.status === 200) {
						oParkingModel.setProperty("/oFormData", {});

						MessageBox.success("Please Go ahead and Park Your Vehicle");

					} else {
						MessageToast.show("Something Went Wrong");
					}

					// that.fnGetData();

				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
			this.getView().byId("idParkingAvailability").setVisible(false);
		},
		onCheckOut: function () {
				var oParkingModel = this.getView().getModel("oParkingModel");
				var pId = oParkingModel.getProperty("/sSelectedKey");
				$.ajax({
					url: "/VMS_Service/admin/setParkingStatus",
					type: "POST",
					data: {
						"pId": pId,
						"status": 0
					},

					// dataType: "json",
					success: function (data, status, response) {

						MessageBox.success("Thank You For Visiting!!Visit Again!!");
						oParkingModel.setProperty("/sSelectedKey", {});
						console.log(data);

						// that.fnGetData();

					},
					error: function (e) {
						sap.m.MessageToast.show("fail");

					}
				});
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf com.incture.VMSApplicationUI5.view.Parking
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.incture.VMSApplicationUI5.view.Parking
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.incture.VMSApplicationUI5.view.Parking
		 */
		//	onExit: function() {
		//
		//	}

	});

});