sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"../utility/formatter",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MessageToast, History, UIComponent, JSONModel, formatter, Fragment, MessageBox, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("com.incture.VMSApplicationUI5.controller.Host", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.incture.VMSApplicationUI5.view.Host
		 */
		onInit: function () {
			var oMeetingData = {
				"purpose": "",
				"date": "",
				"beginTime": "",
				"endTime": "",
				"capacity": "",
				"rId": "",
				"facility": ""
			};
			var oHostModel = this.getOwnerComponent().getModel("oHostModel");
			oHostModel.setProperty("/oMeetingData", oMeetingData);
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
			oHostModel.setProperty("/visitorData", visitorData);
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
			oHostModel.setProperty("/addvisitorData", addvisitorData);
			var visitors = [];
			oHostModel.setProperty("/Visitors", visitors);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MMM dd, yyyy"
			});
			var date = new Date();
			var newdate = oDateFormat.format(date);
			var oViewData = {
				newdate: new Date()
			};
			var oModel = new JSONModel(oViewData);
			this.getView().setModel(oModel, "oViewModel");
			// console.log(newdate);
			oHostModel.setProperty("/date", newdate);
			oHostModel.setProperty("/newdate", newdate);
			var eId = oHostModel.getProperty("/userDetails").eId;
			var sUrl1 = "/VMS_Service/employee/getVisitorHistory?eId=" + eId + "&date=" + newdate;
			var sUrl2 = "/VMS_Service/employee/getAllBlacklistedVisitors?eId=" + eId;
			var sUrl3 = "/VMS_Service/employee/getCheckedOutVisitors?eId=" + eId + "&date=" + newdate;
			var sUrl4 = "/VMS_Service/employee/getExpectedVisitors?eId=" + eId + "&date=" + newdate;
			var sUrl5 = "/VMS_Service/employee/getCheckedInVisitors?eId=" + eId + "&date=" + newdate;
			this.fnGetData(sUrl1, "/Details");
			this.fnGetData(sUrl3, "/CheckOutDetails");
			this.fnGetData(sUrl2, "/BlackListed");
			this.fnGetData(sUrl4, "/ExpectedVisitorDetails");
			this.fnGetData(sUrl5, "/CheckInDetails");
			this.bFlag = true;
			this.bParking = false;
			var sUrl6 = "/VMS_Service/admin/notificationCounter?eId=" + eId;
			var count;
			$.ajax({
				url: sUrl6,
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
					console.log(data);
					count = data.count;
					var countupdated = count.toString();
					oHostModel.setProperty("/Notificationcount", countupdated);
					console.log(countupdated);
					console.log(oHostModel);

				},
				type: "GET"
			});
			var sUrl8 = "wss://projectvmsp2002476966trial.hanatrial.ondemand.com/vms/chat/" + eId;
			var that = this;
			// var sUrl1 = "/VMS_Service/chat/1";
			var webSocket = new WebSocket(sUrl8);
			webSocket.onerror = function (event) {
				// alert(event.data);

			};
			webSocket.onopen = function (event) {
				// alert(event.data);

			};
			webSocket.onmessage = function (event) {
				var jsonData = event.data;
				var msg = JSON.parse(jsonData);
				console.log(msg.title);
				if (msg.content !== "Connected!") {
					var count1 = oHostModel.getProperty("/Notificationcount");
					var count2 = parseInt(count1, 10);
					count2 = count2 + 1;
					var countupdated = count2.toString();
					oHostModel.setProperty("/Notificationcount", countupdated);
					MessageBox.information(msg.content);
					that.fnGetData(sUrl1, "/Details");
					that.fnGetData(sUrl5, "/CheckInDetails");
				}
				// var count1 = oHostModel.getProperty("/Notificationcount");
				// count = count + 1;
				// var countupdated = count.toString();
				// oHostModel.setProperty("/Notificationcount", countupdated);
				// alert(event.data);

			};
		},
		onDate: function () {
			var that = this;
			var date = that.getView().byId("date").getValue();
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			oHostModel.setProperty("/date", date);
			var eId = oHostModel.getProperty("/userDetails").eId;
			var sUrl = "/VMS_Service/security/getAllVisitorHistory?date=" + date;
			that.fnGetData(sUrl, "/Details");
			var sUrl1 = "/VMS_Service/employee/getVisitorHistory?eId=" + eId + "&date=" + date;
			// var sUrl2 = "/VMS_Service/employee/getAllBlacklistedVisitors?eId=" + eId;
			var sUrl3 = "/VMS_Service/employee/getCheckedOutVisitors?eId=" + eId + "&date=" + date;
			var sUrl4 = "/VMS_Service/employee/getExpectedVisitors?eId=" + eId + "&date=" + date;
			var sUrl5 = "/VMS_Service/employee/getCheckedInVisitors?eId=" + eId + "&date=" + date;
			this.fnGetData(sUrl1, "/Details");
			this.fnGetData(sUrl3, "/CheckOutDetails");
			// this.fnGetData(sUrl2, "/BlackListed");
			this.fnGetData(sUrl4, "/ExpectedVisitorDetails");
			this.fnGetData(sUrl5, "/CheckInDetails");
			var oDialog = new sap.m.BusyDialog();
			oDialog.open();
			setTimeout(function () {
				oDialog.close();
			}, 3000);
		},
		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
		},
		onselectroom: function () {
			var oHostModel = this.getView().getModel("oHostModel");
			console.log(oHostModel);
		},
		onCheck: function () {
			var checked1 = Fragment.byId("idPreRegistrationFrag", "idwifi").getSelected();
			var checked2 = Fragment.byId("idPreRegistrationFrag", "idconference").getSelected();
			var checked3 = Fragment.byId("idPreRegistrationFrag", "idboard").getSelected();
			console.log(checked1);
			console.log(checked2);
			console.log(checked3);
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

		onAddNewPress: function () {
			var oHostModel = this.getView().getModel("oHostModel");
			oHostModel.setProperty("/oMeetingData", {});
			oHostModel.setProperty("/visitorData", {});

			if (!this._oDialog1) {
				this._oDialog1 = sap.ui.xmlfragment("idPreRegistrationFrag", "com.incture.VMSApplicationUI5.fragment.PreRegisterVisitorHost",
					this); // Instantiating the Fragment
			}
			this.getView().addDependent(this._oDialog1); // Adding the fragment to your current view
			this._oDialog1.open();
		},
		onAddVisitor: function () {
			this.bFlag = true;
			var oHostModel = this.getView().getModel("oHostModel");
			var addvisitorData = oHostModel.getProperty("/addvisitorData");
			var visitorData = oHostModel.getProperty("/visitorData");
			console.log(visitorData);
			var pId;
			if (this.bParking === true) {
				pId = addvisitorData.pId;
			} else {
				pId = visitorData.pId;
			}
			console.log(pId);
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
					// sap.m.MessageToast.show("Success");
					console.log(status);

					// that.fnGetData();

				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});

			oHostModel.setProperty("/addvisitorData", {});
			this.bParking = true;
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("idaddVisitorFrag", "com.incture.VMSApplicationUI5.fragment.addVisitorHost", this); // Instantiating the Fragment
			}
			this.getView().addDependent(this._oDialog); // Adding the fragment to your current view
			this._oDialog.open();
		},
		onAvailabilityPress: function () {
			var that = this;
			var oHostModel = that.getView().getModel("oHostModel");
			var oMeetingData = oHostModel.getProperty("/oMeetingData");
			var payload = {
				"date": oMeetingData.date,
				"beginTime": oMeetingData.beginTime,
				"endTime": oMeetingData.endTime,
				"capacity": oMeetingData.capacity
			};
			console.log(payload);
			var checked1 = Fragment.byId("idPreRegistrationFrag", "idwifi").getSelected();
			var checked2 = Fragment.byId("idPreRegistrationFrag", "idconference").getSelected();
			var checked3 = Fragment.byId("idPreRegistrationFrag", "idboard").getSelected();
			var afacilities = [];
			if (checked1 === true) {
				afacilities.push("wifi");
			}
			if (checked2 === true) {
				afacilities.push("conferencecalling");
			}
			if (checked3 === true) {
				afacilities.push("board");
			}
			console.log(afacilities);
			var facilities = afacilities.toString();
			oHostModel.setProperty("/facilities", facilities);
			console.log(facilities);
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
					console.log(response);
					if (response.status === 200) {
						// sap.m.MessageToast.show("Success");
						// console.log(data);
						oHostModel.setProperty("/AvailableRooms", data);

					} else {
						sap.m.MessageToast.show("Please enter values in the right format");
					}
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
			var oHostModel = that.getView().getModel("oHostModel");
			var oMeetingData = oHostModel.getProperty("/oMeetingData");
			var visitorData = oHostModel.getProperty("/visitorData");
			var payload = {
				"date": oMeetingData.date,
				"beginTime": oMeetingData.beginTime,
				"endTime": oMeetingData.endTime,
				"parkingType": visitorData.parkingType

			};
			console.log(payload);
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
					// sap.m.MessageToast.show("Success");
					console.log(data);
					oHostModel.setProperty("/AvailableParkingSlots", data);
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
			var oHostModel = that.getView().getModel("oHostModel");
			var oMeetingData = oHostModel.getProperty("/oMeetingData");
			var addvisitorData = oHostModel.getProperty("/addvisitorData");
			var payload = {
				"date": oMeetingData.date,
				"beginTime": oMeetingData.beginTime,
				"endTime": oMeetingData.endTime,
				"parkingType": addvisitorData.parkingType

			};
			console.log(payload);
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
					// sap.m.MessageToast.show("Success");
					console.log(data);
					oHostModel.setProperty("/AvailableParkingSlots", data);
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
		onAdd: function () {
			var that = this;
			if (this.bFlag === true) {
				var oHostModel = that.getView().getModel("oHostModel");
				var addvisitorData = oHostModel.getProperty("/addvisitorData");
				var visitors = oHostModel.getProperty("/Visitors");
				visitors.push(addvisitorData);
				console.log(visitors);
				oHostModel.setProperty("/Visitors", visitors);
				Fragment.byId("idPreRegistrationFrag", "idAddVisitorsTable").setVisible(true);
			} else {
				var oTableModel = Fragment.byId("idPreRegistrationFrag", "idAddVisitorsTable").getModel("oHostModel");
				oTableModel.refresh();
			}
			that._oDialog.close();
			that._oDialog.destroy();
			that._oDialog = null;

		},
		onPressEditBtn: function (oEvent) {
			this.bFlag = false;
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.incture.VMSApplicationUI5.fragment.addVisitorHost", this);
				//this._oDialog = sap.ui.xmlfragment("idAddItemFrag", "com.demo.odata.Demo_Odata_Service.view.addItem", this);
			}
			this.getView().addDependent(this._oDialog);
			var oHostModel = this.getView().getModel("oHostModel");
			var oSource = oEvent.getSource();
			var sBindingContextPath = oSource.getParent().getParent().getBindingContextPath();
			var oProperty = oHostModel.getProperty(sBindingContextPath);
			oHostModel.setProperty("/addvisitorData", oProperty);
			this.aMisMatchBckUp = $.extend(true, {}, oHostModel.getData().Visitors);
			this._oDialog.open();
		},
		onPressDeleteBtn: function (oEvent) {
			var that = this;
			var oHostModel = that.getView().getModel("oHostModel");
			var sBindingContextPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
			var deleteRecord = oHostModel.getProperty(sBindingContextPath);
			var visitors = oHostModel.getProperty("/Visitors");
			var oTableModel = Fragment.byId("idPreRegistrationFrag", "idAddVisitorsTable").getModel("oHostModel");
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
								// sap.m.MessageToast.show("Success");
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
		onCancel: function () {
			if (this.bFlag === false) {
				var oHostModel = this.getView().getModel("oHostModel");
				oHostModel.setProperty("/Visitors", this.aMisMatchBckUp);
			}
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = null;
		},
		onCancelMain: function () {
			this._oDialog1.close();
			this._oDialog1.destroy();
			this._oDialog1 = null;
		},
		onImagePress: function () {
			//  var oHistory, sPreviousHash;

			// oHistory = History.getInstance();
			// sPreviousHash = oHistory.getPreviousHash();

			// if (sPreviousHash !== undefined) {
			// 	window.history.go(-1);
			// } else {
			this.getRouter().navTo("RouteApp");
			// }

		},
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		onRegisterMain: function () {
			var that = this;
			var oHostModel = that.getView().getModel("oHostModel");
			var eId = oHostModel.getProperty("/userDetails").eId;
			var oMeetingData = oHostModel.getProperty("/oMeetingData");
			var visitorData = oHostModel.getProperty("/visitorData");
			var facilities = oHostModel.getProperty("/facilities");
			console.log(visitorData);
			console.log(oMeetingData);
			var visitors = oHostModel.getProperty("/Visitors");
			visitors.push(visitorData);
			// oHostModel.setProperty("/Visitors", visitors);
			// console.log(visitors);
			var payload = {
				"purpose": oMeetingData.purpose,
				"beginTime": oMeetingData.beginTime,
				"endTime": oMeetingData.endTime,
				"eId": eId,
				"rId": oMeetingData.rId,
				"date": oMeetingData.date,
				"facility": facilities,
				"capacity": oMeetingData.capacity,
				"visitors": visitors
					// 				{
					//     "purpose":"Interview",
					//     "beginTime":"15:14",
					//     "endTime":"16:14",
					//     "eId":4,
					//     "rId":2,
					//     "date":"Aug 6, 2020",
					//     "facility":"wifi",
					//     "capacity":1,
					//     "visitors":
					//      [{
					//         "firstName":"Rinku",
					//         "lastName":"Nath",
					//         "email":"Rinku@gmail.com",
					//         "contactNo":"+91 5432178675",
					//         "organisation":"TCS",
					//         "proofType":"AADHAAR",
					//         "proofNo":"78456925456",
					//         "typeId":"1",
					//         "locality":"Assam"
					//     }
					// ]
					// }
			};
			console.log(payload);
			var oDialog = new sap.m.BusyDialog();
			oDialog.open();
			setTimeout(function () {
				oDialog.close();
			}, 3000);
			$.ajax({
				url: "/VMS_Service/employee/preRegister",
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
						// oHostModel.setProperty("/oMeetingData", {});
						// oHostModel.setProperty("/visitorData", {});
						// oHostModel.setProperty("/Visitors", []);
					} else if (data.status === 300) {
						MessageBox.warning("Having a Meeting Clash");
					} else {
						MessageBox.warning("something went wrong..please try again");
					}
					console.log(status);
					console.log(response);
					oHostModel.setProperty("/oMeetingData", {});
					oHostModel.setProperty("/visitorData", {});
					oHostModel.setProperty("/Visitors", []);
					// that._oDialog1.close();
					// that._oDialog1.destroy();
					// that._oDialog1 = null;
					// that.fnGetData();
					var date = oHostModel.getProperty("/date");
					var sUrl1 = "/VMS_Service/employee/getUpcomingMeetings?eId=" + eId + "&date=" + date;
					that.fnGetData(sUrl1, "/UpcomingMeetings");
					var sUrl2 = "/VMS_Service/employee/getPreregistredVisitors?eId=" + eId;
					that.fnGetData(sUrl2, "/PreRegistration");

				},
				error: function (e) {
					MessageBox.warning("Registration failed");

				}
			});

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
		onNotificationPress: function (oEvent) {
			var oHostModel = this.getView().getModel("oHostModel");
			var eId = oHostModel.getProperty("/userDetails").eId;
			var sUrl = "/VMS_Service/employee/getAllNotifications?eId=" + eId;
			this.fnGetData(sUrl, "/notificationList");
			console.log(oHostModel);
			if (!this._oPopover1) {
				this._oPopover1 = sap.ui.xmlfragment("idNotifications", "com.incture.VMSApplicationUI5.fragment.notification", this);
				this.getView().addDependent(this._oPopover1);
			}
			this._oPopover1.openBy(oEvent.getSource());
			var count = oHostModel.getProperty("/Notificationcount");
			count = "0";
			oHostModel.setProperty("/Notificationcount", count);
		},
		onItemClose: function (oEvent) {
			var that = this;
			var oHostModel = this.getView().getModel("oHostModel");
			var oSource = oEvent.getSource();
			var spath = oSource.getBindingContextPath();
			var obj = oHostModel.getProperty(spath);
			var sUrl = "/VMS_Service/employee/readNotifications";
			$.ajax({
				url: sUrl,
				type: "POST",
				data: {
					"nId": obj.nId
				},

				dataType: "json",
				success: function (data, status, response) {
					var eId = oHostModel.getProperty("/userDetails").eId;
					var sUrl1 = "/VMS_Service/employee/getAllNotifications?eId=" + eId;
					that.fnGetData(sUrl1, "/notificationList");
					// that.fnGetData(sUrl2, "/CheckOutDetails");
					// that.fnGetData(sUrl3, "/Details");
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
							MessageBox.information("Your Delivery Needs Signature");
						} else {
							sap.m.MessageToast.show("Something Went Wrong");
						}

						// that.fnGetData(sUrl1, "/BlackListed");
						// that.fnGetData(sUrl2, "/CheckOutDetails");
						// that.fnGetData(sUrl3, "/Details");
					},
					error: function (e) {
						sap.m.MessageToast.show("fail");

					}
				});
			} else if (obj.title === "Overstay Alert") {
				$.ajax({
					url: "/VMS_Service/employee/meetingExtension",
					type: "POST",
					data: {
						"mId": obj.mId,
						"action": "accept",
						"nId": obj.nId
					},

					dataType: "json",
					success: function (data, status, response) {
						if (data.status === 200) {
							MessageBox.success("Your Meeting had Extended by 15 minutes");

						} else {
							sap.m.MessageToast.show("Something Went Wrong");
						}

						// that.fnGetData(sUrl1, "/BlackListed");
						// that.fnGetData(sUrl2, "/CheckOutDetails");
						// that.fnGetData(sUrl3, "/Details");
					},
					error: function (e) {
						sap.m.MessageToast.show("fail");

					}
				});
			} else {
				$.ajax({
					url: "/VMS_Service/employee/manageMeetingRequest",
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
						// that.fnGetData(sUrl1, "/BlackListed");
						// that.fnGetData(sUrl2, "/CheckOutDetails");
						// that.fnGetData(sUrl3, "/Details");
						var eId = oHostModel.getProperty("/userDetails").eId;
						var date = oHostModel.getProperty("/date");
						var sUrl = "/VMS_Service/employee/getUpcomingMeetings?eId=" + eId + "&date=" + date;

						that.fnGetData(sUrl, "/UpcomingMeetings");

					},
					error: function (e) {
						sap.m.MessageToast.show("fail");

					}
				});
			}
			var eId = oHostModel.getProperty("/userDetails").eId;
			var sUrl1 = "/VMS_Service/employee/getAllNotifications?eId=" + eId;
			that.fnGetData(sUrl1, "/notificationList");
			// var oList = oSource.getParent();
			// oList.removeItem(oSource);
		},
		onRejectPress: function (oEvent) {
			var that = this;
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
						// that.fnGetData(sUrl1, "/BlackListed");
						// that.fnGetData(sUrl2, "/CheckOutDetails");
						// that.fnGetData(sUrl3, "/Details");
					},
					error: function (e) {
						sap.m.MessageToast.show("fail");

					}
				});
			} else if (obj.title === "Overstay Alert") {
				$.ajax({
					url: "/VMS_Service/employee/meetingExtension",
					type: "POST",
					data: {
						"mId": obj.mId,
						"action": "reject",
						"nId": obj.nId
					},

					dataType: "json",
					success: function (data, status, response) {
						if (data.status === 200) {
							MessageBox.success("Your Meeting has Ended");

						} else {
							sap.m.MessageToast.show("Something Went Wrong");
						}

						// that.fnGetData(sUrl1, "/BlackListed");
						// that.fnGetData(sUrl2, "/CheckOutDetails");
						// that.fnGetData(sUrl3, "/Details");
					},
					error: function (e) {
						sap.m.MessageToast.show("fail");

					}
				});
			} else {
				$.ajax({
					url: "/VMS_Service/employee/manageMeetingRequest",
					type: "POST",
					data: {
						"mId": obj.mId,
						"action": "reject",
						"nId": obj.nId
					},

					dataType: 'json',
					success: function (data, status, response) {
						sap.m.MessageToast.show("Meeting Rejected");
						// that.fnGetData(sUrl1, "/BlackListed");
						// that.fnGetData(sUrl2, "/CheckOutDetails");
						// that.fnGetData(sUrl3, "/Details");
						var eId = oHostModel.getProperty("/userDetails").eId;
						var date = oHostModel.getProperty("/date");
						var sUrl = "/VMS_Service/employee/getUpcomingMeetings?eId=" + eId + "&date=" + date;

						that.fnGetData(sUrl, "/UpcomingMeetings");
					},
					error: function (e) {
						sap.m.MessageToast.show("fail");

					}
				});
			}
			var eId = oHostModel.getProperty("/userDetails").eId;
			var sUrl1 = "/VMS_Service/employee/getAllNotifications?eId=" + eId;
			that.fnGetData(sUrl1, "/notificationList");
			// var oList = oSource.getParent();
			// oList.removeItem(oSource);

		},
		CheckInPress: function () {
			var oHostModel = this.getView().getModel("oHostModel");
			var date = oHostModel.getProperty("/date");
			var eId = oHostModel.getProperty("/userDetails").eId;
			var sUrl = "/VMS_Service/employee/getCheckedInVisitors?eId=" + eId + "&date=" + date;
			this.fnGetData(sUrl, "/CheckInDetails");
			this.getView().byId("idCheckInTable").setVisible(true);
			this.getView().byId("idCheckOutTable").setVisible(false);
			this.getView().byId("idYetToVisitTable").setVisible(false);
			this.byId("pageContainer").to(this.getView().createId("idFilters"));
			this.getView().byId("idCheckout").removeStyleClass("HomeStyleTile");
			this.getView().byId("idYettovisit").removeStyleClass("HomeStyleTile");
			this.getView().byId("idCheckin").addStyleClass("HomeStyleTile");
		},
		CheckOutPress: function () {
			var oHostModel = this.getView().getModel("oHostModel");
			var date = oHostModel.getProperty("/date");
			var eId = oHostModel.getProperty("/userDetails").eId;
			var sUrl = "/VMS_Service/employee/getCheckedOutVisitors?eId=" + eId + "&date=" + date;
			this.fnGetData(sUrl, "/CheckOutDetails");
			this.getView().byId("idCheckInTable").setVisible(false);
			this.getView().byId("idCheckOutTable").setVisible(true);
			this.getView().byId("idYetToVisitTable").setVisible(false);
			this.byId("pageContainer").to(this.getView().createId("idFilters"));
			this.getView().byId("idCheckin").removeStyleClass("HomeStyleTile");
			this.getView().byId("idYettovisit").removeStyleClass("HomeStyleTile");
			this.getView().byId("idCheckout").addStyleClass("HomeStyleTile");
		},
		YetToVisitPress: function () {
			var oHostModel = this.getView().getModel("oHostModel");
			var date = oHostModel.getProperty("/date");
			var eId = oHostModel.getProperty("/userDetails").eId;
			var sUrl = "/VMS_Service/employee/getExpectedVisitors?eId=" + eId + "&date=" + date;
			this.fnGetData(sUrl, "/ExpectedVisitorDetails");
			this.getView().byId("idCheckInTable").setVisible(false);
			this.getView().byId("idCheckOutTable").setVisible(false);
			this.getView().byId("idYetToVisitTable").setVisible(true);
			this.byId("pageContainer").to(this.getView().createId("idFilters"));
			this.getView().byId("idCheckin").removeStyleClass("HomeStyleTile");
			this.getView().byId("idCheckout").removeStyleClass("HomeStyleTile");
			this.getView().byId("idYettovisit").addStyleClass("HomeStyleTile");
		},
		onUpcomingPress: function () {
			this.getView().byId("idUpcomingMeetingsTable").setVisible(true);
			this.getView().byId("preregisteredtable").setVisible(false);
			this.byId("pageContainer").to(this.getView().createId("idUpcomingMeetings"));
			this.getView().byId("idPreRegistration").removeStyleClass("HomeStyleTile");
			this.getView().byId("idUpcoming").addStyleClass("HomeStyleTile");
			var oHostModel = this.getOwnerComponent().getModel("oHostModel");
			var eId = oHostModel.getProperty("/userDetails").eId;
			var date = oHostModel.getProperty("/date");
			var sUrl = "/VMS_Service/employee/getUpcomingMeetings?eId=" + eId + "&date=" + date;

			this.fnGetData(sUrl, "/UpcomingMeetings");
		},
		onPreregistrationPress: function () {
			this.getView().byId("idUpcomingMeetingsTable").setVisible(false);
			this.getView().byId("preregisteredtable").setVisible(true);
			this.byId("pageContainer").to(this.getView().createId("idUpcomingMeetings"));
			this.getView().byId("idUpcoming").removeStyleClass("HomeStyleTile");
			this.getView().byId("idPreRegistration").addStyleClass("HomeStyleTile");
			var oHostModel = this.getOwnerComponent().getModel("oHostModel");
			var eId = oHostModel.getProperty("/userDetails").eId;
			var sUrl = "/VMS_Service/employee/getPreregistredVisitors?eId=" + eId;
			this.fnGetData(sUrl, "/PreRegistration");
		},
		onShowUpcomingVisitorsPress: function (oEvent) {
			var that = this;
			var oHostModel = that.getView().getModel("oHostModel");
			var spath = oEvent.getSource().getParent().getBindingContextPath();
			var aVisitorList = oHostModel.getProperty(spath).visitors;
			oHostModel.setProperty("/UpcomingVisitors", aVisitorList);
			// console.log(aVisitorList);
			if (!that._oDialog) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				that._oDialog = sap.ui.xmlfragment("idFrequentVisitsFragAdmin",
					"com.incture.VMSApplicationUI5.fragment.displayFrequentVisits",
					this); // Instantiating the Fragment
			}
			that.getView().addDependent(that._oDialog); // Adding the fragment to your current view
			Fragment.byId("idFrequentVisitsFragAdmin", "idFrequentVisitors").setVisible(false);
			Fragment.byId("idFrequentVisitsFragAdmin", "idUpcomingVisitorsAdmin").setVisible(false);
			Fragment.byId("idFrequentVisitsFragAdmin", "idUpcomingVisitorsHost").setVisible(true);
			that._oDialog.open();
		},
		handleUserInput: function (oEvent) {
			var sUserInput = oEvent.getParameter("value");
			var oInputControl = oEvent.getSource();
			if (sUserInput) {
				oInputControl.setValueState(sap.ui.core.ValueState.Success);
			} else {
				oInputControl.setValueState(sap.ui.core.ValueState.Error);
			}
		},
		onPressUnblock: function (oEvent) {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
			var eId = oHostModel.getProperty("/userDetails").eId;
			var date = oHostModel.getProperty("/date");
			var sUrl1 = "/VMS_Service/employee/getAllBlacklistedVisitors?eId=" + eId;
			var sUrl2 = "/VMS_Service/employee/getCheckedOutVisitors?eId=" + eId + "&date=" + date;
			var sUrl3 = "/VMS_Service/employee/getVisitorHistory?eId=" + eId + "&date=" + date;
			var oTableModel = this.getView().byId("idCheckOutTable").getModel("oHostModel");
			var oSource = oEvent.getSource();
			var spath = oSource.getParent().getBindingContextPath();
			var obj = oHostModel.getProperty(spath);
			console.log(obj);
			var bId = obj.bId;
			$.ajax({
				url: "/VMS_Service/admin/removeBlackListedVisitor",
				type: "POST",
				data: {
					"bId": bId
				},

				dataType: "json",
				success: function (data, status, response) {
					sap.m.MessageToast.show("Successfully Unblocked");
					var oDialog = new sap.m.BusyDialog();
					oDialog.open();
					setTimeout(function () {
						oDialog.close();
					}, 3000);
					that.fnGetData(sUrl1, "/BlackListed");
					that.fnGetData(sUrl2, "/CheckOutDetails");
					that.fnGetData(sUrl3, "/Details");
					oTableModel.refresh();
				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});

		},
		onAddToBlackListPress: function (oEvent) {
			var that = this;
			var oHostModel = that.getView().getModel("oHostModel");
			var oSource = oEvent.getSource();
			oHostModel.setProperty("/BlackListedSource", oSource);
			var spath = oEvent.getSource().getParent().getBindingContextPath();
			oHostModel.setProperty("/BlackListedPath", spath);
			if (!that._oDialog) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				that._oDialog = sap.ui.xmlfragment("idaddBlackListVisitorFrag", "com.incture.VMSApplicationUI5.fragment.addBlackListVisitor",
					this); // Instantiating the Fragment
			}
			that.getView().addDependent(that._oDialog); // Adding the fragment to your current view
			that._oDialog.open();
		},
		onConfirmBlackList: function () {
			var that = this;
			var oHostModel = that.getView().getModel("oHostModel");
			var date = oHostModel.getProperty("/date");
			var eId = oHostModel.getProperty("/userDetails").eId;
			var sUrl1 = "/VMS_Service/employee/getAllBlacklistedVisitors?eId=" + eId;
			var sUrl2 = "/VMS_Service/employee/getCheckedOutVisitors?eId=" + eId + "&date=" + date;
			var sUrl3 = "/VMS_Service/employee/getVisitorHistory?eId=" + eId + "&date=" + date;
			var oSource = oHostModel.getProperty("/BlackListedSource");
			var spath = oHostModel.getProperty("/BlackListedPath");
			var obj = oHostModel.getProperty(spath);
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
					that.fnGetData(sUrl2, "/CheckOutDetails");
					that.fnGetData(sUrl1, "/BlackListed");
					that.fnGetData(sUrl3, "/Details");
					var oDialog = new sap.m.BusyDialog();
					oDialog.open();
					setTimeout(function () {
						oDialog.close();
					}, 3000);
					oSource.setEnabled(false);
					if (data.status === 300) {
						MessageBox.warning("Already Blaacklisted");
					}
				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
		},
		fnGetData: function (sUrl, sProperty) {
			var that = this;
			var oHostModel = that.getOwnerComponent().getModel("oHostModel");
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
					// console.log(data);
					oHostModel.setProperty(sProperty, data);

				},
				type: "GET"
			});
		},
		onEditProfileConfirm: function () {
			var that = this;
			var oLoginModel = that.getOwnerComponent().getModel("oLoginModel");
			var obj = oLoginModel.getProperty("/oLoginFormData");
			var obj2 = oLoginModel.getProperty("/userDetails");
			var oHostModel = that.getView().getModel("oHostModel");
			var eId = oHostModel.getProperty("/userDetails").eId;
			var payload = {
				"username": obj.username,
				"password": obj.password,
				"email": obj2.email,
				"contactNo": obj2.contactNo,
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
			var oHostModel = that.getView().getModel("oHostModel");
			var eId = oHostModel.getProperty("/userDetails").eId;
			$.ajax({
				url: "/VMS_Service/admin/logout",
				type: "POST",
				data: {
					"eId": eId
				},

				dataType: "json",
				success: function (data, status, response) {
					var sUrl = "wss://projectvmsp2002476966trial.hanatrial.ondemand.com/vms/chat/" + eId;
					var webSocket = new WebSocket(sUrl);
					webSocket.close();
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