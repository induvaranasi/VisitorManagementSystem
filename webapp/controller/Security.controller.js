sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../utility/formatter",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function (Controller, UIComponent, MessageToast, JSONModel, Filter, FilterOperator, formatter, Fragment, MessageBox) {
	"use strict";

	return Controller.extend("com.incture.VMSApplicationUI5.controller.Security", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.incture.VMSApplicationUI5.view.Security
		 */
		onInit: function () {
			// var oModel = new JSONModel("./model/Visitors.json");
			// this.getView().setModel(oModel, "oSecurityTableModel");
			var oDeliveryData = {
				"date": "",
				"deliveryType": "",
				"mobileNo": ""

			};

			var oSecurityModel = this.getOwnerComponent().getModel("oSecurityModel");
			oSecurityModel.setProperty("/oDeliveryData", oDeliveryData);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MMM dd, yyyy"
			});
			var date = new Date();
			var newdate = oDateFormat.format(date);
			console.log(newdate);
			oSecurityModel.setProperty("/date", newdate);

			// var token = {
			// 	"csrftoken": ""
			// };
			// var oTokenModel = new JSONModel(token);
			// this.getView().setModel(oTokenModel, "oTokenModel");

			var signature = {
				"sSelectedKey": "",
			};
			var oModel = new JSONModel(signature);
			this.getView().setModel(oModel, "oSignatureModel");
			var sUrl1 = "/VMS_Service/security/getAllVisitorHistory?date=" + newdate;
			var sUrl2 = "/VMS_Service/admin/getAllBlackListedVisitors";
			var sUrl3 = "/VMS_Service/security/getParkingSlots";
			var sUrl4 = "/VMS_Service/security/getRecentDelivery?date=" + newdate;
			var sUrl5 = "/VMS_Service/security/getCheckedInVisitors?date=" + newdate;
			var sUrl6 = "/VMS_Service/admin/getCheckedOutVisitors?date=" + newdate;
			var sUrl7 = "/VMS_Service/security/getExpectedVisitors?date=" + newdate;

			this.fnGetData(sUrl1, "/Details");
			this.fnGetData(sUrl3, "/ParkingDetails");
			this.fnGetData(sUrl2, "/BlackListed");
			this.fnGetData(sUrl4, "/DeliveryDetails");
			this.fnGetData(sUrl5, "/CheckInDetails");
			this.fnGetData(sUrl6, "/CheckedOutDetails");
			this.fnGetData(sUrl7, "/ExpectedVisitorDetails");
			var eId = oSecurityModel.getProperty("/userDetails").eId;
			var sUrl8 = "/VMS_Service/admin/notificationCounter?eId=" + eId;
			var count;
			$.ajax({
				url: sUrl8,
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
					sap.m.MessageToast.show("Data Successfully Loaded");
					console.log(data);
					count = data.count;
					var countupdated = count.toString();
					oSecurityModel.setProperty("/Notificationcount", countupdated);
					console.log(countupdated);
					console.log(oSecurityModel);

				},
				type: "GET"
			});
			var sUrl10 = "wss://projectvmsp2002476966trial.hanatrial.ondemand.com/vms/chat/" + eId;
			// var sUrl1 = "/VMS_Service/chat/1";
			var webSocket = new WebSocket(sUrl10);
			webSocket.onerror = function (event) {
				// alert(event.data);

			};
			webSocket.onopen = function (event) {
				// alert(event.data);

			};
			webSocket.onmessage = function (event) {
				// alert(event.data);
				count = count + 1;
				var countupdated = count.toString();
				oSecurityModel.setProperty("/Notificationcount", countupdated);
				// alert(event.data);

			};
		},
		onPressImage: function () {

			this.getRouter().navTo("RouteApp");
			// Routeapp

		},
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},
		onSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("visitorName", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			// update list binding
			// var oList = this.byId("idVisitorsTable");
			var oList = oEvent.getSource().getParent().getParent();
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "Application");
		},
		fnGetNotificationsData: function () {
			var oSecurityModel = this.getView().getModel("oSecurityModel");
			var oHostModel = this.getOwnerComponent().getModel("oHostModel");
			var eId = oSecurityModel.getProperty("/userDetails").eId;
			var sUrl = "/VMS_Service/employee/getAllNotifications?eId=" + eId;
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
					sap.m.MessageToast.show("Data Successfully Loaded");
					// console.log(data);
					oHostModel.setProperty("/notificationList", data);

				},
				type: "GET"
			});
		},
		onNotificationPress: function (oEvent) {
			var oSecurityModel = this.getView().getModel("oSecurityModel");
			this.fnGetNotificationsData();
			if (!this._oPopover1) {
				this._oPopover1 = sap.ui.xmlfragment("idNotifications", "com.incture.VMSApplicationUI5.fragment.notification", this);
				this.getView().addDependent(this._oPopover1);
			}
			this._oPopover1.openBy(oEvent.getSource());
			var count = oSecurityModel.getProperty("/Notificationcount");
			count = "0";
			oSecurityModel.setProperty("/Notificationcount", count);
		},
		onItemClose: function (oEvent) {
			var that = this;
			var oSecurityModel = this.getView().getModel("oSecurityModel");
			var oHostModel = this.getOwnerComponent().getModel("oHostModel");
			var date = oSecurityModel.getProperty("/date");
			var oSource = oEvent.getSource();
			var spath = oSource.getBindingContextPath();
			var obj = oHostModel.getProperty(spath);
			var sUrl = "/VMS_Service/employee/readNotifications";
			var sUrl1 = "/VMS_Service/security/getRecentDelivery?date=" + date;
			$.ajax({
				url: sUrl,
				type: "POST",
				data: {
					"nId": obj.nId
				},

				dataType: "json",
				success: function (data, status, response) {
					this.fnGetNotificationsData();
					this.fnGetData(sUrl1,"/DeliveryDetails");
				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
			// var oItem = oEvent.getSource(),
			// 	oList = oItem.getParent();

			// oList.removeItem(oItem);
			// MessageToast.show("Item Closed: " + oItem.getTitle());
		},
		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
		},
		onCheckInPress: function (oEvent) {
			var that = this;
			that.getView().byId("idCheckInTable").setVisible(true);
			that.getView().byId("idCheckOutTable").setVisible(false);
			that.getView().byId("idYetToVisitTable").setVisible(false);
			that.byId("pageContainer").to(this.getView().createId("idFilters"));
			that.getView().byId("idCheckout").removeStyleClass("HomeStyleTile");
			that.getView().byId("idYettovisit").removeStyleClass("HomeStyleTile");
			that.getView().byId("idCheckin").addStyleClass("HomeStyleTile");
			// var oSecurityModel = that.getView().getModel("oSecurityModel");
			// var date = oSecurityModel.getProperty("/date");
			// var sUrl = "/VMS_Service/security/getCheckedInVisitors?date=" + date;
			// that.fnGetData(sUrl, "/CheckInDetails");

		},
		onCheckOutPress: function () {
			this.getView().byId("idCheckInTable").setVisible(false);
			this.getView().byId("idCheckOutTable").setVisible(true);
			this.getView().byId("idYetToVisitTable").setVisible(false);
			this.byId("pageContainer").to(this.getView().createId("idFilters"));
			this.getView().byId("idCheckin").removeStyleClass("HomeStyleTile");
			this.getView().byId("idYettovisit").removeStyleClass("HomeStyleTile");
			this.getView().byId("idCheckout").addStyleClass("HomeStyleTile");

		},
		onYetToVisitPress: function () {
			this.getView().byId("idCheckInTable").setVisible(false);
			this.getView().byId("idCheckOutTable").setVisible(false);
			this.getView().byId("idYetToVisitTable").setVisible(true);
			this.byId("pageContainer").to(this.getView().createId("idFilters"));
			this.getView().byId("idCheckin").removeStyleClass("HomeStyleTile");
			this.getView().byId("idCheckout").removeStyleClass("HomeStyleTile");
			this.getView().byId("idYettovisit").addStyleClass("HomeStyleTile");

		},

		// RequestsPress: function () {
		// 	this.byId("pageContainer").to(this.getView().createId("requests"));

		// },
		onSendAlertPress: function () {
			this.bFlag = true;
			if (!this._oDialog) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				this._oDialog = sap.ui.xmlfragment("idsendAlertFragSecurity", "com.incture.VMSApplicationUI5.fragment.sendAlert", this); // Instantiating the Fragment
			}
			this.getView().addDependent(this._oDialog); // Adding the fragment to your current view
			this._oDialog.open();
		},
		onAccessCardPress: function (oEvent) {
			var oSecurityModel = this.getView().getModel("oSecurityModel");
			var oSource = oEvent.getSource();
			var spath = oSource.getParent().getBindingContextPath();
			var oProperty = oSecurityModel.getProperty(spath);
			var vhId = oProperty.vhId;
			var sUrl = "/VMS_Service/visitor/getBadgeDetails?vhId=" + vhId;
			this.fnGetData(sUrl, "/CheckInVisitorDetails");
			console.log(oSecurityModel);
			this.bFlag = true;
			if (!this._oDialog) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				this._oDialog = sap.ui.xmlfragment("idaccessCard", "com.incture.VMSApplicationUI5.fragment.accessCard", this); // Instantiating the Fragment
			}
			this.getView().addDependent(this._oDialog); // Adding the fragment to your current view
			this._oDialog.open();
		},
		onAssignAccessCard: function () {
			var oSecurityModel = this.getView().getModel("oSecurityModel");
			var vhId = oSecurityModel.getProperty("/CheckInVisitorDetails").vhId;
			var sUrl = "/VMS_Service/security/printAccessCard?vhId=" + vhId;
			sap.m.URLHelper.redirect(sUrl, true);
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = null;
		},
		onCancel: function () {
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = null;
		},
		onContactPress: function () {
			this.bFlag = true;
			if (!this._oDialog) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				this._oDialog = sap.ui.xmlfragment("idaddDeliveryFrag", "com.incture.VMSApplicationUI5.fragment.addDelivery", this); // Instantiating the Fragment
			}
			this.getView().addDependent(this._oDialog); // Adding the fragment to your current view
			this._oDialog.open();
		},
		onMenuPress: function () {
			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();

			this._setToggleButtonTooltip(bSideExpanded);

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},
		_setToggleButtonTooltip: function (bLarge) {
			var oToggleButton = this.byId("sideNavigationToggleButton");
			if (bLarge) {
				oToggleButton.setTooltip("Large Size Navigation");
			} else {
				oToggleButton.setTooltip("Small Size Navigation");
			}
		},
		onUserPress: function (oEvent) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("idUser", "com.incture.VMSApplicationUI5.fragment.user", this);
				this.getView().addDependent(this._oPopover);
			}
			this._oPopover.openBy(oEvent.getSource());
		},
		onEditProfilePress: function () {
			if (!this._oDialog) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				this._oDialog = sap.ui.xmlfragment("idEditProfileFrag", "com.incture.VMSApplicationUI5.fragment.editProfile",
					this); // Instantiating the Fragment
			}
			this.getView().addDependent(this._oDialog);
			this._oDialog.open();
		},

		onUnblock: function (oEvent) {
			var sUrl = "/VMS_Service/admin/getAllBlackListedVisitors";
			var that = this;
			// var token = "72063d69217c16b7-w5C-zqZHSREgWqD9tZ_V5ktcDTc";
			// var oTokenModel = that.getView().getModel("oTokenModel");
			// var oToken = oTokenModel.getData();
			// var token = oToken.csrftoken;
			// console.log(oTokenModel);
			// var oToken = that.getView().getModel("oToken").getProperty("csrftoken");
			// console.log(oToken);
			// console.log(token);
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			var oSource = oEvent.getSource();
			var spath = oSource.getParent().getBindingContextPath();
			var obj = oSecurityModel.getProperty(spath);
			console.log(obj);
			var bId = obj.bId;
			$.ajax({
				url: "/VMS_Service/admin/removeBlackListedVisitor",
				type: "POST",
				data: {
					"bId": bId
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },

				dataType: 'json',
				success: function (data, status, response) {
					sap.m.MessageToast.show("Successfully Unblocked");
					var oDialog = new sap.m.BusyDialog();
					oDialog.open();
					setTimeout(function () {
						oDialog.close();
					}, 3000);
					that.fnGetData(sUrl, "/BlackListed");
				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});

		},
		onAddToBlackListPress: function (oEvent) {
			var that = this;
			var oSecurityModel = that.getView().getModel("oSecurityModel");
			var oSource = oEvent.getSource();
			oSecurityModel.setProperty("/BlackListedSource", oSource);
			var spath = oSource.getParent().getBindingContextPath();
			oSecurityModel.setProperty("/BlackListedPath", spath);
			if (!that._oDialog) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				that._oDialog = sap.ui.xmlfragment("idaddBlackListVisitorFrag", "com.incture.VMSApplicationUI5.fragment.addBlackListVisitor", this); // Instantiating the Fragment
			}
			that.getView().addDependent(that._oDialog); // Adding the fragment to your current view
			that._oDialog.open();
		},
		onConfirmBlackList: function () {
			var that = this;
			var oSecurityModel = that.getView().getModel("oSecurityModel");
			var date = oSecurityModel.getProperty("/date");
			var sUrl1 = "/VMS_Service/admin/getAllBlackListedVisitors";
			var sUrl2 = "/VMS_Service/admin/getCheckedOutVisitors?date=" + date;
			var sUrl3 = "/VMS_Service/security/getAllVisitorHistory?date=" + date;
			var oSource = oSecurityModel.getProperty("/BlackListedSource");
			var spath = oSecurityModel.getProperty("/BlackListedPath");
			console.log(spath);
			var obj = oSecurityModel.getProperty(spath);
			console.log(obj);
			var sRemarks = Fragment.byId("idaddBlackListVisitorFrag", "idTarea").getValue();
			// var payload={
			// 	"eId": obj.eId
			// };
			$.ajax({
				url: "/VMS_Service/employee/addBlacklistedVisitor",
				type: "POST",
				data: {
					"eId": obj.eId,
					"vId": obj.vId,
					"remarks": sRemarks,
					"vhId": obj.vhId
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },

				dataType: "json",
				success: function (data, status, response) {
					sap.m.MessageToast.show("Successfully BlackListed");

					console.log(response);
					that._oDialog.close();
					that._oDialog.destroy();
					that._oDialog = null;
					var oDialog = new sap.m.BusyDialog();
					oDialog.open();
					setTimeout(function () {
						oDialog.close();
					}, 3000);
					that.fnGetData(sUrl2, "/CheckedOutDetails");
					that.fnGetData(sUrl1, "/BlackListed");
					that.fnGetData(sUrl3, "/Details");
					oSource.setEnabled(false);
				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
		},
		onSendDelivery: function () {
			var that = this;
			var oSecurityModel = that.getView().getModel("oSecurityModel");
			console.log(oSecurityModel);
			var date = oSecurityModel.getProperty("/date");
			var sSignature = this.getView().getModel("oSignatureModel").getProperty("/sSelectedKey");
			console.log(sSignature);
			if (sSignature === "Signature") {
				sSignature = 1;
			} else {
				sSignature = 0;
			}
			console.log(sSignature);
			var sUrl = "/VMS_Service/security/getRecentDelivery?date=" + date;

			// var sUrl = "/VMS_Service/security/getRecentDelivery?date=" + date;
			// var token=that.getView().getModel("oTokenModel");
			// var token = "72063d69217c16b7-w5C-zqZHSREgWqD9tZ_V5ktcDTc";
			// var oTokenModel = that.getView().getModel("oTokenModel");
			// var oToken = oTokenModel.getData();
			// var token = oToken.csrftoken;
			// console.log(oTokenModel);
			// var oToken = that.getView().getModel("oToken").getProperty("csrftoken");
			// console.log(oToken);
			// console.log(token);
			// var oSecurityModel = this.getView().getModel("oSecurityModel");
			var obj = oSecurityModel.getProperty("/oDeliveryData");
			// console.log(obj);
			var payload = {
				"date": date,
				"deliveryType": sSignature,
				"mobileNo": obj.mobileNo
			};
			console.log(payload);
			$.ajax({
				url: "/VMS_Service/security/addDelivery",
				type: "POST",
				data: {
					"date": obj.date,
					"deliveryType": sSignature,
					"mobileNo": obj.mobileNo

				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },

				dataType: "json",
				success: function (data, status, response) {
					if (data.status === 200) {
						sap.m.MessageToast.show("Success");
						console.log(status);
						console.log(response);
						var oDialog = new sap.m.BusyDialog();
						oDialog.open();
						setTimeout(function () {
							oDialog.close();
						}, 3000);
						that.fnGetData(sUrl, "/DeliveryDetails");

					} else if (data.status === 300) {
						MessageBox.warning("Enter The Correct Mobile Number");
					} else {
						MessageBox.warning("Something Went Wrong..Plese try again");
					}
					that._oDialog.close();
					that._oDialog.destroy();
					that._oDialog = null;
					oSecurityModel.setProperty("/oDeliveryData", {});
				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});

		},
		onSendEvacuation: function () {
			var that = this;
			var oSecurityModel = that.getView().getModel("oSecurityModel");
			var aSelectedPaths = that.getView().byId("idSecurityEvacuationtable").getSelectedContextPaths();
			var sType = Fragment.byId("idsendAlertFragSecurity", "idRadio").getSelectedButton().getText();
			// var sType = that.getView().byId("idRadio").getSelectedButton().getText();
			var sMessage = Fragment.byId("idsendAlertFragSecurity", "idtarea").getValue();
			if (sType === "All Hosts and Visitors") {
				sType = 0;
			} else {
				sType = 1;
			}

			var aEmailList = [];
			var item;
			for (var i = 0; i < aSelectedPaths.length; i++) {
				item = aSelectedPaths[i];
				var obj = oSecurityModel.getProperty(item);
				aEmailList.push(obj.email);
				console.log(obj.email);

			}
			console.log(aEmailList);
			var payload = {
				"emailList": aEmailList,
				"message": sMessage,
				"alertType": sType
			};
			// var oTokenModel = that.getView().getModel("oTokenModel");
			// var oToken = oTokenModel.getData();
			// var token = oToken.csrftoken;
			$.ajax({
				url: "/VMS_Service/security/sendEvacuationMessage",
				type: "POST",
				data: {
					"data": JSON.stringify(payload)
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },

				dataType: "json",
				success: function (data, status, response) {
					sap.m.MessageToast.show("Successfully Sent Alert");
					console.log(response);
					that._oDialog.close();
					that._oDialog.destroy();
					that._oDialog = null;
					// that.fnGetData();

				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
			that._oDialog.close();
			that._oDialog.destroy();
			that._oDialog = null;
		},
		onDate: function () {
			var that = this;
			var date = that.getView().byId("date").getValue();
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
			oSecurityModel.setProperty("/date", date);
			var sUrl = "/VMS_Service/security/getAllVisitorHistory?date=" + date;
			that.fnGetData(sUrl, "/Details");
		},
		fnGetData: function (sUrl, sProperty) {
			var that = this;
			var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
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
					sap.m.MessageToast.show("Data Successfully Loaded");
					oSecurityModel.setProperty(sProperty, data);

				},
				type: "GET"
			});
		},
		onEditProfileConfirm: function () {
			var that = this;
			var oLoginModel = that.getOwnerComponent().getModel("oLoginModel");
			var obj = oLoginModel.getProperty("/oLoginFormData");
			var oSecurityModel = that.getView().getModel("oSecurityModel");
			var eId = oSecurityModel.getProperty("/userDetails").eId;
			var payload = {
				"username": obj.username,
				"password": obj.password,
				"eId": eId
			};
			$.ajax({
				url: "/VMS_Service/admin/editProfile",
				type: "POST",
				data: {
					"data": JSON.stringify(payload)
				},

				// dataType: "json",
				success: function (data, status, response) {
					sap.m.MessageToast.show("Successfully Edited");
					that._oDialog.close();
					that._oDialog.destroy();
					that._oDialog = null;
					console.log(response);
				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});

		},
		onLogOutPress: function () {
			var that = this;
			var oSecurityModel = that.getView().getModel("oSecurityModel");
			var eId = oSecurityModel.getProperty("/userDetails").eId;
			$.ajax({
				url: "/VMS_Service/admin/logout",
				type: "POST",
				data: {
					"eId": eId
				},

				dataType: "json",
				success: function (data, status, response) {
					sap.m.MessageToast.show("Successfully LoggedOut");
					that.getRouter().navTo("RouteApp");
					console.log(response);
				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
		}

		// fnGetData: function () {
		// 	var that = this;
		// 	var oSecurityModel = that.getOwnerComponent().getModel("oSecurityModel");
		// 	var date = oSecurityModel.getProperty("/date");
		// 	// var oToken = that.getView().getModel("oTokenModel").getProperty("csrftoken");
		// 	var sUrl1 = "/VMS_Service/security/getAllVisitorHistory?date=" + date;
		// 	var sUrl2 = "/VMS_Service/admin/getAllBlackListedVisitors";
		// 	var sUrl3 = "/VMS_Service/security/getCheckedInVisitors?date=" + date;
		// 	var sUrl4 = "/VMS_Service/admin/getCheckedOutVisitors?date=" + date;
		// 	var sUrl5 = "/VMS_Service/security/getParkingSlots";
		// 	var sUrl6 = "/VMS_Service/security/getRecentDelivery?date=" + date;
		// 	var sUrl7 = "/VMS_Service/security/getExpectedVisitors?date=" + date;

		// 	// var sUrl3 = "/Admin_Service/admin/getRoomAvailability";
		// 	// var sUrl4 = "/Admin_Service/admin/getAllMeetingRequests";

		// 	$.ajax({
		// 		url: sUrl1,
		// 		data: null,
		// 		async: true,
		// 		headers: {
		// 			dataType: "json",
		// 			contentType: "application/json; charset=utf-8"
		// 				// "X-CSRF-Token": "Fetch"
		// 		},
		// 		error: function (err) {
		// 			sap.m.MessageToast.show("Destination Failed");
		// 		},
		// 		success: function (data) {
		// 			sap.m.MessageToast.show("Data Successfully Loaded");
		// 			oSecurityModel.setProperty("/Details", data);
		// 			// oToken = response.getResponseHeader("x-csrf-token");
		// 			// that.getView().getModel("oTokenModel").setProperty("/csrftoken", oToken);
		// 			// console.log(oToken);
		// 			// console.log(response);

		// 		},
		// 		type: "GET"
		// 	});
		// 	$.ajax({
		// 		url: sUrl2,
		// 		data: null,
		// 		async: true,
		// 		dataType: "json",
		// 		contentType: "application/json; charset=utf-8",
		// 		error: function (err) {
		// 			sap.m.MessageToast.show("Destination Failed");
		// 		},
		// 		success: function (data) {
		// 			sap.m.MessageToast.show("Data Successfully Loaded");

		// 			oSecurityModel.setProperty("/BlackListed", data);

		// 		},
		// 		type: "GET"
		// 	});
		// 	$.ajax({
		// 		url: sUrl3,
		// 		data: null,
		// 		async: true,
		// 		dataType: "json",
		// 		contentType: "application/json; charset=utf-8",
		// 		error: function (err) {
		// 			sap.m.MessageToast.show("Destination Failed");
		// 		},
		// 		success: function (data) {
		// 			sap.m.MessageToast.show("Data Successfully Loaded");

		// 			oSecurityModel.setProperty("/CheckInDetails", data);

		// 		},
		// 		type: "GET"
		// 	});
		// 	$.ajax({
		// 		url: sUrl4,
		// 		data: null,
		// 		async: true,
		// 		dataType: "json",
		// 		contentType: "application/json; charset=utf-8",
		// 		error: function (err) {
		// 			sap.m.MessageToast.show("Destination Failed");
		// 		},
		// 		success: function (data) {
		// 			sap.m.MessageToast.show("Data Successfully Loaded");

		// 			oSecurityModel.setProperty("/CheckedOutDetails", data);
		// 			console.log(oSecurityModel);

		// 		},
		// 		type: "GET"
		// 	});
		// 	$.ajax({
		// 		url: sUrl5,
		// 		data: null,
		// 		async: true,
		// 		dataType: "json",
		// 		contentType: "application/json; charset=utf-8",
		// 		error: function (err) {
		// 			sap.m.MessageToast.show("Destination Failed");
		// 		},
		// 		success: function (data) {
		// 			sap.m.MessageToast.show("Data Successfully Loaded");

		// 			oSecurityModel.setProperty("/ParkingDetails", data);

		// 		},
		// 		type: "GET"
		// 	});
		// 	$.ajax({
		// 		url: sUrl6,
		// 		data: null,
		// 		async: true,
		// 		headers: {
		// 			dataType: "json",
		// 			contentType: "application/json; charset=utf-8"
		// 				// "X-CSRF-Token": "Fetch"
		// 		},
		// 		error: function (err) {
		// 			sap.m.MessageToast.show("Destination Failed");
		// 		},
		// 		success: function (data, status, response) {
		// 			sap.m.MessageToast.show("Data Successfully Loaded");

		// 			oSecurityModel.setProperty("/DeliveryDetails", data);
		// 			// oToken = response.getResponseHeader("x-csrf-token");
		// 			// that.getView().getModel("oTokenModel").setProperty("/csrftoken", oToken);
		// 			// console.log(oToken);
		// 			// console.log(response);

		// 		},
		// 		type: "GET"
		// 	});
		// 	$.ajax({
		// 		url: sUrl7,
		// 		data: null,
		// 		async: true,
		// 		headers: {
		// 			dataType: "json",
		// 			contentType: "application/json; charset=utf-8"
		// 				// "X-CSRF-Token": "Fetch"
		// 		},
		// 		error: function (err) {
		// 			sap.m.MessageToast.show("Destination Failed");
		// 		},
		// 		success: function (data, status, response) {
		// 			sap.m.MessageToast.show("Data Successfully Loaded");

		// 			oSecurityModel.setProperty("/ExpectedVisitorDetails", data);
		// 			// oToken = response.getResponseHeader("x-csrf-token");
		// 			// that.getView().getModel("oTokenModel").setProperty("/csrftoken", oToken);
		// 			// console.log(oToken);
		// 			// console.log(response);

		// 		},
		// 		type: "GET"
		// 	});
		// 	// $.ajax({
		// 	// 	url: sUrl3,
		// 	// 	data: null,
		// 	// 	async: true,
		// 	// 	dataType: "json",
		// 	// 	contentType: "application/json; charset=utf-8",
		// 	// 	error: function (err) {
		// 	// 		sap.m.MessageToast.show("Destination Failed");
		// 	// 	},
		// 	// 	success: function (data) {
		// 	// 		sap.m.MessageToast.show("Data Successfully Loaded");

		// 	// 		oAdminModel.setProperty("/RoomStatus", data);

		// 	// 	},
		// 	// 	type: "GET"
		// 	// });
		// 	// $.ajax({
		// 	// 	url: sUrl4,
		// 	// 	data: null,
		// 	// 	async: true,
		// 	// 	dataType: "json",
		// 	// 	contentType: "application/json; charset=utf-8",
		// 	// 	error: function (err) {
		// 	// 		sap.m.MessageToast.show("Destination Failed");
		// 	// 	},
		// 	// 	success: function (data) {
		// 	// 		sap.m.MessageToast.show("Data Successfully Loaded");

		// 	// 		oAdminModel.setProperty("/Requests", data);

		// 	// 	},
		// 	// 	type: "GET"
		// 	// });
		// 	// 	$.ajax({

		// 	// 	url: "https://vmsystem.cfapps.us10.hana.ondemand.com/admin/getVisitorHistory?eId=3",

		// 	// 	method: "GET",
		// 	// 	headers: {
		// 	// 		"Content-Type": "application/json"
		// 	// 	},
		// 	// 	success: function (odata) {
		// 	// 		console.log(odata);
		// 	// 		this.getView().getModel("oAdminModel").setProperty("/Details", odata);
		// 	// 	},
		// 	// 	error: function (oError) {
		// 	// 		sap.ui.core.BusyIndicator.hide();
		// 	// 	}
		// 	// });
		// }
	});

});