jQuery.sap.declare("com.incture.VMSApplicationUI5.utility.formatter");
com.incture.VMSApplicationUI5.utility.formatter = {
	//Function to display change color of button based on status of task
	changeColor: function (sValue) {
		this.removeStyleClass("textGreen textRed textlightBlue");
		if (sValue === "Checked In") {
			this.addStyleClass("textGreen");
		} else if (sValue === "Checked Out") {
			this.addStyleClass("textRed");
		} else {
			this.addStyleClass("textlightBlue");
		}
		return sValue;
	},
	changeColorDelivery: function (sValue) {
		this.removeStyleClass("textGreen textRed textlightBlue");
		if (sValue === "Delivered") {
			this.addStyleClass("textGreen");
		} else if (sValue === "Not Delivered") {
			this.addStyleClass("textRed");
		} else {
			this.addStyleClass("textlightBlue");
		}
		return sValue;
	},
	changeColorParking: function (sValue) {
		this.removeStyleClass("textGreen textRed textlightBlue");
		if (sValue === "Available") {
			this.addStyleClass("textGreen");
		} else {
			this.addStyleClass("textRed");
		}
		return sValue;
	},
	changeColorRoomsavailable: function (sValue) {
		this.removeStyleClass("textGreen textRed textlightBlue");
		if (sValue === "Available") {
			this.addStyleClass("textGreen");
		} else if (sValue === "In Use") {
			this.addStyleClass("textRed");
		} else {
			this.addStyleClass("textlightBlue");
		}
		return sValue;
	},
	changeColorUpcomingMeetings: function (sValue) {
			this.removeStyleClass("textGreen textRed textlightBlue");
			if (sValue === "Upcoming") {
				this.addStyleClass("textGreen");
			} else if (sValue === "Pending") {
				this.addStyleClass("textlightBlue");
			} else {
				this.addStyleClass("textRed");
			}
			return sValue;
		}
		//Function to display colour based on the status of delivery

};