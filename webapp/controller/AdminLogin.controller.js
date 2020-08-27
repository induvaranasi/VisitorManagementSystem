sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, UIComponent, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("com.incture.VMSApplicationUI5.controller.AdminLogin", {

		onInit: function () {
			var oLoginFormData = {
				"username": "",
				"password": ""
			};
			var oLoginModel = this.getOwnerComponent().getModel("oLoginModel");
			oLoginModel.setProperty("/oLoginFormData", oLoginFormData);
			console.log(oLoginModel);
			var oForgotPasswordData = {
				"username": "",
				"mail": "",
				"otp": "",
				"newPassword": ""
			};
			oLoginModel.setProperty("/oForgotPasswordData", oForgotPasswordData);
			// var token = {
			// 	"csrftoken": ""
			// };
			// var oTokenModel = new JSONModel(token);
			// this.getView().setModel(oTokenModel, "oTokenModel");
			// this.fnGetData();

		},
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},
		// fnGetData: function () {
		// 	var that = this;
		// 	var oToken = that.getView().getModel("oTokenModel").getProperty("csrftoken");
		// 	var sUrl1 = "/VMS_Service/admin/getAllVisitorHistory?date=jul 26, 2020";
		// 	$.ajax({
		// 		url: sUrl1,
		// 		data: null,
		// 		async: true,
		// 		headers: {
		// 			dataType: "json",
		// 			contentType: "application/json; charset=utf-8",
		// 			"X-CSRF-Token": "Fetch"
		// 		},
		// 		error: function (err) {
		// 			sap.m.MessageToast.show("Destination Failed");
		// 		},
		// 		success: function (data, status, response) {

		// 			sap.m.MessageToast.show("Data Successfully Loaded");
		// 			oToken = response.getResponseHeader("x-csrf-token");
		// 			that.getView().getModel("oTokenModel").setProperty("/csrftoken", oToken);
		// 			console.log(oToken);
		// 			console.log(response);

		// 		},
		// 		type: "GET"
		// 	});
		// },

		onLoginPress: function () {
			// var oDialog = sap.m.BusyDialog();
			// oDialog.open();
			// setTimeout(function () {
			// 	oDialog.close();
			// }, 3000);
			var that = this;
			var sUrl = "/VMS_Service/admin/login";
			var oSecurityModel = this.getOwnerComponent().getModel("oSecurityModel");
			var oAdminModel = this.getOwnerComponent().getModel("oAdminModel");
			var oHostModel = this.getOwnerComponent().getModel("oHostModel");
			// var oTokenModel = that.getView().getModel("oTokenModel");
			// var oToken = oTokenModel.getData();
			// var token = oToken.csrftoken;
			// console.log(token);
			var oLoginModel = that.getView().getModel("oLoginModel");
			var obj = oLoginModel.getProperty("/oLoginFormData");
			console.log(obj);
			oLoginModel.setProperty("/oLoginFormData", obj);
			console.log(oLoginModel);
			$.ajax({
				url: sUrl,
				type: "POST",
				data: {
					"username": obj.username,
					"password": obj.password
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },
				dataType: "json",
				success: function (data, status, response) {
					sap.m.MessageToast.show("Success");
					console.log(data);
					console.log(response);
					if (data.status === true && data.role === "ADMIN") {
						sap.m.MessageToast.show("Successfully Logged IN");
						oAdminModel.setProperty("/userDetails", data);
						that.getRouter().navTo("AdminDetails");
					} else if (data.status === true && data.role === "HOST") {
						sap.m.MessageToast.show("Successfully Logged IN");
						oHostModel.setProperty("/userDetails", data);
						that.getRouter().navTo("HostDetails");
					} else if (data.status === true && data.role === "SECURITY") {
						sap.m.MessageToast.show("Successfully Logged IN");
						oSecurityModel.setProperty("/userDetails", data);
						that.getRouter().navTo("SecurityDetails");
					} else {
						MessageBox.warning("Invalid Credentials");
					}

				},
				error: function (e) {
					MessageBox.information("Server Not Responding");
					console.log(e);
					// that.getRouter().navTo("AdminDetails");
				}
			});
			// that.getRouter().navTo("AdminDetails");
		},
		onPressImage: function () {
			this.getRouter().navTo("RouteApp");
			this.getView().byId("idLogin").setVisible(true);
			this.getView().byId("idForgtPassword").setVisible(false);
			this.getView().byId("idotp").setVisible(false);
			this.getView().byId("idNewPassword").setVisible(false);
		},
		onForgotpasswordPress: function () {
			this.getView().byId("idLogin").setVisible(false);
			this.getView().byId("idForgtPassword").setVisible(true);

		},
		onSubmitPress: function () {
			// this.getView().byId("idvbox1").setVisible(false);

			var that = this;
			var oLoginModel = that.getView().getModel("oLoginModel");
			var obj = oLoginModel.getProperty("/oForgotPasswordData");
			var sUrl = "/VMS_Service/admin/sendOtp";
			$.ajax({
				url: sUrl,
				type: "POST",
				data: {
					"email": obj.username
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },
				dataType: "json",
				success: function (data, status, response) {

					console.log(data);
					if (data.status === 300) {
						MessageBox.warning("Invalid User Name");
					} else {
						that.getView().byId("idForgtPassword").setVisible(false);
						that.getView().byId("idotp").setVisible(true);
					}
				},
				error: function (e) {
					sap.m.MessageToast.show("Server Not Responding");
				}
			});
		},
		onVerify: function () {

			var that = this;
			var oLoginModel = that.getView().getModel("oLoginModel");
			var obj = oLoginModel.getProperty("/oForgotPasswordData");
			var sUrl = "/VMS_Service/admin/verifyOtp";
			$.ajax({
				url: sUrl,
				type: "POST",
				data: {
					"email": obj.username,
					"otp": obj.otp
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },
				dataType: "json",
				success: function (data, status, response) {
					if (data.status === 300) {
						MessageBox.warning("Invalid OTP");
					} else {
						that.getView().byId("idotp").setVisible(false);
						that.getView().byId("idNewPassword").setVisible(true);
					}
				},
				error: function (e) {
					sap.m.MessageToast.show("Server Not Responding");
				}
			});
		},
		onChangePassword: function () {
			var that = this;
			var oLoginModel = that.getView().getModel("oLoginModel");
			var obj = oLoginModel.getProperty("/oForgotPasswordData");
			var sUrl = "/VMS_Service/admin/forgotPassword";
			$.ajax({
				url: sUrl,
				type: "POST",
				data: {
					"email": obj.username,
					"password": obj.newPassword
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },
				dataType: "json",
				success: function (data, status, response) {
					MessageBox.success("Password Changed Successfully..Please Login to Continue");
					that.getView().byId("idNewPassword").setVisible(false);
					that.getView().byId("idLogin").setVisible(true);
				},
				error: function (e) {
					sap.m.MessageToast.show("Server Not Responding");
				}
			});
		}

	});

});