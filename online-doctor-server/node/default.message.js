const template = require('./template');

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


}