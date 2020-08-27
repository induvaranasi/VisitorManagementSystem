sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../utility/formatter",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet"
], function (Controller, MessageToast, UIComponent, JSONModel, Filter, FilterOperator, formatter, Fragment, MessageBox, Spreadsheet) {
	"use strict";

	return Controller.extend("com.incture.VMSApplicationUI5.controller.Admin", {
		formatter: formatter,
		onInit: function () {
			// var oModel = new JSONModel("./model/Visitors.json");
			// this.getView().setModel(oModel, "oTableModel");
			// var oFormData = {
			// 	"purpose": "Interview",
			// 	"comments": " ",
			// 	"date": "Aug 6, 2020",
			// 	"beginTime": "13:30",
			// 	"endTime": "14:30",
			// 	"eId": 3,
			// 	"capacity": 5,
			// 	"facility": "wifi,board",
			// 	"visitors": [{
			// 		"firstName": "Raman",
			// 		"lastName": "Bhalla",
			// 		"email": "raman3@gmail.com",
			// 		"contactNo": "+91 90003645587",
			// 		"proofType": "AADHAAR",
			// 		"proofNo": "45000176235",
			// 		"locality": "Bangalore",
			// 		"parkingType": 2
			// 	}]
			// };
			var oMeetingData = {
				"purpose": "",
				"date": "",
				"beginTime": "",
				"endTime": "",
				"capacity": "",
				"rId": ""
					// "facility": "wifi,board"
			};
			var oAdminModel = this.getOwnerComponent().getModel("oAdminModel");
			// console.log(oAdminModel);
			// oAdminModel.setProperty("/oFormData", oFormData);
			oAdminModel.setProperty("/oMeetingData", oMeetingData);
			var visitorData = {
				"firstName": "",
				"lastName": "",
				"email": "",
				"contactNo": " ",
				"proofType": "",
				"proofNo": "",
				"locality": "",
				"organisation": "",
				"parkingType": "",
				"pId": ""
			};
			oAdminModel.setProperty("/visitorData", visitorData);
			var addvisitorData = {
				"firstName": "",
				"lastName": "",
				"email": "",
				"contactNo": " ",
				"proofType": "",
				"proofNo": "",
				"locality": "",
				"organisation": "",
				"parkingType": "",
				"pId": ""
			};
			oAdminModel.setProperty("/addvisitorData", addvisitorData);
			var visitors = [];
			oAdminModel.setProperty("/Visitors", visitors);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MMM dd, yyyy"
			});
			var date = new Date();
			var newdate = oDateFormat.format(date);
			// console.log(newdate);
			oAdminModel.setProperty("/date", newdate);
			// var eId = oAdminModel.getProperty("/userDetails").eId;
			var sUrl = "/VMS_Service/admin/getCheckedInVisitors?date=" + newdate;
			this.fndoajax(sUrl, "/CheckInDetails");
			var oViewData = {
				"accept": "Accept",
				"reject": "Reject",
				"RejectVisibility": true,
				"AcceptVisibility": true,
				newdate: new Date(),
				"selectedroom": "",
				"selectedparking": "",
				"IDtype": ""
			};
			var oModel = new JSONModel(oViewData);
			this.getView().setModel(oModel, "oViewModel");
			// var token = {
			// 	"csrftoken": ""
			// };
			// var oTokenModel = new JSONModel(token);
			// this.getView().setModel(oTokenModel, "oTokenModel");
			// var sample 
			var sUrl1 = "/VMS_Service/admin/getPurposePercent";
			var sUrl2 = "/VMS_Service/admin/getOrganisationPercent";
			this.fndoajax(sUrl1, "/PurposePercent");
			this.fndoajax(sUrl2, "/OrganisationPercent");
			this.fnGetData();
			this.bFlag = true;

			var eId = oAdminModel.getProperty("/userDetails").eId;
			var sUrl5 = "/VMS_Service/admin/notificationCounter?eId=" + eId;
			var count;
			$.ajax({
				url: sUrl5,
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
					oAdminModel.setProperty("/Notificationcount", countupdated);
					console.log(countupdated);
					console.log(oAdminModel);

				},
				type: "GET"
			});
			var sUrl3 = "wss://projectvmsp2002476966trial.hanatrial.ondemand.com/vms/chat/"+eId;
			// var sUrl1 = "/VMS_Service/chat/1";
			var webSocket = new WebSocket(sUrl3);
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
				oAdminModel.setProperty("/Notificationcount", countupdated);
				// alert(event.data);

			};
			// this.fndoajax(sUrl5, "/Notificationcount");
			// var notificationcount = oAdminModel.getProperty("/Notificationcount");
			// var count = notificationcount.toString();
			// oAdminModel.setProperty("/Notificationcount", count);

		},
		onDate: function () {
			var that = this;
			var date = that.getView().byId("date").getValue();
			console.log(date);
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			oAdminModel.setProperty("/date", date);
			var sUrl = "/VMS_Service/security/getAllVisitorHistory?date=" + date;
			that.fndoajax(sUrl, "/Details");
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
			var oAdminModel = this.getOwnerComponent().getModel("oAdminModel");
			var oHostModel = this.getOwnerComponent().getModel("oHostModel");
			var eId = oAdminModel.getProperty("/userDetails").eId;
			var sUrl = "/VMS_Service/admin/getAllNotifications?eId=" + eId;
			console.log(sUrl);
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
					console.log(oHostModel);

				},
				type: "GET"
			});
		},
		onNotificationPress: function (oEvent) {
			var oAdminModel = this.getOwnerComponent().getModel("oAdminModel");
			this.fnGetNotificationsData();
			if (!this._oPopover1) {
				this._oPopover1 = sap.ui.xmlfragment("idNotifications", "com.incture.VMSApplicationUI5.fragment.notification", this);
				this.getView().addDependent(this._oPopover1);
			}
			this._oPopover1.openBy(oEvent.getSource());
			var count = oAdminModel.getProperty("/Notificationcount");
			count = "0";
			oAdminModel.setProperty("/Notificationcount", count);
		},
		onItemClose: function (oEvent) {
			// var oSecurityModel = this.getView().getModel("oSecurityModel");
			var that = this;
			var oHostModel = this.getOwnerComponent().getModel("oHostModel");
			var oSource = oEvent.getSource();
			var spath = oSource.getBindingContextPath();
			var obj = oHostModel.getProperty(spath);
			var sUrl = "/VMS_Service/admin/readNotifications";
			$.ajax({
				url: sUrl,
				type: "POST",
				data: {
					"nId": obj.nId
				},

				dataType: "json",
				success: function (data, status, response) {
					that.fnGetNotificationsData();
				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
		},
		onAcceptPress: function (oEvent) {
			var that = this;
			var oHostModel = this.getView().getModel("oHostModel");
			var oSource = oEvent.getSource();
			var spath = oSource.getParent().getParent().getBindingContextPath();
			var obj = oHostModel.getProperty(spath);
			console.log(obj);
			if (obj.title === "Delivery Request") {
				$.ajax({
					url: "/VMS_Service/employee/acceptDelivery",
					type: "POST",
					data: {
						"dId": obj.dId,
						"nId": obj.nId
					},

					dataType: "json",
					success: function (data, status, response) {
						if (data.status === 200) {
							sap.m.MessageToast.show("Delivery Accepted");

						} else if (data.status === 300) {
							sap.m.MessageToast.show("Your Delivery Needs Signature");
						} else {
							sap.m.MessageToast.show("Something Went Wrong");
						}

					},
					error: function (e) {
						sap.m.MessageToast.show("fail");

					}
				});
			} else {
				$.ajax({
					url: "/VMS_Service/admin/manageMeetingRequest",
					type: "POST",
					data: {
						"mId": obj.mId,
						"action": "accept",
						"nId": obj.nId
					},

					dataType: 'json',
					success: function (data, status, response) {

						if (data.status === 200) {
							sap.m.MessageToast.show("Meeting Accepted");
						} else {
							sap.m.MessageToast.show("Something Went Wrong");
						}

					},
					error: function (e) {
						sap.m.MessageToast.show("fail");

					}
				});
			}

			that.fnGetNotificationsData();
		},
		onRejectPress: function (oEvent) {
			var oHostModel = this.getView().getModel("oHostModel");
			var oSource = oEvent.getSource();
			var spath = oSource.getParent().getParent().getBindingContextPath();
			var obj = oHostModel.getProperty(spath);
			console.log(obj);
			if (obj.title === "Delivery Request") {
				$.ajax({
					url: "/VMS_Service/employee/rejectDelivery",
					type: "POST",
					data: {
						"dId": obj.dId,
						"nId": obj.nId
					},

					dataType: "json",
					success: function (data, status, response) {
						sap.m.MessageToast.show("Delivery Rejected");
					},
					error: function (e) {
						sap.m.MessageToast.show("fail");

					}
				});
			} else {
				$.ajax({
					url: "/VMS_Service/admin/manageMeetingRequest",
					type: "POST",
					data: {
						"mId": obj.mId,
						"action": "reject",
						"nId": obj.nId
					},

					dataType: 'json',
					success: function (data, status, response) {
						sap.m.MessageToast.show("Meeting Rejected");

					},
					error: function (e) {
						sap.m.MessageToast.show("fail");

					}
				});
			}

			this.fnGetNotificationsData();
		},
		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
		},
		onPressImage: function () {

			this.getRouter().navTo("RouteApp");

		},
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},
		onCheckInPress: function (oEvent) {
			var that = this;
			this.getView().byId("idCheckInTable").setVisible(true);
			this.getView().byId("idCheckOutTable").setVisible(false);
			this.getView().byId("idYetToVisitTable").setVisible(false);
			this.getView().byId("idFrequentVisitsTable").setVisible(false);
			this.byId("pageContainer").to(this.getView().createId("idFilters"));
			this.getView().byId("idCheckout").removeStyleClass("HomeStyleTile");
			this.getView().byId("idYettovisit").removeStyleClass("HomeStyleTile");
			this.getView().byId("idFrequentVisits").removeStyleClass("HomeStyleTile");
			this.getView().byId("idCheckin").addStyleClass("HomeStyleTile");
			var oAdminModel = this.getView().getModel("oAdminModel");
			// var date = oAdminModel.getProperty("/date");
			// var eId = oAdminModel.getProperty("/userDetails").eId;
			// var sUrl = "/VMS_Service/admin/getCheckedInVisitors?eId=" + eId + "&date=" + date;
			// console.log(sUrl);
			// that.fndoajax(sUrl, "/CheckInDetails");
			// console.log(oAdminModel);
			var date = oAdminModel.getProperty("/date");
			// var eId = oAdminModel.getProperty("/userDetails").eId;
			var sUrl = "/VMS_Service/admin/getCheckedInVisitors?date=" + date;
			console.log(sUrl);
			that.fndoajax(sUrl, "/CheckInDetails");

		},
		onCheckOutPress: function () {
			var that = this;
			this.getView().byId("idCheckInTable").setVisible(false);
			this.getView().byId("idCheckOutTable").setVisible(true);
			this.getView().byId("idYetToVisitTable").setVisible(false);
			this.getView().byId("idFrequentVisitsTable").setVisible(false);
			this.byId("pageContainer").to(this.getView().createId("idFilters"));
			this.getView().byId("idCheckout").addStyleClass("HomeStyleTile");
			this.getView().byId("idYettovisit").removeStyleClass("HomeStyleTile");
			this.getView().byId("idFrequentVisits").removeStyleClass("HomeStyleTile");
			this.getView().byId("idCheckin").removeStyleClass("HomeStyleTile");
			var oAdminModel = this.getView().getModel("oAdminModel");
			var date = oAdminModel.getProperty("/date");
			// var eId = oAdminModel.getProperty("/userDetails").eId;
			var sUrl = "/VMS_Service/admin/getCheckedOutVisitors?date=" + date;
			console.log(sUrl);
			that.fndoajax(sUrl, "/CheckOutDetails");
			console.log(oAdminModel);
		},
		onYetToVisitPress: function () {
			var that = this;
			this.getView().byId("idCheckInTable").setVisible(false);
			this.getView().byId("idCheckOutTable").setVisible(false);
			this.getView().byId("idYetToVisitTable").setVisible(true);
			this.getView().byId("idFrequentVisitsTable").setVisible(false);
			this.byId("pageContainer").to(this.getView().createId("idFilters"));
			this.getView().byId("idCheckout").removeStyleClass("HomeStyleTile");
			this.getView().byId("idYettovisit").addStyleClass("HomeStyleTile");
			this.getView().byId("idFrequentVisits").removeStyleClass("HomeStyleTile");
			this.getView().byId("idCheckin").removeStyleClass("HomeStyleTile");
			var oAdminModel = this.getView().getModel("oAdminModel");
			var date = oAdminModel.getProperty("/date");
			var sUrl = "/VMS_Service/admin/getExpectedVisitors?date=" + date;
			that.fndoajax(sUrl, "/ExpectedVisitorDetails");
		},
		onFrequentVisitsPress: function () {
			this.getView().byId("idCheckInTable").setVisible(false);
			this.getView().byId("idCheckOutTable").setVisible(false);
			this.getView().byId("idYetToVisitTable").setVisible(false);
			this.getView().byId("idFrequentVisitsTable").setVisible(true);
			this.byId("pageContainer").to(this.getView().createId("idFilters"));
			this.getView().byId("idCheckout").removeStyleClass("HomeStyleTile");
			this.getView().byId("idYettovisit").removeStyleClass("HomeStyleTile");
			this.getView().byId("idFrequentVisits").addStyleClass("HomeStyleTile");
			this.getView().byId("idCheckin").removeStyleClass("HomeStyleTile");
		},
		onExport: function () {
			var oAdminModel = this.getView().getModel("oAdminModel");
			var date = oAdminModel.getProperty("/date");
			var sUrl = "/VMS_Service/admin/export?date=" + date;
			sap.m.URLHelper.redirect(sUrl, true);

		},
		onPrintPress: function () {
			var oAdminModel = this.getView().getModel("oAdminModel");
			var date = oAdminModel.getProperty("/date");
			var sUrl = "/VMS_Service/admin/downloadPDF?date=" + date;
			sap.m.URLHelper.redirect(sUrl, true);
		},

		onPreregistrationPress: function () {
			var that = this;
			this.getView().byId("idUpcomingMeetingsTable").setVisible(false);
			this.getView().byId("preregisteredtable").setVisible(true);
			this.byId("pageContainer").to(this.getView().createId("idUpcomingMeetings"));
			this.getView().byId("idUpcoming").removeStyleClass("HomeStyleTile");
			this.getView().byId("idPreRegistration").addStyleClass("HomeStyleTile");
			var oAdminModel = this.getView().getModel("oAdminModel");
			var sUrl6 = "/VMS_Service/admin/getPreregistredVisitors?eId=3";
			$.ajax({
				url: sUrl6,
				data: null,
				async: true,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					sap.m.MessageToast.show("Data Successfully Loaded");

					oAdminModel.setProperty("/PreRegistration", data);

				},
				type: "GET"
			});
		},
		// VisitorHistoryPress: function () {
		// 	this.byId("pageContainer").to(this.getView().createId("visitorhistory"));
		// },
		onUpcomingPress: function () {
			this.getView().byId("idUpcomingMeetingsTable").setVisible(true);
			this.getView().byId("preregisteredtable").setVisible(false);
			this.byId("pageContainer").to(this.getView().createId("idUpcomingMeetings"));
			this.getView().byId("idPreRegistration").removeStyleClass("HomeStyleTile");
			this.getView().byId("idUpcoming").addStyleClass("HomeStyleTile");
			var oAdminModel = this.getView().getModel("oAdminModel");
			var date = oAdminModel.getProperty("/date");
			var sUrl8 = "/VMS_Service/admin/getAllUpcomingMeeting?eId=3";
			$.ajax({
				url: sUrl8,
				data: null,
				async: true,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					sap.m.MessageToast.show("Data Successfully Loaded");
					// console.log(data);

					oAdminModel.setProperty("/UpcomingMeetings", data);
					// console.log(oAdminModel);

				},
				type: "GET"
			});

		},
		// onAddBlackListPress: function () {
		// 	this.byId("pageContainer").to(this.getView().createId("addtoblacklist"));
		// 	var currentFilter = "Check Out";
		// 	var aFilter = [];
		// 	if (currentFilter) {
		// 		aFilter.push(new Filter("status", FilterOperator.Contains, currentFilter));
		// 	}
		// 	// filter binding
		// 	var oTable = this.byId("addtoblacklisttable");
		// 	var oBinding = oTable.getBinding("items");
		// 	oBinding.filter(aFilter);
		// },
		// onConfirmation: function () {

		// 	// this has to be completed;;;;

		// },
		onAddNewPress: function () {
			this.bParking = true;
			var oAdminModel = this.getView().getModel("oAdminModel");
			oAdminModel.setProperty("/oMeetingData", {});
			oAdminModel.setProperty("/visitorData", {});
			if (!this._oDialog1) {
				this._oDialog1 = sap.ui.xmlfragment("idPreRegistrationFrag", "com.incture.VMSApplicationUI5.fragment.PreRegisterVisitorAdmin",
					this); // Instantiating the Fragment
			}
			this.getView().addDependent(this._oDialog1); // Adding the fragment to your current view
			this._oDialog1.open();
		},
		onAddVisitor: function () {
			this.bFlag = true;
			this.bParking = false;
			var oAdminModel = this.getView().getModel("oAdminModel");
			var sUrl = "/VMS_Service/admin/getAvailableParkingSlots";
			var addvisitorData = oAdminModel.getProperty("/addvisitorData");
			var visitorData = oAdminModel.getProperty("/visitorData");
			var pId;
			if (this.bParking === false) {
				pId = addvisitorData.pId;
			} else {
				pId = visitorData.pId;
			}
			$.ajax({
				url: "/VMS_Service/admin/setParkingStatus",
				type: "POST",
				data: {
					"pId": pId,
					"status": 1
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },

				// dataType: "json",
				success: function (data, status, response) {
					sap.m.MessageToast.show("Success");
					console.log(data);
					this.fndoajax(sUrl, "/AvailableParkingSlots");

					// that.fnGetData();

				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
			oAdminModel.setProperty("/addvisitorData", {});
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("idaddVisitorFrag", "com.incture.VMSApplicationUI5.fragment.addVisitorAdmin", this); // Instantiating the Fragment
			}
			this.getView().addDependent(this._oDialog); // Adding the fragment to your current view
			this._oDialog.open();
		},
		onAvailabilityPress: function () {
			var that = this;
			var oAdminModel = that.getView().getModel("oAdminModel");
			var oMeetingData = oAdminModel.getProperty("/oMeetingData");
			//	var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			// 	pattern: "MMM dd, yyyy"
			// });
			// var meetingDate = oMeetingData.date; 
			// var date = oDateFormat.format(meetingDate);
			var payload = {
				"date": oMeetingData.date,
				"beginTime": oMeetingData.beginTime,
				"endTime": oMeetingData.endTime,
				"capacity": oMeetingData.capacity
			};
			console.log(payload);
			$.ajax({
				url: "/VMS_Service/admin/getAvailableRooms",
				type: "POST",
				data: {
					"data": JSON.stringify(payload)
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },

				// dataType: "json",
				success: function (data, status, response) {
					sap.m.MessageToast.show("Success");
					console.log(data);
					oAdminModel.setProperty("/AvailableRooms", data);
					console.log(status);
					console.log(response);

					// that.fnGetData();

				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});

			Fragment.byId("idPreRegistrationFrag", "idRoomAvailability").setVisible(true);
		},
		onParkingAvailabilityPress: function () {
			var that = this;
			var oAdminModel = that.getView().getModel("oAdminModel");
			var oMeetingData = oAdminModel.getProperty("/oMeetingData");
			var visitorData = oAdminModel.getProperty("/visitorData");
			var payload = {
				"date": oMeetingData.date,
				"beginTime": oMeetingData.beginTime,
				"endTime": oMeetingData.endTime,
				"parkingType": visitorData.parkingType

			};
			$.ajax({
				url: "/VMS_Service/admin/getAvailableParkingSlots",
				type: "GET",
				data: {
					"data": JSON.stringify(payload)
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },

				// dataType: "json",
				success: function (data, status, response) {
					sap.m.MessageToast.show("Success");
					console.log(data);
					oAdminModel.setProperty("/AvailableParkingSlots", data);
					console.log(status);
					console.log(response);

					// that.fnGetData();

				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
			Fragment.byId("idPreRegistrationFrag", "idParkingAvailability").setVisible(true);
		},
		onAddParkingAvailabilityPress: function () {
			var that = this;
			var oAdminModel = that.getView().getModel("oAdminModel");
			var oMeetingData = oAdminModel.getProperty("/oMeetingData");
			var addvisitorData = oAdminModel.getProperty("/addvisitorData");
			var payload = {
				"date": oMeetingData.date,
				"beginTime": oMeetingData.beginTime,
				"endTime": oMeetingData.endTime,
				"parkingType": addvisitorData.parkingType

			};
			$.ajax({
				url: "/VMS_Service/admin/getAvailableParkingSlots",
				type: "GET",
				data: {
					"data": JSON.stringify(payload)
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },

				// dataType: "json",
				success: function (data, status, response) {
					sap.m.MessageToast.show("Success");
					console.log(data);
					oAdminModel.setProperty("/AvailableParkingSlots", data);
					console.log(status);
					console.log(response);

					// that.fnGetData();

				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
			Fragment.byId("idaddVisitorFrag", "idAddParkingAvailability").setVisible(true);
		},
		onCancelMain: function () {
			this._oDialog1.close();
			this._oDialog1.destroy();
			this._oDialog1 = null;
		},
		onAdd: function () {
			var that = this;
			if (this.bFlag === true) {
				var oAdminModel = that.getView().getModel("oAdminModel");
				var addvisitorData = oAdminModel.getProperty("/addvisitorData");
				var visitors = oAdminModel.getProperty("/Visitors");
				visitors.push(addvisitorData);
				console.log(visitors);
				oAdminModel.setProperty("/Visitors", visitors);
				Fragment.byId("idPreRegistrationFrag", "idAddVisitorsTable").setVisible(true);
			} else {
				var oTableModel = Fragment.byId("idPreRegistrationFrag", "idAddVisitorsTable").getModel("oAdminModel");
				oTableModel.refresh();
			}
			that._oDialog.close();
			that._oDialog.destroy();
			that._oDialog = null;

		},
		onPressEditBtn: function (oEvent) {
			this.bFlag = false;
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.incture.VMSApplicationUI5.fragment.addVisitorAdmin", this);
				//this._oDialog = sap.ui.xmlfragment("idAddItemFrag", "com.demo.odata.Demo_Odata_Service.view.addItem", this);
			}
			this.getView().addDependent(this._oDialog);
			var oAdminModel = this.getView().getModel("oAdminModel");
			var oSource = oEvent.getSource();
			var sBindingContextPath = oSource.getParent().getParent().getBindingContextPath();
			var oProperty = oAdminModel.getProperty(sBindingContextPath);
			oAdminModel.setProperty("/addvisitorData", oProperty);
			this.aMisMatchBckUp = $.extend(true, {}, oAdminModel.getData()["Visitors"]);
			this._oDialog.open();
		},
		onPressDeleteBtn: function (oEvent) {
			var that = this;
			var oAdminModel = that.getView().getModel("oAdminModel");
			var sBindingContextPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
			var deleteRecord = oAdminModel.getProperty(sBindingContextPath);
			var visitors = oAdminModel.getProperty("/Visitors");
			var oTableModel = Fragment.byId("idPreRegistrationFrag", "idAddVisitorsTable").getModel("oAdminModel");
			MessageBox.warning("Are You Sure You Want To Delete", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === "OK") {

						$.ajax({
							url: "/VMS_Service/admin/setParkingStatus",
							type: "POST",
							data: {
								"pId": deleteRecord.pId,
								"status": 0
							},
							// headers: {
							// 	"X-CSRF-Token": token
							// },

							// dataType: "json",
							success: function (data, status, response) {
								sap.m.MessageToast.show("Success");
								console.log(data);

								// that.fnGetData();

							},
							error: function (e) {
								sap.m.MessageToast.show("fail");

							}
						});

						for (var i = 0; i <= visitors.length; i++) {
							if (visitors[i] == deleteRecord) {
								//	pop this._data.Products[i] 
								visitors.splice(i, 1); //removing 1 record from i th index.
								oTableModel.refresh();
								break; //quit the loop
							}
						}

					}

				}
			});
		},
		onRegisterMain: function () {
			var that = this;
			var sUrl1 = "/VMS_Service/admin/getAllUpcomingMeeting?eId=3";
			var sUrl2 = "/VMS_Service/admin/getPreregistredVisitors?eId=3";
			var oAdminModel = that.getView().getModel("oAdminModel");
			var oMeetingData = oAdminModel.getProperty("/oMeetingData");
			var visitorData = oAdminModel.getProperty("/visitorData");
			var eId = oAdminModel.getProperty("/userDetails").eId;
			console.log(visitorData);
			console.log(oMeetingData);
			var visitors = oAdminModel.getProperty("/Visitors");
			visitors.push(visitorData);
			// oAdminModel.setProperty("/Visitors", visitors);
			// var Visitors = oAdminModel.getProperty("/Visitors");
			console.log(visitors);
			var payload = {
				"purpose": oMeetingData.purpose,
				"beginTime": oMeetingData.beginTime,
				"endTime": oMeetingData.endTime,
				"eId": eId,
				"rId": oMeetingData.rId,
				"date": oMeetingData.date,
				"facility": "",
				"capacity": oMeetingData.capacity,
				"visitors": visitors
					// [{
					// 	"firstName": "Ishita",
					// 	"lastName": "Iyer",
					// 	"email": "ishita@gmail.com",
					// 	"contactNo": "+91 9432178675",
					// 	"organisation": "TCS",
					// 	"proofType": "AADHAAR",
					// 	"proofNo": "78456925756",
					// 	"typeId": "1",
					// 	"locality": "Assam"
					// }]
			};
			console.log(payload);
			var oDialog = new sap.m.BusyDialog();
			oDialog.open();
			setTimeout(function () {
				oDialog.close();
			}, 3000);
			// var oTokenModel = that.getView().getModel("oTokenModel");
			// var oToken = oTokenModel.getData();
			// var token = oToken.csrftoken;
			// console.log(token);
			// var oFormData = that.getView().getModel("oAdminmodel").getProperty("oFormData");
			// var oFormData = oAdminModel.getProperty("oFormData");
			$.ajax({
				url: "/VMS_Service/admin/preRegister",
				type: "POST",
				data: {
					"data": JSON.stringify(payload)
				},
				// headers: {
				// 	"X-CSRF-Token": token
				// },

				// dataType: "json",
				success: function (data, status, response) {
					if (data.status === 200) {
						sap.m.MessageToast.show("Successfully Pre-Registered");
						that._oDialog1.close();
						that._oDialog1.destroy();
						that._oDialog1 = null;
					} else if (data.status === 300) {
						sap.m.MessageToast.show("Having a Meeting Clash");
					} else {
						sap.m.MessageToast.show("Something Went Wrong..please try again");
					}
					console.log(status);
					console.log(response);
					oAdminModel.setProperty("/oMeetingData", {});
					oAdminModel.setProperty("/visitorData", {});
					oAdminModel.setProperty("/Visitors", []);
					// that._oDialog1.close();
					// that._oDialog1.destroy();
					// that._oDialog1 = null;
					that.fndoajax(sUrl1, "/UpcomingMeetings");
					that.fndoajax(sUrl2, "/PreRegistration");
				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});

		},
		onSendAlertPress: function () {
			this.bFlag = true;
			if (!this._oDialog) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				this._oDialog = sap.ui.xmlfragment("idsendAlertFragAdmin", "com.incture.VMSApplicationUI5.fragment.sendAlert", this); // Instantiating the Fragment
			}
			this.getView().addDependent(this._oDialog); // Adding the fragment to your current view
			this._oDialog.open();
		},
		onSendEvacuation: function () {
			var that = this;
			var oAdminModel = that.getView().getModel("oAdminModel");
			var aSelectedPaths = that.getView().byId("idAdminEvacuationtable").getSelectedContextPaths();
			var sType = Fragment.byId("idsendAlertFragAdmin", "idRadio").getSelectedButton().getText();
			// var sType = that.getView().byId("idRadio").getSelectedButton().getText();
			var sMessage = Fragment.byId("idsendAlertFragAdmin", "idtarea").getValue();
			if (sType === "All Hosts and Visitors") {
				sType = 0;
			} else {
				sType = 1;
			}

			var aEmailList = [];
			var item;
			for (var i = 0; i < aSelectedPaths.length; i++) {
				item = aSelectedPaths[i];
				var obj = oAdminModel.getProperty(item);
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
		onCancel: function () {
			if (this.bFlag === false) {
				var oAdminModel = this.getView().getModel("oAdminModel");
				oAdminModel.setProperty("/Visitors", this.aMisMatchBckUp);
			}
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = null;
		},
		oViewReportsPress: function () {
			this.byId("pageContainer").to(this.getView().createId("viewreports"));
		},
		onAccept: function () {
			this.getView().getModel("oViewModel").setProperty("/RejectVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/accept", "Accepted");
		},
		onReject: function () {
			this.getView().getModel("oViewModel").setProperty("/AcceptVisibility", false);
			this.getView().getModel("oViewModel").setProperty("/reject", "Rejected");
		},
		onSideNavButtonPress: function () {
			var toolPage = this.byId("toolPage");

			toolPage.setSideExpanded(!toolPage.getSideExpanded());
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
		onShowFrequentVisitorsPress: function (oEvent) {
			var that = this;
			var oAdminModel = that.getView().getModel("oAdminModel");
			var spath = oEvent.getSource().getParent().getBindingContextPath();
			var aVisitorList = oAdminModel.getProperty(spath).visitors;
			oAdminModel.setProperty("/FrequentVisitors", aVisitorList);
			console.log(aVisitorList);
			if (!that._oDialog) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				that._oDialog = sap.ui.xmlfragment("idFrequentVisitsFragAdmin", "com.incture.VMSApplicationUI5.fragment.displayFrequentVisits",
					this); // Instantiating the Fragment
			}
			that.getView().addDependent(that._oDialog); // Adding the fragment to your current view
			Fragment.byId("idFrequentVisitsFragAdmin", "idFrequentVisitors").setVisible(true);
			Fragment.byId("idFrequentVisitsFragAdmin", "idUpcomingVisitorsAdmin").setVisible(false);
			Fragment.byId("idFrequentVisitsFragAdmin", "idUpcomingVisitorsHost").setVisible(false);
			that._oDialog.open();
		},
		onShowUpcomingVisitorsPress: function (oEvent) {
			var that = this;
			var oAdminModel = that.getView().getModel("oAdminModel");
			var spath = oEvent.getSource().getParent().getBindingContextPath();
			var aVisitorList = oAdminModel.getProperty(spath).visitors;
			oAdminModel.setProperty("/UpcomingVisitors", aVisitorList);
			console.log(aVisitorList);
			if (!that._oDialog) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				that._oDialog = sap.ui.xmlfragment("idFrequentVisitsFragAdmin", "com.incture.VMSApplicationUI5.fragment.displayFrequentVisits",
					this); // Instantiating the Fragment
			}
			that.getView().addDependent(that._oDialog); // Adding the fragment to your current view
			Fragment.byId("idFrequentVisitsFragAdmin", "idFrequentVisitors").setVisible(false);
			Fragment.byId("idFrequentVisitsFragAdmin", "idUpcomingVisitorsAdmin").setVisible(true);
			Fragment.byId("idFrequentVisitsFragAdmin", "idUpcomingVisitorsHost").setVisible(false);
			that._oDialog.open();
		},
		// myToken: "",
		fnGetData: function () {
			var that = this;
			// var oToken = that.getView().getModel("oTokenModel").getProperty("csrftoken");
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var date = oAdminModel.getProperty("/date");
			var eId = oAdminModel.getProperty("/userDetails").eId;
			console.log(eId);
			var sUrl1 = "/VMS_Service/admin/getAllVisitorHistory?date=" + date;
			var sUrl2 = "/VMS_Service/admin/getAllBlackListedVisitors";
			var sUrl3 = "/VMS_Service/admin/getRoomAvailability";
			var sUrl4 = "/VMS_Service/admin/getAllMeetingRequests";
			var sUrl5 = "/VMS_Service/admin/getVisitorHistory?date=" + date + "&eId=" + eId;
			console.log(sUrl5);

			var sUrl7 = "/VMS_Service/admin/getFrequentVisitors";

			$.ajax({
				url: sUrl1,
				data: null,
				async: true,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					sap.m.MessageToast.show("Data Successfully Loaded");
					console.log(data);

					oAdminModel.setProperty("/Details", data);
					console.log(oAdminModel);

				},
				type: "GET"
			});
			$.ajax({
				url: sUrl2,
				data: null,
				async: true,
				headers: {
					dataType: "json",
					contentType: "application/json; charset=utf-8",
					"X-CSRF-Token": "Fetch"
				},
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data, status, response) {
					sap.m.MessageToast.show("Data Successfully Loaded");
					oAdminModel.setProperty("/BlackListed", data);

					// oToken = response.getResponseHeader("x-csrf-token");
					// that.getView().getModel("oTokenModel").setProperty("/csrftoken", oToken);
					// console.log(oToken);
					console.log(response);

				},
				type: "GET"
			});
			$.ajax({
				url: sUrl3,
				data: null,
				async: true,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					sap.m.MessageToast.show("Data Successfully Loaded");

					oAdminModel.setProperty("/RoomStatus", data);

				},
				type: "GET"
			});
			$.ajax({
				url: sUrl4,
				data: null,
				async: true,
				headers: {
					dataType: "json",
					contentType: "application/json; charset=utf-8"
						// "X-CSRF-Token": "Fetch"
				},
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data, status, response) {
					sap.m.MessageToast.show("Data Successfully Loaded");
					// oToken = response.getResponseHeader("x-csrf-token");
					// // that.getView().getModel("oToken").setProperty("/csrftoken", oToken);
					oAdminModel.setProperty("/Requests", data);

				},
				type: "GET"
			});
			$.ajax({
				url: sUrl5,
				data: null,
				async: true,
				headers: {
					dataType: "json",
					contentType: "application/json; charset=utf-8"
						// "X-CSRF-Token": "Fetch"
				},
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data, status, response) {
					sap.m.MessageToast.show("Data Successfully Loaded");
					console.log(data);
					// oToken = response.getResponseHeader("x-csrf-token");
					// // that.getView().getModel("oToken").setProperty("/csrftoken", oToken);
					oAdminModel.setProperty("/AdminVisitors", data);

				},
				type: "GET"
			});

			$.ajax({
				url: sUrl7,
				data: null,
				async: true,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					sap.m.MessageToast.show("Data Successfully Loaded");

					oAdminModel.setProperty("/FrequentVisits", data);

				},
				type: "GET"
			});
			// $.ajax({
			// 	url: sUrl8,
			// 	data: null,
			// 	async: true,
			// 	dataType: "json",
			// 	contentType: "application/json; charset=utf-8",
			// 	error: function (err) {
			// 		sap.m.MessageToast.show("Destination Failed");
			// 	},
			// 	success: function (data) {
			// 		sap.m.MessageToast.show("Data Successfully Loaded");

			// 		oAdminModel.setProperty("/FrequentVisits", data);

			// 	},
			// 	type: "GET"
			// });
			// 	$.ajax({

			// 	url: "https://vmsystem.cfapps.us10.hana.ondemand.com/admin/getVisitorHistory?eId=3",

			// 	method: "GET",
			// 	headers: {
			// 		"Content-Type": "application/json"
			// 	},
			// 	success: function (odata) {
			// 		console.log(odata);
			// 		this.getView().getModel("oAdminModel").setProperty("/Details", odata);
			// 	},
			// 	error: function (oError) {
			// 		sap.ui.core.BusyIndicator.hide();
			// 	}
			// });
		},
		onAddToBlackListPress: function (oEvent) {
			var that = this;
			var oAdminModel = that.getView().getModel("oAdminModel");
			var oSource = oEvent.getSource();
			oAdminModel.setProperty("/BlackListedSource", oSource);
			var spath = oSource.getParent().getBindingContextPath();
			oAdminModel.setProperty("/BlackListedPath", spath);
			if (!that._oDialog) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				that._oDialog = sap.ui.xmlfragment("idaddBlackListVisitorFrag", "com.incture.VMSApplicationUI5.fragment.addBlackListVisitor", this); // Instantiating the Fragment
			}
			that.getView().addDependent(that._oDialog); // Adding the fragment to your current view
			that._oDialog.open();
		},
		onConfirmBlackList: function () {
			var that = this;
			var oAdminModel = that.getView().getModel("oAdminModel");
			var date = oAdminModel.getProperty("/date");
			var sUrl1 = "/VMS_Service/admin/getAllBlackListedVisitors";
			var sUrl2 = "/VMS_Service/admin/getCheckedOutVisitors?date=" + date;
			var oSource = oAdminModel.getProperty("/BlackListedSource");
			var spath = oAdminModel.getProperty("/BlackListedPath");
			console.log(spath);
			var obj = oAdminModel.getProperty(spath);
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
					oSource.setEnabled(false);
					if (data.status === 300) {
						MessageBox.warning("Alredy Blacklisted");
					}

				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
		},
		onPressUnblock: function (oEvent) {
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
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
			var oSource = oEvent.getSource();
			var spath = oSource.getParent().getBindingContextPath();
			var obj = oAdminModel.getProperty(spath);
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
					that.fnGetData(sUrl, "/BlackListed");

				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});

		},
		fndoajax: function (sUrl, sProperty) {
			var that = this;
			var oAdminModel = that.getOwnerComponent().getModel("oAdminModel");
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
					oAdminModel.setProperty(sProperty, data);

				},
				type: "GET"
			});
		},
		onEditProfileConfirm: function () {
			var that = this;
			var oLoginModel = that.getOwnerComponent().getModel("oLoginModel");
			var obj = oLoginModel.getProperty("/oLoginFormData");
			var oAdminModel = that.getView().getModel("oAdminModel");
			var eId = oAdminModel.getProperty("/userDetails").eId;
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
			var oAdminModel = that.getView().getModel("oAdminModel");
			var eId = oAdminModel.getProperty("/userDetails").eId;
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

	});
});