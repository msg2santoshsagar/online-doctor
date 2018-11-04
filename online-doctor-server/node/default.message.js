const template = require('./templates');

module.exports = {

    getInformationSafeMessage: function (from, to) {
        return {
            from: from,
            to: to,
            template: template.TEMPLATE_1,
            createdDate: new Date(),
            shortMessage: 'Your detail is safe',
            oldMessage: false
        };
    },

    getPatientTypeSelectionMessage: function (from, to) {
        return {
            from: from,
            to: to,
            template: template.TEMPLATE_2,
            createdDate: new Date(),
            shortMessage: 'Please select the answer',
            oldMessage: false
        };
    },


    getPatientNameSelectionMessage: function (from, to) {
        return {
            from: from,
            to: to,
            template: template.TEMPLATE_3,
            createdDate: new Date(),
            shortMessage: 'Please Enter the patient name',
            oldMessage: false
        };
    },


    getPatientSymptompMessage: function (from, to) {
        return {
            from: from,
            to: to,
            template: template.TEMPLATE_4,
            createdDate: new Date(),
            shortMessage: 'Please describe the symptomps',
            oldMessage: false
        };
    },

    getDoctorTypeSelectionMessage: function (from, to) {
        return {
            from: from,
            to: to,
            template: template.TEMPLATE_5,
            createdDate: new Date(),
            shortMessage: 'Please select the doctor type',
            oldMessage: false
        };
    },

    getPackageSelectionMessage: function (from, to) {
        return {
            from: from,
            to: to,
            template: template.TEMPLATE_6,
            createdDate: new Date(),
            shortMessage: 'Please choose consultation plan',
            oldMessage: false
        };
    },

    getPaymentSuccessFullMessage: function (from, to, price, credit) {
        return {
            from: from,
            to: to,
            template: template.TEMPLATE_8,
            createdDate: new Date(),
            shortMessage: "Your payment successfull",
            actMessage: "You paid consultation fee of " + price + " for " + credit + " consultation.",
            oldMessage: false
        };
    },


    getDocterWillContactMessage: function (from, to, docName) {
        return {
            from: from,
            to: to,
            template: template.TEMPLATE_8,
            createdDate: new Date(),
            shortMessage: 'Doctor will contact you shortly',
            actMessage: docName + ' will assist you in this matter. we will contact you soon.',
            oldMessage: false
        };
    },


    getNormalMessageForLeftSide: function (from, to, message) {
        return {
            from: from,
            to: to,
            template: template.TEMPLATE_7,
            createdDate: new Date(),
            shortMessage: message,
            actMessage: message,
            oldMessage: false
        };
    },


    getNormalMessageForRightSide: function (from, to, message) {
        return {
            from: from,
            to: to,
            template: template.TEMPLATE_8,
            createdDate: new Date(),
            shortMessage: message,
            actMessage: message,
            oldMessage: false
        };
    },



}