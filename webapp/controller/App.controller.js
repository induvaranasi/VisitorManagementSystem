sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast"
], function (Controller, UIComponent, MessageToast) {
	"use strict";

	return Controller.extend("com.incture.VMSApplicationUI5.controller.App", {
		onInit: function () {

		},
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},
		onHostPress: function (oEvent) {
			// MessageToast.show("Host is Pressed");
			this.getRouter().navTo("AdminLogin");
		},
		onVisitorPress: function () {
			this.getRouter().navTo("VisitorDetails");
		},
		onAdminPress: function (oEvent) {
			// MessageToast.show("Host is Pressed");
			this.getRouter().navTo("AdminLogin");
		},
		onSecurityPress: function (oEvent) {
			// MessageToast.show("Host is Pressed");
			this.getRouter().navTo("AdminLogin");
		},
		onParkingPress: function(oEvent){
			this.getRouter().navTo("ParkingDetails");
		}
	});
});