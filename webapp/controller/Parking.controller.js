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
					// sap.m.MessageToast.show("Data Successfully Loaded");

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
					if (oResult.cancelled === false) {
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
						// that.getView().byId("idParkingSignIn").setVisible(false);
						that.getView().byId("idRegister").setVisible(false);
					}
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
					"pId": pId,
					"vehicleNo": vehicleNumber
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
			this.getView().byId("idRegister").setVisible(true);
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
			var that = this;
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
						var sUrl = "/VMS_Service/visitor/getAllParking";
						that.fnGetData(sUrl, "/AllParkingSlots");

					} else {
						MessageBox.warning("Please Select Parking Slot by checking the Availability");
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
			var that = this;
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
					oParkingModel.setProperty("/sSelectedKey", "");
					console.log(data);
					var sUrl = "/VMS_Service/visitor/getAllParking";
					that.fnGetData(sUrl, "/AllParkingSlots");

					// that.fnGetData();

				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
		},
		fnGetData: function (sUrl, sProperty) {
			var that = this;
			var oParkingModel = that.getView().getModel("oParkingModel");
			$.ajax({
				url: sUrl,
				data: null,
				async: true,
				headers: {
					dataType: "json",
					contentType: "application/json; charset=utf-8"

				},
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					// sap.m.MessageToast.show("Data Successfully Loaded");
					oParkingModel.setProperty(sProperty, data);

				},
				type: "GET"
			});
		}

	});

});