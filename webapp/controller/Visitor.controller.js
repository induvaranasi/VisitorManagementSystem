jQuery.sap.require("sap.ndc.BarcodeScanner");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ndc/BarcodeScanner",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, UIComponent, Fragment, MessageToast, BarcodeScanner, JSONModel) {
	"use strict";

	return Controller.extend("com.incture.VMSApplicationUI5.controller.Visitor", {

		onInit: function () {
			var oVisibilityData = {
				"EmailPattern": false,
				"MobilePattern": false
			};
			var oModel = new JSONModel(oVisibilityData);
			this.getView().setModel(oModel, "oVisibilityModel");
			var oMeetingData = {
				"eId": "",
				"hostName": "",
				"purpose": "",
				"beginTime": "",
				"endTime": ""
					// "capacity": "",
					// "rId": ""
					// "facility": "wifi,board"
			};
			var oVisitorModel = this.getOwnerComponent().getModel("oVisitorModel");
			// console.log(oAdminModel);
			// oAdminModel.setProperty("/oFormData", oFormData);
			oVisitorModel.setProperty("/oMeetingData", oMeetingData);
			var visitorData = {
				// "vhId": "",
				"firstName": "",
				"lastName": "",
				"email": "",
				"contactNo": " ",
				"proofType": "",
				"proofNo": "",
				"locality": "",
				"organisation": "",
				"photo": ""
					// "parkingType": "",
					// "pId": ""
			};
			oVisitorModel.setProperty("/visitorData", visitorData);
			var addvisitorData = {
				"firstName": "",
				"lastName": "",
				"email": "",
				"contactNo": " ",
				"proofType": "",
				"proofNo": "",
				"locality": "",
				"organisation": "",
				"photo": ""
					// "parkingType": "",
					// "pId": ""
			};
			oVisitorModel.setProperty("/addvisitorData", addvisitorData);
			var visitors = [];
			oVisitorModel.setProperty("/Visitors", visitors);
			var sUrl = "/VMS_Service/employee/getAllEmployees";
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

					oVisitorModel.setProperty("/getEmployeeList", data);
					console.log(oVisitorModel);

				},
				type: "GET"
			});
			this.bFlag = false;
			this.bform = false;
			this.bEdit = false;
		},
		onImagePress: function () {
			this.getRouter().navTo("RouteApp");

		},
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},
		fnValidateEmail: function () {
			var email;
			if (this.bFlag === false) {
				email = this.getView().byId("idEmail").getValue();
			} else {
				email = Fragment.byId("idaddAnother", "idEmail").getValue();
			}
			if (email.length > 0) {
				var noSpaces2 = email.replace(/ +/, "");
				var isemail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+[.]+[a-zA-Z]{2,4}$/.test(noSpaces2);
				if (isemail) {
					this.getView().getModel("oVisibilityModel").setProperty("/EmailPattern", false);
					this.bform = true;
				} else {
					this.getView().getModel("oVisibilityModel").setProperty("/EmailPattern", true);
				}
			}
		},
		fnValidateContactNo: function (oEvent) {
			var contactnum = oEvent.getParameters().value;
			var bIsPhone = /^[789]\d{9}$/.test(contactnum);
			if (bIsPhone && contactnum.length > 0 && contactnum.length <= 10) {
				this.getView().getModel("oVisibilityModel").setProperty("/MobilePattern", false);
				// this.bform = true;

			} else {
				this.getView().getModel("oVisibilityModel").setProperty("/MobilePattern", true);
				// this.bForm=false;
			}
		},
		onSubmitMail: function () {
			var oDialog = new sap.m.BusyDialog();
			oDialog.open();
			setTimeout(function () {
				oDialog.close();
			}, 3000);
			this.fnValidateEmail();
			if (this.bform === true) {
				// MessageBox.information("Please wait..we are checking whether you are an Existing Visitor or New Visitor");
				var that = this;
				var oVisitorModel = that.getView().getModel("oVisitorModel");
				var visitordata = oVisitorModel.getProperty("/visitorData");
				var mail = visitordata.email;
				console.log(mail);
				var sUrl = "/VMS_Service/visitor/validateEmail";
				$.ajax({
					url: sUrl,
					data: {
						"email": mail
					},
					// async: true,
					// dataType: "json",
					// contentType: "application/json; charset=utf-8",
					error: function (err) {
						sap.m.MessageToast.show("Destination Failed");
					},
					success: function (data) {
						// sap.m.MessageToast.show("Data Successfully Loaded");
						console.log(data);
						if (data.status === 200) {
							MessageBox.success(
								"You are an Existing visitor..Your Personal Details will be Auto filled after Successfull OTP verification");
							that.getView().byId("idlabel").setVisible(true);
							that.getView().byId("idotp").setVisible(true);
							that.getView().byId("idsubmit").setVisible(true);
						} else {
							MessageBox.success("You are New Visitor..Please fill all the Details");
						}

						// oVisitorModel.setProperty("/getEmployeeList", data);
						// console.log(oVisitorModel);

					},
					type: "POST"
				});
			}
		},
		onSubmitOTP: function () {
			var that = this;
			var oVisitorModel = that.getView().getModel("oVisitorModel");
			var visitordata = oVisitorModel.getProperty("/visitorData");
			var otp = visitordata.otp;
			var mail = visitordata.email;
			console.log(mail);
			console.log(otp);
			var sUrl = "/VMS_Service/visitor/verifyOtp";
			$.ajax({
				url: sUrl,
				data: {
					"email": mail,
					"otp": otp
				},
				// async: true,
				// dataType: "json",
				// contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					// sap.m.MessageToast.show("Data Successfully Loaded");
					console.log(data);
					if (data.status === 200) {
						oVisitorModel.setProperty("/visitorData", data);
						that.getView().byId("idlabel").setVisible(false);
						that.getView().byId("idotp").setVisible(false);
						that.getView().byId("idsubmit").setVisible(false);
					} else if (data.status === 300) {
						MessageBox.warning("OTP verification failed..please try again");
					} else {
						MessageToast.show("Destination failed");
					}

					// oVisitorModel.setProperty("/getEmployeeList", data);
					// console.log(oVisitorModel);

				},
				type: "POST"
			});
		},
		onSubmitAnotherMail: function () {
			var oDialog = new sap.m.BusyDialog();
			oDialog.open();
			setTimeout(function () {
				oDialog.close();
			}, 3000);
			this.fnValidateEmail();
			if (this.bform === true) {
				// MessageBox.information("Please wait..we are checking whether you are an Existing Visitor or New Visitor");
				var that = this;
				var oVisitorModel = that.getView().getModel("oVisitorModel");
				var visitordata = oVisitorModel.getProperty("/addvisitorData");
				var mail = visitordata.email;
				console.log(mail);
				var sUrl = "/VMS_Service/visitor/validateEmail";
				$.ajax({
					url: sUrl,
					data: {
						"email": mail
					},
					// async: true,
					// dataType: "json",
					// contentType: "application/json; charset=utf-8",
					error: function (err) {
						sap.m.MessageToast.show("Destination Failed");
					},
					success: function (data) {
						// sap.m.MessageToast.show("Data Successfully Loaded");
						console.log(data);
						if (data.status === 200) {
							Fragment.byId("idaddAnother", "label").setVisible(true);
							Fragment.byId("idaddAnother", "idExistingadd").setVisible(true);

						}

						// oVisitorModel.setProperty("/getEmployeeList", data);
						// console.log(oVisitorModel);

					},
					type: "POST"
				});
			}
		},
		onSubmitAddOtp: function () {
			var that = this;
			var oVisitorModel = that.getView().getModel("oVisitorModel");
			var visitordata = oVisitorModel.getProperty("/addvisitorData");
			var otp = visitordata.otp;
			var mail = visitordata.email;
			console.log(mail);
			console.log(otp);
			var sUrl = "/VMS_Service/visitor/verifyOtp";
			$.ajax({
				url: sUrl,
				data: {
					"email": mail,
					"otp": otp
				},
				// async: true,
				// dataType: "json",
				// contentType: "application/json; charset=utf-8",
				error: function (err) {
					sap.m.MessageToast.show("Destination Failed");
				},
				success: function (data) {
					// sap.m.MessageToast.show("Data Successfully Loaded");
					console.log(data);
					if (data.status === 200) {
						oVisitorModel.setProperty("/addvisitorData", data);
						Fragment.byId("idaddAnother", "label").setVisible(false);
						Fragment.byId("idaddAnother", "idExistingadd").setVisible(false);
					} else if (data.status === 300) {
						MessageBox.warning("OTP verification failed..please try again");
					} else {
						MessageToast.show("Destination failed");
					}

					// oVisitorModel.setProperty("/getEmployeeList", data);
					// console.log(oVisitorModel);

				},
				type: "POST"
			});
		},
		onAddvisitorPress: function () {
			var that = this;
			this.bFlag = true;
			var oVisitorModel = that.getView().getModel("oVisitorModel");
			oVisitorModel.setProperty("/addvisitorData", {});
			if (!this._oDialog1) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				this._oDialog1 = sap.ui.xmlfragment("idaddAnother", "com.incture.VMSApplicationUI5.fragment.addVisitor", this); // Instantiating the Fragment
			}
			this.getView().addDependent(this._oDialog1); // Adding the fragment to your current view
			this._oDialog1.open();
		},
		onAdd: function () {
			var that = this;
			if (this.bFlag === true) {
				var oVisitorModel = that.getView().getModel("oVisitorModel");
				var addvisitorData = oVisitorModel.getProperty("/addvisitorData");
				var visitors = oVisitorModel.getProperty("/Visitors");
				visitors.push(addvisitorData);
				console.log(visitors);
				oVisitorModel.setProperty("/Visitors", visitors);
				this.getView().byId("idAddVisitorsTable").setVisible(true);
				// Fragment.byId("idPreRegistrationFrag", "idAddVisitorsTable").setVisible(true);
			} else {
				var oTableModel = this.getView().byId("idAddVisitorsTable").getModel("oVisitorModel");
				oTableModel.refresh();
			}
			that._oDialog1.close();
			that._oDialog1.destroy();
			that._oDialog1 = null;
		},
		onCancel: function () {
			if (this.bFlag === false) {
				var oVisitorModel = this.getView().getModel("oVisitorModel");
				oVisitorModel.setProperty("/Visitors", this.aMisMatchBckUp);
			}
			this._oDialog1.close();
			this._oDialog1.destroy();
			this._oDialog1 = null;
		},
		ValidateInput: function (oEvent) {
			var sUserInput = oEvent.getParameter("value");
			var oInputControl = oEvent.getSource();
			if (sUserInput) {
				oInputControl.setValueState(sap.ui.core.ValueState.Success);
			} else {
				oInputControl.setValueState(sap.ui.core.ValueState.Error);
			}
		},
		onPressEditBtn: function (oEvent) {
			this.bFlag = false;
			if (!this._oDialog1) {
				this._oDialog1 = sap.ui.xmlfragment("com.incture.VMSApplicationUI5.fragment.addVisitor", this);
				//this._oDialog = sap.ui.xmlfragment("idAddItemFrag", "com.demo.odata.Demo_Odata_Service.view.addItem", this);
			}
			this.getView().addDependent(this._oDialog1);
			var oVisitorModel = this.getView().getModel("oVisitorModel");
			var oSource = oEvent.getSource();
			var sBindingContextPath = oSource.getParent().getParent().getBindingContextPath();
			var oProperty = oVisitorModel.getProperty(sBindingContextPath);
			oVisitorModel.setProperty("/addvisitorData", oProperty);
			this.aMisMatchBckUp = $.extend(true, {}, oVisitorModel.getData().Visitors);
			this._oDialog1.open();
		},
		onPressDeleteBtn: function (oEvent) {
			var that = this;
			var oVisitorModel = that.getView().getModel("oVisitorModel");
			var sBindingContextPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
			var deleteRecord = oVisitorModel.getProperty(sBindingContextPath);
			var visitors = oVisitorModel.getProperty("/Visitors");
			var oTableModel = this.getView().byId("idAddVisitorsTable").getModel("oVisitorModel");
			MessageBox.warning("Are You Sure You Want To Delete", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === "OK") {

						for (var i = 0; i <= visitors.length; i++) {
							if (visitors[i] === deleteRecord) {
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
		onAcceptTandC: function () {
			var bCheck = this.getView().byId("idTC").getSelected();
			if (bCheck === true) {
				this.getView().byId("idRegisterBtn").setEnabled(true);
			} else {
				this.getView().byId("idRegisterBtn").setEnabled(false);
			}
		},
		ValidateForm: function (oEvent) {
			var sUserInput = this.byId("fname").getValue();
			if (sUserInput.trim() === "") {
				this.byId("fname").setValueState("Error");
				this.byId("fname").setValueStateText("Name cannot be empty");
				MessageBox.error("Please enter text in name field", {
					details: "plese enter text here"
				});
			} else {
				var that = this;
				var oVisitorModel = that.getView().getModel("oVisitorModel");
				var oMeetingData = oVisitorModel.getProperty("/oMeetingData");
				var visitorData = oVisitorModel.getProperty("/visitorData");
				console.log(visitorData);
				console.log(oMeetingData);
				var visitors = oVisitorModel.getProperty("/Visitors");
				visitors.push(visitorData);
				// oAdminModel.setProperty("/Visitors", visitors);
				// var Visitors = oAdminModel.getProperty("/Visitors");
				console.log(visitors);
				var payload = {
					"purpose": oMeetingData.purpose,
					"beginTime": oMeetingData.beginTime,
					"endTime": oMeetingData.endTime,
					"eId": oMeetingData.eId,
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
				$.ajax({
					url: "/VMS_Service/visitor/newVisitor",
					type: "POST",
					data: {
						"data": JSON.stringify(payload)
					},
					// dataType: "json",
					success: function (data, status, response) {
						if (data.status === 200) {
							sap.m.MessageToast.show("Successfully Pre-Registered");
							MessageBox.success(
								"Registration Succesfull...Your Host Will be Informed About Your Arrival, Please Wait in the Lobby and Please Check your Mail for Any Upadtes about the Meeting"
							);
						} else if (data.status === 300) {
							sap.m.MessageToast.show("Having a Meeting Clash");
						} else if (data.status === 301) {
							MessageBox.information("End time can't be less than Begin time");
						} else {
							sap.m.MessageToast.show("Something Went Wrong");
						}
						console.log(status);
						console.log(response);
						oVisitorModel.setProperty("/oMeetingData", {});
						oVisitorModel.setProperty("/visitorData", {});
						oVisitorModel.setProperty("/Visitors", []);
						// that._oDialog1.close();
						// that._oDialog1.destroy();
						// that._oDialog1 = null;
					},
					error: function (e) {
						sap.m.MessageToast.show("fail");

					}
				});

			}
		},
		// onCancelRegister: function () {
		// 	this._oDialog1.close();
		// 	this._oDialog1.destroy();
		// 	this._oDialog1 = null;
		// },
		onScancodeCheckin: function () {
			// this.bFlag = true;
			// this.iFragmentNo = 1;
			var that = this;
			var oVisitorModel = that.getView().getModel("oVisitorModel");
			var vhId;
			sap.ndc.BarcodeScanner.scan(
				function (oResult) {
					console.log(oResult);
					vhId = oResult.text;
					console.log(vhId);
					var sUrl = "/VMS_Service/visitor/getVisitorDetails?vhId=" + vhId;
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
							// if (data.status === 200) {
							oVisitorModel.setProperty("/userDetails", data);
							// } else {
							// 	sap.m.MessageToast.show("Please Scan Your QR code Again");
							// }
						},
						type: "GET"
					});
					if (oResult.cancelled === false) {
						that.fnOpenDialog();
					}
					// / * process scan result * /
				},
				function (oError) {
					MessageBox.warning("Error");
					// / * handle scan error * /
				},
				function (oResult) {
					// / * handle input dialog change * /
				});

			// var vhId = this.getView().byId("idVhid").getValue();
			// console.log(vhId);

		},
		fnOpenDialog: function () {
			if (!this._oDialog1) {
				//this._oDialog = sap.ui.xmlfragment("com.demo.odata.Demo_Odata_Service.view.addItem", this);
				this._oDialog1 = sap.ui.xmlfragment("idCheckinDetails", "com.incture.VMSApplicationUI5.fragment.visitorCheckinDetails", this); // Instantiating the Fragment
			}
			this.getView().addDependent(this._oDialog1); // Adding the fragment to your current view
			this._oDialog1.open();
		},
		onCapture: function () {
			var that = this;
			navigator.camera.getPicture(function (imageData) {
				console.log(imageData);
				var oVisitorModel = that.getView().getModel("oVisitorModel");
				var res = imageData.split("base64,");
				var image = res[1];
				if (that.bEdit === true) {
					Fragment.byId("idCheckinDetails", "idPhoto").setVisible(true);
					oVisitorModel.setProperty("/photo", imageData);
				} else if (that.bFlag === true) {
					oVisitorModel.setProperty("/addvisitorData/photo", image);
					Fragment.byId("idaddAnother", "idImage").setVisible(true);

				} else {
					oVisitorModel.setProperty("/visitorData/photo", image);
					that.getView().byId("idImage").setVisible(true);
				}

			}, that.onFail, {
				quality: 75,
				targetWidth: 300,
				targetHeight: 300,
				sourceType: navigator.camera.PictureSourceType.CAMERA,
				destinationType: navigator.camera.DestinationType.FILE_URI
			});
		},
		// onSuccess: function (imageData) {
		// 	console.log(imageData);
		// 	Fragment.byId("idCheckinDetails", "idPhoto").setVisible(true);
		// 	var oVisitorModel = this.getView().getModel("oVisitorModel");
		// 	oVisitorModel.setProperty("/photo", imageData);

		// },
		onFail: function (message) {
			var that = this;
			alert("Failed because: " + message);
		},
		onEditDetails: function () {
			this.bEdit = true;
			Fragment.byId("idCheckinDetails", "idSimpleFormEditable").setVisible(true);
			Fragment.byId("idCheckinDetails", "idSimpleForm").setVisible(false);
		},
		onRejectPress: function () {
			MessageToast.show("Reject Button Pressed");
		},

		onAcceptPress: function () {
			MessageToast.show("Accept Button Pressed");
		},

		onConfirmDetails: function () {
			var that = this;
			var oVisitorModel = that.getOwnerComponent().getModel("oVisitorModel");
			var visitorData = oVisitorModel.getProperty("/userDetails");
			var image = oVisitorModel.getProperty("/photo");
			var res = image.split("base64,");
			// console.log(visitorData);
			// var payload = visitorData;
			// var vhId = that.getView().byId("idVhid").getValue();
			var payload = {
				"vhId": visitorData.vhId,
				"firstName": visitorData.firstName,
				"lastName": visitorData.lastName,
				"email": visitorData.email,
				"contactNo": visitorData.contactNo,
				"proofType": visitorData.proofType,
				"proofNo": visitorData.proofNo,
				"locality": visitorData.locality,
				"organisation": visitorData.organisation,
				"image": res[1]

			};
			// var vhId = 3;
			// var sUrl = "/VMS_Service/visitor/getVisitorDetails?vhId=1";
			console.log(payload);
			$.ajax({
				url: "/VMS_Service/visitor/editDetails",
				type: "POST",
				data: {
					"data": JSON.stringify(payload)
				},
				// dataType: "json",
				success: function (data, status, response) {
					if (data.status === 200) {
						// sap.m.MessageToast.show("Successfully Pre-Registered");
						MessageBox.success(
							"Welcome to Incture Technologies!!Please Collect Access Card From the Security."
						);
						that.bEdit = false;
					} else if (data.status === 300) {
						sap.m.MessageToast.show("Having a Meeting Clash");
					} else {
						sap.m.MessageToast.show("Something Went Wrong");
					}

					console.log(status);
					console.log(response);

					// that._oDialog1.close();
					// that._oDialog1.destroy();
					// that._oDialog1 = null;
				},
				error: function (e) {
					sap.m.MessageToast.show("fail");

				}
			});
			that._oDialog1.close();
			that._oDialog1.destroy();
			that._oDialog1 = null;
		},
		onScancodeCheckout: function () {
			var that = this;
			// var oVisitorModel = that.getView().getModel("oVisitorModel");
			var vhId;
			sap.ndc.BarcodeScanner.scan(
				function (oResult) {
					console.log(oResult);
					vhId = oResult.text;

					$.ajax({
						url: "/VMS_Service/visitor/checkOut",
						type: "POST",
						data: {
							"vhId": vhId

						},
						dataType: "json",
						success: function (data, status, response) {
							console.log(data);
							if (data.status === 200) {

								MessageBox.success("Thank You For Visiting!!Please HandOver the Access Card to the Security.");

							} else if (data.status === 300) {
								MessageBox.information("Already Checked out");
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

					// / * handle scan error * /
				}

			);

		}

	});

});